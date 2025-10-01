import { NextResponse } from 'next/server';

import { getDb } from '@/lib/mongodb';
import { Factura, Iva } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const facturas = await db.collection<Factura>('facturas').find({}).toArray();
    return NextResponse.json(facturas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener facturas' + error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();

    const body = await request.json();
    const { factura, ivas } = body;

    // Insertar factura
    const facturaData: Factura = {
      id: Date.now(),
      tipo: factura.tipo,
      year: factura.year,
      subconta: factura.subconta,
      fechaRegistro: new Date(factura.fechaRegistro),
      numeroRegistro: factura.numeroRegistro,
      suFactura: factura.suFactura,
      fechaFactura: new Date(factura.fechaFactura),
      idCuentaClienteProveedor: factura.idCuentaClienteProveedor,
      idCuentaContrapartida: factura.idCuentaContrapartida,
      baseRetencion: factura.baseRetencion || 0,
      porcentajeRetencion: factura.porcentajeRetencion || 0,
      importeRetencion: factura.importeRetencion || 0,
      importeTotal: factura.importeTotal,
    };

    const resultFactura = await db.collection<Factura>('facturas').insertOne(facturaData);
    const idFactura = facturaData.id;

    // Insertar líneas de IVA
    if (ivas && ivas.length > 0) {
      const ivasData = ivas.map((iva: Iva) => ({
        id: Date.now() + Math.random(),
        year: factura.year,
        subconta: factura.subconta,
        idFactura: idFactura,
        porcentaje: iva.porcentaje,
        baseIva: iva.baseIva,
        cuota: iva.cuota,
      }));

      await db.collection<Iva>('iva').insertMany(ivasData);
    }

    return NextResponse.json({
      success: true,
      facturaId: idFactura
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
  }
}
