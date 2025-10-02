import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { BienInversion } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const bienes = await db
      .collection<BienInversion>('bienes_inversion')
      .find({})
      .sort({ fechaAdquisicion: -1 })
      .toArray();

    return NextResponse.json(bienes);
  } catch (error) {
    console.error('Error al obtener bienes de inversión:', error);
    return NextResponse.json(
      { error: 'Error al obtener bienes de inversión' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    const nuevoBien: BienInversion = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('bienes_inversion').insertOne(nuevoBien);

    return NextResponse.json(
      { _id: result.insertedId, ...nuevoBien },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear bien de inversión:', error);
    return NextResponse.json(
      { error: 'Error al crear bien de inversión' },
      { status: 500 }
    );
  }
}
