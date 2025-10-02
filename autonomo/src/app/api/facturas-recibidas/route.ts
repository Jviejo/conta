import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { FacturaRecibida } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const facturas = await db
      .collection<FacturaRecibida>('facturas_recibidas')
      .find({})
      .sort({ fechaRecepcion: -1 })
      .toArray();

    return NextResponse.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas recibidas:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas recibidas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevaFactura: FacturaRecibida = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('facturas_recibidas').insertOne(nuevaFactura);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevaFactura },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear factura recibida:', error);
    return NextResponse.json(
      { error: 'Error al crear factura recibida' },
      { status: 500 }
    );
  }
}
