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
    const proveedor = await db
      .collection('proveedores')
      .findOne({ _id: new ObjectId(id) });

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedor' },
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

    const result = await db.collection('proveedores').updateOne(
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
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json(
      { error: 'Error al actualizar proveedor' },
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
      .collection('proveedores')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json(
      { error: 'Error al eliminar proveedor' },
      { status: 500 }
    );
  }
}
