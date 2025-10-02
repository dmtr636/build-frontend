export interface SymPayload {
    salt: string; // base64, 16 байт
    iv: string; // base64, 12 байт
    ciphertext: string; // base64, AES-GCM (включая auth-tag)
}

const b64enc = (buf: ArrayBuffer | Uint8Array): string => {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
};

const b64dec = (b64: string): Uint8Array => {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
};

const enc = new TextEncoder();
const dec = new TextDecoder();

const subtle: SubtleCrypto = (() => {
    if (typeof crypto !== "undefined" && crypto.subtle) return crypto.subtle;
    throw new Error("Web Crypto Subtle API недоступен в этом окружении.");
})();

async function deriveAesGcmKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
    );

    return subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100_000, // можно менять по требованиям производительности
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

export async function encryptSym(plaintext: string, password: string): Promise<SymPayload> {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // уникальная соль на сообщение
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 байт для GCM

    const key = await deriveAesGcmKey(password, salt);
    const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));

    return {
        salt: b64enc(salt),
        iv: b64enc(iv),
        ciphertext: b64enc(ct),
    };
}

export async function decryptSym(payload: SymPayload, password: string): Promise<string> {
    const salt = b64dec(payload.salt);
    const iv = b64dec(payload.iv);
    const ct = b64dec(payload.ciphertext);

    const key = await deriveAesGcmKey(password, salt);
    const plainBuf = await subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return dec.decode(plainBuf);
}
