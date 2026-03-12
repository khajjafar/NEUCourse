/**
 * @fileoverview Centralized OpenAPI 3.0 specification for the NEUCourse API.
 *
 * Exports the full Swagger/OpenAPI document consumed by /app/api-docs/page.tsx
 * (Swagger UI) and /app/api/swagger/route.ts (JSON endpoint). Defines all
 * schemas, security schemes, and path/operation objects for every endpoint
 * under /api/v1/.
 *
 * Update this file whenever a new endpoint or response shape is added.
 */

import { OpenAPIV3 } from 'openapi-types';

const errorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

const unauthorizedResponse: OpenAPIV3.ResponseObject = {
  description: 'Unauthorized — missing or invalid Firebase JWT',
  content: { 'application/json': { schema: errorSchema } },
};

const notFoundResponse: OpenAPIV3.ResponseObject = {
  description: 'Not found',
  content: { 'application/json': { schema: errorSchema } },
};

const serverErrorResponse: OpenAPIV3.ResponseObject = {
  description: 'Internal server error',
  content: { 'application/json': { schema: errorSchema } },
};

/** Complete OpenAPI 3.0.0 document describing all NEUCourse API endpoints and schemas. */
export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'NEUCourse API',
    version: '1.0.0',
    description:
      'REST API for NEUCourse — Northeastern University degree planning and scheduling. ' +
      'All authenticated endpoints require a Firebase JWT in the `Authorization: Bearer <token>` header. ' +
      'Course endpoints are public.',
  },
  servers: [{ url: '/api/v1', description: 'Production' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase ID token obtained via getIdToken()',
      },
    },
    schemas: {
      Error: errorSchema,
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'CS3500' },
          subject: { type: 'string', example: 'CS' },
          number: { type: 'string', example: '3500' },
          name: { type: 'string', example: 'Object-Oriented Design' },
          description: { type: 'string' },
          prereqs: { type: 'array', items: { type: 'string' } },
          coreqs: { type: 'array', items: { type: 'string' } },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                crn: { type: 'string' },
                meetingTimes: { type: 'string' },
                rooms: { type: 'string' },
                professor: { type: 'string' },
                seats: { type: 'number' },
                campus: { type: 'string' },
              },
            },
          },
        },
      },
      Plan: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'My 4-Year Plan' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          semesterCount: { type: 'number' },
        },
      },
      Semester: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Fall 2026' },
          order: { type: 'number', example: 0 },
          courses: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string', description: 'courseId string (legacy)' },
                {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string', example: 'CS3500' },
                    crn: { type: 'string', example: '10243' },
                  },
                },
              ],
            },
          },
        },
      },
      CalendarEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'CS3500 Lecture' },
          startTime: { type: 'string', example: '2026-09-08T10:30:00' },
          endTime: { type: 'string', example: '2026-09-08T11:35:00' },
          location: { type: 'string', example: 'Shillman Hall 105' },
          color: { type: 'string', example: 'blue' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    // ── Courses (public) ───────────────────────────────────────────────
    '/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Search / list courses',
        description:
          'Returns up to 50 pre-scraped NEU courses. All query params are optional and combinable.',
        parameters: [
          {
            in: 'query', name: 'q', schema: { type: 'string' },
            description: 'Free-text search across courseId, name, and subject.',
          },
          {
            in: 'query', name: 'subject', schema: { type: 'string' },
            description: 'Exact subject code filter, e.g. CS, MATH.',
          },
          {
            in: 'query', name: 'minLevel', schema: { type: 'integer' },
            description: 'Minimum course number, e.g. 3000.',
          },
          {
            in: 'query', name: 'maxLevel', schema: { type: 'integer' },
            description: 'Maximum course number, e.g. 4999.',
          },
        ],
        responses: {
          '200': {
            description: 'Array of matching courses (max 50)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Course' } },
                  },
                },
              },
            },
          },
          '500': serverErrorResponse,
        },
      },
    },
    '/courses/{courseId}': {
      get: {
        tags: ['Courses'],
        summary: 'Get a single course',
        description: 'Returns the full Firestore document for a specific course by its ID.',
        parameters: [
          {
            in: 'path', name: 'courseId', required: true,
            schema: { type: 'string' }, example: 'CS3500',
          },
        ],
        responses: {
          '200': {
            description: 'Course data',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Course' } } },
              },
            },
          },
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
    },

    // ── Plans (authenticated) ─────────────────────────────────────────
    '/plans': {
      get: {
        tags: ['Plans'],
        summary: 'List degree plans',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of the user\'s degree plans',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Plan' } } },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
      post: {
        tags: ['Plans'],
        summary: 'Create a degree plan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'My 4-Year Plan' } },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Plan created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } },
                },
              },
            },
          },
          '400': { description: 'Missing or invalid plan name', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
    },
    '/plans/{planId}': {
      get: {
        tags: ['Plans'],
        summary: 'Get a plan with its semesters',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'planId', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Plan with nested semesters array',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/Plan' },
                        { type: 'object', properties: { semesters: { type: 'array', items: { $ref: '#/components/schemas/Semester' } } } },
                      ],
                    },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
      put: {
        tags: ['Plans'],
        summary: 'Rename a plan',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'planId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {
          '200': { description: 'Plan renamed', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } } } } } },
          '400': { description: 'Invalid name', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
      patch: {
        tags: ['Plans'],
        summary: 'Partial update a plan',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'planId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {
          '200': { description: 'Plan updated' },
          '400': { description: 'Invalid request body', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
      delete: {
        tags: ['Plans'],
        summary: 'Delete a plan',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'planId', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Plan deleted' },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
    },

    // ── Semesters ─────────────────────────────────────────────────────
    '/plans/{planId}/semesters': {
      post: {
        tags: ['Semesters'],
        summary: 'Add a semester to a plan',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'planId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Fall 2026' },
                  order: { type: 'number', example: 0 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Semester created',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Semester' } } } } },
          },
          '400': { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
    },
    '/plans/{planId}/semesters/{semId}': {
      patch: {
        tags: ['Semesters'],
        summary: 'Update a semester (name, order, or full courses array)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'planId', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'semId', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  order: { type: 'number' },
                  courses: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Semester updated' },
          '400': { description: 'No update data provided', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
      delete: {
        tags: ['Semesters'],
        summary: 'Delete a semester',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'planId', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'semId', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Semester deleted' },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
    },
    '/plans/{planId}/semesters/{semId}/courses': {
      post: {
        tags: ['Semesters'],
        summary: 'Add a course to a semester',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'planId', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'semId', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId'],
                properties: {
                  courseId: { type: 'string', example: 'CS3500' },
                  crn: { type: 'string', example: '10243' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Course added to semester' },
          '400': { description: 'Missing courseId', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
    },
    '/plans/{planId}/semesters/{semId}/courses/{courseId}': {
      delete: {
        tags: ['Semesters'],
        summary: 'Remove a course from a semester',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'planId', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'semId', required: true, schema: { type: 'string' } },
          { in: 'path', name: 'courseId', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Course removed' },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
    },

    // ── Calendar Events (authenticated) ───────────────────────────────
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'List all calendar events',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of the user\'s events ordered by startTime',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { type: 'array', items: { $ref: '#/components/schemas/CalendarEvent' } } },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Create a calendar event',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'startTime', 'endTime'],
                properties: {
                  title: { type: 'string', example: 'CS3500 Lecture' },
                  startTime: { type: 'string', example: '2026-09-08T10:30:00' },
                  endTime: { type: 'string', example: '2026-09-08T11:35:00' },
                  location: { type: 'string', example: 'Shillman Hall 105' },
                  color: { type: 'string', example: 'blue' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Event created',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/CalendarEvent' } } } } },
          },
          '400': { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '500': serverErrorResponse,
        },
      },
    },
    '/events/{eventId}': {
      put: {
        tags: ['Events'],
        summary: 'Update a calendar event',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'eventId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'startTime', 'endTime'],
                properties: {
                  title: { type: 'string' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  location: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Event updated',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/CalendarEvent' } } } } },
          },
          '400': { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Delete a calendar event',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'eventId', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Event deleted' },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '500': serverErrorResponse,
        },
      },
    },
  },
};
