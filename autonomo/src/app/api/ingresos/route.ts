import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Ingreso } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const ingresos = await db
      .collection<Ingreso>('ingresos')
      .find({})
      .sort({ fechaCobro: -1 })
      .toArray();

    return NextResponse.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingresos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevoIngreso = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('ingresos').insertOne(nuevoIngreso);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevoIngreso },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    return NextResponse.json(
      { error: 'Error al crear ingreso' },
      { status: 500 }
    );
  }
}
