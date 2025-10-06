import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

const handleProxyRequest = async (request: NextRequest, method: string = 'GET') => {
  const path = request.nextUrl.pathname.replace('/api/proxy', '');
  const targetUrl = `${API_BASE_URL}${path}${request.nextUrl.search}`;
  
  try {
    const headers = new Headers();
    // Forward only necessary headers
    if (request.headers.get('Authorization')) {
      headers.set('Authorization', request.headers.get('Authorization')!);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const init: RequestInit = {
      method,
      headers,
      cache: 'no-store',
    };

    if (method !== 'GET') {
      init.body = await request.text();
    }

    const response = await fetch(targetUrl, init);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json') 
      ? await response.json()
      : await response.text();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
};

export const GET = (request: NextRequest) => handleProxyRequest(request);
export const POST = (request: NextRequest) => handleProxyRequest(request, 'POST');
export const PUT = (request: NextRequest) => handleProxyRequest(request, 'PUT');
export const DELETE = (request: NextRequest) => handleProxyRequest(request, 'DELETE');

export const OPTIONS = async () => {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};