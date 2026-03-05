import path from 'path';
import { getKnowledgeSourcesCollection, getKnowledgeChunksCollection, getKnowledgeVersionsCollection } from '@/lib/knowledge/db';
import { buildSourceDocument } from '@/lib/knowledge/sourceModel';
import { chunkText } from '@/lib/knowledge/chunker';
import { readFileContent } from '@/lib/knowledge/readers';
import { crawlUrl } from '@/lib/knowledge/crawl';
import { scanCodebase } from '@/lib/knowledge/codebase';
import { generateEmbeddings } from '@/lib/knowledge/embed';
import { fingerprintFile, fingerprintUrl } from '@/lib/knowledge/fingerprint';

function getCodebaseBatchConfig() {
  const maxFiles = Number(process.env.CODEBASE_BATCH_FILES ?? 200);
  const maxChunks = Number(process.env.CODEBASE_BATCH_CHUNKS ?? 2000);
  return {
    maxFiles: Number.isFinite(maxFiles) && maxFiles > 0 ? maxFiles : 200,
    maxChunks: Number.isFinite(maxChunks) && maxChunks > 0 ? maxChunks : 2000,
  };
}

function getChunkStrategy(filePath) {
  const ext = path.extname(filePath || '').toLowerCase();

  if (ext === '.md') {
    return { strategy: 'markdown', opts: {} };
  }

  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return { strategy: 'fixed', opts: { size: 400, overlap: 40 } };
  }

  if (['.json', '.yaml', '.yml'].includes(ext)) {
    return { strategy: 'fixed', opts: { size: 600, overlap: 0 } };
  }

  return { strategy: 'paragraph', opts: {} };
}

