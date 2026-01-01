import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive encryption key from user ID and secret
 */
function deriveKey(userId: string, secret: string): Buffer {
    return crypto.pbkdf2Sync(
        secret,
        userId,
        100000,
        KEY_LENGTH,
        'sha512'
    );
}

/**
 * Encrypt storage credentials
 * @param credentials - Plain credentials object
 * @param userId - User ID for key derivation
 * @returns Encrypted string
 */
export function encryptCredentials(credentials: any, userId: string): string {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) throw new Error('ENCRYPTION_SECRET not configured');

    const key = deriveKey(userId, secret);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintext = JSON.stringify(credentials);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt storage credentials
 * @param encryptedData - Encrypted string
 * @param userId - User ID for key derivation
 * @returns Decrypted credentials object
 */
export function decryptCredentials(encryptedData: string, userId: string): any {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) throw new Error('ENCRYPTION_SECRET not configured');

    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    if (!ivHex || !tagHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
    }

    const key = deriveKey(userId, secret);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}
