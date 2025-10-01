import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Plantilla } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    const db = await getDb();

    // Get the document from plantillas collection
    const document = await db.collection('plantillas').findOne({});

    if (!document || !document.plantillas_asientos) {
      return NextResponse.json([]);
    }

    // Extract the plantillas_asientos array
    let plantillas: Plantilla[] = document.plantillas_asientos;

    // Filter by tipo if specified
    if (tipo) {
      plantillas = plantillas.filter((p: Plantilla) => p.tipo_asiento === tipo);
    }

    return NextResponse.json(plantillas);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 });
  }
}