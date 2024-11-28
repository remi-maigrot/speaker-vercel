import { openDB, type DBSchema } from 'idb';

interface Voice {
  id?: number;
  userId: number;
  name: string;
  type: string;
  audioUrl: string;
  createdAt: string;
  isPublished?: boolean;
}

interface MarketplaceListing {
  id?: number;
  voiceId: number;
  userId: number;
  price: number;
  description: string;
  createdAt: string;
}

interface SpeakerDB extends DBSchema {
  users: {
    key: number;
    value: {
      id?: number;
      email: string;
      password: string;
      name: string;
      createdAt: string;
      updatedAt?: string; // Ajout de la propriété `updatedAt`
    };
    indexes: { 'by-email': string };
  };
  voices: {
    key: number;
    value: Voice;
    indexes: { 'by-user': number };
  };
  voice_emotions: {
    key: number;
    value: {
      id?: number;
      voiceId: number;
      emotion: string;
      startTime: number;
      endTime: number;
      intensity: number;
      createdAt: string;
    };
    indexes: { 'by-voice': number };
  };
  user_preferences: {
    key: number;
    value: {
      userId: number;
      theme?: string;
      exportQuality?: string;
      autoSave?: boolean;
      emailNotifications?: boolean;
      updatedAt: string;
    };
  };
  marketplace_listings: {
    key: number;
    value: MarketplaceListing;
    indexes: { 'by-voice': number };
  };
}

const DB_NAME = 'speaker-db';
const DB_VERSION = 6;

// Delete existing database if version mismatch
async function resetDatabase() {
  try {
    const databases = await window.indexedDB.databases();
    const existingDb = databases.find(db => db.name === DB_NAME);
    if (existingDb) {
      await window.indexedDB.deleteDatabase(DB_NAME);
    }
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

const dbPromise = (async () => {
  await resetDatabase();
  return openDB<SpeakerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
      userStore.createIndex('by-email', 'email', { unique: true });
      
      // Voices store
      const voiceStore = db.createObjectStore('voices', { keyPath: 'id', autoIncrement: true });
      voiceStore.createIndex('by-user', 'userId');
      
      // Voice emotions store
      const emotionStore = db.createObjectStore('voice_emotions', { keyPath: 'id', autoIncrement: true });
      emotionStore.createIndex('by-voice', 'voiceId');

      // User preferences store
      db.createObjectStore('user_preferences', { keyPath: 'userId' });

      // Marketplace listings store
      const marketplaceStore = db.createObjectStore('marketplace_listings', { keyPath: 'id', autoIncrement: true });
      marketplaceStore.createIndex('by-voice', 'voiceId', { unique: true });
    },
  });
})();

export async function createUser(email: string, password: string, name: string) {
  const db = await dbPromise;
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  return db.add('users', {
    email,
    password,
    name,
    createdAt: new Date().toISOString()
  });
}

export async function getUserByEmail(email: string) {
  const db = await dbPromise;
  const index = db.transaction('users').store.index('by-email');
  return index.get(email);
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  return user;
}

export async function updateUser(userId: number, data: Partial<{ name: string; email: string; password: string }>) {
  const db = await dbPromise;
  const user = await db.get('users', userId);
  if (!user) throw new Error('User not found');

  return db.put('users', {
    ...user,
    ...data,
    updatedAt: new Date().toISOString() // Mise à jour du champ `updatedAt`
  });
}

export async function createVoice(userId: number, name: string, type: string, audioBlob: Blob) {
  const db = await dbPromise;
  const audioUrl = URL.createObjectURL(audioBlob);
  
  const voice: Voice = {
    userId,
    name,
    type,
    audioUrl,
    createdAt: new Date().toISOString(),
    isPublished: false
  };

  try {
    const id = await db.add('voices', voice);
    return { ...voice, id };
  } catch (error) {
    URL.revokeObjectURL(audioUrl);
    throw error;
  }
}

export async function getUserVoices(userId: number) {
  const db = await dbPromise;
  const tx = db.transaction('voices', 'readonly');
  const index = tx.store.index('by-user');
  return index.getAll(userId);
}

export async function deleteVoice(voiceId: number) {
  const db = await dbPromise;
  const voice = await db.get('voices', voiceId);
  if (voice?.audioUrl) {
    URL.revokeObjectURL(voice.audioUrl);
  }
  await db.delete('voices', voiceId);
}

export async function addVoiceEmotion(
  voiceId: number,
  emotion: string,
  startTime: number,
  endTime: number,
  intensity: number
) {
  const db = await dbPromise;
  return db.add('voice_emotions', {
    voiceId,
    emotion,
    startTime,
    endTime,
    intensity,
    createdAt: new Date().toISOString()
  });
}

export async function getVoiceEmotions(voiceId: number) {
  const db = await dbPromise;
  const index = db.transaction('voice_emotions').store.index('by-voice');
  return index.getAll(voiceId);
}

export async function updateUserPreferences(userId: number, preferences: any) {
  const db = await dbPromise;
  const existing = await db.get('user_preferences', userId);
  return db.put('user_preferences', {
    ...(existing || {}),
    ...preferences,
    userId,
    updatedAt: new Date().toISOString()
  });
}

export async function getUserPreferences(userId: number) {
  const db = await dbPromise;
  return db.get('user_preferences', userId);
}

export async function publishVoiceToMarketplace(
  voiceId: number,
  userId: number,
  price: number,
  description: string
) {
  const db = await dbPromise;
  
  const tx = db.transaction(['marketplace_listings', 'voices'], 'readwrite');
  
  try {
    const voice = await tx.objectStore('voices').get(voiceId);
    if (!voice) throw new Error('Voice not found');

    const listing: MarketplaceListing = {
      voiceId,
      userId,
      price,
      description,
      createdAt: new Date().toISOString()
    };

    await tx.objectStore('marketplace_listings').add(listing);
    await tx.objectStore('voices').put({
      ...voice,
      isPublished: true
    });

    await tx.done;
  } catch (error) {
    await tx.abort();
    throw error;
  }
}

export async function getMarketplaceListings() {
  const db = await dbPromise;
  const tx = db.transaction(['marketplace_listings', 'voices'], 'readonly');
  
  try {
    const listings = await tx.objectStore('marketplace_listings').getAll();
    const voices = await Promise.all(
      listings.map(listing => tx.objectStore('voices').get(listing.voiceId))
    );

    return listings.map((listing, i) => ({
      ...listing,
      voice: voices[i]
    }));
  } catch (error) {
    console.error('Error getting marketplace listings:', error);
    throw error;
  }
}
