import * as crypto from 'crypto';
import * as fs from 'fs';

const ALGORITHM = 'aes-256-gcm'; // Encryption algorithm
const KEY_FILE = 'encryption_key.json'; // Key file
const ENCRYPTED_FILE = 'encrypted_message.json'; // Encrypted file

function generateKey(): void {
    const key = crypto.randomBytes(32); 
    const iv = crypto.randomBytes(16); 
    fs.writeFileSync(KEY_FILE, JSON.stringify({ key: key.toString('hex'), iv: iv.toString('hex') }));
    console.log(`Encryption key and IV saved to '${KEY_FILE}'.`);
}

function encryptMessage(message: string): void {
    const { key, iv } = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'));
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    fs.writeFileSync(ENCRYPTED_FILE, JSON.stringify({ encrypted, authTag }));
    console.log(`Encrypted message saved to '${ENCRYPTED_FILE}'.`);
}

function decryptMessage(): void {
    const { key, iv } = JSON.parse(fs.readFileSync(KEY_FILE, 'utf-8'));
    const { encrypted, authTag } = JSON.parse(fs.readFileSync(ENCRYPTED_FILE, 'utf-8'));

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(`Decrypted message: ${decrypted}`);
}

const action = process.argv[2]; 
const message = process.argv[3]; 

switch (action) {
    case 'generate':
        generateKey();
        break;
    case 'encrypt':
        if (!message) {
            console.error('Please provide a message to encrypt.');
        } else {
            encryptMessage(message);
        }
        break;
    case 'decrypt':
        decryptMessage();
        break;
    default:
        console.error('Invalid action. Use "generate", "encrypt <message>", or "decrypt".');
}
