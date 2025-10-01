import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Cuenta } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const db = await getDb();

    const cuenta = await db.collection<Cuenta>('cuentas').findOne({
      id: parseInt(codigo)
    });

    if (!cuenta) {
      return NextResponse.json({
        id: parseInt(codigo),
        nombre: 'Cuenta no encontrada'
      });
    }

    return NextResponse.json(cuenta);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener cuenta' }, { status: 500 });
  }
}