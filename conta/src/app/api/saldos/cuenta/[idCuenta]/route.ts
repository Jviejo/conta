import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Saldos } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idCuenta: string }> }
) {
  try {
    const { idCuenta } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const subconta = searchParams.get('subconta');
    const agruparSubcontas = searchParams.get('agrupar') === 'true';

    const db = await getDb();

    let query: any = { idCuenta: parseInt(idCuenta) };
    if (year) query.year = parseInt(year);
    if (subconta) query.subconta = subconta;

    const saldos = await db.collection<Saldos>('saldos')
      .find(query)
      .sort({ year: 1, month: 1, subconta: 1 })
      .toArray();

    // Si se solicita agrupar subcontas, sumar por mes
    if (agruparSubcontas && saldos.length > 0) {
      const agrupado = new Map<string, Saldos>();

      saldos.forEach((saldo) => {
        const key = `${saldo.year}-${saldo.month}`;
        const existing = agrupado.get(key);

        if (existing) {
          existing.debe += saldo.debe;
          existing.haber += saldo.haber;
        } else {
          agrupado.set(key, {
            id: saldo.id,
            idCuenta: saldo.idCuenta,
            year: saldo.year,
            month: saldo.month,
            subconta: 'TODAS',
            debe: saldo.debe,
            haber: saldo.haber,
          });
        }
      });

      return NextResponse.json(Array.from(agrupado.values()));
    }

    return NextResponse.json(saldos);
  } catch (error) {
    console.error('Error al obtener saldos de cuenta:', error);
    return NextResponse.json({ error: 'Error al obtener saldos de cuenta' }, { status: 500 });
  }
}