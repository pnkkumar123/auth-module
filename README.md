# 🔐 NestJS Authentication & RBAC Module

A comprehensive, enterprise-grade authentication and role-based access control (RBAC) system built with NestJS, TypeScript, and TypeORM. This module provides secure JWT-based authentication, granular permission management, and extensive testing coverage.

## 🌟 Features

### Authentication System
- **JWT-based Authentication** with access and refresh tokens
- **Secure Password Management** with bcrypt hashing
- **Password Reset Flow** with token-based verification
- **Token Rotation** for enhanced security
- **Employee Validation** against existing company records

### Role-Based Access Control (RBAC)
- **Granular Permission System** with CRUD operations per module
- **Dynamic Module Management** for business applications
- **Dynamic Role Management** - create and manage roles on-the-fly
- **Module-specific Permissions** (read, create, update, delete)
- **User-Module-Role Assignment** for flexible access control

### Enterprise Features
- **Comprehensive API Documentation** with Swagger/OpenAPI
- **Extensive Test Coverage** with 100+ E2E test scenarios
- **Input Validation** and security hardening
- **Database Migrations** and seeding
- **Environment-based Configuration**
- **SQL Injection Protection**

## 🏗️ Architecture

```
src/
├── auth/                    # Authentication module
│   ├── auth.controller.ts   # Login, logout, refresh, password reset
│   ├── auth.service.ts      # Business logic for authentication
│   └── dto/                 # Authentication DTOs
├── users/                   # User management module
│   ├── users.controller.ts  # User registration and management
│   └── dto/                 # User DTOs
├── rbac/                    # Role-Based Access Control
│   ├── modules/             # Business module management
│   ├── roles/               # Role management
│   └── user-module-roles/   # Permission assignment
├── common/                  # Shared utilities
│   ├── guards/              # JWT, Role, Module access guards
│   └── decorators/          # Custom decorators
├── employee/                # Employee validation
└── database/                # Database configuration and seeding
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- SQL Server (MSSQL)
- npm or yarn

### Installation

```bash


# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run typeorm migration:run

# Start the application
npm run start:dev
```

### Environment Configuration

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourSecurePassword!
DB_NAME=app_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Validation Settings
SKIP_PE_VALIDATION=false  # Set to true to bypass employee validation
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api
```

## 🔑 Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "companyName": "SYSTEM",
  "employeeNumber": "0001",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Password Reset Flow

#### Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "companyName": "ABC",
  "employeeNumber": "1234567",
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "resetToken": "a1b2c3d4e5f6...",
  "companyName": "ABC",
  "employeeNumber": "1234567",
  "newPassword": "NewSecurePassword@123"
}
```

## 👥 User Management Endpoints

### Register User
```http
POST /users/register
Content-Type: application/json

