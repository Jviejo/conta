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
    const ingreso = await db
      .collection('ingresos')
      .findOne({ _id: new ObjectId(id) });

    if (!ingreso) {
      return NextResponse.json(
        { error: 'Ingreso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(ingreso);
  } catch (error) {
    console.error('Error al obtener ingreso:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingreso' },
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

    const result = await db.collection('ingresos').updateOne(
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
        { error: 'Ingreso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ingreso actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ingreso' },
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
      .collection('ingresos')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Ingreso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    return NextResponse.json(
      { error: 'Error al eliminar ingreso' },
      { status: 500 }
    );
  }
}
