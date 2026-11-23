// src/app/api/product/[...path]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {del, get, post, put} from '@/utils/request/request';

export async function GET(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const data = await get(`product/${path}`, searchParams);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
        {error: error instanceof Error ? error.message : 'Unknown error'},
        {status: 500}
    );
  }
}

export async function POST(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();

    const data = await post(`product/${path}`, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
        {error: error instanceof Error ? error.message : 'Unknown error'},
        {status: 500}
    );
  }
}

export async function PUT(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();

    const data = await put(`product/${path}`, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
        {error: error instanceof Error ? error.message : 'Unknown error'},
        {status: 500}
    );
  }
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const data = await del(`product/${path}`, searchParams);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
        {error: error instanceof Error ? error.message : 'Unknown error'},
        {status: 500}
    );
  }
}
