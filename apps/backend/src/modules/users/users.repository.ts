import { UserModel } from "@/models/user.model";

export class UsersRepository {
  async createCashier(payload: {
    tenantId: string;
    shopId: string;
    name: string;
    email: string;
    password: string;
    role: "cashier";
  }) {
    return UserModel.create(payload);
  }

  async findCashiers(tenantId: string, shopId: string) {
    return UserModel.find({ tenantId, shopId, role: "cashier" }).sort({ createdAt: -1 });
  }

  async findCashierById(id: string, tenantId: string, shopId: string) {
    return UserModel.findOne({ _id: id, tenantId, shopId, role: "cashier" });
  }

  async updateCashier(id: string, tenantId: string, shopId: string, payload: Record<string, unknown>) {
    return UserModel.findOneAndUpdate({ _id: id, tenantId, shopId, role: "cashier" }, payload, { new: true });
  }

  async deleteCashier(id: string, tenantId: string, shopId: string) {
    return UserModel.findOneAndDelete({ _id: id, tenantId, shopId, role: "cashier" });
  }

  async findCashierByEmail(email: string, tenantId: string, shopId: string) {
    return UserModel.findOne({ email: email.toLowerCase(), tenantId, shopId, role: "cashier" });
  }
}
