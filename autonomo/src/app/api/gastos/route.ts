import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Gasto } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const gastos = await db
      .collection<Gasto>('gastos')
      .find({})
      .sort({ fechaPago: -1 })
      .toArray();

    return NextResponse.json(gastos);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json(
      { error: 'Error al obtener gastos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevoGasto = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('gastos').insertOne(nuevoGasto);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevoGasto },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear gasto:', error);
    return NextResponse.json(
      { error: 'Error al crear gasto' },
      { status: 500 }
    );
  }
}
