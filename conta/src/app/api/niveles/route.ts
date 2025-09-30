import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Nivel } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const niveles = await db.collection<Nivel>('niveles').find({}).toArray();
    return NextResponse.json(niveles);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener niveles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Nivel>('niveles').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear nivel' }, { status: 500 });
  }
}