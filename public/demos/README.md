# Demo Preview Assets

This directory stores the public preview assets used by the demo gallery on
`vaicli.com`.

For now, assets are copied here by hand from `voyageai-cli` after a demo is
recorded and approved.

## Manual Publishing Flow

1. Record or update the source tape in `voyageai-cli/docs/demos/`.
2. Generate the preview asset locally, usually with:
   `./scripts/record-demo.sh vhs docs/demos/<name>.tape`
3. Optimize the asset if needed.
4. Copy the selected file into this directory using the public slug, for
   example:
   - `cli-quickstart.gif`
   - `local-inference.gif`
   - `ollama-nano-chat.gif`
5. Confirm the matching entry in `src/data/demos.ts` points to the same public
   path under `/demos/`.

The gallery UI falls back to a placeholder when an asset has not been copied
yet, which makes it safe to publish metadata before the preview file is ready.
