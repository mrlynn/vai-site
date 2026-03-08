# Demo Preview Assets

This directory stores the public preview media used by the demo gallery on
`vaicli.com`.

For now, assets are copied here by hand from `voyageai-cli` after a demo is
recorded and approved.

## Manual Publishing Flow

1. Record or update the source tape in `voyageai-cli/docs/demos/` or `voyageai-cli/docs/demos/tapes/`.
2. Generate the source recording locally, usually with:
   `./scripts/record-demo.sh vhs docs/demos/<name>.tape`
   or
   `./scripts/record-demo.sh vhs docs/demos/tapes/<name>.tape`
3. Convert the selected recording to a web-friendly preview format such as `mp4`.
4. Copy the selected file into this directory using the public slug, for
   example:
   - `cli-quickstart.mp4`
   - `local-inference.mp4`
   - `ollama-nano-chat.mp4`
   - `what-is-an-embedding.mp4`
   - `document-vs-query.mp4`
   - `chunking-strategies.mp4`
   - `pipeline-end-to-end.mp4`
   - `two-stage-retrieval.mp4`
   - `shared-embedding-space.mp4`
   - `reranking.mp4`
   - `models-and-benchmarks.mp4`
5. Confirm the matching entry in `src/data/demos.ts` points to the same public
   path under `/demos/`.

The gallery UI falls back to a placeholder when an asset has not been copied
yet, which makes it safe to publish metadata before the preview file is ready.
