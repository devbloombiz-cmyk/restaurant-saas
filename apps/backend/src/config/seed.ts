import { UserModel } from "@/models/user.model";
import { hashValue } from "@/utils/crypto";
import { env } from "@/config/env";
import { USER_ROLES } from "@shared/types/roles";

export async function ensureSuperAdminSeed(): Promise<void> {
  const existingSuperAdmin = await UserModel.findOne({
    email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
    role: USER_ROLES.SUPER_ADMIN
  });

  if (existingSuperAdmin) {
    return;
  }

  const hashedPassword = await hashValue(env.SUPER_ADMIN_PASSWORD);

  await UserModel.create({
    tenantId: "platform",
    shopId: "platform",
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    role: USER_ROLES.SUPER_ADMIN,
    isActive: true
  });
}
