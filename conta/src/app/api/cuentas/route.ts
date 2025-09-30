import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Cuenta } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const cuentas = await db.collection<Cuenta>('cuentas').find({}).toArray();
    return NextResponse.json(cuentas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener cuentas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const result = await db.collection<Cuenta>('cuentas').insertOne(body);

    return NextResponse.json({
      success: true,
      id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 });
  }
}