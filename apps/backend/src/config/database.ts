import mongoose from "mongoose";
import { env } from "@/config/env";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
