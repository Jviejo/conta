import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

import { Factura } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = await getDb();

    const { searchParams } = new URL(request.url);

    const query: any = {};

    // Filtros
    const year = searchParams.get('year');
    const subconta = searchParams.get('subconta');
    const tipo = searchParams.get('tipo');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const idCuenta = searchParams.get('idCuenta');
    const importeMin = searchParams.get('importeMin');
    const importeMax = searchParams.get('importeMax');

    if (year) {
      query.year = parseInt(year);
    }

    if (subconta) {
      query.subconta = subconta;
    }

    if (tipo && tipo !== 'todas') {
      query.tipo = tipo;
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

    if (idCuenta) {
      query.idCuentaClienteProveedor = parseInt(idCuenta);
    }

    if (importeMin || importeMax) {
      query.importeTotal = {};
      if (importeMin) query.importeTotal.$gte = parseFloat(importeMin);
      if (importeMax) query.importeTotal.$lte = parseFloat(importeMax);
    }

    const facturas = await db.collection<Factura>('facturas')
      .find(query)
      .sort({ fechaFactura: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json(facturas);
  } catch (error) {
    console.error('Error al buscar facturas:', error);
    return NextResponse.json({ error: 'Error al buscar facturas' }, { status: 500 });
  }
}
