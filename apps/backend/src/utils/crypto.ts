import bcrypt from "bcryptjs";
import { env } from "@/config/env";

export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
}

export async function compareHash(value: string, hashedValue: string): Promise<boolean> {
  return bcrypt.compare(value, hashedValue);
}
