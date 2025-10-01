import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Saldos } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const subconta = searchParams.get('subconta');

    const db = await getDb();

    let query: any = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (subconta) query.subconta = subconta;

    const saldos = await db.collection<Saldos>('saldos')
      .find(query)
      .sort({ year: -1, month: -1, idCuenta: 1 })
      .toArray();

    return NextResponse.json(saldos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener saldos' }, { status: 500 });
  }
}