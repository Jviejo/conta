import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Apunte } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = await getDb();

    const { searchParams } = new URL(request.url);
    const idCuenta = searchParams.get('idCuenta');
    const year = searchParams.get('year');
    const subconta = searchParams.get('subconta');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    if (!idCuenta) {
      return NextResponse.json({ error: 'idCuenta requerido' }, { status: 400 });
    }

    // Construir query base
    const queryApuntes: any = {
      $or: [
        { idCuentaDebe: parseInt(idCuenta) },
        { idCuentaHaber: parseInt(idCuenta) }
      ]
    };

    if (year) {
      queryApuntes.year = parseInt(year);
    }

    if (subconta) {
      queryApuntes.subconta = subconta;
    }

    // Obtener apuntes
    const apuntes = await db.collection<Apunte>('apuntes')
      .find(queryApuntes)
      .sort({ year: 1, idAsiento: 1, idApunte: 1 })
      .toArray();

    // Obtener asientos únicos para filtrar por fecha
    const asientosIds = [...new Set(apuntes.map(a => a.idAsiento))];

    const queryAsientos: any = { idAsiento: { $in: asientosIds } };

    if (fechaDesde || fechaHasta) {
      queryAsientos.date = {};
      if (fechaDesde) queryAsientos.date.$gte = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        queryAsientos.date.$lte = hasta;
      }
    }

    const asientos = await db.collection('asientos')
      .find(queryAsientos)
      .toArray();

    const asientosIdsValidos = new Set(asientos.map(a => a.idAsiento));

    // Filtrar apuntes que pertenecen a asientos válidos
    const apuntesFiltrados = apuntes.filter(a => asientosIdsValidos.has(a.idAsiento));

    // Enriquecer con información del asiento
    const extracto = apuntesFiltrados.map(apunte => {
      const asiento = asientos.find(a => a.idAsiento === apunte.idAsiento);
      return {
        ...apunte,
        fecha: asiento?.date,
      };
    });

    return NextResponse.json(extracto);
  } catch (error) {
    console.error('Error al obtener extracto:', error);
    return NextResponse.json({ error: 'Error al obtener extracto' }, { status: 500 });
  }
}
