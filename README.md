# ReplayHub

<div align="center">
  <img src="https://assets.mckeonwebsolutions.com/replayhub/replaylogo.png" alt="ReplayHub Logo" width="200"/>
  
  <h3>Complete Esports Operations Platform</h3>
  
  <p>
    Manage your esports organization with ease - teams, events, inventory, and more.
  </p>
</div>

---

## 🎮 Overview

ReplayHub is a comprehensive multi-tenant esports operations platform designed to help organizations manage every aspect of their competitive gaming operations. From roster management to tournament scheduling, equipment tracking to incident reporting, ReplayHub provides all the tools needed to run a professional esports organization.

## ✨ Key Features

### 🏆 Team & Roster Management
- Create and manage multiple teams
- Player profiles with stats visibility controls
- Roster tracking and player assignments
- Discord integration for team communications

### 📅 Event & Tournament Management
- Schedule matches and tournaments
- Event checklists and runsheets
- Automated notifications
- Calendar integration

### 📦 Inventory & Asset Management
- Track equipment and assets
- Check-in/check-out system
- Asset versioning
- Approval workflows

### 🚨 Incident & Report Management
- Real-time incident reporting
- Priority-based workflow
- Status tracking
- Team notifications

### 📊 Game Log & Statistics
- Match history tracking
- Performance analytics
- Player statistics
- Game data management

### 🎨 Customization
- Theming system with custom colors
- Organization branding
- Quick links management
- Personalized dashboards

### 🔐 Security & Permissions
- Role-based access control (RBAC)
- Row-level security (RLS)
- Multi-tenant isolation
- Audit logging

### 💬 Feedback System
- Bug reporting
- Feature suggestions
- Admin management dashboard
- Internal/public comments

### 🌐 Discord Integration
- OAuth authentication
- Direct message notifications
- Channel webhooks
- Profile linking

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis
- **Authentication**: Session-based with passport
- **Validation**: Zod schemas

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Radix UI Components
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Theming**: CSS Variables + Theme System

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Storage**: Local disk / MinIO
- **Process Manager**: PM2 (production)
- **Reverse Proxy**: Nginx

## 📁 Project Structure

```
IMPROVEDAPP/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── common/   # Shared utilities
│   │   │   └── database/ # Prisma client
│   │   └── prisma/       # Database schema & migrations
│   └── web/              # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── lib/          # Utilities & configs
│       └── hooks/        # Custom React hooks
├── docker-compose.yml    # Docker configuration
└── package.json          # Root dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IMPROVEDAPP
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/api && npm install
   cd ../web && npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` files in both `apps/api` and `apps/web`:
   
   **apps/api/.env.local**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/esports_ops"
   SESSION_SECRET="your-secret-key"
   REDIS_URL="redis://localhost:6379"
   PORT=3001
   ```
   
   **apps/web/.env.local**
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_API_BASE="/api"
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   
   Terminal 1 (API):
   ```bash
   npm run dev:api
   ```
   
   Terminal 2 (Web):
   ```bash
   npm run dev:web
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## 🐳 Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 👥 User Roles & Permissions

### Global Admin
- Full system access
- Manage all organizations
- View admin control center
- Access feedback submissions

### Organization Admin
- Manage organization settings
- Create and manage teams
- Assign permissions
- View all organization data

### Team Member
- View assigned team data
- Submit feedback
- Manage own profile
- Access permitted features

## 📝 Key Modules

### Organizations
Multi-tenant architecture with complete data isolation between organizations.

### RBAC (Role-Based Access Control)
Flexible permission system using Casbin-style policies for fine-grained access control.

### Audit System
Comprehensive audit trail for all critical operations with context capture.

### Discord Integration
OAuth flow for user authentication and automated notifications via webhooks and DMs.

### Feedback System
Built-in bug reporting and feature suggestion system with admin dashboard.

## 🔒 Security Features

- Row-level security (RLS) for tenant isolation
- Session-based authentication with secure cookies
- Permission checks at API and UI levels
- SQL injection protection via Prisma
- XSS protection
- CSRF tokens
- Rate limiting
- Audit logging

## 📊 Database Schema

The platform uses PostgreSQL with the following main entities:
- Organizations (Tenants)
- Users (Global & Organization-scoped)
- Roles & Permissions
- Teams & Players
- Events & Matches
- Assets & Inventory
- Incidents & Reports
- Audit Logs
- Feedback Submissions

## 🎨 Theming

Organizations can customize their experience with:
- Primary, secondary, accent colors
- Background and foreground colors
- Border radius adjustments
- Font customization (Montserrat + System fonts)
- Light/Dark mode support

## 🔄 API Architecture

RESTful API with:
- Module-based organization
- Guard-based authentication
- Tenant context middleware
- Error handling interceptors
- Request validation with DTOs
- Swagger documentation (optional)

## 📱 Frontend Architecture

- Server and Client Components (Next.js 14)
- Optimistic UI updates
- Real-time data synchronization
- Responsive design (mobile-first)
- Accessible components (ARIA)
- Loading and error states

## 🤝 Contributing

This is a private project. For questions or access requests, please contact the development team.

## 📄 License

Proprietary - All rights reserved.

## 🆘 Support

For technical support or questions:
- Create a feedback submission in the app
- Contact your organization administrator
- Reach out to the ReplayHub support team

---

<div align="center">
  <p>Built with ❤️ for the esports community</p>
  <p>© 2025 ReplayHub. All rights reserved.</p>
</div>
