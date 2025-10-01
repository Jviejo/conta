import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Ejercicio } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const ejercicios = await db.collection<Ejercicio>('ejercicios').find({}).sort({ year: -1 }).toArray();
    return NextResponse.json(ejercicios);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ejercicios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Ejercicio>('ejercicios').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear ejercicio' }, { status: 500 });
  }
}