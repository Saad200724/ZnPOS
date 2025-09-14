import { z } from "zod";

// Business schema
export const insertBusinessSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxRate: z.string().default("0.0825"),
  currency: z.string().default("BDT"),
});

// User schema
export const insertUserSchema = z.object({
  businessId: z.number(),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().default("employee"),
  isActive: z.boolean().default(true),
  permissions: z.object({
    pos: z.boolean(),
    inventory: z.boolean(),
    customers: z.boolean(),
    reports: z.boolean(),
    employees: z.boolean(),
    settings: z.boolean(),
  }).default({
    pos: false,
    inventory: false,
    customers: false,
    reports: false,
    employees: false,
    settings: false,
  }),
});

// Category schema
export const insertCategorySchema = z.object({
  businessId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
});

// Product schema
export const insertProductSchema = z.object({
  businessId: z.number(),
  categoryId: z.number().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.string(),
  cost: z.string().default("0.00"),
  stock: z.number().default(0),
  lowStockThreshold: z.number().default(5),
  isActive: z.boolean().default(true),
});

// Customer schema
export const insertCustomerSchema = z.object({
  businessId: z.number(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  loyaltyPoints: z.number().default(0),
  totalSpent: z.string().default("0.00"),
});

// Transaction schema
export const insertTransactionSchema = z.object({
  businessId: z.number(),
  customerId: z.number().optional(),
  userId: z.number(),
  transactionNumber: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  total: z.string(),
  paymentMethod: z.string(),
  status: z.string().default("completed"),
});

// Transaction item schema
export const insertTransactionItemSchema = z.object({
  transactionId: z.number(),
  productId: z.number(),
  quantity: z.number(),
  unitPrice: z.string(),
  total: z.string(),
});