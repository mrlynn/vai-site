import connectDB from '@/lib/mongodb';

const COLLECTION_NAME = 'content_drafts';

export async function getDraftsCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME);
}

