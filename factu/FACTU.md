# Model

Este es un excelente esquema para modelar un sistema de facturación. A continuación, se describen los campos esenciales que cada una de estas "tablas" o bloques de datos debe contener.



---



## Tablas Maestras (Master Tables)

Estas tablas contienen la información de referencia que se reutiliza constantemente en las transacciones.



### 1. Products (Productos/Servicios)

Define los artículos que la compañía vende, independientemente de la factura específica.

| Campo                 | Descripción                                                    | Notas |
| :-------------------- | :------------------------------------------------------------- | :---- |
| **ID_Producto**       | Clave primaria única.                                          | `PK`  |
| **Codigo_SKU**        | Código interno de referencia o _stock keeping unit_.           |       |
| **Nombre**            | Nombre comercial corto del producto/servicio.                  |       |
| **Descripcion_Larga** | Texto detallado para la factura.                               |       |
| **Precio_Venta_Base** | Precio unitario estándar antes de impuestos.                   |       |
| **Tipo_IVA_Defecto**  | El porcentaje de IVA que se aplica por defecto (ej. 21%, 10%). |       |
| **Unidad_Medida**     | La unidad en que se vende (ej. UNIDAD, HORA, METRO).           |       |

### 2. Customers (Clientes)

Almacena los datos de los destinatarios de las facturas.

| Campo                        | Descripción                                           | Notas                  |
| :--------------------------- | :---------------------------------------------------- | :--------------------- |
| **ID_Cliente**               | Clave primaria única.                                 | `PK`                   |
| **Nombre_RazonSocial**       | Nombre completo o razón social del cliente.           |                        |
| **NIF_CIF**                  | Número de Identificación Fiscal (obligatorio).        |                        |
| **Direccion_Fiscal**         | Domicilio fiscal completo.                            |                        |
| **Telefono**, **Email**      | Datos de contacto.                                    |                        |
| **Condiciones_Pago_Defecto** | La referencia a la forma de pago preferida o pactada. | `FK` a **Formas_Pago** |

---

## Bloques Comunes (Common)

Estos bloques representan datos que, si bien pueden estar en tablas separadas, son fundamentales en cualquier transacción.

### 1. Datos company (Datos del Emisor/Vendedor)

Representa a la entidad que emite la factura.

| Campo                  | Descripción                            | Notas      |
| :--------------------- | :------------------------------------- | :--------- |
| **Nombre_RazonSocial** | Nombre legal de la empresa.            |            |
| **NIF_CIF**            | Identificación fiscal del emisor.      |            |
| **Direccion_Fiscal**   | Domicilio de la compañía.              |            |
| **Logo_URL**           | Ruta de acceso o binario del logotipo. | (Opcional) |
| **APIKEY_IA**          | API Key de la IA.                       |            |
| **CERTIFICADO_VERIFACUTU** | Certificado de Verifactu.              |            |
| **CERTIFICADO_FACTURAE**  | Certificado de FacturAE.              |            |
| **IBAN**                  | IBAN de la empresa.                     |            |

### 2. Formas de Pago (Payment Methods)

Define los medios y condiciones de pago.

| Campo                        | Descripción                                                          | Notas |
| :--------------------------- | :------------------------------------------------------------------- | :---- |
| **ID_FormaPago**             | Clave primaria única.                                                | `PK`  |
| **Nombre**                   | Descripción del método (ej. Transferencia, Domiciliación, Efectivo). |       |
| **Requiere_IBAN**            | Indicador booleano (Sí/No).                                          |       |
| **Dias_Vencimiento_Defecto** | Plazo estándar para este método (ej. 30, 60 días).                   |       |

### 3. Líneas de facturación (Línea de Detalle)

Aunque la estructura de la línea se almacena en la tabla **InvoiceDetails**, estos son los campos necesarios para definir un concepto facturado.

| Campo                    | Descripción                                                               | Notas                          |
| :----------------------- | :------------------------------------------------------------------------ | :----------------------------- |
| **ID_Producto**          | Referencia al producto maestro.                                           | `FK` a **Products** (Opcional) |
| **Descripcion**          | Descripción del artículo en esta factura.                                 |                                |
| **Cantidad**             | Número de unidades vendidas.                                              |                                |
| **Precio_Unitario**      | Precio por unidad, _al momento de la venta_.                              |                                |
| **Descuento_Monto**      | Descuento aplicado a la línea.                                            |                                |
| **Base_Imponible_Linea** | Precio final antes de impuestos ($$Cantidad \times Precio - Descuento$$). | (Calculado)                    |
| **Tipo_IVA**             | Tipo de IVA aplicado a esta línea.                                        |                                |
| **Importe_Total_Linea**  | Precio final (incluyendo IVA y retenciones).                              | (Calculado)                    |

---

## Movimientos (Moviments)

Estas tablas registran la transacción de facturación propiamente dicha.

### 1. Invoice (Factura - Cabecera)

Contiene la información general de la factura y los totales, enlazando al cliente.

