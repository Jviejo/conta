import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Product } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const products = await db.collection<Product>('products').find({}).toArray();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const result = await db.collection<Product>('products').insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch {
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
