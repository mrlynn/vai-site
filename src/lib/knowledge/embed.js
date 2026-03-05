// Voyage AI embedding helper, JS port from vai-dashboard.

const EMBEDDING_DIMENSIONS = 1024;
const BATCH_SIZE = 128;
const RETRY_DELAY_MS = 2000;

export async function generateEmbeddings(texts) {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'VOYAGE_API_KEY environment variable is not set. Add it to .env.local to enable embedding generation.',
    );
  }

  const baseUrl = process.env.VOYAGE_API_BASE ?? 'https://api.voyageai.com/v1';
  const model = process.env.VOYAGE_MODEL ?? 'voyage-3';
  const endpoint = `${baseUrl}/embeddings`;

  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    // eslint-disable-next-line no-await-in-loop
    let response = await fetchEmbeddings(endpoint, apiKey, model, batch);

    if (response.status === 429) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      // eslint-disable-next-line no-await-in-loop
      response = await fetchEmbeddings(endpoint, apiKey, model, batch);
    }

    if (!response.ok) {
      // eslint-disable-next-line no-await-in-loop
      const errorText = await response.text();
      throw new Error(`Voyage AI embedding request failed (${response.status}): ${errorText}`);
    }

    // eslint-disable-next-line no-await-in-loop
    const data = await response.json();

    for (const item of data.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

async function fetchEmbeddings(endpoint, apiKey, model, texts) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: texts,
      model,
      input_type: 'document',
    }),
  });
}

export { EMBEDDING_DIMENSIONS };

