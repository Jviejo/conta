import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Factura, Asiento, Cuenta } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = await getDb();

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as 'facturas' | 'asientos' | 'cuentas';

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de búsqueda requerido' }, { status: 400 });
    }

    let resultados: any[] = [];

    if (tipo === 'facturas') {
      const query: any = {};

      // Filtros específicos de facturas
      const idCuenta = searchParams.get('idCuenta');
      const suFactura = searchParams.get('suFactura');
      const numeroRegistro = searchParams.get('numeroRegistro');
      const fechaDesde = searchParams.get('fechaDesde');
      const fechaHasta = searchParams.get('fechaHasta');
      const importeMin = searchParams.get('importeMin');
      const importeMax = searchParams.get('importeMax');

      if (idCuenta) {
        query.$or = [
          { idCuentaClienteProveedor: parseInt(idCuenta) },
          { idCuentaContrapartida: parseInt(idCuenta) }
        ];
      }

      if (suFactura) {
        query.suFactura = { $regex: suFactura, $options: 'i' };
      }

      if (numeroRegistro) {
        query.numeroRegistro = { $regex: numeroRegistro, $options: 'i' };
      }

      if (fechaDesde || fechaHasta) {
        query.fechaFactura = {};
        if (fechaDesde) query.fechaFactura.$gte = new Date(fechaDesde);
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          query.fechaFactura.$lte = hasta;
        }
      }

      if (importeMin !== null || importeMax !== null) {
        query.importeTotal = {};
        if (importeMin) query.importeTotal.$gte = parseFloat(importeMin);
        if (importeMax) query.importeTotal.$lte = parseFloat(importeMax);
      }

      resultados = await db.collection<Factura>('facturas')
        .find(query)
        .sort({ fechaFactura: -1 })
        .limit(100)
        .toArray();
    }

    if (tipo === 'asientos') {
      const query: any = {};

      const idCuenta = searchParams.get('idCuenta');
      const idAsiento = searchParams.get('idAsiento');
      const fechaDesde = searchParams.get('fechaDesde');
      const fechaHasta = searchParams.get('fechaHasta');

      if (idAsiento) {
        query.idAsiento = parseInt(idAsiento);
      }

      if (fechaDesde || fechaHasta) {
        query.date = {};
        if (fechaDesde) query.date.$gte = new Date(fechaDesde);
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          query.date.$lte = hasta;
        }
      }

      resultados = await db.collection<Asiento>('asientos')
        .find(query)
        .sort({ date: -1 })
        .limit(100)
        .toArray();

      // Si se busca por cuenta, filtrar por apuntes
      if (idCuenta) {
        const apuntes = await db.collection('apuntes')
          .find({
            $or: [
              { idCuentaDebe: parseInt(idCuenta) },
              { idCuentaHaber: parseInt(idCuenta) }
            ]
          })
          .toArray();

        const idsAsientos = [...new Set(apuntes.map(a => a.idAsiento))];
        resultados = resultados.filter(a => idsAsientos.includes(a.idAsiento));
      }
    }

    if (tipo === 'cuentas') {
      const query: any = {};
      const idCuenta = searchParams.get('idCuenta');

      if (idCuenta) {
        // Buscar por ID o nombre
        const isNumeric = !isNaN(parseInt(idCuenta));
        if (isNumeric) {
          query.id = parseInt(idCuenta);
        } else {
          query.nombre = { $regex: idCuenta, $options: 'i' };
        }
      }

      resultados = await db.collection<Cuenta>('cuentas')
        .find(query)
        .sort({ id: 1 })
        .limit(100)
        .toArray();
    }

    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 });
  }
}
