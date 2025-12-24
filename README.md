# 🎯 MIRELLO - Trello-like Project Management Application

<div align="center">

![MIRELLO Logo](https://via.placeholder.com/200x60/3b82f6/ffffff?text=MIRELLO)

**Modern, feature-rich project management application inspired by Trello**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/mehmetdogandev/mrello)

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.0-2596BE?style=for-the-badge)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-0.41-FF6B6B?style=for-the-badge)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Docker](#-docker)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**MIRELLO** is a modern, full-stack project management application inspired by Trello. It provides a powerful and intuitive interface for managing workspaces, boards, lists, and cards with advanced features like labels, members, checklists, comments, and more.

Built with cutting-edge technologies, MIRELLO offers a seamless experience for teams to collaborate and organize their projects efficiently.

---

## ✨ Features

### 🔐 Authentication & User Management
- **Email/Password Authentication** - Secure login and registration
- **User Profiles** - Complete user information management
- **Session Management** - Robust session handling with Better Auth

### 🏢 Workspace Management
- **Multiple Workspaces** - Create and manage multiple workspaces
- **Workspace Members** - Add members with different roles (owner, admin, member)
- **Workspace Customization** - Custom colors, descriptions, and positioning

### 📊 Board Management
- **Multiple Boards** - Create unlimited boards within workspaces
- **Board Visibility** - Public and private board options
- **Board Customization** - Custom colors, cover images, and descriptions
- **Drag & Drop** - Intuitive board organization

### 📝 List & Card Management
- **Flexible Lists** - Create multiple lists within boards
- **Card Organization** - Drag and drop cards between lists
- **Card Details** - Rich card information with descriptions, due dates, and colors
- **Position Management** - Automatic position calculation for ordering

### 🏷️ Advanced Card Features
- **Labels** - Colorful labels with custom colors and names
- **Members** - Assign workspace members to cards
- **Checklists** - Create checklists with multiple items
- **Comments** - Comment system for card discussions
- **Attachments** - File attachment support (ready for implementation)
- **Due Dates** - Set and track due dates for cards
- **Status Tracking** - Mark cards as completed or in progress

### 🎨 User Interface
- **Modern Design** - Beautiful, responsive UI built with Shadcn/ui
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Layout** - Works perfectly on all devices
- **Smooth Animations** - Polished user experience

### 🔧 Developer Experience
- **Type-Safe API** - End-to-end type safety with tRPC
- **Docker Support** - Easy development and production setup
- **Database Studio** - Built-in Drizzle Studio for database management
- **Hot Reload** - Fast development with Next.js Turbo

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Backend
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Better Auth](https://www.better-auth.com/)** - Authentication library
- **[Zod](https://zod.dev/)** - Schema validation

### DevOps & Tools
- **[Docker](https://www.docker.com/)** - Containerization
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations and studio
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 📸 Screenshots

> **Note:** Add your application screenshots here

```
📸 Dashboard View
📸 Workspace Management
📸 Board View with Lists and Cards
📸 Card Detail View
📸 Dark Mode Interface
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **pnpm** 10.x or higher (or npm/yarn)
- **Docker** and **Docker Compose** (for database)
- **PostgreSQL** 15+ (if not using Docker)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mehmetdogandev/mrello.git
cd mrello
```

2. **Install dependencies**

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trello-copy
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=trello-copy
POSTGRES_PORT=5432

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Optional: GitHub OAuth (if using)
BETTER_AUTH_GITHUB_CLIENT_ID=your-github-client-id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# Drizzle Studio (Production)
DRIZZLE_STUDIO_PORT=4983
DRIZZLE_STUDIO_PASSWORD=your-password
```

For production, create a `.env.production` file with production values.

### Database Setup

1. **Start Docker containers** (includes PostgreSQL and Drizzle Studio)

```bash
pnpm run dev
```

This will:
- Start PostgreSQL database container
- Start Next.js development server
- Wait for database to be ready

2. **Push database schema**

```bash
pnpm run db:push
```

This will create all tables in your database based on the Drizzle schema.

### Running the Application

#### Development Mode

```bash
# Start Docker containers and Next.js dev server
pnpm run dev

# Or start them separately
docker-compose -f docker-compose.dev.yml up -d
pnpm run dev --turbo
```

The application will be available at `http://localhost:3000`

#### Production Mode

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start
```

#### Docker Commands

```bash
# Start development containers
pnpm run dev

# Stop containers
pnpm run dev:down

# Stop and remove volumes
pnpm run dev:clean

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

#### Database Commands

```bash
# Push schema changes to database
pnpm run db:push

# Generate migrations
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Open Drizzle Studio
pnpm run db:studio
```

---

## 📁 Project Structure

```
mrello/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/            # Route groups
│   │   │   ├── workspaces/     # Workspace pages
│   │   │   └── user-info/      # User profile page
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication routes
│   │   │   └── trpc/           # tRPC API handler
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── lib/
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── board/          # Board-related components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── tables/         # Data table components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── workspace/      # Workspace components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── server/             # Server-side code
│   │   │   ├── better-auth/    # Auth configuration
│   │   │   ├── db/             # Database configuration
│   │   │   │   └── schema/     # Drizzle schemas
│   │   │   └── trpc/           # tRPC setup and routers
│   │   │       └── router/      # API route handlers
│   │   └── utils/              # Utility functions
│   └── styles/                # Global styles
├── public/                     # Static assets
├── scripts/                    # Utility scripts
├── docker-compose.dev.yml      # Development Docker config
├── docker-compose.prod.yml     # Production Docker config
├── drizzle.config.ts           # Drizzle configuration
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 📚 API Documentation

### tRPC Routers

The application uses tRPC for type-safe API calls. All routers are located in `src/lib/server/trpc/router/`.

#### Available Routers

- **`auth`** - Authentication and user management
- **`workspace`** - Workspace CRUD operations
- **`board`** - Board management
- **`list`** - List operations
- **`card`** - Card operations (including labels, members, checklists, comments)

#### Example Usage

```typescript
// Client-side usage
import { api } from "@/lib/server/trpc/react"

// Query
const { data: workspaces } = api.workspace.getAll.useQuery()

// Mutation
const createWorkspace = api.workspace.create.useMutation({
  onSuccess: () => {
    // Handle success
  }
})
```

---

## 🐳 Docker

### Development

The development Docker Compose file (`docker-compose.dev.yml`) includes:

- **PostgreSQL** - Database server
- **Next.js** - Application server (optional)

### Production

The production Docker Compose file (`docker-compose.prod.yml`) includes:

- **PostgreSQL** - Database server
- **Drizzle Studio** - Database management UI

### Environment Variables

Make sure to set all required environment variables in your `.env` or `.env.production` files.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with Docker |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run db:push` | Push schema to database |
| `pnpm run db:generate` | Generate migrations |
| `pnpm run db:migrate` | Run migrations |
| `pnpm run db:studio` | Open Drizzle Studio |
| `pnpm run dev:down` | Stop Docker containers |
| `pnpm run dev:clean` | Stop and remove Docker volumes |
| `pnpm run cli` | Production deployment script (git pull, push, build) |
| `pnpm run lint` | Run ESLint |
| `pnpm run typecheck` | Run TypeScript type checking |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Developer:** mehmetdogan.dev

- 📧 Email: [mehmetdogan.dev@gmail.com](mailto:mehmetdogan.dev@gmail.com)
- 🐙 GitHub: [@mehmetdogandev](https://github.com/mehmetdogandev)
- 🌐 Website: [mehmetdogan.dev](https://mehmetdogan.dev)

---

<div align="center">

**Made with ❤️ by [mehmetdogan.dev](https://github.com/mehmetdogandev)**

[![GitHub stars](https://img.shields.io/github/stars/mehmetdogandev/mrello?style=social)](https://github.com/mehmetdogandev/mrello)
[![GitHub forks](https://img.shields.io/github/forks/mehmetdogandev/mrello?style=social)](https://github.com/mehmetdogandev/mrello)

</div>
