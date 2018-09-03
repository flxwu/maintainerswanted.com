/**
 * Convert a .p12 file to .pem string
 * @param filename The .p12 key filename.
 * @param callback The callback function.
 * @return A promise that resolves with the .pem private key
 *         if no callback provided.
 */
export declare function getPem(filename: string): Promise<string>;
export declare function getPem(filename: string, callback: (err: Error | null, pem: string | null) => void): void;
