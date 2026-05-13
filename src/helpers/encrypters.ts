import crypto from "crypto";

const HASH_METHOD: string = process.env.DEFAULT_HASH_METHOD || "sha256";
const PASSWORD_SALT: string =
	process.env.DEFAULT_PASSWORD_SALT ||
	"cafe_secure_enterprise_salt_key_998877";

export default function encryptPassword(data: string): string {
	return crypto
		.createHmac(HASH_METHOD, PASSWORD_SALT)
		.update(data)
		.digest("hex");
}
