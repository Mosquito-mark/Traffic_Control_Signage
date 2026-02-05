
import { InventoryItem, Deployment } from '../types';
import { initialInventoryData, initialDeployments } from '../data/initialData';
import { encryptData, decryptData, isEncryptionReady } from './cryptoService';

const DB_NAME = 'traffic-inventory-db';
const DB_VERSION = 1;
const INVENTORY_STORE = 'inventory';
const DEPLOYMENTS_STORE = 'deployments';

let db: IDBDatabase;

function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = (event) => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = request.result;
            if (!tempDb.objectStoreNames.contains(INVENTORY_STORE)) {
                // SECURITY: The keyPath is now 'id' for encrypted blobs
                tempDb.createObjectStore(INVENTORY_STORE, { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains(DEPLOYMENTS_STORE)) {
                tempDb.createObjectStore(DEPLOYMENTS_STORE, { keyPath: 'id' });
            }
        };
    });
}

export async function initDB() {
    await isEncryptionReady(); // Ensure crypto key is available before DB operations
    const dbInstance = await getDb();
    const inventoryTransaction = dbInstance.transaction(INVENTORY_STORE, 'readonly');
    const inventoryStore = inventoryTransaction.objectStore(INVENTORY_STORE);
    const countRequest = inventoryStore.count();

    return new Promise<void>((resolve) => {
        countRequest.onsuccess = async () => {
            if (countRequest.result === 0) {
                console.log('Database is empty, populating with initial encrypted data...');
                const populateTransaction = dbInstance.transaction([INVENTORY_STORE, DEPLOYMENTS_STORE], 'readwrite');
                const invStore = populateTransaction.objectStore(INVENTORY_STORE);
                const depStore = populateTransaction.objectStore(DEPLOYMENTS_STORE);
                
                // Encrypt initial data before storing
                for (const item of initialInventoryData) {
                    const encrypted = await encryptData(item);
                    invStore.put({ id: item.item, data: encrypted });
                }
                for (const item of initialDeployments) {
                     const encrypted = await encryptData({ ...item, synced: true });
                    depStore.put({ id: item.id, data: encrypted });
                }

                populateTransaction.oncomplete = () => {
                    console.log('Initial encrypted data populated successfully.');
                    resolve();
                };
                 populateTransaction.onerror = () => {
                    console.error('Error populating initial data');
                    resolve();
                };
            } else {
                console.log('Database already contains data.');
                resolve();
            }
        };
         countRequest.onerror = () => {
            console.error('Could not count inventory items');
            resolve();
        };
    });
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
    const dbInstance = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(`Error getting all from ${storeName}`);
        request.onsuccess = async () => {
            try {
                // SECURITY: Decrypt each item after retrieval
                const encryptedItems = request.result;
                const decryptedItems = await Promise.all(
                    encryptedItems.map(item => decryptData<T>(item.data))
                );
                resolve(decryptedItems.filter(item => item !== null) as T[]);
            } catch (error) {
                console.error(`Failed to decrypt data from ${storeName}:`, error);
                reject('Decryption failed');
            }
        };
    });
}

export async function addOrUpdateItem<T extends { id?: string; item?: string }>(storeName: string, item: T): Promise<void> {
    const dbInstance = await getDb();
    // SECURITY: Encrypt the item before storing it
    const encryptedData = await encryptData(item);
    // Use the original item's keyPath property for the ID
    const keyPathValue = storeName === INVENTORY_STORE ? item.item : item.id;
    const itemToStore = { id: keyPathValue, data: encryptedData };

    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(itemToStore);

        request.onerror = () => reject(`Error adding/updating item in ${storeName}`);
        request.onsuccess = () => resolve();
    });
}
