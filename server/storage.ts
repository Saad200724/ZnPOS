import { 
  businesses, 
  users, 
  categories, 
  products, 
  customers, 
  transactions, 
  transactionItems,
  type Business, 
  type User, 
  type Category,
  type Product,
  type Customer,
  type Transaction,
  type TransactionItem,
  type InsertBusiness, 
  type InsertUser, 
  type InsertCategory,
  type InsertProduct,
  type InsertCustomer,
  type InsertTransaction,
  type InsertTransactionItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, sum, count } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUserByUsernameAndBusiness(username: string, businessId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusiness(id: number): Promise<Business | undefined>;
  
  // Categories
  getCategories(businessId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(businessId: number): Promise<Product[]>;
  getProduct(id: number, businessId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, businessId: number, updates: Partial<InsertProduct>): Promise<Product>;
  getLowStockProducts(businessId: number): Promise<Product[]>;
  
  // Customers
  getCustomers(businessId: number): Promise<Customer[]>;
  getCustomer(id: number, businessId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, businessId: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  
  // Transactions
  getTransactions(businessId: number, limit?: number): Promise<(Transaction & { user: Pick<User, 'firstName' | 'lastName'>, customer?: Pick<Customer, 'firstName' | 'lastName'> })[]>;
  createTransaction(transaction: InsertTransaction, items: InsertTransactionItem[]): Promise<Transaction>;
  getDashboardStats(businessId: number): Promise<{
    todaySales: string;
    todayTransactions: number;
    averageSale: string;
    lowStockCount: number;
    todayGrowth: string;
    transactionGrowth: string;
    averageGrowth: string;
  }>;
  getTopProducts(businessId: number, limit: number): Promise<(Product & { soldCount: number; revenue: string })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsernameAndBusiness(username: string, businessId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.businessId, businessId)));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const [business] = await db
      .insert(businesses)
      .values(insertBusiness)
      .returning();
    return business;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id));
    return business || undefined;
  }

  async getCategories(businessId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.businessId, businessId));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getProducts(businessId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.businessId, businessId), eq(products.isActive, true)));
  }

  async getProduct(id: number, businessId: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.businessId, businessId)));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, businessId: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(and(eq(products.id, id), eq(products.businessId, businessId)))
      .returning();
    return product;
  }

  async getLowStockProducts(businessId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.businessId, businessId),
          eq(products.isActive, true),
          sql`${products.stock} <= ${products.lowStockThreshold}`
        )
      );
  }

  async getCustomers(businessId: number): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId));
  }

  async getCustomer(id: number, businessId: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, businessId: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set(updates)
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
      .returning();
    return customer;
  }

  async getTransactions(businessId: number, limit = 50): Promise<any[]> {
    return await db
      .select({
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
          lastName: users.lastName,
        },
        customer: {
          firstName: customers.firstName,
          lastName: customers.lastName,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .where(eq(transactions.businessId, businessId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(insertTransaction: InsertTransaction, items: InsertTransactionItem[]): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      // Create transaction
      const [transaction] = await tx
        .insert(transactions)
        .values(insertTransaction)
        .returning();

      // Create transaction items and update product stock
      for (const item of items) {
        await tx
          .insert(transactionItems)
          .values({
            ...item,
            transactionId: transaction.id,
          });

        // Update product stock
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      // Update customer total spent if customer exists
      if (insertTransaction.customerId) {
        await tx
          .update(customers)
          .set({ 
            totalSpent: sql`${customers.totalSpent} + ${insertTransaction.total}`,
            loyaltyPoints: sql`${customers.loyaltyPoints} + ${Math.floor(parseFloat(insertTransaction.total) / 10)}`
          })
          .where(eq(customers.id, insertTransaction.customerId));
      }

      return transaction;
    });
  }

  async getDashboardStats(businessId: number): Promise<{
    todaySales: string;
    todayTransactions: number;
    averageSale: string;
    lowStockCount: number;
    todayGrowth: string;
    transactionGrowth: string;
    averageGrowth: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's stats
    const [todayStats] = await db
      .select({
        sales: sum(transactions.total),
        count: count(transactions.id),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.businessId, businessId),
          sql`${transactions.createdAt} >= ${today.toISOString()}`
        )
      );

    // Yesterday's stats for comparison
    const [yesterdayStats] = await db
      .select({
        sales: sum(transactions.total),
        count: count(transactions.id),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.businessId, businessId),
          sql`${transactions.createdAt} >= ${yesterday.toISOString()} AND ${transactions.createdAt} < ${today.toISOString()}`
        )
      );

    // Low stock count
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.businessId, businessId),
          eq(products.isActive, true),
          sql`${products.stock} <= ${products.lowStockThreshold}`
        )
      );

    const todaySales = parseFloat(todayStats.sales || '0');
    const todayTransactions = todayStats.count || 0;
    const yesterdaySales = parseFloat(yesterdayStats.sales || '0');
    const yesterdayTransactions = yesterdayStats.count || 0;

    const averageSale = todayTransactions > 0 ? todaySales / todayTransactions : 0;
    const yesterdayAverage = yesterdayTransactions > 0 ? yesterdaySales / yesterdayTransactions : 0;

    const todayGrowth = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100) : 0;
    const transactionGrowth = yesterdayTransactions > 0 ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions * 100) : 0;
    const averageGrowth = yesterdayAverage > 0 ? ((averageSale - yesterdayAverage) / yesterdayAverage * 100) : 0;

    return {
      todaySales: todaySales.toFixed(2),
      todayTransactions,
      averageSale: averageSale.toFixed(2),
      lowStockCount: lowStockResult.count,
      todayGrowth: todayGrowth.toFixed(1),
      transactionGrowth: transactionGrowth.toFixed(1),
      averageGrowth: averageGrowth.toFixed(1),
    };
  }

  async getTopProducts(businessId: number, limit: number): Promise<(Product & { soldCount: number; revenue: string })[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .select({
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
        revenue: sum(transactionItems.total),
      })
      .from(products)
      .innerJoin(transactionItems, eq(products.id, transactionItems.productId))
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(products.businessId, businessId),
          sql`${transactions.createdAt} >= ${thirtyDaysAgo.toISOString()}`
        )
      )
      .groupBy(products.id)
      .orderBy(desc(sum(transactionItems.total)))
      .limit(limit);

    return result.map(item => ({
      ...item,
      soldCount: Number(item.soldCount) || 0,
      revenue: (Number(item.revenue) || 0).toFixed(2),
    }));
  }
}

export const storage = new DatabaseStorage();
