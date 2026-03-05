const CORE_VAI_KNOWLEDGE = [
  `vai is an open-source CLI (voyageai-cli) that helps teams build semantic search and RAG-style knowledge bases on top of their own documents using Voyage AI embeddings and MongoDB Atlas Vector Search.`,
  `vai focuses on developer ergonomics: you point it at a folder of docs, run a simple pipeline command, and it handles embedding, indexing, and basic retrieval wiring without requiring ML expertise.`,
  `vai keeps data under the user's control by running ingestion locally and storing embeddings and documents in the user's own MongoDB Atlas cluster, rather than a third-party SaaS.`,
  `Typical vai workflows include: ingesting docs with "vai pipeline", exploring search results with "vai playground", querying from the terminal with "vai search", and wiring assistants via "vai mcp-server" or "vai chat".`,
  `Performance and relevance depend on the underlying Voyage AI embedding models and the quality/coverage of the ingested documents. vai does not magically know about content that has not been indexed.`,
  `vai does not replace production observability, compliance, or SRE tooling; it provides building blocks for semantic search and RAG pipelines that can be integrated into a broader stack.`,
];

export function getCoreVaiKnowledge() {
  // Return a shallow copy so callers can't mutate our internal array.
  return [...CORE_VAI_KNOWLEDGE];
}

