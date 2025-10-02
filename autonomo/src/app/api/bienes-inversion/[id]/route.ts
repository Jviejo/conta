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
    const bien = await db
      .collection('bienes_inversion')
      .findOne({ _id: new ObjectId(id) });

    if (!bien) {
      return NextResponse.json(
        { error: 'Bien de inversión no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(bien);
  } catch (error) {
    console.error('Error al obtener bien de inversión:', error);
    return NextResponse.json(
      { error: 'Error al obtener bien de inversión' },
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

    const result = await db.collection('bienes_inversion').updateOne(
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
        { error: 'Bien de inversión no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Bien de inversión actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar bien de inversión:', error);
    return NextResponse.json(
      { error: 'Error al actualizar bien de inversión' },
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
      .collection('bienes_inversion')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Bien de inversión no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Bien de inversión eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar bien de inversión:', error);
    return NextResponse.json(
      { error: 'Error al eliminar bien de inversión' },
      { status: 500 }
    );
  }
}
