#!/usr/bin/env node
/**
 * Seed script: Embed devdocs sample docs and store in MongoDB.
 * Usage: node scripts/seed-devdocs-kb.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mike:Password678%21@performance.zbcul.mongodb.net/vai';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || 'al-EdFh1FwUCPTZw7ofd93ulmRNxEmt-JOCRmmWc96wWJ8';
const VOYAGE_BASE_URL = process.env.VOYAGE_BASE_URL || 'https://ai.mongodb.com/v1/';
const EMBEDDING_MODEL = 'voyage-code-3';
const DB_NAME = 'vai';
const COLLECTION_NAME = 'devdocs_chatbot';
const SLUG = 'devdocs';
const DOCS_DIR = join(import.meta.dirname, '..', 'public', 'use-cases', 'devdocs', 'sample-docs');

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------
function chunkDocument(text, source, maxChars = 500, overlap = 100) {
  const chunks = [];
  // Split by headings first
  const sections = text.split(/(?=^#{1,3} )/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChars) {
      chunks.push({ text: trimmed, source });
    } else {
      // Sub-chunk long sections
      let i = 0;
      while (i < trimmed.length) {
        const end = Math.min(i + maxChars, trimmed.length);
        chunks.push({ text: trimmed.slice(i, end).trim(), source });
        i += maxChars - overlap;
      }
    }
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Embed via Voyage AI
// ---------------------------------------------------------------------------
async function embedTexts(texts) {
  const batchSize = 20;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await fetch(new URL('embeddings', VOYAGE_BASE_URL).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Voyage API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    for (const item of data.data) {
      allEmbeddings.push(item.embedding);
    }
    console.log(`  Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
  }

  return allEmbeddings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('📄 Reading markdown files...');
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
  console.log(`  Found ${files.length} files`);

  const allChunks = [];
  for (const file of files) {
    const content = readFileSync(join(DOCS_DIR, file), 'utf-8');
    const chunks = chunkDocument(content, file);
    allChunks.push(...chunks);
  }
  console.log(`📦 Created ${allChunks.length} chunks`);

  console.log('🧠 Embedding chunks...');
  const texts = allChunks.map((c) => c.text);
  const embeddings = await embedTexts(texts);

  const docs = allChunks.map((chunk, i) => ({
    text: chunk.text,
    source: chunk.source,
    embedding: embeddings[i],
    slug: SLUG,
  }));

  console.log('💾 Storing in MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

    // Clear existing docs for this slug
    const deleted = await col.deleteMany({ slug: SLUG });
    console.log(`  Deleted ${deleted.deletedCount} existing docs`);

    await col.insertMany(docs);
    console.log(`  Inserted ${docs.length} docs`);

    // Try to create vector search index
    try {
      await db.command({
        createSearchIndexes: COLLECTION_NAME,
        indexes: [
          {
            name: 'vector_index',
            type: 'vectorSearch',
            definition: {
              fields: [
                {
                  type: 'vector',
                  path: 'embedding',
                  numDimensions: 1024,
                  similarity: 'cosine',
                },
              ],
            },
          },
        ],
      });
      console.log('🔍 Created vector search index "vector_index"');
    } catch (e) {
      if (e.message?.includes('already exists') || e.codeName === 'IndexAlreadyExists') {
        console.log('🔍 Vector search index "vector_index" already exists');
      } else {
        console.log('⚠️  Could not auto-create vector search index. Create it manually in Atlas:');
        console.log('   Index name: vector_index');
        console.log('   Collection: vai.devdocs_chatbot');
        console.log('   Field: embedding (1024 dimensions, cosine)');
        console.log('   Error:', e.message);
      }
    }

    console.log('✅ Done!');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
