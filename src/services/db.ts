import { VideoProject, GeneratedImage, ChatMessage, SunoMusicTrack, CustomExtension } from '../types';

const DB_NAME = 'flowmotion_studio_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chat')) {
        db.createObjectStore('chat', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('music')) {
        db.createObjectStore('music', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('extensions')) {
        db.createObjectStore('extensions', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function saveProject(project: VideoProject): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    const req = store.put(project);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getProjects(): Promise<VideoProject[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const req = store.getAll();
    req.onsuccess = () => {
      const sorted = (req.result || []).sort((a: VideoProject, b: VideoProject) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveImage(image: GeneratedImage): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.put(image);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getImages(): Promise<GeneratedImage[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const req = store.getAll();
    req.onsuccess = () => {
      const sorted = (req.result || []).sort((a: GeneratedImage, b: GeneratedImage) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat', 'readwrite');
    const store = tx.objectStore('chat');
    const req = store.put(msg);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat', 'readonly');
    const store = tx.objectStore('chat');
    const req = store.getAll();
    req.onsuccess = () => {
      const sorted = (req.result || []).sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearChatMessages(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chat', 'readwrite');
    const store = tx.objectStore('chat');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveMusicTrack(track: SunoMusicTrack): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('music', 'readwrite');
    const store = tx.objectStore('music');
    const req = store.put(track);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getMusicTracks(): Promise<SunoMusicTrack[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('music', 'readonly');
    const store = tx.objectStore('music');
    const req = store.getAll();
    req.onsuccess = () => {
      const sorted = (req.result || []).sort((a: SunoMusicTrack, b: SunoMusicTrack) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveExtensions(extensions: CustomExtension[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('extensions', 'readwrite');
    const store = tx.objectStore('extensions');
    store.clear();
    for (const ext of extensions) {
      store.put(ext);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getExtensions(): Promise<CustomExtension[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('extensions', 'readonly');
    const store = tx.objectStore('extensions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