{
  "companyName": "ABC",
  "employeeNumber": "1234567",
  "password": "User@123"
}
```

### Get All Users (Requires HR Read Permission)
```http
GET /users/all
Authorization: Bearer <access_token>
```

## 🎯 RBAC Endpoints

### Modules Management

#### Create Module (Requires HR Create Permission)
```http
POST /modules
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "HR",
  "name": "Human Resources",
  "description": "HR management module"
}
```

#### Get All Modules (Requires HR Read Permission)
```http
GET /modules
Authorization: Bearer <access_token>
```

#### Update Module (Requires HR Update Permission)
```http
PUT /modules/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Human Resources Updated",
  "description": "Updated description"
}
```

#### Delete Module (Requires HR Delete Permission)
```http
DELETE /modules/:id
Authorization: Bearer <access_token>
```

### Roles Management (Dynamic - ADMIN Only)

#### Create Role
```http
POST /roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "HR_MANAGER",
  "description": "HR Manager with elevated permissions"
}
```

#### Get All Roles
```http
GET /roles
Authorization: Bearer <access_token>
```

#### Update Role
```http
PUT /roles/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "HR_MANAGER_UPDATED",
  "description": "Updated role description"
}
```

#### Delete Role
```http
DELETE /roles/:id
Authorization: Bearer <access_token>
```

### User Permission Assignment

#### Assign Role to User (Requires HR Create Permission)
```http
POST /user-module-roles/assign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": 2,
  "moduleId": 1,
  "roleId": 1,
  "canRead": true,
  "canCreate": false,
  "canUpdate": false,
  "canDelete": false
}
```

> **Note:** Assign any dynamically created role to users with specific module permissions

## 🧪 Testing

### Run All Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### E2E Test Coverage

The comprehensive E2E test suite covers:

#### Authentication Tests
- ✅ User login with valid credentials
- ✅ User registration with employee validation
- ✅ Token refresh functionality
- ✅ Logout and token invalidation
- ✅ Password reset flow
- ✅ JWT token security (expired, malformed, replay attacks)
- ✅ Refresh token security (rotation, tampering)

#### RBAC Tests
- ✅ Role-based access control
- ✅ Module-based permissions
- ✅ User-module-role assignment
- ✅ Permission matrix validation
- ✅ Unauthorized access prevention

#### Security Tests
- ✅ Input validation and sanitization
- ✅ SQL injection protection
- ✅ Weak password rejection
- ✅ Duplicate registration prevention
- ✅ Invalid token handling

#### Edge Cases
- ✅ Empty request bodies
- ✅ Missing required fields
- ✅ Invalid IDs and references
- ✅ Non-existent resources
- ✅ Permission conflicts

## 🔒 Security Features

### Password Security
- Bcrypt hashing with salt rounds
- Password strength validation
- Secure password reset tokens
- Password history (extensible)

### JWT Security
- Short-lived access tokens (15 minutes)
- Refresh token rotation
- Token invalidation on logout
- Stateless authentication

### Access Control
- Granular permissions (CRUD per module)
- Dynamic role-based authorization (create any roles you need)
- Module-specific access control
- Permission inheritance ready

### Input Validation
- Class-validator decorators
- SQL injection prevention
- XSS protection
- Request sanitization

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **roles** - Dynamic roles (create any role names you need)
- **business_modules** - Business application modules
- **user_module_roles** - User permissions per module
- **refresh_tokens** - JWT refresh token management
- **password_reset_tokens** - Password reset token storage
- **pe** - Employee validation table (external)

### Relationships
- Users ↔ Dynamic Roles (many-to-many through user_module_roles)
- Users ↔ Modules (many-to-many through user_module_roles)
- Modules ↔ User permissions (granular CRUD permissions)

> **Note:** Unlike systems with predefined roles, your roles are completely dynamic. Create roles like "HR_MANAGER", "FINANCE_ADMIN", "PROJECT_LEAD", "DEPARTMENT_HEAD", etc.

## 🔧 Configuration

### JWT Configuration
```typescript
// Access token: 15 minutes
// Refresh token: 7 days
// Algorithm: HS256
```

### Database Configuration
```typescript
// Type: Microsoft SQL Server
// ORM: TypeORM
// Migrations: Enabled
// Synchronization: Development only
```

### Validation Rules
```typescript
// Password: Minimum 6 characters
// Company name: Required, 1-100 characters
// Employee number: Required, 1-100 characters
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `SKIP_PE_VALIDATION=false` for employee validation
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📈 Monitoring & Logging

### Health Check Endpoint
```http
GET /health
```

### Logging Levels
- ERROR: System errors and exceptions
- WARN: Warning conditions
- INFO: General system information
- DEBUG: Detailed debugging information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow SOLID principles
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Swagger documentation at `/api`
- Review the test cases for usage examples

## 🏆 Acknowledgments

- NestJS framework team
- TypeORM contributors
- Passport.js authentication strategies
- Swagger/OpenAPI specification

---

**Made with ❤️ by the Development Team**
