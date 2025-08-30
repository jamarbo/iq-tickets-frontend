# IQ Outsourcing - Frontend

Frontend application for the IQ Outsourcing ticket management system. Built with React, TypeScript, and modern web technologies.

## ⚡ **INICIO RÁPIDO**

### Opción A — DEMO (sin backend)
```bash
# 1) Copia variables de entorno
cp .env.example .env

# 2) (Opcional) Fuerza DEMO
# En .env, ajusta:
# VITE_DEMO=true

# 3) Instala y ejecuta
npm install
npm run dev

# 4) Ingresa con credenciales de demo
# Admin: admin@demo.com / password  → Puede eliminar
# User:  user@demo.com  / password  → No puede eliminar
```

### Con Docker Compose (Recomendado)
```bash
docker-compose up -d
# ✅ Frontend: http://localhost:3000
# ✅ Backend: http://localhost:8080  
# ✅ Base de datos: puerto 5432
```

### Desarrollo Local
```bash
npm install && npm run dev
# ✅ Frontend: http://localhost:3000
```

### Solo Frontend Dockerizado
```bash
npm run docker:build && npm run docker:run
# ✅ Frontend: http://localhost:3000
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Date-fns** - Date manipulation
- **React Hot Toast** - Notifications

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   └── layout/          # Layout components (Header, Layout)
├── pages/               # Route components
├── contexts/            # React contexts (Auth)
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript type definitions
├── styles/              # Global styles and CSS
└── test/                # Test setup and utilities
```

### Key Features
- **Authentication** - JWT-based auth with role management
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Automatic data synchronization
- **Offline Support** - Basic caching with React Query
- **Accessibility** - WCAG 2.1 compliant
- **Performance** - Optimized loading and rendering

### DEMO vs Backend
- DEMO: el frontend funciona 100% local (tickets en localStorage). Útil para demo sin depender del backend.
	- Se activa si el token comienza con "demo-" (al ingresar con usuarios de demo) o si `VITE_DEMO=true` en `.env`.
- Backend real: para usar la API real, ejecuta tu backend en `http://localhost:8080` y entra con credenciales reales.
	- En desarrollo, Vite proxya todas las llamadas a `/api` hacia `http://localhost:8080` (ver `vite.config.ts`).

## 🚀 Getting Started

### ⚡ **UN SOLO COMANDO** (Docker Compose)
```bash
# Levanta TODO el sistema completo
docker-compose up -d

# Accede a http://localhost:3000
# Backend en http://localhost:8080
# Base de datos en puerto 5432
```

### Prerequisites
- Node.js 18+ and npm (para desarrollo local)
- Docker & Docker Compose (para containerización)
- Backend API running on port 8080

### Quick Start - Desarrollo Local
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Environment Variables
Create a `.env` file (o copia `.env.example` a `.env`):
```env
# DEMO mode (opcional). Si es true, no llama al backend.
VITE_DEMO=false

# API base path. En desarrollo se usa proxy de Vite con base "/api".
# Nota: El código usa baseURL "/api"; cambia el proxy o usa un
# reverse proxy para que la API esté disponible en /api.
VITE_API_URL=/api
```

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Quality & Testing
```bash
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run format:check # Check formatting
```

### Docker Commands
```bash
npm run docker:build    # Build production Docker image
npm run docker:run      # Run production container
npm run docker:dev      # Build and run development container
npm run compose:up      # Start all services with docker-compose
npm run compose:down    # Stop all services
npm run compose:logs    # View logs from all services
```

Nota: el `docker-compose.yml` incluido asume un monorepo con `backend/` al lado de `front/`.
Si solo tienes este frontend, usa la sección "Solo Frontend Dockerizado" o ajusta rutas del compose.

### Using Makefile
```bash
make dev            # Start development
make build          # Build for production
make test           # Run tests
make lint           # Run linter
make format         # Format code
make docker-build   # Build Docker image
make docker-up      # Start with docker-compose
```

## 🐳 Docker

### Quick Start with Docker Compose
```bash
# Levantar toda la aplicación (frontend + backend + DB)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Solo Frontend Dockerizado
```bash
# Build y ejecutar imagen de producción
docker build -t iq-tickets-frontend .
docker run -p 3000:80 iq-tickets-frontend

# Acceder en: http://localhost:3000
```

### Development
```bash
# Build development image
docker build -f Dockerfile.dev -t iq-tickets-frontend:dev .

# Run development container
docker run -p 3000:3000 -v $(pwd):/app iq-tickets-frontend:dev
```

### Production
```bash
# Build production image
docker build -t iq-tickets-frontend .

# Run production container
docker run -p 80:80 iq-tickets-frontend
```

### Docker Compose Services
- **frontend**: React app (puerto 3000)
- **backend**: API server (puerto 8080) 
- **database**: PostgreSQL (puerto 5432)

### Environment Variables para Docker
```env
VITE_DEMO=false
VITE_API_URL=/api
```

## 🎨 Design System

### Color Palette (IQ Outsourcing Corporate)
- **Primary**: Blue (#1e40af) - Main brand color
- **Secondary**: Green (#059669) - Success states
- **Accent**: Red (#dc2626) - Errors and warnings
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: System fonts (system-ui, Segoe UI, etc.)
- **Scale**: rem-based sizing for accessibility
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)

### Components
All components follow consistent patterns:
- **Variants**: Different styles (primary, secondary, etc.)
- **Sizes**: Small, medium, large options
- **States**: Loading, disabled, error states
- **Accessibility**: ARIA labels, focus management

## 🔐 Authentication

### Login Flow
1. User enters credentials
2. Frontend sends POST to `/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token sent in Authorization header

