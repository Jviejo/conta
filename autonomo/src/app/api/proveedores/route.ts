import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ClienteProveedor } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const proveedores = await db
      .collection<ClienteProveedor>('proveedores')
      .find({ tipo: 'proveedor' })
      .sort({ fechaAlta: -1 })
      .toArray();

    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevoProveedor: ClienteProveedor = {
      ...data,
      tipo: 'proveedor',
      fechaAlta: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('proveedores').insertOne(nuevoProveedor);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevoProveedor },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json(
      { error: 'Error al crear proveedor' },
      { status: 500 }
    );
  }
}