export async function ingestSource(sourceId) {
  const startMs = Date.now();

  const sourcesCollection = await getKnowledgeSourcesCollection();
  const chunksCollection = await getKnowledgeChunksCollection();
  const versionsCollection = await getKnowledgeVersionsCollection();

  const source = await sourcesCollection.findOne({ id: sourceId });
  if (!source) {
    throw new Error(`Knowledge source not found: ${sourceId}`);
  }

  const previousChunkCount = source.chunkCount ?? 0;

  await sourcesCollection.updateOne(
    { id: sourceId },
    { $set: { status: 'indexing', errorMessage: null, updatedAt: new Date().toISOString() } },
  );

  try {
    let chunks = [];
    let documentCount = 0;
    let fingerprint = '';

    switch (source.type) {
      case 'file': {
        if (!source.sourcePath) throw new Error('File source requires a sourcePath');
        const content = await readFileContent(source.sourcePath);
        const { strategy, opts } = getChunkStrategy(source.sourcePath);
        const textChunks = chunkText(content, strategy, opts);
        chunks = textChunks.map((c) => ({ content: c, originPath: source.sourcePath }));
        documentCount = 1;
        fingerprint = await fingerprintFile(source.sourcePath);
        break;
      }
      case 'url': {
        if (!source.sourcePath) throw new Error('URL source requires a sourcePath');
        const crawlConfig = source.crawlConfig || {};
        const depth =
          typeof crawlConfig.crawlDepth === 'number' && crawlConfig.crawlDepth > 0
            ? crawlConfig.crawlDepth
            : 0;
        const maxPages =
          typeof crawlConfig.maxPages === 'number' && crawlConfig.maxPages > 0
            ? crawlConfig.maxPages
            : 20;

        // For now, even with depth > 0 we still treat it as a single-page fetch;
        // the extended spidering logic can be added here next.
        const { text, fingerprint: urlFingerprint } = await crawlUrl(source.sourcePath);
        const textChunks = chunkText(text, 'paragraph');
        chunks = textChunks.map((c) => ({ content: c, originPath: source.sourcePath }));
        documentCount = 1;
        fingerprint = urlFingerprint;
        break;
      }
      case 'codebase': {
        if (!source.sourcePath) throw new Error('Codebase source requires a sourcePath');
        const { maxFiles, maxChunks } = getCodebaseBatchConfig();
        const allFilePaths = await scanCodebase(source.sourcePath);
        const totalFiles = allFilePaths.length;
        if (totalFiles === 0) throw new Error('No files found in codebase path');

        const startIndex = source.indexState?.codebase?.nextFileIndex ?? 0;
        const fileSlice = allFilePaths.slice(startIndex, startIndex + maxFiles);

        const batchFilePaths = [];
        const chunkedByFile = [];
        let totalBatchChunks = 0;

        for (const filePath of fileSlice) {
          let content;
          try {
            content = await readFileContent(filePath);
          } catch {
            continue;
          }
          const { strategy, opts } = getChunkStrategy(filePath);
          const fileChunks = chunkText(content, strategy, opts);
          if (fileChunks.length === 0) continue;

          if (totalBatchChunks + fileChunks.length > maxChunks && batchFilePaths.length > 0) {
            break;
          }

          batchFilePaths.push(filePath);
          chunkedByFile.push({ originPath: filePath, chunks: fileChunks });
          totalBatchChunks += fileChunks.length;

          if (totalBatchChunks >= maxChunks) break;
        }

        if (batchFilePaths.length === 0) {
          throw new Error(
            'No chunks produced for codebase batch — try reducing batch size or check readable files',
          );
        }

        chunks = chunkedByFile.flatMap((f) =>
          f.chunks.map((c) => ({ content: c, originPath: f.originPath })),
        );

        const nextFileIndex = startIndex + batchFilePaths.length;
        documentCount = nextFileIndex;

        const cryptoMod = await import('crypto');
        const hash = cryptoMod.createHash('sha256');
        hash.update(allFilePaths.join('\n'));
        fingerprint = hash.digest('hex');
        break;
      }
      case 'text': {
        const content = source.sourcePath || '';
        if (!content) throw new Error('Text source requires content in sourcePath field');
        const textChunks = chunkText(content, 'paragraph');
        chunks = textChunks.map((c) => ({ content: c, originPath: 'pasted-text' }));
        documentCount = 1;
        const cryptoMod = await import('crypto');
        const hash = cryptoMod.createHash('sha256');
        hash.update(content);
        fingerprint = hash.digest('hex');
        break;
      }
      default: {
        throw new Error(`Unknown source type: ${source.type}`);
      }
    }

    if (!chunks.length) {
      throw new Error('No chunks produced — source may be empty or unreadable');
    }

    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    if (source.type === 'codebase' && source.sourcePath) {
      const batchOriginPaths = [...new Set(chunks.map((c) => c.originPath))];
      await chunksCollection.deleteMany({ sourceId, originPath: { $in: batchOriginPaths } });
      if (!source.indexState?.codebase) {
        await chunksCollection.deleteMany({ sourceId });
      }
    } else {
      await chunksCollection.deleteMany({ sourceId });
    }

    const now = new Date().toISOString();
    const chunkDocs = chunks.map((c, i) => ({
      id: crypto.randomUUID(),
      sourceId,
      sourceName: source.name,
      content: c.content,
      embedding: embeddings[i],
      chunkIndex: i,
      totalChunks: chunks.length,
      originPath: c.originPath,
      metadata: {},
      createdAt: now,
    }));

    if (chunkDocs.length > 0) {
      await chunksCollection.insertMany(chunkDocs);
    }

    const versionDoc = {
      id: crypto.randomUUID(),
      sourceId,
      fingerprint,
      chunkCount: chunks.length,
      documentCount,
      diffSummary: {
        added: Math.max(0, chunks.length - previousChunkCount),
        removed: Math.max(0, previousChunkCount - chunks.length),
        changed: 0,
      },
      createdAt: now,
    };
    await versionsCollection.insertOne(versionDoc);

    const durationMs = Date.now() - startMs;

    await sourcesCollection.updateOne(
      { id: sourceId },
      {
        $set: {
          status: 'indexed',
          chunkCount: chunks.length,
          documentCount,
          fingerprint,
          lastIndexedAt: now,
          updatedAt: now,
          errorMessage: null,
          indexState: undefined,
        },
      },
    );

    return {
      sourceId,
      chunkCount: chunks.length,
      documentCount,
      fingerprint,
      durationMs,
      previousChunkCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await sourcesCollection.updateOne(
      { id: sourceId },
      {
        $set: {
          status: 'error',
          errorMessage,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    throw err;
  }
}

export async function createKnowledgeSource(input) {
  const sourcesCollection = await getKnowledgeSourcesCollection();
  const doc = buildSourceDocument(input);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await sourcesCollection.insertOne(doc);
  return doc;
}

