import {NEXT_AUTH_SECRET} from "./constants";

/**
 * 使用 AES 加密保护敏感数据（如 token）
 * 使用 Web Crypto API 进行安全的加密/解密
 */

// 生成加密密钥
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(NEXT_AUTH_SECRET);

  return await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      {name: 'AES-GCM'},
      false,
      ['encrypt', 'decrypt']
  );
}

/**
 * 加密数据
 * @param data 要加密的数据对象
 * @returns 加密后的字符串
 */
export async function encryptData(data: object): Promise<string> {
  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 字节的 IV

    const encodedData = encoder.encode(JSON.stringify(data));

    const encryptedData = await crypto.subtle.encrypt(
        {name: 'AES-GCM', iv},
        key,
        encodedData
    );

    // 将 IV 和加密数据组合
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // 转换为 base64 字符串
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error("Error encrypting data:", e);
    throw e;
  }
}

/**
 * 解密数据
 * @param encryptedData 加密的字符串
 * @returns 解密后的数据对象，失败返回 null
 */
export async function decryptData<T = any>(encryptedData: string): Promise<T | null> {
  try {
    const key = await getCryptoKey();

    // 从 base64 解码
    const binaryString = atob(encryptedData);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // 提取 IV 和加密数据
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // 解密数据
    const decryptedData = await crypto.subtle.decrypt(
        {name: 'AES-GCM', iv},
        key,
        encrypted
    );

    // 转换为字符串并解析 JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedData);
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Error decrypting data:", e);
    return null;
  }
}

/**
 * 加密 Token（兼容旧接口）
 * @deprecated 建议使用 encryptData
 */
export const encodeJWT = async (payload: object): Promise<string> => {
  return await encryptData(payload);
};

/**
 * 解密 Token（兼容旧接口）
 * @deprecated 建议使用 decryptData
 */
export const decodeJWT = async <T = any>(token: string): Promise<T | null> => {
  return await decryptData<T>(token);
};