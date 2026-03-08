import connectDB from '@/lib/mongodb';

const COLLECTION_NAME = 'content_drafts';
export const DRAFT_SORT = { updatedAt: -1, createdAt: -1, _id: -1 };

function getDraftTimestamp(draft) {
  const timestamp = Date.parse(draft?.updatedAt || draft?.createdAt || '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getDraftIdentity(draft, index) {
  if (typeof draft?.id === 'string' && draft.id.trim()) {
    return draft.id;
  }

  if (draft?._id) {
    return String(draft._id);
  }

  return `missing-id:${index}`;
}

export async function getDraftsCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME);
}

export function dedupeDrafts(drafts) {
  const draftsById = new Map();

  drafts.forEach((draft, index) => {
    const identity = getDraftIdentity(draft, index);
    const normalizedDraft =
      draft?.id === identity
        ? draft
        : {
            ...draft,
            id: identity,
          };
    const existingDraft = draftsById.get(identity);

    if (!existingDraft || getDraftTimestamp(normalizedDraft) >= getDraftTimestamp(existingDraft)) {
      draftsById.set(identity, normalizedDraft);
    }
  });

  return [...draftsById.values()].sort(
    (left, right) => getDraftTimestamp(right) - getDraftTimestamp(left),
  );
}

