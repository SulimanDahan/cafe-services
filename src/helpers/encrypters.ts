import crypto from "crypto";

const HASH_METHOD: string = process.env.DEFAULT_HASH_METHOD || "sha256";

export default function encryptPassword(data: string): string {
	return crypto.createHash(HASH_METHOD).update(data).digest("hex");
}
