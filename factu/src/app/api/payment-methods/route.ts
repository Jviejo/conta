import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PaymentMethod } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const paymentMethods = await db.collection<PaymentMethod>('payment_methods').find({}).toArray();
    return NextResponse.json(paymentMethods);
  } catch {
    return NextResponse.json({ error: 'Error fetching payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const result = await db.collection<PaymentMethod>('payment_methods').insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch {
    return NextResponse.json({ error: 'Error creating payment method' }, { status: 500 });
  }
}
