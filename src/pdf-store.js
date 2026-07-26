const DB_NAME = "wenzhe-academic-site-v2-files";
const STORE_NAME = "pdfs";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putPdf(key, file) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(file, key);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getPdf(key) {
  const db = await openDb();
  const result = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function deletePdf(key) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  db.close();
}
