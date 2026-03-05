import connectDB from '@/lib/mongodb';

export async function getSubscribersCollection() {
  const db = await connectDB();
  return db.collection('newsletter_subscribers');
}

export async function ensureSubscriberIndexes() {
  const collection = await getSubscribersCollection();

  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ status: 1, createdAt: -1 });
}

