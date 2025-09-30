import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Apunte } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idAsiento = searchParams.get('idAsiento');
    const year = searchParams.get('year');

    const db = await getDb();

    let query = {};
    if (idAsiento && year) {
      query = { idAsiento: parseInt(idAsiento), year: parseInt(year) };
    }

    const apuntes = await db.collection<Apunte>('apuntes').find(query).toArray();
    return NextResponse.json(apuntes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener apuntes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Apunte>('apuntes').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear apunte' }, { status: 500 });
  }
}