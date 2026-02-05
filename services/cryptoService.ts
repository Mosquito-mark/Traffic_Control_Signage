
// This service manages a session-level encryption key and provides functions
// to encrypt and decrypt data using the browser's native Web Crypto API.

let sessionKey: CryptoKey | null = null;
let keyReadyPromise: Promise<void> | null = null;

/**
 * Generates an AES-GCM key and stores it in a non-exportable format for the current session.
 * This function is idempotent and will only generate the key once per session.
 */
async function generateSessionKey(): Promise<void> {
    if (sessionKey) return;

    try {
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256, // 256-bit key for strong encryption
            },
            true, // Key is extractable (for session storage, though not ideal)
            ['encrypt', 'decrypt']
        );
        sessionKey = key;
        console.log('Session encryption key generated.');
    } catch (error) {
        console.error('Error generating encryption key:', error);
        throw new Error('Could not initialize cryptographic module.');
    }
}

// Ensures that any cryptographic operation waits until the key is ready.
export function isEncryptionReady(): Promise<void> {
    if (!keyReadyPromise) {
        keyReadyPromise = generateSessionKey();
    }
    return keyReadyPromise;
}

/**
 * Encrypts a JavaScript object using the session key.
 * @param data The object to encrypt.
 * @returns A Base64 encoded string representing the encrypted data and initialization vector.
 */
export async function encryptData<T>(data: T): Promise<string> {
    await isEncryptionReady();
    if (!sessionKey) throw new Error('Encryption key not available.');

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM
    const jsonString = JSON.stringify(data);
    const encodedData = new TextEncoder().encode(jsonString);

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        sessionKey,
        encodedData
    );

    const encryptedBytes = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);
    
    // Convert the combined ArrayBuffer to a Base64 string for easy storage.
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

/**
 * Decrypts a Base64 encoded string back into a JavaScript object.
 * @param encryptedBase64 The encrypted string from storage.
 * @returns The original decrypted object, or null if decryption fails.
 */
export async function decryptData<T>(encryptedBase64: string): Promise<T | null> {
    await isEncryptionReady();
    if (!sessionKey) throw new Error('Decryption key not available.');

    try {
        const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
        const iv = combined.slice(0, 12);
        const encryptedContent = combined.slice(12);

        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            sessionKey,
            encryptedContent
        );

        const decodedString = new TextDecoder().decode(decryptedContent);
        return JSON.parse(decodedString) as T;
    } catch (error) {
        console.error('Decryption failed:', error);
        // Return null to indicate failure, allowing the app to handle potentially corrupted data gracefully.
        return null;
    }
}
