import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Asiento, Apunte, Saldos } from '@/types';
import { Db } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const asientos = await db.collection<Asiento>('asientos').find({}).toArray();

    // Get apuntes for each asiento
    const asientosWithApuntes = await Promise.all(
      asientos.map(async (asiento) => {
        const apuntes = await db
          .collection<Apunte>('apuntes')
          .find({ idAsiento: asiento.idAsiento, year: asiento.year })
          .toArray();
        return { ...asiento, apuntes };
      })
    );

    return NextResponse.json(asientosWithApuntes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asientos' }, { status: 500 });
  }
}

async function actualizarSaldos(db: Db, apuntes: Apunte[], fecha: Date, year: number, subconta: string) {
  const month = fecha.getMonth() + 1; // JavaScript months are 0-indexed

  // Agrupar apuntes por cuenta
  const cuentasAfectadas = new Map<number, { debe: number; haber: number }>();

  apuntes.forEach((apunte) => {
    // Procesar cuenta del DEBE
    if (apunte.idCuentaDebe > 0) {
      const current = cuentasAfectadas.get(apunte.idCuentaDebe) || { debe: 0, haber: 0 };
      current.debe += apunte.debe;
      cuentasAfectadas.set(apunte.idCuentaDebe, current);
    }

    // Procesar cuenta del HABER
    if (apunte.idCuentaHaber > 0) {
      const current = cuentasAfectadas.get(apunte.idCuentaHaber) || { debe: 0, haber: 0 };
      current.haber += apunte.haber;
      cuentasAfectadas.set(apunte.idCuentaHaber, current);
    }
  });

  // Actualizar o crear saldos para cada cuenta afectada
  for (const [idCuenta, movimientos] of cuentasAfectadas) {
    const saldoExistente = await db.collection<Saldos>('saldos').findOne({
      idCuenta,
      year,
      month,
      subconta
    });

    if (saldoExistente) {
      // Actualizar saldo existente
      await db.collection<Saldos>('saldos').updateOne(
        { _id: saldoExistente._id },
        {
          $inc: {
            debe: movimientos.debe,
            haber: movimientos.haber
          }
        }
      );
    } else {
      // Crear nuevo saldo
      await db.collection<Saldos>('saldos').insertOne({
        id: Date.now() + idCuenta, // ID único temporal
        idCuenta,
        year,
        month,
        subconta,
        debe: movimientos.debe,
        haber: movimientos.haber
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const { apuntes, ...asientoData } = body;

    // Insert asiento
    const asientoResult = await db.collection<Asiento>('asientos').insertOne(asientoData);

    // Insert apuntes if provided
    if (apuntes && apuntes.length > 0) {
      await db.collection<Apunte>('apuntes').insertMany(apuntes);

      // Actualizar saldos
      await actualizarSaldos(
        db,
        apuntes,
        new Date(asientoData.date),
        asientoData.year,
        asientoData.subconta
      );
    }

    return NextResponse.json({
      success: true,
      id: asientoResult.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear asiento:', error);
    return NextResponse.json({ error: 'Error al crear asiento' }, { status: 500 });
  }
}