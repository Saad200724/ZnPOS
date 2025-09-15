import { ObjectId, Db } from 'mongodb';
import { getDb } from './mongodb';
import bcrypt from 'bcrypt';

// Types adapted for MongoDB
export interface MongoUser {
  _id?: ObjectId;
  id: number;
  businessId: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  permissions: {
    pos: boolean;
    inventory: boolean;
    customers: boolean;
    reports: boolean;
    employees: boolean;
    settings: boolean;
  };
  createdAt: Date;
}

export interface MongoBusiness {
  _id?: ObjectId;
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxRate: string;
  currency: string;
  createdAt: Date;
}

export interface MongoProduct {
  _id?: ObjectId;
  id: number;
  businessId: number;
  categoryId?: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: string;
  cost: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MongoCustomer {
  _id?: ObjectId;
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: string;
  createdAt: Date;
}

export interface MongoTransaction {
  _id?: ObjectId;
  id: number;
  businessId: number;
  customerId?: number;
  userId: number;
  transactionNumber: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  paymentMethod: string;
  status: string;
  createdAt: Date;
}

export interface MongoCategory {
  _id?: ObjectId;
  id: number;
  businessId: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface MongoTransactionItem {
  _id?: ObjectId;
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  total: string;
}

export class MongoStorage {
  private db: Db;

  constructor() {
    this.db = getDb();
  }

  // Helper to get next ID
  async getNextId(collection: string): Promise<number> {
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: collection as any },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return counter?.value?.seq || counter?.seq || 1;
  }

  // Auth
  async getUserByUsernameAndPassword(username: string, password: string): Promise<MongoUser | undefined> {
    const trimmedUsername = username.trim();
    
    const user = await this.db.collection('users').findOne({ 
      $or: [{ username: trimmedUsername }, { email: trimmedUsername }],
      isActive: true
    }) as MongoUser | null;
    
    if (!user) {
      return undefined;
    }
    
    // First try bcrypt comparison
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      // If bcrypt fails, the password might not be properly hashed
      // Fall through to legacy password check
    }
    
    // If bcrypt fails, check if it's a plaintext password (legacy case)
    if (!isPasswordValid && user.password === password) {
      // Rehash the password properly
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Update the user's password in the database
      await this.db.collection('users').updateOne(
        { id: user.id },
        { $set: { password: hashedPassword } }
      );
      
      // Update the local user object
      user.password = hashedPassword;
      isPasswordValid = true;
    }
    
    if (!isPasswordValid) {
      return undefined;
    }
    
    return user;
  }

  // Employee Management
  async getEmployees(businessId: number): Promise<MongoUser[]> {
    const employees = await this.db.collection('users').find({ 
      businessId,
      role: { $ne: 'admin' }
    }, {
      projection: { password: 0 } // Exclude password field
    }).toArray() as MongoUser[];
    return employees;
  }

  // Debug method to get all users
  async getAllUsers(): Promise<MongoUser[]> {
    const users = await this.db.collection('users').find({}, {
      projection: { password: 0 } // Exclude password field for security
    }).toArray() as MongoUser[];
    return users;
  }

  async getEmployeeCount(businessId: number): Promise<number> {
    return await this.db.collection('users').countDocuments({ 
      businessId,
      role: { $ne: 'admin' }
    });
  }