### Role-Based Access
- **Admin**: Full CRUD access, can delete tickets
- **User**: Can create, read, update tickets

### Demo Credentials
- Admin: `admin@demo.com` / `password`
- User: `user@demo.com` / `password`

### Protected Routes
All routes except `/login` require authentication. Unauthenticated users are redirected to login.

## 📱 Features

### Ticket Management
- **List View**: Paginated table with filters and search
- **Detail View**: Full ticket information with edit capability
- **Create/Edit**: Form validation and error handling
- **Delete**: Admin-only with confirmation

### Filtering & Search
- **Text Search**: Searches title and description
- **Status Filter**: Open, In Progress, Closed
- **Priority Filter**: Low, Medium, High
- **Pagination**: Configurable page size

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messaging when no data
- **Accessibility**: Keyboard navigation, screen readers

## 🧪 Testing

### Test Strategy
- **Unit Tests**: Component logic and rendering
- **Integration Tests**: User interactions and API calls
- **E2E Tests**: Critical user journeys (planned)

### Test Files
```bash
src/
├── components/ui/Button.test.tsx
├── components/ui/Input.test.tsx
└── pages/LoginPage.test.tsx
```

### Running Tests
```bash
npm run test           # Run all tests
npm run test:ui        # Interactive test UI
npm run test -- --coverage  # With coverage
```

Tips (Windows/PowerShell): si ves errores de ESM/TypeError, actualiza a Node 18 LTS y borra `node_modules` + `package-lock.json`, luego `npm install`.

## 📊 Performance

### Optimization Strategies
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Dynamic imports for pages
- **Caching**: React Query for API responses
- **Bundle Analysis**: Vite bundle analyzer
- **Image Optimization**: WebP support

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🔍 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🛠️ Development Workflow

### Code Quality
- **ESLint**: Linting with TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Git hooks (planned)

### Git Workflow
1. Feature branches from `main`
2. Pull requests for all changes
3. Code review required
4. Automated checks before merge

## 🚀 Deployment

### Build Process
```bash
npm run build        # Creates dist/ directory
npm run preview      # Test production build locally
```

### Production Environment
- **Server**: Nginx for static file serving
- **CDN**: Cloudflare for global distribution (recommended)
- **SSL**: HTTPS required
- **Monitoring**: Error tracking and analytics

Backend bajo el mismo dominio: configura tu reverse proxy para que `/api` apunte a tu backend.
Si backend vive en otro dominio, habilita CORS y ajusta el proxy/ingress.

### Environment Configuration
- **Development**: Hot reload, source maps
- **Staging**: Production build with debug info
- **Production**: Optimized build, minified assets

## 📝 Technical Decisions & Trade-offs

### Why React?
- **Ecosystem**: Large community and library support
- **Performance**: Virtual DOM and hooks optimization
- **Developer Experience**: Great tooling and debugging
- **Team Familiarity**: Common knowledge in team

### Why TypeScript?
- **Type Safety**: Catches errors at compile time
- **Developer Experience**: Better IDE support
- **Maintainability**: Self-documenting code
- **Team Productivity**: Reduces debugging time

### Why Vite?
- **Development Speed**: Extremely fast HMR
- **Modern Standards**: ES modules, tree shaking
- **Simple Configuration**: Works out of the box
- **Build Performance**: Faster than Webpack

### State Management Choice
- **React Query**: Server state management
- **Context API**: Global client state
- **Local State**: Component-specific state
- **Trade-off**: No Redux for simplicity

### Styling Approach
- **CSS Variables**: Theming and consistency
- **Utility Classes**: Rapid development
- **Component Styles**: Scoped styling
- **No CSS-in-JS**: Avoiding runtime overhead

## ⏱️ Time Investment

### Development Breakdown
- **Project Setup**: 2 hours
- **UI Components**: 4 hours
- **Authentication**: 2 hours
- **Ticket Management**: 6 hours
- **Testing**: 2 hours
- **Docker & Deployment**: 1 hour
- **Documentation**: 1 hour

**Total**: ~18 hours

### Pending Items
- [ ] Advanced filtering (date range, assignee)
- [ ] Real-time updates with WebSocket
- [ ] Bulk operations (multi-select)
- [ ] Advanced search with highlighting
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Progressive Web App features
- [ ] Comprehensive E2E tests

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Run tests: `npm test`

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features
- Update documentation

## 📞 Support

For technical support or questions:
- **Documentation**: See README files
- **Issues**: Use GitHub issues
- **Email**: Contact development team

---

**IQ Outsourcing Ticket Management System Frontend**  
Built with ❤️ using React and TypeScript

### Troubleshooting rápido
- 403 al listar tickets: asegúrate de haber iniciado sesión. En DEMO, usa credenciales de demo.
- 401 tras inactividad: el interceptor limpia sesión y te envía a /login.
- Puerto 3000 ocupado: cambia el puerto en `vite.config.ts` o cierra el proceso en uso.
- Cambios en .env no aplican: reinicia el servidor de desarrollo.
- No ves el backend en dev: recuerda que en dev todas las llamadas usan `/api` y van al proxy → `:8080`.