| Campo                    | Descripción                                       | Notas                  |
| :----------------------- | :------------------------------------------------ | :--------------------- |
| **ID_Factura**           | Clave primaria única.                             | `PK`                   |
| **ID_Cliente**           | El cliente al que se factura.                     | `FK` a **Customers**   |
| **Numero_Factura**       | Número secuencial y único (ej. A/2025/0001).      |                        |
| **Fecha_Emision**        | Fecha en que se emite el documento.               |                        |
| **Fecha_Vencimiento**    | Fecha límite de pago.                             |                        |
| **ID_FormaPago**         | La forma de pago utilizada para esta factura.     | `FK` a **Formas_Pago** |
| **Base_Imponible_Total** | Suma de todas las bases imponibles de las líneas. | (Calculado)            |
| **Impuestos_Total**      | Suma total de impuestos (ej. IVA).                | (Calculado)            |
| **Retenciones_Total**    | Suma total de retenciones (ej. IRPF).             | (Calculado)            |
| **Total_Factura**        | Importe final a pagar.                            | (Calculado)            |
| **Estado**               | Estado del pago (ej. Pendiente, Pagada, Vencida). |                        |

### 2. InvoiceDetails (Detalle de Factura - Líneas)

Contiene una fila por cada producto o servicio vendido, enlazando la cabecera.

| Campo                    | Descripción                                        | Notas                                                                  |
| :----------------------- | :------------------------------------------------- | :--------------------------------------------------------------------- |
| **ID_Detalle**           | Clave primaria única para la línea.                | `PK`                                                                   |
| **ID_Factura**           | Clave para enlazar la línea a su factura.          | `FK` a **Invoice**                                                     |
| **Linea_Numero**         | Posición de la línea dentro de la factura.         |                                                                        |
| **ID_Producto**          | Enlace al producto maestro (si aplica).            | `FK` a **Products**                                                    |
| **Descripcion**          | La descripción exacta que aparecerá en la factura. |                                                                        |
| **Cantidad**             | Cantidad facturada.                                |                                                                        |
| **Precio_Unitario**      | Precio unitario final de esta transacción.         |                                                                        |
| **Tipo_IVA**             | Tipo de IVA utilizado.                             | **Importante:** Se debe guardar el tipo **en el momento de la venta.** |
| **Base_Imponible_Linea** | La base imponible de esta línea.                   |                                                                        |

## Facturae
```xml
<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    xmlns:fe="http://www.facturae.es/Facturae/2014/v3.2.1/Facturae">

    <FileHeader>
        <SchemaVersion>3.2.1</SchemaVersion>
        <Modality>I</Modality> <InvoiceIssuerType>EM</InvoiceIssuerType> <Batch>
            <BatchIdentifier>LOTE-2025/001</BatchIdentifier>
            <InvoicesCount>1</InvoicesCount>
            <TotalInvoicesAmount>
                <TotalAmount>121.00</TotalAmount>
            </TotalInvoicesAmount>
            <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        </Batch>
    </FileHeader>

    <Parties>
        <SellerParty>
            <TaxIdentification>
                <TaxIdentificationNumber>A12345678</TaxIdentificationNumber>
            </TaxIdentification>
            <LegalEntity>
                <CorporateName>NOMBRE DE LA EMPRESA S.L.</CorporateName>
                </LegalEntity>
        </SellerParty>
        <BuyerParty>
            <TaxIdentification>
                <TaxIdentificationNumber>B87654321</TaxIdentificationNumber>
            </TaxIdentification>
            <AdministrativeCentre>
                 <CentreCode>U00000001</CentreCode> <RoleTypeCode>01</RoleTypeCode>
            </AdministrativeCentre>
            </BuyerParty>
    </Parties>

    <Invoices>
        <Invoice>
            <InvoiceHeader>
                <InvoiceNumber>2025/001</InvoiceNumber>
                <InvoiceSeries>A</InvoiceSeries>
            </InvoiceHeader>

            <InvoiceIssueData>
                <IssueDate>2025-10-02</IssueDate>
                <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
                </InvoiceIssueData>

            <InvoiceTotals>
                <TotalGrossAmount>100.00</TotalGrossAmount>
                <TotalOutstandingAmount>121.00</TotalOutstandingAmount>
                <InvoiceTotal>121.00</InvoiceTotal>
            </InvoiceTotals>

            <Items>
                <InvoiceLine>
                    <ItemDescription>Servicio de Consultoría Web</ItemDescription>
                    <Quantity>1.0</Quantity>
                    <UnitOfMeasure>05</UnitOfMeasure> <UnitPriceWithoutTax>100.00</UnitPriceWithoutTax>
                    <GrossAmount>100.00</GrossAmount>
                    <TaxesOutputs>
                        <Tax>
                            <TaxRate>21.00</TaxRate>
                            <TaxAmount>21.00</TaxAmount>
                        </Tax>
                    </TaxesOutputs>
                </InvoiceLine>
            </Items>

            <TaxesOutputs>
                <Tax>
                    <TaxRate>21.00</TaxRate>
                    <TaxableBase>
                        <TotalAmount>100.00</TotalAmount>
                    </TaxableBase>
                    <TaxAmount>21.00</TaxAmount>
                </Tax>
            </TaxesOutputs>

            </Invoice>
    </Invoices>

    <ds:Signature>
        <ds:SignedInfo>...</ds:SignedInfo>
        <ds:SignatureValue>...</ds:SignatureValue>
        <ds:KeyInfo>...</ds:KeyInfo>
    </ds:Signature>
</fe:Facturae>
```