  async updateUserPermissions(id: number, businessId: number, permissions: MongoUser['permissions']): Promise<MongoUser> {
    await this.db.collection('users').updateOne(
      { id, businessId },
      { $set: { permissions } }
    );
    
    const user = await this.db.collection('users').findOne(
      { id, businessId },
      { projection: { password: 0 } } // Exclude password field
    ) as MongoUser;
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async deleteEmployee(id: number, businessId: number): Promise<boolean> {
    const result = await this.db.collection('users').deleteOne({ 
      id, 
      businessId,
      role: { $ne: 'admin' } // Prevent deleting admin
    });
    return result.deletedCount > 0;
  }

  async toggleEmployeeStatus(id: number, businessId: number): Promise<MongoUser> {
    const user = await this.db.collection('users').findOne(
      { id, businessId },
      { projection: { password: 0 } } // Exclude password field
    ) as MongoUser;
    if (!user) {
      throw new Error('User not found');
    }
    
    const newStatus = !user.isActive;
    await this.db.collection('users').updateOne(
      { id, businessId },
      { $set: { isActive: newStatus } }
    );
    
    return { ...user, isActive: newStatus };
  }

  async createUser(user: Omit<MongoUser, 'id' | 'createdAt'>): Promise<MongoUser> {
    const id = await this.getNextId('users');
    const defaultPermissions = user.role === 'admin' ? 
      { pos: true, inventory: true, customers: true, reports: true, employees: true, settings: true } :
      { pos: true, inventory: false, customers: false, reports: false, employees: false, settings: false };
    
    // Hash the password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    const newUser = {
      ...user,
      id,
      password: hashedPassword,
      permissions: user.permissions || defaultPermissions,
      createdAt: new Date()
    };
    
    await this.db.collection('users').insertOne(newUser);
    
    // Return user without password for security
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as MongoUser;
  }

