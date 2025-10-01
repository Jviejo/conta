import { ObjectId } from 'mongodb';

export interface Nivel {
  _id?: ObjectId;
  id: number;
  nombre: string;
}

export interface Cuenta {
  _id?: ObjectId;
  id: number;
  nombre: string;
}

export interface Subconta {
  _id?: ObjectId;
  id: number;
  nombre: string;
}

export interface Ejercicio {
  _id?: ObjectId;
  year: number;
}

export interface Plantilla {
  _id?: ObjectId;
  nombre: string;
  evento: string;
  tipo_asiento: "simple" | "compuesto";
  asiento: PlantillaLinea[];
}

export interface PlantillaLinea {
  cuenta_codigo: string;
  cuenta_nombre: string;
  naturaleza: "DEBE" | "HABER";
  concepto: string;
  importe: string;
}

export interface Nif {
  _id?: ObjectId;
  idCuenta: number;
  nombre: string;
  nif: string;
  dir1: string;
  dir2: string;
  cp: string;
  dir3: string;
  dir4: string;
}

export interface Saldos {
  _id?: ObjectId;
  id: number;
  idCuenta: number;
  year: number;
  month: number;
  subconta: string;
  debe: number;
  haber: number;
}

export interface Asiento {
  _id?: ObjectId;
  id: number;
  year: number;
  subconta: string;
  idAsiento: number;
  date: Date;
}

export interface Concepto {
  _id?: ObjectId;
  id: number;
  nombre: string;
}

export interface Apunte {
  _id?: ObjectId;
  id: number;
  year: number;
  subconta: string;
  idAsiento: number;
  idApunte: number;
  idCuentaDebe: number;
  idCuentaHaber: number;
  debe: number;
  haber: number;
  idConcepto: number;
  descripcion: string;
}

export interface Factura {
  _id?: ObjectId;
  id: number;
  tipo: "emitida" | "recibida";
  year: number;
  subconta: string;
  fechaRegistro: Date;
  numeroRegistro: string;
  suFactura: string;
  fechaFactura: Date;
  idCuentaClienteProveedor: number;
  idCuentaContrapartida: number;
  baseRetencion: number;
  porcentajeRetencion: number;
  importeRetencion: number;
  importeTotal: number;
  idAsiento?: number;
}

export interface Iva {
  _id?: ObjectId;
  id: number;
  year: number;
  subconta: string;
  idFactura: number;
  porcentaje: number;
  baseIva: number;
  cuota: number;
}