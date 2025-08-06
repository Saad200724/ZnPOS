var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  businesses: () => businesses,
  businessesRelations: () => businessesRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  insertBusinessSchema: () => insertBusinessSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertProductSchema: () => insertProductSchema,
  insertTransactionItemSchema: () => insertTransactionItemSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  products: () => products,
  productsRelations: () => productsRelations,
  transactionItems: () => transactionItems,
  transactionItemsRelations: () => transactionItemsRelations,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0.0825"),
  // Default 8.25%
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("employee"),
  // admin, manager, employee
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueUsername: unique().on(table.businessId, table.username),
  uniqueEmail: unique().on(table.businessId, table.email)
}));
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  stock: integer("stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  skuIndex: index("idx_products_sku").on(table.businessId, table.sku),
  barcodeIndex: index("idx_products_barcode").on(table.businessId, table.barcode)
}));
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  loyaltyPoints: integer("loyalty_points").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  transactionNumber: text("transaction_number").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  // cash, card, mobile
  status: text("status").notNull().default("completed"),
  // completed, pending, refunded
  createdAt: timestamp("created_at").defaultNow()
});
var transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull()
});
var businessesRelations = relations(businesses, ({ many }) => ({
  users: many(users),
  categories: many(categories),
  products: many(products),
  customers: many(customers),
  transactions: many(transactions)
}));
var usersRelations = relations(users, ({ one, many }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id]
  }),
  transactions: many(transactions)
}));
var categoriesRelations = relations(categories, ({ one, many }) => ({
  business: one(businesses, {
    fields: [categories.businessId],
    references: [businesses.id]
  }),
  products: many(products)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id]
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  transactionItems: many(transactionItems)
}));
var customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id]
  }),
  transactions: many(transactions)
}));
var transactionsRelations = relations(transactions, ({ one, many }) => ({
  business: one(businesses, {
    fields: [transactions.businessId],
    references: [businesses.id]
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id]
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  items: many(transactionItems)
}));
var transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id]
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id]
  })
}));
var insertBusinessSchema = createInsertSchema(businesses).omit({ id: true, createdAt: true });
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
var insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
var insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
var insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, totalSpent: true });
var insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
var insertTransactionItemSchema = createInsertSchema(transactionItems).omit({ id: true });

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, sql, sum, count } from "drizzle-orm";
var DatabaseStorage = class {
  async getUserByUsernameAndBusiness(username, businessId) {
    const [user] = await db.select().from(users).where(and(eq(users.username, username), eq(users.businessId, businessId)));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createBusiness(insertBusiness) {
    const [business] = await db.insert(businesses).values(insertBusiness).returning();
    return business;
  }
  async getBusiness(id) {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || void 0;
  }
  async getCategories(businessId) {
    return await db.select().from(categories).where(eq(categories.businessId, businessId));
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async getProducts(businessId) {
    return await db.select().from(products).where(and(eq(products.businessId, businessId), eq(products.isActive, true)));
  }
  async getProduct(id, businessId) {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.businessId, businessId)));
    return product || void 0;
  }
  async createProduct(insertProduct) {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProduct(id, businessId, updates) {
    const [product] = await db.update(products).set(updates).where(and(eq(products.id, id), eq(products.businessId, businessId))).returning();
    return product;
  }
  async getLowStockProducts(businessId) {
    return await db.select().from(products).where(
      and(
        eq(products.businessId, businessId),
        eq(products.isActive, true),
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
  }
  async getCustomers(businessId) {
    return await db.select().from(customers).where(eq(customers.businessId, businessId));
  }
  async getCustomer(id, businessId) {
    const [customer] = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
    return customer || void 0;
  }
  async createCustomer(insertCustomer) {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomer(id, businessId, updates) {
    const [customer] = await db.update(customers).set(updates).where(and(eq(customers.id, id), eq(customers.businessId, businessId))).returning();
    return customer;
  }
  async getTransactions(businessId, limit = 50) {
    return await db.select({
      id: transactions.id,
      businessId: transactions.businessId,
      customerId: transactions.customerId,
      userId: transactions.userId,
      transactionNumber: transactions.transactionNumber,
      subtotal: transactions.subtotal,
      taxAmount: transactions.taxAmount,
      total: transactions.total,
      paymentMethod: transactions.paymentMethod,
      status: transactions.status,
      createdAt: transactions.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName
      },
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName
      }
    }).from(transactions).leftJoin(users, eq(transactions.userId, users.id)).leftJoin(customers, eq(transactions.customerId, customers.id)).where(eq(transactions.businessId, businessId)).orderBy(desc(transactions.createdAt)).limit(limit);
  }
  async createTransaction(insertTransaction, items) {
    return await db.transaction(async (tx) => {
      const [transaction] = await tx.insert(transactions).values(insertTransaction).returning();
      for (const item of items) {
        await tx.insert(transactionItems).values({
          ...item,
          transactionId: transaction.id
        });
        await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(eq(products.id, item.productId));
      }
      if (insertTransaction.customerId) {
        await tx.update(customers).set({
          totalSpent: sql`${customers.totalSpent} + ${insertTransaction.total}`,
          loyaltyPoints: sql`${customers.loyaltyPoints} + ${Math.floor(parseFloat(insertTransaction.total) / 10)}`
        }).where(eq(customers.id, insertTransaction.customerId));
      }
      return transaction;
    });
  }
  async getDashboardStats(businessId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const [todayStats] = await db.select({
      sales: sum(transactions.total),
      count: count(transactions.id)
    }).from(transactions).where(
      and(
        eq(transactions.businessId, businessId),
        sql`${transactions.createdAt} >= ${today.toISOString()}`
      )
    );
    const [yesterdayStats] = await db.select({
      sales: sum(transactions.total),
      count: count(transactions.id)
    }).from(transactions).where(
      and(
        eq(transactions.businessId, businessId),
        sql`${transactions.createdAt} >= ${yesterday.toISOString()} AND ${transactions.createdAt} < ${today.toISOString()}`
      )
    );
    const [lowStockResult] = await db.select({ count: count() }).from(products).where(
      and(
        eq(products.businessId, businessId),
        eq(products.isActive, true),
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
    const todaySales = parseFloat(todayStats.sales || "0");
    const todayTransactions = todayStats.count || 0;
    const yesterdaySales = parseFloat(yesterdayStats.sales || "0");
    const yesterdayTransactions = yesterdayStats.count || 0;
    const averageSale = todayTransactions > 0 ? todaySales / todayTransactions : 0;
    const yesterdayAverage = yesterdayTransactions > 0 ? yesterdaySales / yesterdayTransactions : 0;
    const todayGrowth = yesterdaySales > 0 ? (todaySales - yesterdaySales) / yesterdaySales * 100 : 0;
    const transactionGrowth = yesterdayTransactions > 0 ? (todayTransactions - yesterdayTransactions) / yesterdayTransactions * 100 : 0;
    const averageGrowth = yesterdayAverage > 0 ? (averageSale - yesterdayAverage) / yesterdayAverage * 100 : 0;
    return {
      todaySales: todaySales.toFixed(2),
      todayTransactions,
      averageSale: averageSale.toFixed(2),
      lowStockCount: lowStockResult.count,
      todayGrowth: todayGrowth.toFixed(1),
      transactionGrowth: transactionGrowth.toFixed(1),
      averageGrowth: averageGrowth.toFixed(1)
    };
  }
  async getTopProducts(businessId, limit) {
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await db.select({
      id: products.id,
      businessId: products.businessId,
      categoryId: products.categoryId,
      name: products.name,
      description: products.description,
      sku: products.sku,
      barcode: products.barcode,
      price: products.price,
      cost: products.cost,
      stock: products.stock,
      lowStockThreshold: products.lowStockThreshold,
      isActive: products.isActive,
      createdAt: products.createdAt,
      soldCount: sum(transactionItems.quantity),
      revenue: sum(transactionItems.total)
    }).from(products).innerJoin(transactionItems, eq(products.id, transactionItems.productId)).innerJoin(transactions, eq(transactionItems.transactionId, transactions.id)).where(
      and(
        eq(products.businessId, businessId),
        sql`${transactions.createdAt} >= ${thirtyDaysAgo.toISOString()}`
      )
    ).groupBy(products.id).orderBy(desc(sum(transactionItems.total))).limit(limit);
    return result.map((item) => ({
      ...item,
      soldCount: Number(item.soldCount) || 0,
      revenue: (Number(item.revenue) || 0).toFixed(2)
    }));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import session from "express-session";
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "znforge-pos-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1e3 }
    // 24 hours
  }));
  function requireAuth(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }
  app2.post("/api/register", async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body.business);
      const userData = insertUserSchema.parse({
        ...req.body.user,
        businessId: 0,
        // Will be set after business creation
        role: "admin"
      });
      const business = await storage.createBusiness(businessData);
      const user = await storage.createUser({
        ...userData,
        businessId: business.id
      });
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
      res.json({ user: req.session.user, business });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, businessId } = req.body;
      const user = await storage.getUserByUsernameAndBusiness(username, businessId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
      const business = await storage.getBusiness(user.businessId);
      res.json({ user: req.session.user, business });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Login failed"
      });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
  app2.get("/api/me", requireAuth, async (req, res) => {
    try {
      const business = await storage.getBusiness(req.session.user.businessId);
      res.json({ user: req.session.user, business });
    } catch (error) {
      console.error("Database error in /api/me:", error);
      res.status(500).json({ message: "Database connection failed" });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.user.businessId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/recent-transactions", requireAuth, async (req, res) => {
    try {
      const transactions2 = await storage.getTransactions(req.session.user.businessId, 10);
      res.json(transactions2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/top-products", requireAuth, async (req, res) => {
    try {
      const products2 = await storage.getTopProducts(req.session.user.businessId, 5);
      res.json(products2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/low-stock", requireAuth, async (req, res) => {
    try {
      const products2 = await storage.getLowStockProducts(req.session.user.businessId);
      res.json(products2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products2 = await storage.getProducts(req.session.user.businessId);
      res.json(products2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        businessId: req.session.user.businessId
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers2 = await storage.getCustomers(req.session.user.businessId);
      res.json(customers2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        businessId: req.session.user.businessId
      });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions2 = await storage.getTransactions(req.session.user.businessId);
      res.json(transactions2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { transaction, items } = req.body;
      const transactionNumber = `TXN-${Date.now()}`;
      const transactionData = insertTransactionSchema.parse({
        ...transaction,
        businessId: req.session.user.businessId,
        userId: req.session.user.id,
        transactionNumber
      });
      const createdTransaction = await storage.createTransaction(transactionData, items);
      res.json(createdTransaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
