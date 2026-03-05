import connectDB from '@/lib/mongodb';

export async function getNewsletterEventsCollection() {
  const db = await connectDB();
  return db.collection('newsletter_events');
}

export async function logNewsletterEvent(event) {
  const collection = await getNewsletterEventsCollection();

  const doc = {
    ...event,
    createdAt: event.createdAt || new Date(),
  };

  await collection.insertOne(doc);
}

