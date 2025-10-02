import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const factura = await db
      .collection('facturas_recibidas')
      .findOne({ _id: new ObjectId(id) });

    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json(
      { error: 'Error al obtener factura' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = await getDb();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = data;

    const result = await db.collection('facturas_recibidas').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Factura actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    return NextResponse.json(
      { error: 'Error al actualizar factura' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const result = await db
      .collection('facturas_recibidas')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    return NextResponse.json(
      { error: 'Error al eliminar factura' },
      { status: 500 }
    );
  }
}
