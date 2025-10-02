export interface Contacto {
  nombre: string;
  cargo: string;
  telefonoDirecto: string;
  emailDirecto: string;
  movil: string;
  departamento: string;
  esContactoPrincipal: boolean;
  fechaUltimoContacto?: Date;
}

export interface Visita {
  fecha: Date;
  tipo: 'presencial' | 'videoconferencia';
  personasVisitadas: string;
  asunto: string;
  resumen: string;
  proximaAccion: string;
  fechaProximaVisita?: Date;
  usuario: string;
}

export interface Comunicacion {
  fecha: Date;
  tipo: 'llamada' | 'whatsapp' | 'reunion' | 'otros';
  contacto: string;
  asunto: string;
  resumen: string;
  seguimientoNecesario: boolean;
  fechaSeguimiento?: Date;
  estado: 'pendiente' | 'completado';
}

export interface Email {
  fecha: Date;
  remitente: string;
  destinatario: string;
  asunto: string;
  adjuntos: string[];
  etiquetas: string[];
  relacionadoCon?: string;
  requiereRespuesta: boolean;
  fechaLimiteRespuesta?: Date;
}

export interface Documento {
  tipo: 'presupuesto' | 'contrato' | 'albaran' | 'factura' | 'legal' | 'certificado' | 'otro';
  nombre: string;
  url: string;
  fecha: Date;
}

export interface ClienteProveedor {
  _id?: string;
  // Datos Obligatorios AEAT
  nif: string;
  nombre: string;
  razonSocial: string;
  domicilioFiscal: {
    calle: string;
    numero: string;
    codigoPostal: string;
    poblacion: string;
    provincia: string;
    pais: string;
  };
  telefono: string;
  email: string;
  tipoEntidad: 'fisica' | 'juridica';
  paisResidenciaFiscal: string;

  // Datos Comerciales
  nombreComercial?: string;
  sector?: string;
  formaPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'pagare';
  plazoPago: number; // días
  cuentaBancaria?: string; // IBAN
  descuentos?: number;
  condicionesEspeciales?: string;
  notasInternas?: string;

  // Contactos, Visitas, Comunicaciones, Emails, Documentos
  contactos: Contacto[];
  visitas: Visita[];
  comunicaciones: Comunicacion[];
  emails: Email[];
  documentos: Documento[];

  // Histórico y Análisis
  fechaAlta: Date;
  fechaUltimaFactura?: Date;
  volumenFacturacionAnual: number;
  numeroFacturas: number;
  importeMedioFactura: number;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  motivoInactividad?: string;
  riesgoImpago: 'bajo' | 'medio' | 'alto';
  valoracion: 'A' | 'B' | 'C';

  // Campo para diferenciar tipo
  tipo: 'cliente' | 'proveedor';

  createdAt?: Date;
  updatedAt?: Date;
}

// Libro de Facturas Emitidas
export interface FacturaEmitida {
  _id?: string;
  numeroFactura: string;
  fechaEmision: Date;
  clienteId: string; // Referencia al cliente
  clienteNombre: string;
  clienteNif: string;
  baseImponible: number;
  tipoIva: number; // 21, 10, 4
  cuotaIva: number;
  totalFactura: number;
  tipoOperacion: 'nacional' | 'intracomunitaria' | 'exportacion';
  concepto: string;
  formaPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'pagare';
  estado: 'pendiente' | 'cobrada' | 'vencida';
  fechaCobro?: Date;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Libro de Facturas Recibidas
export interface FacturaRecibida {
  _id?: string;
  numeroFactura: string;
  fechaRecepcion: Date;
  proveedorId: string; // Referencia al proveedor
  proveedorNombre: string;
  proveedorNif: string;
  baseImponible: number;
  tipoIva: number;
  cuotaIvaDeducible: number;
  totalFactura: number;
  conceptoGasto: string;
  categoriaGasto: 'suministros' | 'material' | 'servicios' | 'dietas' | 'transporte' | 'alquiler' | 'otros';
  formaPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'pagare';
  estado: 'pendiente' | 'pagada';
  fechaPago?: Date;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Libro de Ingresos
export interface Ingreso {
  _id?: string;
  fechaCobro: Date;
  concepto: string;
  importe: number;
  medioPago: 'efectivo' | 'transferencia' | 'tarjeta';
  clienteOrigen?: string;
  clienteNif?: string;
  facturaAsociada?: string; // ID de factura emitida
  numeroFactura?: string;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Libro de Gastos
export interface Gasto {
  _id?: string;
  fechaPago: Date;
  concepto: string;
  importe: number;
  ivaDeducible: number;
  proveedor?: string;
  proveedorNif?: string;
  facturaAsociada?: string; // ID de factura recibida
  numeroFactura?: string;
  clasificacion: 'suministros' | 'material' | 'servicios' | 'dietas' | 'transporte' | 'alquiler' | 'otros';
  medioPago: 'efectivo' | 'transferencia' | 'tarjeta';
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Libro de Bienes de Inversión
export interface BienInversion {
  _id?: string;
  fechaAdquisicion: Date;
  descripcion: string;
  proveedor: string;
  proveedorNif: string;
  importeAdquisicion: number;
  ivaSoportado: number;
  tipoAmortizacion: 'lineal' | 'degresiva' | 'acelerada';
  porcentajeAmortizacion: number; // % anual
  vidaUtil: number; // años
  valorResidual: number;
  amortizacionAcumulada: number;
  estado: 'activo' | 'vendido' | 'dado_de_baja';
  numeroFactura?: string;
  categoria: 'inmueble' | 'vehiculo' | 'maquinaria' | 'equipos_informaticos' | 'mobiliario' | 'otros';
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
