import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const gasto = await db
      .collection('gastos')
      .findOne({ _id: new ObjectId(params.id) });

    if (!gasto) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(gasto);
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    return NextResponse.json(
      { error: 'Error al obtener gasto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const db = await getDb();

    const { _id, ...updateData } = data;

    const result = await db.collection('gastos').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gasto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar gasto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const result = await db
      .collection('gastos')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar gasto' },
      { status: 500 }
    );
  }
}
