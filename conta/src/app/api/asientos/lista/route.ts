import { getDb } from '@/lib/mongodb';
import { Asiento, Apunte } from '@/types';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const subconta = searchParams.get('subconta');
    const idAsientoDesde = searchParams.get('idAsientoDesde');

    if (!year || !subconta) {
      return NextResponse.json(
        { error: 'year y subconta son requeridos' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Query para asientos
    const queryAsientos: any = {
      year: parseInt(year),
      subconta: subconta,
    };

    if (idAsientoDesde) {
      queryAsientos.idAsiento = { $gte: parseInt(idAsientoDesde) };
    }

    // Obtener asientos ordenados por idAsiento
    const asientos = await db
      .collection<Asiento>('asientos')
      .find(queryAsientos)
      .sort({ idAsiento: 1 })
      .toArray();

    if (asientos.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener todos los apuntes de estos asientos
    const idsAsientos = asientos.map((a) => a.idAsiento);
    const apuntes = await db
      .collection<Apunte>('apuntes')
      .find({
        year: parseInt(year),
        subconta: subconta,
        idAsiento: { $in: idsAsientos },
      })
      .sort({ idAsiento: 1, idApunte: 1 })
      .toArray();

    // Agrupar apuntes por asiento
    const asientosConApuntes = asientos.map((asiento) => ({
      ...asiento,
      apuntes: apuntes.filter((ap) => ap.idAsiento === asiento.idAsiento),
    }));

    return NextResponse.json(asientosConApuntes);
  } catch (error) {
    console.error('Error al obtener asientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener asientos' },
      { status: 500 }
    );
  }
}
