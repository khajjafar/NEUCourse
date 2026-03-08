import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * GET /api/swagger
 * Returns the OpenAPI 3.0 spec as JSON. Used by the /api-docs Swagger UI page.
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
