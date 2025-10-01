import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

import { Iva } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = await getDb();

    const { searchParams } = new URL(request.url);
    const idFactura = searchParams.get('idFactura');

    if (!idFactura) {
      return NextResponse.json({ error: 'idFactura requerido' }, { status: 400 });
    }

    const ivas = await db.collection<Iva>('iva')
      .find({ idFactura: parseInt(idFactura) })
      .toArray();

    return NextResponse.json(ivas);
  } catch (error) {
    console.error('Error al obtener IVAs:', error);
    return NextResponse.json({ error: 'Error al obtener IVAs' }, { status: 500 });
  }
}
