import connectDB from '@/lib/mongodb';

const COLLECTION_NAME = 'admin_settings';

export async function getSettingsCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME);
}

export async function getGlobalSettings() {
  const col = await getSettingsCollection();
  const doc = await col.findOne({ id: 'global' });
  if (!doc) {
    return {
      id: 'global',
      editorTheme: 'light',
      footerBio: '',
    };
  }
  return {
    id: 'global',
    editorTheme: doc.editorTheme || 'light',
    footerBio: doc.footerBio || '',
  };
}

export async function updateGlobalSettings(partial) {
  const col = await getSettingsCollection();
  const update = {};
  if (partial.editorTheme) {
    update.editorTheme = partial.editorTheme === 'dark' ? 'dark' : 'light';
  }
  if (typeof partial.footerBio === 'string') {
    update.footerBio = partial.footerBio;
  }

  const result = await col.findOneAndUpdate(
    { id: 'global' },
    {
      $set: {
        id: 'global',
        ...update,
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: {
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const value = result && result.value ? result.value : await col.findOne({ id: 'global' });

  return {
    id: value?.id || 'global',
    editorTheme: value?.editorTheme || 'light',
    footerBio: value?.footerBio || '',
  };
}

