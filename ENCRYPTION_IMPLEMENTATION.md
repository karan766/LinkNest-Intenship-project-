# End-to-End Encryption Implementation

## Overview

LinkNest now supports end-to-end encryption (E2EE) for chat messages using RSA-OAEP encryption with 2048-bit keys.

## How It Works

### Key Generation
- When a user logs in, a unique RSA key pair is automatically generated
- Public key is uploaded to the server and stored in the user's profile
- Private key is stored locally in browser's localStorage (never sent to server)

### Message Encryption Flow
1. Sender retrieves recipient's public key from server
2. Message is encrypted using recipient's public key
3. Encrypted message is sent to server and stored in database
4. Server cannot decrypt the message (no private key)

### Message Decryption Flow
1. Recipient receives encrypted message
2. Message is decrypted using recipient's private key (stored locally)
3. Decrypted message is displayed in the chat

## Security Features

- **RSA-OAEP 2048-bit encryption**: Industry-standard asymmetric encryption
- **Client-side encryption**: Messages are encrypted before leaving the browser
- **Private keys never leave the device**: Stored only in localStorage
- **Server cannot read messages**: Only encrypted data is stored in database
- **Backward compatible**: Works with existing unencrypted messages

## Visual Indicators

- 🔒 Green lock icon: Messages are end-to-end encrypted
- 🔓 Gray lock icon: Messages are not encrypted (recipient hasn't set up encryption)

## Implementation Files

### Backend
- `backend/models/userModel.js`: Added `publicKey` field to User schema
- `backend/controllers/userController.js`: Added `updatePublicKey` and `getPublicKey` endpoints
- `backend/routes/userRoutes.js`: Added routes for public key management

### Frontend
- `frontend/src/utils/encryption.js`: Core encryption utilities
- `frontend/src/hooks/useEncryption.js`: React hook for encryption initialization
- `frontend/src/components/MessageInput.jsx`: Encrypts messages before sending
- `frontend/src/components/Message.jsx`: Decrypts received messages
- `frontend/src/App.jsx`: Initializes encryption on app load
- `frontend/src/hooks/useLogout.js`: Clears encryption keys on logout

## API Endpoints

### Update Public Key
```
PUT /api/users/publickey
Body: { publicKey: "base64-encoded-public-key" }
```

### Get Public Key
```
GET /api/users/publickey/:userId
Response: { publicKey: "base64-encoded-public-key", username: "username" }
```

## Limitations

- Images are not encrypted (stored on Cloudinary)
- Private keys stored in localStorage (vulnerable to XSS attacks)
- No key rotation mechanism
- No forward secrecy
- No multi-device sync for keys

## Future Improvements

1. Implement key rotation and expiration
2. Add password-based encryption for private keys
3. Implement forward secrecy with ephemeral keys
4. Add multi-device key synchronization
5. Encrypt image messages
6. Add key verification/fingerprinting
7. Implement secure key backup and recovery

## Testing

To test encryption:
1. Log in with two different accounts in separate browsers
2. Send messages between the accounts
3. Check the lock icon status (should be green when both users have keys)
4. Verify messages are encrypted in the database (MongoDB)
5. Verify messages display correctly in the chat

## Notes

- Encryption is automatically enabled for all new users
- Existing users will have encryption enabled on their next login
- If encryption fails, messages fall back to unencrypted transmission
- The system gracefully handles mixed encrypted/unencrypted messages
