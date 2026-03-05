import connectDB from '@/lib/mongodb';

const PLAN_COLLECTION = 'content_plans';

export async function getPlanCollection() {
  const db = await connectDB();
  return db.collection(PLAN_COLLECTION);
}

