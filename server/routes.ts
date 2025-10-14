import type { Express } from "express";
import { createServer, type Server } from "http";
import { MongoStorage } from "./mongo-storage";
import session from "express-session";
import { insertProductSchema, insertCustomerSchema, insertTransactionSchema, insertUserSchema } from "../shared/mongo-schemas";

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      businessId: number;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions?: {
        pos: boolean;
        inventory: boolean;
        customers: boolean;
        reports: boolean;
        employees: boolean;
        settings: boolean;
      };
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB storage after connection is established
  const storage = new MongoStorage();
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'znforge-pos-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Permission middleware
  function requirePermission(permission: 'pos' | 'inventory' | 'customers' | 'reports' | 'employees' | 'settings') {
    return (req: any, res: any, next: any) => {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = req.session.user;
      if (user.role === 'admin' || user.permissions?.[permission]) {
        return next();
      }
      
      return res.status(403).json({ message: 'Access denied' });
    };
  }

  // Admin-only middleware
  function requireAdmin(req: any, res: any, next: any) {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    return next();
  }


  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const businessData = req.body.business;
      const userData = {
        ...req.body.user,
        businessId: 0, // Will be set after business creation
        role: 'admin'
      };

      // Create business first
      const business = await storage.createBusiness(businessData);
      
      // Create admin user
      const user = await storage.createUser({
        ...userData,
        businessId: business.id
      });

      // Set session
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
      };

      res.json({ user: req.session.user, business });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsernameAndPassword(username, password);
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.user = {
        id: user.id,
        businessId: user.businessId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
      };

      const business = await storage.getBusiness(user.businessId);
      res.json({ user: req.session.user, business });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const business = await storage.getBusiness(req.session.user!.businessId);
      res.json({ user: req.session.user, business });
    } catch (error) {
      console.error("Database error in /api/me:", error);
      res.status(500).json({ message: "Database connection failed" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, requirePermission('reports'), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.user!.businessId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/recent-transactions", requireAuth, requirePermission('reports'), async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.session.user!.businessId, 10);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/top-products", requireAuth, requirePermission('reports'), async (req, res) => {
    try {
      const products = await storage.getTopProducts(req.session.user!.businessId, 5);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/low-stock", requireAuth, requirePermission('inventory'), async (req, res) => {
    try {
      const products = await storage.getLowStockProducts(req.session.user!.businessId);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Products routes
  app.get("/api/products", requireAuth, requirePermission('inventory'), async (req, res) => {
    try {
      const products = await storage.getProducts(req.session.user!.businessId);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAuth, requirePermission('inventory'), async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        businessId: req.session.user!.businessId
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", requireAuth, requirePermission('inventory'), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, req.session.user!.businessId, updates);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customers routes
  app.get("/api/customers", requireAuth, requirePermission('customers'), async (req, res) => {
    try {
      const customers = await storage.getCustomers(req.session.user!.businessId);
      res.json(customers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/customers", requireAuth, requirePermission('customers'), async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        businessId: req.session.user!.businessId
      });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, requirePermission('reports'), async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.session.user!.businessId);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/transactions", requireAuth, requirePermission('pos'), async (req, res) => {
    try {
      const { transaction, items } = req.body;
      
      // Generate transaction number
      const transactionNumber = `TXN-${Date.now()}`;
      
      const transactionData = insertTransactionSchema.parse({
        ...transaction,
        businessId: req.session.user!.businessId,
        userId: req.session.user!.id,
        transactionNumber
      });

      const createdTransaction = await storage.createTransaction(transactionData, items);
      res.json({ ...createdTransaction, invoiceId: createdTransaction.id });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Employee Management Routes (Admin only)
  app.get("/api/employees", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getEmployees(req.session.user!.businessId);
      res.json(employees);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/employees", requireAdmin, async (req, res) => {
    try {
      const count = await storage.getEmployeeCount(req.session.user!.businessId);
      if (count >= 10) return res.status(400).json({ message: "Maximum of 10 employees allowed" });

      const userData = insertUserSchema.parse({
        ...req.body,
        businessId: req.session.user!.businessId,
        role: 'employee',
        isActive: true,
      });
      const employee = await storage.createUser(userData);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/employees/:id/permissions", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { permissions } = req.body;
      const employee = await storage.updateUserPermissions(employeeId, req.session.user!.businessId, permissions);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/employees/:id/status", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const employee = await storage.toggleEmployeeStatus(employeeId, req.session.user!.businessId);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/employees/:id", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(employeeId, req.session.user!.businessId);
      if (!deleted) return res.status(404).json({ message: "Employee not found" });
      res.json({ message: "Employee deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Settings routes
  app.put("/api/settings/business", requireAuth, requirePermission('settings'), async (req, res) => {
    try {
      const businessId = req.session.user!.businessId;
      const { name, email, phone, address, taxRate, currency, timezone, receiptFooter } = req.body;
      
      const updates = {
        name,
        email,
        phone,
        address,
        taxRate,
        currency,
        timezone,
        receiptFooter
      };

      const updatedBusiness = await storage.updateBusiness(businessId, updates);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Invoice routes
  app.get("/api/invoices/:id", requireAuth, requirePermission('pos'), async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const businessId = req.session.user!.businessId;
      
      const transaction = await storage.getTransactionById(invoiceId, businessId);
      if (!transaction) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const items = await storage.getTransactionItems(invoiceId);
      const business = await storage.getBusiness(businessId);
      
      // Build invoice response
      const invoice = {
        _id: transaction.id,
        invoiceNumber: transaction.transactionNumber,
        orderId: transaction.transactionNumber,
        userId: transaction.userId.toString(),
        customerInfo: transaction.customer ? {
          name: `${transaction.customer.firstName} ${transaction.customer.lastName}`,
          email: transaction.customer.email || '',
          phone: transaction.customer.phone || '',
          address: transaction.customer.address || ''
        } : {
          name: 'Walk-in Customer',
          email: '',
          phone: '',
          address: ''
        },
        items: items.map(item => ({
          productId: item.productId.toString(),
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.image || '/placeholder-product.png'
        })),
        subtotal: parseFloat(transaction.subtotal),
        total: parseFloat(transaction.total),
        paymentMethod: transaction.paymentMethod,
        paymentStatus: transaction.status === 'completed' ? 'Paid' : 'Pending',
        orderDate: transaction.createdAt.toISOString(),
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.createdAt.toISOString(),
        business: business
      };
      
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/invoices/download/:id", requireAuth, requirePermission('pos'), async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const businessId = req.session.user!.businessId;
      
      const transaction = await storage.getTransactionById(invoiceId, businessId);
      if (!transaction) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const items = await storage.getTransactionItems(invoiceId);
      const business = await storage.getBusiness(businessId);
      
      // Helper function to escape HTML
      const escapeHtml = (text: string | null | undefined) => {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      };

      // Generate HTML invoice
      const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${escapeHtml(transaction.transactionNumber)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .business-info { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total-section { text-align: right; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(business?.name) || 'ZnForge POS'}</h1>
        <h2>INVOICE #${escapeHtml(transaction.transactionNumber)}</h2>
        <p>Date: ${new Date(transaction.createdAt).toLocaleDateString()}</p>
    </div>
    
    <div class="business-info">
        <h3>From:</h3>
        <p>${escapeHtml(business?.name) || 'ZnForge POS'}<br>
        ${escapeHtml(business?.email)}<br>
        ${escapeHtml(business?.phone)}<br>
        ${escapeHtml(business?.address)}</p>
    </div>
    
    <div class="customer-info">
        <h3>Bill To:</h3>
        <p>${transaction.customer ? `${escapeHtml(transaction.customer.firstName)} ${escapeHtml(transaction.customer.lastName)}` : 'Walk-in Customer'}<br>
        ${escapeHtml(transaction.customer?.email)}<br>
        ${escapeHtml(transaction.customer?.phone)}<br>
        ${escapeHtml(transaction.customer?.address)}</p>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${business?.currency || '$'}${parseFloat(item.price).toFixed(2)}</td>
                <td>${business?.currency || '$'}${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <p><strong>Subtotal: ${business?.currency || '$'}${parseFloat(transaction.subtotal).toFixed(2)}</strong></p>
        <p><strong>Tax: ${business?.currency || '$'}${parseFloat(transaction.taxAmount || '0').toFixed(2)}</strong></p>
        <p><strong>Total: ${business?.currency || '$'}${parseFloat(transaction.total).toFixed(2)}</strong></p>
        <p>Payment Method: ${transaction.paymentMethod}</p>
        <p>Status: ${transaction.status === 'completed' ? 'Paid' : 'Pending'}</p>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${transaction.transactionNumber}.html"`);
      res.send(html);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
