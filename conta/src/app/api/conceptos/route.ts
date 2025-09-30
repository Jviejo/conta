import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Concepto } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const conceptos = await db.collection<Concepto>('conceptos').find({}).toArray();
    return NextResponse.json(conceptos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener conceptos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Concepto>('conceptos').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear concepto' }, { status: 500 });
  }
}