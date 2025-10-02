import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Customer } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const customers = await db.collection<Customer>('customers').find({}).toArray();
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const result = await db.collection<Customer>('customers').insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch {
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 });
  }
}
