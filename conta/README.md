# tipos

``` 
type Niveles = {
    id: number;
    nombre: string;
}

type Cuenta = {
    id: number;
    nombre: string;
}

type Subconta = {
    id: number;
    nombre: string;
}

type Nif = {
    idCuenta: number;
    nombre: string;
    nif: string;
    dir1: string;
    dir2: string;
    cp: string;
    dir3: string;
    dir4: string;
}

type Saldos = {
    id: number;
    year: number;
    month: number;
    debe: number;
    haber: number;
}

type Asiento = {
    id: number;
    year: number;
    subconta: string;
    idAsiento: number;
    date: Date;
}

type Concepto = {
    id: number;
    nombre: string;
}
// un asiento puede tener varios apuntes
type Apunte = {
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
// una factura puede tener varios apuntes
// una factura puede tener varios iva
type Factura = {
    id: number;
    tipo: "emitida" | "recibida";
    idNif: number;
    date: Date;
    year: number;
    subconta: string;
    numero: string;
    idAsiento: number;
}

type Iva = {
    id: number;
    year: number;
    subconta: string;
    idFactura: number;
    base: number;
    cuenta: number; // 477 repercutido 472 soportado
    porcentaje: number; // 21% 10% 4% 
    importe: number;
}

```
