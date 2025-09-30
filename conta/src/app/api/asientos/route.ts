import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Asiento, Apunte } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const asientos = await db.collection<Asiento>('asientos').find({}).toArray();

    // Get apuntes for each asiento
    const asientosWithApuntes = await Promise.all(
      asientos.map(async (asiento) => {
        const apuntes = await db
          .collection<Apunte>('apuntes')
          .find({ idAsiento: asiento.idAsiento, year: asiento.year })
          .toArray();
        return { ...asiento, apuntes };
      })
    );

    return NextResponse.json(asientosWithApuntes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asientos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const { apuntes, ...asientoData } = body;

    // Insert asiento
    const asientoResult = await db.collection<Asiento>('asientos').insertOne(asientoData);

    // Insert apuntes if provided
    if (apuntes && apuntes.length > 0) {
      await db.collection<Apunte>('apuntes').insertMany(apuntes);
    }

    return NextResponse.json({
      success: true,
      id: asientoResult.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear asiento' }, { status: 500 });
  }
}