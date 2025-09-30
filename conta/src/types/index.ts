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
  year: number;
  month: number;
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
  idNif: number;
  date: Date;
  year: number;
  subconta: string;
  numero: string;
  idAsiento: number;
}

export interface Iva {
  _id?: ObjectId;
  id: number;
  year: number;
  subconta: string;
  idFactura: number;
  base: number;
  cuenta: number;
  porcentaje: number;
  importe: number;
}