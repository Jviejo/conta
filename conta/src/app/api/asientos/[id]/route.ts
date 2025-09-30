import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Asiento, Apunte } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const asiento = await db.collection<Asiento>('asientos').findOne({ _id: new ObjectId(id) });

    if (!asiento) {
      return NextResponse.json({ error: 'Asiento no encontrado' }, { status: 404 });
    }

    // Get apuntes for this asiento
    const apuntes = await db
      .collection<Apunte>('apuntes')
      .find({ idAsiento: asiento.idAsiento, year: asiento.year })
      .toArray();

    return NextResponse.json({ ...asiento, apuntes });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asiento' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    const { _id, apuntes, ...updateData } = body;

    const result = await db.collection<Asiento>('asientos').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Asiento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar asiento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const asiento = await db.collection<Asiento>('asientos').findOne({ _id: new ObjectId(id) });

    if (!asiento) {
      return NextResponse.json({ error: 'Asiento no encontrado' }, { status: 404 });
    }

    // Delete associated apuntes
    await db.collection<Apunte>('apuntes').deleteMany({
      idAsiento: asiento.idAsiento,
      year: asiento.year
    });

    // Delete asiento
    await db.collection<Asiento>('asientos').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar asiento' }, { status: 500 });
  }
}