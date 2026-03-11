/**
 * End-to-End Encryption Utilities for Chat Messages
 * Uses Web Crypto API for secure encryption
 */

// Generate a new encryption key pair for a user
export async function generateKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    return keyPair;
  } catch (error) {
    console.error("Error generating key pair:", error);
    throw error;
  }
}

// Export public key to string format
export async function exportPublicKey(publicKey) {
  try {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    const exportedAsString = arrayBufferToBase64(exported);
    return exportedAsString;
  } catch (error) {
    console.error("Error exporting public key:", error);
    throw error;
  }
}

// Export private key to string format
export async function exportPrivateKey(privateKey) {
  try {
    const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
    const exportedAsString = arrayBufferToBase64(exported);
    return exportedAsString;
  } catch (error) {
    console.error("Error exporting private key:", error);
    throw error;
  }
}

// Import public key from string format
export async function importPublicKey(publicKeyString) {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyString);
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
    return publicKey;
  } catch (error) {
    console.error("Error importing public key:", error);
    throw error;
  }
}

// Import private key from string format
export async function importPrivateKey(privateKeyString) {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
    return privateKey;
  } catch (error) {
    console.error("Error importing private key:", error);
    throw error;
  }
}

// Encrypt a message using recipient's public key
export async function encryptMessage(message, recipientPublicKeyString) {
  try {
    const publicKey = await importPublicKey(recipientPublicKeyString);
    const encodedMessage = new TextEncoder().encode(message);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encodedMessage
    );
    
    return arrayBufferToBase64(encryptedBuffer);
  } catch (error) {
    console.error("Error encrypting message:", error);
    throw error;
  }
}

// Decrypt a message using user's private key
export async function decryptMessage(encryptedMessage, privateKeyString) {
  try {
    const privateKey = await importPrivateKey(privateKeyString);
    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedBuffer
    );
    
    const decryptedMessage = new TextDecoder().decode(decryptedBuffer);
    return decryptedMessage;
  } catch (error) {
    console.error("Error decrypting message:", error);
    return "[Encrypted Message - Unable to Decrypt]";
  }
}

// Helper: Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Store keys in localStorage (encrypted with user password in production)
export function storePrivateKey(userId, privateKey) {
  localStorage.setItem(`privateKey_${userId}`, privateKey);
}

export function getPrivateKey(userId) {
  return localStorage.getItem(`privateKey_${userId}`);
}

export function clearPrivateKey(userId) {
  localStorage.removeItem(`privateKey_${userId}`);
}

// Initialize encryption for a new user
export async function initializeEncryption(userId) {
  try {
    // Check if keys already exist
    const existingPrivateKey = getPrivateKey(userId);
    if (existingPrivateKey) {
      return { success: true, message: "Keys already exist" };
    }

    // Generate new key pair
    const keyPair = await generateKeyPair();
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);

    // Store private key locally
    storePrivateKey(userId, privateKey);

    return {
      success: true,
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error("Error initializing encryption:", error);
    return { success: false, error: error.message };
  }
}
