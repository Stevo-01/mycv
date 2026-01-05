MyCv API

A comprehensive vehicle reports management system built with NestJS, TypeScript, and PostgreSQL. This API enables users to create, manage, and share vehicle condition reports with advanced features including authentication, file uploads, tagging, and more.
 
 ## FEATURES:
 
 ## Authentication & Security

- JWT-based authentication with refresh tokens
- Password reset functionality
- Role-based access control (User/Admin)
- Session management with secure cookies
- Rate limiting (10 requests/minute globally)
- Helmet.js for security headers
- Input validation and sanitization

 ## Reports Management

- Create, read, update, and delete vehicle reports
- Advanced search with full-text search capabilities-
- Filter by make, model, year, price range, and tags
- Price estimation based on vehicle details and location
- Report approval system (admin only)
- Soft delete with restore capability
- Pagination support

 ## Tagging System

- Create and manage tags
- Associate multiple tags with reports
- Search reports by tags
- Tag-based filtering

 ## File Upload System

- Profile Pictures: Single image per user (300x300, 80% quality)
- Report Images: Multiple images per report (1200x1200, 85% quality)
- Automatic image optimization with Sharp
- File validation (type, size limits: 5MB)
- Secure file storage and serving
- Owner-only access control

 ## Monitoring & Logging

- Structured logging with Winston
- HTTP request/response logging with timing
- Error tracking with stack traces
- Separate log files (combined, error, access, security)
- Health check endpoints for container orchestration
- Prometheus metrics integration

 ## Testing

- Unit tests with Jest
- Test database setup
- 36% code coverage
- Integration-ready test infrastructure

 ## Tech Stack

- Framework: NestJS 10.x
- Language: TypeScript 5.x
- Database: PostgreSQL 16 (Alpine)
- ORM: TypeORM with migrations
- Authentication: Passport JWT + Cookie Session
- File Upload: Multer + Sharp
- Validation: class-validator, class-transformer
- Logging: Winston
- Documentation: Swagger/OpenAPI
- Testing: Jest
- Containerization: Docker & Docker Compose

 ## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

 ## Author
- Stephen Adedigba
- Email: olamsteph@gmail.com
- GitHub: @Stevo-01

## Project setup

## Clone the repository

$ git clone https://github.com/Stevo-01/mycv.git
$ cd mycv

## Install dependencies
$ npm install

## Build and start all services

$ docker-compose up --build

## Or run in detached mode
$ docker-compose up -d

 ## License
Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).