## Verifactu
```xml
<?xml version="1.0"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<SOAP-ENV:Body>
		<RegFactuSistemaFacturacion xmlns="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd">
			<Cabecera>
				<ObligadoEmision xmlns="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
					<NombreRazon>TRIBUTEC DATA SL</NombreRazon>
					<NIF>B70825260</NIF>
				</ObligadoEmision>
			</Cabecera>
			<RegistroFactura>
				<RegistroAlta xmlns="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
					<IDVersion>1.0</IDVersion>
					<IDFactura>
						<IDEmisorFactura>B70825260</IDEmisorFactura>
						<NumSerieFactura>12024</NumSerieFactura>
						<FechaExpedicionFactura>20-11-2024</FechaExpedicionFactura>
					</IDFactura>
					<NombreRazonEmisor>TRIBUTEC DATA SL</NombreRazonEmisor>
					<Subsanacion>N</Subsanacion>
					<RechazoPrevio>N</RechazoPrevio>
					<TipoFactura>F1</TipoFactura>
					<FechaOperacion>20-11-2024</FechaOperacion>
					<DescripcionOperacion>MANTENIMIENTO DE SOFTWARE</DescripcionOperacion>
					<FacturaSimplificadaArt7273>N</FacturaSimplificadaArt7273>
					<FacturaSinIdentifDestinatarioArt61d>N</FacturaSinIdentifDestinatarioArt61d>
					<Macrodato>N</Macrodato>
					<Destinatarios>
						<IDDestinatario>
							<NombreRazon>KUNG FU SOFTWARE SL</NombreRazon>
							<NIF>B42669572</NIF>
						</IDDestinatario>
					</Destinatarios>
					<Cupon>N</Cupon>
					<Desglose>
						<DetalleDesglose>
							<ClaveRegimen>01</ClaveRegimen>
							<CalificacionOperacion>S1</CalificacionOperacion>
							<TipoImpositivo>21.00</TipoImpositivo>
							<BaseImponibleOimporteNoSujeto>100.00</BaseImponibleOimporteNoSujeto>
							<CuotaRepercutida>21.00</CuotaRepercutida>
						</DetalleDesglose>
					</Desglose>
					<CuotaTotal>21.00</CuotaTotal>
					<ImporteTotal>121.00</ImporteTotal>
					<Encadenamiento>
						<RegistroAnterior>
							<IDEmisorFactura>B70825260</IDEmisorFactura>
							<NumSerieFactura>22022</NumSerieFactura>
							<FechaExpedicionFactura>20-11-2024</FechaExpedicionFactura>
							<Huella>C653DF54DFB64E3B656255CDE9790327BDDDD086E130A3E69EA6BE1FF42C</Huella>
						</RegistroAnterior>
					</Encadenamiento>
					<SistemaInformatico>
						<NombreRazon>TRIBUTEC DATA SL</NombreRazon>
						<NIF>B70825260</NIF>
						<NombreSistemaInformatico>TRIBUTEC DATA SL</NombreSistemaInformatico>
						<IdSistemaInformatico>10</IdSistemaInformatico>
						<Version>1.0</Version>
						<NumeroInstalacion>5</NumeroInstalacion>
						<TipoUsoPosibleSoloVerifactu>S</TipoUsoPosibleSoloVerifactu>
						<TipoUsoPosibleMultiOT>N</TipoUsoPosibleMultiOT>
						<IndicadorMultiplesOT>N</IndicadorMultiplesOT>
					</SistemaInformatico>
					<FechaHoraHusoGenRegistro>2024-11-20T18:55:03+01:00</FechaHoraHusoGenRegistro>
					<NumRegistroAcuerdoFacturacion></NumRegistroAcuerdoFacturacion>
					<IdAcuerdoSistemaInformatico></IdAcuerdoSistemaInformatico>
					<TipoHuella>01</TipoHuella>
					<Huella>B6455458254680C4660186AB3B6BB3AE20445879632573A3128A66BE2200A0</Huella>
				</RegistroAlta>
			</RegistroFactura>
		</RegFactuSistemaFacturacion>
	</SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

# ARQUITECTURA

## APLICACION NEXTJS
## BASE DE DATOS MONGODB. NO SE USA MONGOOSE
## ALMACENAR JUNTO LA FACTURA EL FACTURAE Y EL VERIFACUTU

