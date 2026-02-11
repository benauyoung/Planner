import type { AIPlanNode } from '@/types/chat'

export const CRUD_API_TEMPLATE = {
  title: 'REST API with CRUD Operations',
  description: 'Full REST API with database models, controllers, validation, error handling, and tests.',
  nodeCount: 22,
  tags: ['api', 'backend', 'crud'],
  nodes: [
    { id: 'goal-1', type: 'goal', title: 'REST API Service', description: 'Build a production-ready REST API with full CRUD, validation, auth middleware, and documentation.', parentId: null },

    { id: 'subgoal-1-1', type: 'subgoal', title: 'Database & Models', description: 'Database schema design, ORM setup, and model definitions.', parentId: 'goal-1' },
    { id: 'subgoal-1-2', type: 'subgoal', title: 'API Endpoints', description: 'RESTful route handlers with proper HTTP semantics.', parentId: 'goal-1' },
    { id: 'subgoal-1-3', type: 'subgoal', title: 'Quality & Deployment', description: 'Testing, error handling, documentation, and deployment config.', parentId: 'goal-1' },

    { id: 'feature-1-1-1', type: 'feature', title: 'Database Schema Design', description: 'Define tables, relationships, and indexes.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-1-1', type: 'task', title: 'Design entity-relationship diagram', description: 'Define primary entities, foreign keys, and junction tables.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-2', type: 'task', title: 'Create migration files', description: 'Schema migrations with up/down for each table.', parentId: 'feature-1-1-1' },
    { id: 'task-1-1-1-3', type: 'task', title: 'Seed data for development', description: 'Realistic seed data for testing and development.', parentId: 'feature-1-1-1' },

    { id: 'feature-1-1-2', type: 'feature', title: 'ORM Model Layer', description: 'Data models with validation, hooks, and query helpers.', parentId: 'subgoal-1-1' },
    { id: 'task-1-1-2-1', type: 'task', title: 'Define model classes with types', description: 'TypeScript interfaces + ORM model definitions.', parentId: 'feature-1-1-2' },
    { id: 'task-1-1-2-2', type: 'task', title: 'Add model-level validation', description: 'Required fields, string lengths, enum constraints.', parentId: 'feature-1-1-2' },

    { id: 'feature-1-2-1', type: 'feature', title: 'CRUD Endpoints', description: 'Standard Create, Read, Update, Delete operations.', parentId: 'subgoal-1-2' },
    { id: 'task-1-2-1-1', type: 'task', title: 'GET /resources — List with pagination', description: 'Query params: page, limit, sort, filter. Return paginated response.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-2', type: 'task', title: 'GET /resources/:id — Get single resource', description: 'Return 404 if not found. Include related data via query param.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-3', type: 'task', title: 'POST /resources — Create resource', description: 'Validate body, create record, return 201 with created entity.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-4', type: 'task', title: 'PUT /resources/:id — Update resource', description: 'Partial update support. Return 404 if not found.', parentId: 'feature-1-2-1' },
    { id: 'task-1-2-1-5', type: 'task', title: 'DELETE /resources/:id — Delete resource', description: 'Soft delete or hard delete. Return 204 on success.', parentId: 'feature-1-2-1' },

    { id: 'feature-1-2-2', type: 'feature', title: 'Request Validation', description: 'Input validation middleware for all endpoints.', parentId: 'subgoal-1-2' },
    { id: 'task-1-2-2-1', type: 'task', title: 'Define validation schemas (Zod/Joi)', description: 'Schema for each endpoint: create, update, query params.', parentId: 'feature-1-2-2' },
    { id: 'task-1-2-2-2', type: 'task', title: 'Validation middleware', description: 'Validate request body/params/query against schema, return 422 on failure.', parentId: 'feature-1-2-2' },

    { id: 'feature-1-3-1', type: 'feature', title: 'Error Handling', description: 'Centralized error handling with consistent error response format.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-1-1', type: 'task', title: 'Global error handler middleware', description: 'Catch all errors, format as { error, message, statusCode }.', parentId: 'feature-1-3-1' },
    { id: 'task-1-3-1-2', type: 'task', title: 'Custom error classes', description: 'NotFoundError, ValidationError, UnauthorizedError, etc.', parentId: 'feature-1-3-1' },

    { id: 'feature-1-3-2', type: 'feature', title: 'API Documentation', description: 'Auto-generated API docs with OpenAPI/Swagger.', parentId: 'subgoal-1-3' },
    { id: 'task-1-3-2-1', type: 'task', title: 'Generate OpenAPI spec', description: 'Annotate routes or generate from schemas.', parentId: 'feature-1-3-2' },
    { id: 'task-1-3-2-2', type: 'task', title: 'Swagger UI endpoint', description: 'Serve interactive docs at /api/docs.', parentId: 'feature-1-3-2' },
  ] as AIPlanNode[],
}
