import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ClienteProveedor } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const clientes = await db
      .collection<ClienteProveedor>('clientes')
      .find({ tipo: 'cliente' })
      .sort({ fechaAlta: -1 })
      .toArray();

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevoCliente = {
      ...data,
      tipo: 'cliente',
      fechaAlta: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('clientes').insertOne(nuevoCliente);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevoCliente },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}
