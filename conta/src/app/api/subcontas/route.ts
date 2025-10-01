import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Subconta } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const subcontas = await db.collection<Subconta>('subcontas').find({}).toArray();
    return NextResponse.json(subcontas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener subcontas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Subconta>('subcontas').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear subconta' }, { status: 500 });
  }
}