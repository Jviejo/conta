import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { FacturaEmitida } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const facturas = await db
      .collection<FacturaEmitida>('facturas_emitidas')
      .find({})
      .sort({ fechaEmision: -1 })
      .toArray();

    return NextResponse.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas emitidas:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas emitidas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevaFactura: FacturaEmitida = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('facturas_emitidas').insertOne(nuevaFactura);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevaFactura },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear factura emitida:', error);
    return NextResponse.json(
      { error: 'Error al crear factura emitida' },
      { status: 500 }
    );
  }
}