  // Business
  async createBusiness(business: Omit<MongoBusiness, 'id' | 'createdAt'>): Promise<MongoBusiness> {
    const id = await this.getNextId('businesses');
    const newBusiness = {
      ...business,
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('businesses').insertOne(newBusiness);
    return newBusiness;
  }

  async getBusiness(id: number): Promise<MongoBusiness | undefined> {
    const business = await this.db.collection('businesses').findOne({ id }) as MongoBusiness | null;
    return business || undefined;
  }

  async updateBusiness(id: number, updates: Partial<Omit<MongoBusiness, 'id' | 'createdAt'>>): Promise<MongoBusiness | undefined> {
    const result = await this.db.collection('businesses').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result as MongoBusiness | undefined;
  }

  // Categories
  async getCategories(businessId: number): Promise<MongoCategory[]> {
    const categories = await this.db.collection('categories').find({ businessId }).toArray() as MongoCategory[];
    return categories;
  }

  async createCategory(category: Omit<MongoCategory, 'id' | 'createdAt'>): Promise<MongoCategory> {
    const id = await this.getNextId('categories');
    const newCategory = {
      ...category,
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('categories').insertOne(newCategory);
    return newCategory;
  }

  // Products
  async getProducts(businessId: number): Promise<MongoProduct[]> {
    const products = await this.db.collection('products').find({ 
      businessId, 
      isActive: true 
    }).toArray() as MongoProduct[];
    return products;
  }

  async getProduct(id: number, businessId: number): Promise<MongoProduct | undefined> {
    const product = await this.db.collection('products').findOne({ 
      id, 
      businessId 
    }) as MongoProduct | null;
    return product || undefined;
  }

  async createProduct(product: Omit<MongoProduct, 'id' | 'createdAt'>): Promise<MongoProduct> {
    const id = await this.getNextId('products');
    const newProduct = {
      ...product,
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('products').insertOne(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, businessId: number, updates: Partial<MongoProduct>): Promise<MongoProduct> {
    await this.db.collection('products').updateOne(
      { id, businessId },
      { $set: updates }
    );
    
    const product = await this.getProduct(id, businessId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getLowStockProducts(businessId: number): Promise<MongoProduct[]> {
    const products = await this.db.collection('products').find({
      businessId,
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).toArray() as MongoProduct[];
    return products;
  }

  // Customers
  async getCustomers(businessId: number): Promise<MongoCustomer[]> {
    const customers = await this.db.collection('customers').find({ businessId }).toArray() as MongoCustomer[];
    return customers;
  }

  async getCustomer(id: number, businessId: number): Promise<MongoCustomer | undefined> {
    const customer = await this.db.collection('customers').findOne({ 
      id, 
      businessId 
    }) as MongoCustomer | null;
    return customer || undefined;
  }

  async createCustomer(customer: Omit<MongoCustomer, 'id' | 'createdAt'>): Promise<MongoCustomer> {
    const id = await this.getNextId('customers');
    const newCustomer = {
      ...customer,
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('customers').insertOne(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, businessId: number, updates: Partial<MongoCustomer>): Promise<MongoCustomer> {
    await this.db.collection('customers').updateOne(
      { id, businessId },
      { $set: updates }
    );
    
    const customer = await this.getCustomer(id, businessId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  // Transactions
  async getTransactions(businessId: number, limit?: number): Promise<any[]> {
    const pipeline = [
      { $match: { businessId } },
      { $sort: { createdAt: -1 } },
      ...(limit ? [{ $limit: limit }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: 'id',
          as: 'customer'
        }
      },
      {
        $project: {
          id: 1,
          businessId: 1,
          customerId: 1,
          userId: 1,
          transactionNumber: 1,
          subtotal: 1,
          taxAmount: 1,
          total: 1,
          paymentMethod: 1,
          status: 1,
          createdAt: 1,
          user: {
            $let: {
              vars: { userDoc: { $arrayElemAt: ['$user', 0] } },
              in: {
                id: '$$userDoc.id',
                username: '$$userDoc.username',
                email: '$$userDoc.email',
                firstName: '$$userDoc.firstName',
                lastName: '$$userDoc.lastName',
                role: '$$userDoc.role',
                isActive: '$$userDoc.isActive'
              }
            }
          },
          customer: { $arrayElemAt: ['$customer', 0] }
        }
      }
    ];

    return await this.db.collection('transactions').aggregate(pipeline).toArray();
  }

  async createTransaction(transaction: Omit<MongoTransaction, 'id' | 'createdAt'>, items: Omit<MongoTransactionItem, 'id'>[]): Promise<MongoTransaction> {
    const id = await this.getNextId('transactions');
    const newTransaction = {
      ...transaction,
      id,
      createdAt: new Date()
    };
    
    // Insert transaction
    await this.db.collection('transactions').insertOne(newTransaction);
    
    // Insert transaction items
    for (const item of items) {
      const itemId = await this.getNextId('transactionItems');
      await this.db.collection('transactionItems').insertOne({
        ...item,
        id: itemId,
        transactionId: id
      });
    }
    
    return newTransaction;
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
    
    const todayStats = await this.db.collection('transactions').aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: today },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $toDouble: '$total' } },
          transactionCount: { $sum: 1 }
        }
      }
    ]).toArray();

    const lowStockProducts = await this.getLowStockProducts(businessId);
    
    const todaySales = todayStats[0]?.totalSales || 0;
    const todayTransactions = todayStats[0]?.transactionCount || 0;
    const averageSale = todayTransactions > 0 ? (todaySales / todayTransactions).toFixed(2) : '0.00';

    return {
      todaySales: todaySales.toFixed(2),
      todayTransactions,
      averageSale,
      lowStockCount: lowStockProducts.length,
      todayGrowth: '0.00', // Would need historical data
      transactionGrowth: '0.00', // Would need historical data  
      averageGrowth: '0.00' // Would need historical data
    };
  }

  async getTopProducts(businessId: number, limit: number): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'transactions',
          localField: 'transactionId',
          foreignField: 'id',
          as: 'transaction'
        }
      },
      {
        $match: {
          'transaction.businessId': businessId,
          'transaction.status': 'completed'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: 'id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$productId',
          product: { $first: '$product' },
          soldCount: { $sum: '$quantity' },
          revenue: { $sum: { $toDouble: '$total' } }
        }
      },
      {
        $sort: { soldCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          id: '$product.id',
          businessId: '$product.businessId',
          categoryId: '$product.categoryId',
          name: '$product.name',
          description: '$product.description',
          sku: '$product.sku',
          barcode: '$product.barcode',
          price: '$product.price',
          cost: '$product.cost',
          stock: '$product.stock',
          lowStockThreshold: '$product.lowStockThreshold',
          isActive: '$product.isActive',
          createdAt: '$product.createdAt',
          soldCount: 1,
          revenue: { $toString: '$revenue' }
        }
      }
    ];

    return await this.db.collection('transactionItems').aggregate(pipeline).toArray();
  }
}