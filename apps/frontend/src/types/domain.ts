export type Shop = {
  _id: string;
  tenantId: string;
  shopId: string;
  name: string;
  location: string;
  printerConfig: Record<string, unknown>;
  isActive: boolean;
};

export type MenuCategory = {
  _id: string;
  tenantId: string;
  shopId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type MenuItem = {
  _id: string;
  tenantId: string;
  shopId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  modifierEnabled: boolean;
  isAvailable: boolean;
  image: string;
  sortOrder: number;
};

export type Modifier = {
  _id: string;
  tenantId: string;
  shopId: string;
  itemId: string;
  name: string;
  priceAdjustment: number;
  type: "add" | "remove";
};

export type OrderPaymentMode = "cash" | "card" | "pending";
export type OrderType = "website" | "takeaway" | "eat_in";

export type OrderItemInput = {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  modifiers?: Array<{
    modifierId: string;
    name: string;
    priceAdjustment: number;
  }>;
};

export type CreateOrderPayload = {
  orderType: OrderType;
  paymentMode: OrderPaymentMode;
  items: OrderItemInput[];
};

export type DailyReport = {
  totalOrders: number;
  totalSales: number;
  cashTotal: number;
  cardTotal: number;
  pendingTotal: number;
};

export type PrinterSettings = {
  _id?: string;
  printerName: string;
  printerType: "thermal" | "inkjet" | "laser";
  connectionType: "lan" | "wifi" | "usb";
  ipAddress: string;
  port: number;
  paperWidth: 58 | 80;
  autoPrint: boolean;
  copies: number;
  isActive: boolean;
};

export type KotPayload = {
  orderId: string;
  orderNumber: string;
  copies: number;
  paperWidth: number;
  html: string;
};

export type Cashier = {
  _id: string;
  name: string;
  email: string;
  role: "cashier";
  isActive: boolean;
};

export type AuditLog = {
  _id: string;
  userId: string;
  action: string;
  module: string;
  metadata: Record<string, unknown>;
  timestamp: string;
};

export type ShopSettings = {
  _id?: string;
  shopName: string;
  currency: string;
  timezone: string;
  taxRate: number;
  receiptFooter: string;
  printerDefaults: Record<string, unknown>;
  logo: string;
  supportNumber: string;
};

export type TenantSummary = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type ShopSummary = {
  _id: string;
  tenantId: string;
  shopId: string;
  name: string;
  location: string;
  isActive: boolean;
};

export type PlatformSummary = {
  totalTenants: number;
  totalShops: number;
  totalOrders: number;
  activeCashiers: number;
  revenueSnapshot: number;
};
