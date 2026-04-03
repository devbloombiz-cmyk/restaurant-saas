import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/config/env";
import { OrderModel } from "@/models/order.model";
import { UserModel } from "@/models/user.model";
import { ShopSettingModel } from "@/models/shopSetting.model";
import { MenuCategoryModel } from "@/models/menuCategory.model";
import { MenuItemModel } from "@/models/menuItem.model";

export class SystemRepository {
  private getBackupDir(): string {
    return path.resolve(process.cwd(), env.BACKUP_DIR);
  }

  async listBackups() {
    const dir = this.getBackupDir();
    await fs.mkdir(dir, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const stat = await fs.stat(fullPath);

          return {
            filename: entry.name,
            sizeBytes: stat.size,
            updatedAt: stat.mtime.toISOString()
          };
        })
    );

    return files.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async createBackupSnapshot(tenantId: string, shopId: string): Promise<{ fileName: string; fullPath: string }> {
    const [orders, users, settings, categories, items] = await Promise.all([
      OrderModel.find({ tenantId, shopId }).lean(),
      UserModel.find({ tenantId, shopId }).lean(),
      ShopSettingModel.find({ tenantId, shopId }).lean(),
      MenuCategoryModel.find({ tenantId, shopId }).lean(),
      MenuItemModel.find({ tenantId, shopId }).lean()
    ]);

    const now = new Date().toISOString().replace(/[.:]/g, "-");
    const fileName = `backup_${tenantId}_${shopId}_${now}.json`;
    const dir = this.getBackupDir();
    await fs.mkdir(dir, { recursive: true });

    const reportSnapshot = {
      totalOrders: orders.length,
      totalUsers: users.length,
      generatedAt: new Date().toISOString()
    };

    const payload = {
      tenantId,
      shopId,
      createdAt: new Date().toISOString(),
      data: {
        orders,
        users,
        settings,
        menu: {
          categories,
          items
        },
        reportSnapshot
      }
    };

    const fullPath = path.join(dir, fileName);
    await fs.writeFile(fullPath, JSON.stringify(payload, null, 2), "utf-8");

    return { fileName, fullPath };
  }

  async restoreFromBackup(tenantId: string, shopId: string, fileName: string): Promise<void> {
    const fullPath = path.join(this.getBackupDir(), fileName);
    const raw = await fs.readFile(fullPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      data: {
        orders: Array<Record<string, unknown>>;
        users: Array<Record<string, unknown>>;
        settings: Array<Record<string, unknown>>;
        menu: {
          categories: Array<Record<string, unknown>>;
          items: Array<Record<string, unknown>>;
        };
      };
    };

    await Promise.all([
      OrderModel.deleteMany({ tenantId, shopId }),
      UserModel.deleteMany({ tenantId, shopId }),
      ShopSettingModel.deleteMany({ tenantId, shopId }),
      MenuCategoryModel.deleteMany({ tenantId, shopId }),
      MenuItemModel.deleteMany({ tenantId, shopId })
    ]);

    if (parsed.data.orders.length > 0) {
      await OrderModel.insertMany(parsed.data.orders);
    }
    if (parsed.data.users.length > 0) {
      await UserModel.insertMany(parsed.data.users);
    }
    if (parsed.data.settings.length > 0) {
      await ShopSettingModel.insertMany(parsed.data.settings);
    }
    if (parsed.data.menu.categories.length > 0) {
      await MenuCategoryModel.insertMany(parsed.data.menu.categories);
    }
    if (parsed.data.menu.items.length > 0) {
      await MenuItemModel.insertMany(parsed.data.menu.items);
    }
  }

  async getBackupFilePath(fileName: string): Promise<string> {
    const fullPath = path.join(this.getBackupDir(), fileName);
    await fs.access(fullPath);
    return fullPath;
  }
}
