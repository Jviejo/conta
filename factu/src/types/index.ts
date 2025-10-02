import { ObjectId } from 'mongodb';

// Products
export interface Product {
  _id?: ObjectId;
  codigo_sku: string;
  nombre: string;
  descripcion_larga: string;
  precio_venta_base: number;
  tipo_iva_defecto: number;
  unidad_medida: string;
}

// Customers
export interface Customer {
  _id?: ObjectId;
  nombre_razon_social: string;
  nif_cif: string;
  direccion_fiscal: string;
  telefono?: string;
  email?: string;
  condiciones_pago_defecto?: ObjectId;
}

// Payment Methods
export interface PaymentMethod {
  _id?: ObjectId;
  nombre: string;
  requiere_iban: boolean;
  dias_vencimiento_defecto: number;
}

// Company
export interface Company {
  _id?: ObjectId;
  nombre_razon_social: string;
  nif_cif: string;
  direccion_fiscal: string;
  logo_url?: string;
  apikey_ia?: string;
  certificado_verifactu?: string;
  certificado_facturae?: string;
  iban?: string;
}

// Invoice Detail Line
export interface InvoiceDetail {
  _id?: ObjectId;
  id_factura: ObjectId;
  linea_numero: number;
  id_producto?: ObjectId;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_monto: number;
  base_imponible_linea: number;
  tipo_iva: number;
  importe_total_linea: number;
}

// Invoice
export interface Invoice {
  _id?: ObjectId;
  id_cliente: ObjectId;
  numero_factura: string;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  id_forma_pago: ObjectId;
  base_imponible_total: number;
  impuestos_total: number;
  retenciones_total: number;
  total_factura: number;
  estado: 'Pendiente' | 'Pagada' | 'Vencida';
  facturae_xml?: string;
  verifactu_xml?: string;
  detalles: InvoiceDetail[];
}
