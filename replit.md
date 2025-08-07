# Overview

State Rater is a React-based web application that allows users to rate and compare U.S. states across different criteria. The application provides both map and list views to visualize ratings, with support for multiple users (user and wife) to rate states independently. Users can create custom criteria, assign ratings on a 1-10 scale, and view combined or individual ratings through an interactive interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Pattern**: RESTful API with JSON responses
- **Data Layer**: In-memory storage implementation with interface for future database integration
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot module replacement via Vite middleware

## Data Storage Design
- **Current Implementation**: In-memory storage using Map data structures
- **Schema Definition**: Drizzle ORM schema definitions for PostgreSQL
- **Database Ready**: Configured for PostgreSQL with Neon Database connection
- **Migrations**: Drizzle Kit for database schema management

## Key Data Models
- **Users**: Basic user profiles (user, wife)
- **States**: U.S. state information with codes and names
- **Criteria**: Customizable rating categories with weights and colors
- **Ratings**: Individual user ratings for state-criterion combinations (1-10 scale)

## Component Architecture
- **Map View**: Interactive U.S. map grid with color-coded state ratings
- **List View**: Tabular display with sorting and filtering capabilities
- **Rating Panel**: Modal interface for rating states across criteria
- **Criteria Manager**: CRUD operations for rating criteria
- **Sidebar**: User selection and statistics display

## API Design
- **User Endpoints**: GET /api/users, GET /api/users/:username
- **Criteria Endpoints**: GET/POST/PUT/DELETE /api/criteria
- **State Endpoints**: GET /api/states (configured but not implemented)
- **Rating Endpoints**: GET/POST/PUT/DELETE /api/ratings (partially implemented)

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Build Tools**: Vite, TypeScript, esbuild for production builds
- **Database**: Drizzle ORM, @neondatabase/serverless for PostgreSQL connection
- **Validation**: Zod for schema validation and type safety

## UI and Styling
- **Component Library**: Extensive Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

## Development and Tooling
- **Development Server**: Express with Vite middleware for HMR
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Date Handling**: date-fns for date manipulation
- **Development Tools**: @replit/* plugins for Replit integration

## Production Considerations
- **Database**: Currently using in-memory storage, ready for PostgreSQL migration
- **Session Store**: Configured for PostgreSQL session storage
- **Build Output**: Optimized for production deployment with proper static asset handling