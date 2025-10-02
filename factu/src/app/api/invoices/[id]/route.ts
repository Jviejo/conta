import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Invoice, Company, Customer } from '@/types';
import { generateFacturaeXML, generateVerifactuXML } from '@/lib/xml-generators';

interface InvoiceDetailInput {
  id_producto?: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_monto?: number;
  tipo_iva: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const invoice = await db.collection<Invoice>('invoices').findOne({ _id: new ObjectId(id) });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: 'Error fetching invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body = await request.json();

    // Recalculate totals if detalles are provided
    if (body.detalles) {
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
    }

    if (body.fecha_emision) body.fecha_emision = new Date(body.fecha_emision);
    if (body.fecha_vencimiento) body.fecha_vencimiento = new Date(body.fecha_vencimiento);
    if (body.id_cliente) body.id_cliente = new ObjectId(body.id_cliente);
    if (body.id_forma_pago) body.id_forma_pago = new ObjectId(body.id_forma_pago);

    // Regenerate XMLs if data changed
    const company = await db.collection<Company>('company').findOne({});
    const customer = await db.collection<Customer>('customers').findOne({ _id: new ObjectId(body.id_cliente) });

    if (company && customer) {
      body.facturae_xml = generateFacturaeXML({ ...body, _id: new ObjectId(id) }, company, customer);
      body.verifactu_xml = generateVerifactuXML({ ...body, _id: new ObjectId(id) }, company, customer);
    }

    const result = await db.collection<Invoice>('invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ _id: id, ...body });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error updating invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const result = await db.collection<Invoice>('invoices').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Error deleting invoice' }, { status: 500 });
  }
}
