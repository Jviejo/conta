import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Invoice, Company, Customer } from '@/types';
import { generateFacturaeXML, generateVerifactuXML } from '@/lib/xml-generators';
import { ObjectId } from 'mongodb';

interface InvoiceDetailInput {
  id_producto?: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_monto?: number;
  tipo_iva: number;
}

export async function GET() {
  try {
    const db = await getDatabase();
    const invoices = await db.collection<Invoice>('invoices').find({}).toArray();
    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: 'Error fetching invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Calculate totals
    let base_imponible_total = 0;
    let impuestos_total = 0;

    body.detalles = body.detalles.map((detalle: InvoiceDetailInput, index: number) => {
      const base_imponible_linea = (detalle.cantidad * detalle.precio_unitario) - (detalle.descuento_monto || 0);
      const importe_iva = base_imponible_linea * detalle.tipo_iva / 100;
      const importe_total_linea = base_imponible_linea + importe_iva;

      base_imponible_total += base_imponible_linea;
      impuestos_total += importe_iva;

      return {
        linea_numero: index + 1,
        ...detalle,
        base_imponible_linea,
        importe_total_linea
      };
    });

    body.base_imponible_total = base_imponible_total;
    body.impuestos_total = impuestos_total;
    body.total_factura = base_imponible_total + impuestos_total - (body.retenciones_total || 0);
    body.fecha_emision = new Date(body.fecha_emision);
    body.fecha_vencimiento = new Date(body.fecha_vencimiento);
    body.id_cliente = new ObjectId(body.id_cliente);
    body.id_forma_pago = new ObjectId(body.id_forma_pago);

    // Get company and customer data for XML generation
    const company = await db.collection<Company>('company').findOne({});
    const customer = await db.collection<Customer>('customers').findOne({ _id: new ObjectId(body.id_cliente) });

    if (!company || !customer) {
      return NextResponse.json({ error: 'Company or customer not found' }, { status: 400 });
    }

    // Generate XMLs
    body.facturae_xml = generateFacturaeXML(body, company, customer);
    body.verifactu_xml = generateVerifactuXML(body, company, customer);

    const result = await db.collection<Invoice>('invoices').insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error creating invoice' }, { status: 500 });
  }
}
