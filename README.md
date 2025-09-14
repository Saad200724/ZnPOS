# ZnForge POS System 🛒

**MongoDB-based Point of Sale System for Small to Medium Businesses**

A modern, full-stack POS application built with React, Express, and MongoDB.

## 🚀 Quick Setup for Replit

### 1. Import from GitHub
When importing this repository to Replit, it will automatically detect:
- **Technology Stack**: React + Express + TypeScript
- **Database**: MongoDB (requires connection setup)
- **Port**: 5000 (configured for Replit)

### 2. MongoDB Configuration
This application requires a MongoDB database. Set up your `.env` file:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/znpos?retryWrites=true&w=majority
```

**MongoDB Atlas Setup:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the MONGODB_URI in your .env file

### 3. Run the Application
```bash
npm install  # Automatically handled by Replit
npm run dev  # Start development server
```

The application will be available at your Replit URL on port 5000.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with native driver
- **UI**: Radix UI + shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Validation**: Zod schemas
- **Authentication**: Session-based with bcrypt

## 📊 Features

### Core POS Features
- ✅ **Real-time Sales Processing**
- ✅ **Inventory Management**
- ✅ **Customer Management** 
- ✅ **Multi-user Support**
- ✅ **Role-based Permissions**
- ✅ **Sales Reporting**
- ✅ **Low Stock Alerts**

### Business Management
- ✅ **Multi-tenant Architecture**
- ✅ **Business Registration**
- ✅ **Employee Management**
- ✅ **Tax Configuration**
- ✅ **Payment Methods**

## 🎯 Project Structure

```
znforge-pos/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Application pages
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom hooks
├── server/           # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── mongodb.ts       # Database connection
│   └── mongo-storage.ts # Data access layer
├── shared/           # Shared types/schemas
│   └── mongo-schemas.ts # Zod validation schemas
└── .replit          # Replit configuration
```

## 🔧 Development

### Environment Variables
```bash
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key  # Optional, defaults provided
NODE_ENV=development
```

### Available Scripts
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run check   # Type checking
```

## 🚀 Deployment

### Replit Deployment
This application is optimized for Replit deployment:
- Automatic port configuration (5000)
- Environment variable support
- Hot reloading in development
- Production build optimization

### Other Platforms
Can be deployed to:
- Vercel
- Railway
- Render
- Traditional VPS

## 🛡️ Security

- Session-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- MongoDB injection prevention
- Role-based access control

## 📝 License

MIT License - feel free to use for your business needs.

---

**Ready to start?** Import this repository to Replit and set up your MongoDB connection!