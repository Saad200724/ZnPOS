# ZnForge POS System

## Overview

ZnForge POS is a full-stack Point of Sale application built with modern web technologies. It's designed for small to medium businesses to manage sales transactions, inventory, customers, and generate reports. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

**Rationale**: This stack provides a modern, type-safe development experience with excellent performance and developer experience. Radix UI ensures accessibility, while TanStack Query handles complex server state management efficiently.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: express-session with PostgreSQL session store
- **Database Access**: Drizzle ORM for type-safe database operations
- **Development**: Hot reloading with tsx for TypeScript execution

**Rationale**: Express provides a mature, flexible foundation for the API. Drizzle ORM offers excellent TypeScript integration and type safety while remaining lightweight and performant.

## Key Components

### Authentication System
- Session-based authentication using express-session
- Multi-tenant support with business-scoped users
- Role-based access control (admin, manager, employee)
- Registration flow creates both business and admin user

### Database Schema
The application uses a comprehensive schema supporting:
- **Multi-tenancy**: All data is scoped to businesses
- **User Management**: Role-based user system
- **Product Catalog**: Categories, products with inventory tracking
- **Customer Management**: Customer profiles with loyalty points
- **Transaction Processing**: Complete sales transaction handling
- **Audit Trail**: Timestamps and user tracking

### Core Features
1. **Point of Sale**: Real-time transaction processing with cart management
2. **Inventory Management**: Product CRUD, stock tracking, low-stock alerts
3. **Customer Management**: Customer profiles, purchase history, loyalty tracking
4. **Reporting**: Sales analytics, transaction history, performance metrics
5. **Settings**: Business configuration, tax rates, payment options

## Data Flow

1. **Authentication Flow**: User logs in → Session created → Business context established
2. **Transaction Flow**: Product selection → Cart management → Payment processing → Transaction recording
3. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation
4. **Multi-tenant Isolation**: All API endpoints automatically filter by business ID from session

## External Dependencies

### Core Dependencies
- **pg**: PostgreSQL connection for Node.js environments
- **@radix-ui/***: Comprehensive UI component library
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe ORM
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Setup
- Requires `DATABASE_URL` environment variable for PostgreSQL connection
- Session secret can be configured via `SESSION_SECRET`
- Supports both development and production modes

### Database Management
- Uses Drizzle ORM with PostgreSQL database (migrated from Neon to Replit PostgreSQL)
- Schema defined in `shared/schema.ts` for type sharing
- Push-based deployments with `db:push` command
- Demo data automatically created for development

### Recent Optimizations (August 2025)
- Removed 25+ unused UI components to reduce bundle size
- Cleaned up development/testing files
- Streamlined authentication flow
- Migrated from disabled Neon database to working Replit PostgreSQL
- Reduced client bundle size by ~30%

**Rationale**: This deployment strategy supports both traditional and serverless deployments while maintaining type safety across the entire stack. The monorepo structure with shared types reduces duplication and improves maintainability.

### Development Workflow
- `npm run dev`: Starts development server with hot reloading
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

The application is designed to be easily deployable to platforms like Replit, Vercel, or traditional VPS hosting while supporting modern development practices and scalability requirements.