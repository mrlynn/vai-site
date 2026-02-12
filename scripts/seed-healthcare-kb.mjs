#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mike:Password678%21@performance.zbcul.mongodb.net/vai';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || 'al-EdFh1FwUCPTZw7ofd93ulmRNxEmt-JOCRmmWc96wWJ8';
const VOYAGE_BASE_URL = process.env.VOYAGE_BASE_URL || 'https://ai.mongodb.com/v1/';
const EMBEDDING_MODEL = 'voyage-4-large';
const DB_NAME = 'vai';
const COLLECTION_NAME = 'healthcare_chatbot';
const SLUG = 'healthcare';
const DOCS_DIR = join(import.meta.dirname, '..', 'public', 'use-cases', 'healthcare', 'sample-docs');

function chunkDocument(text, source, maxChars = 500, overlap = 100) {
  const chunks = [];
  for (const section of text.split(/(?=^#{1,3} )/m)) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxChars) { chunks.push({ text: trimmed, source }); }
    else { let i = 0; while (i < trimmed.length) { chunks.push({ text: trimmed.slice(i, Math.min(i + maxChars, trimmed.length)).trim(), source }); i += maxChars - overlap; } }
  }
  return chunks;
}

async function embedTexts(texts) {
  const allEmbeddings = [];
  for (let i = 0; i < texts.length; i += 20) {
    const batch = texts.slice(i, i + 20);
    const res = await fetch(new URL('embeddings', VOYAGE_BASE_URL).toString(), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${VOYAGE_API_KEY}` },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });
    if (!res.ok) throw new Error(`Voyage API error ${res.status}: ${await res.text()}`);
    for (const item of (await res.json()).data) allEmbeddings.push(item.embedding);
    console.log(`  Embedded batch ${Math.floor(i / 20) + 1}/${Math.ceil(texts.length / 20)}`);
  }
  return allEmbeddings;
}

async function main() {
  console.log('📄 Reading healthcare markdown files...');
  const files = readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  console.log(`  Found ${files.length} files`);
  const allChunks = [];
  for (const file of files) allChunks.push(...chunkDocument(readFileSync(join(DOCS_DIR, file), 'utf-8'), file));
  console.log(`📦 Created ${allChunks.length} chunks`);
  console.log('🧠 Embedding chunks with voyage-4-large...');
  const embeddings = await embedTexts(allChunks.map(c => c.text));
  const docs = allChunks.map((chunk, i) => ({ text: chunk.text, source: chunk.source, embedding: embeddings[i], slug: SLUG }));
  console.log('💾 Storing in MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME); const col = db.collection(COLLECTION_NAME);
    await col.deleteMany({ slug: SLUG });
    await col.insertMany(docs);
    console.log(`  Inserted ${docs.length} docs`);
    try {
      await db.command({ createSearchIndexes: COLLECTION_NAME, indexes: [{ name: 'vector_index', type: 'vectorSearch', definition: { fields: [{ type: 'vector', path: 'embedding', numDimensions: 1024, similarity: 'cosine' }] } }] });
      console.log('🔍 Created vector search index');
    } catch (e) { console.log(e.message?.includes('already exists') ? '🔍 Vector search index already exists' : '⚠️  ' + e.message); }
    console.log('✅ Done!');
  } finally { await client.close(); }
}
main().catch(err => { console.error('❌', err); process.exit(1); });
