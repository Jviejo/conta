import { Invoice, Company, Customer } from '@/types';
import { js2xml } from 'xml-js';

export function generateFacturaeXML(invoice: Invoice, company: Company, customer: Customer): string {
  const facturae = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    'fe:Facturae': {
      _attributes: {
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'xmlns:fe': 'http://www.facturae.es/Facturae/2014/v3.2.1/Facturae'
      },
      FileHeader: {
        SchemaVersion: { _text: '3.2.1' },
        Modality: { _text: 'I' },
        InvoiceIssuerType: { _text: 'EM' },
        Batch: {
          BatchIdentifier: { _text: `LOTE-${new Date().getFullYear()}/${invoice.numero_factura}` },
          InvoicesCount: { _text: '1' },
          TotalInvoicesAmount: {
            TotalAmount: { _text: invoice.total_factura.toFixed(2) }
          },
          InvoiceCurrencyCode: { _text: 'EUR' }
        }
      },
      Parties: {
        SellerParty: {
          TaxIdentification: {
            TaxIdentificationNumber: { _text: company.nif_cif }
          },
          LegalEntity: {
            CorporateName: { _text: company.nombre_razon_social }
          }
        },
        BuyerParty: {
          TaxIdentification: {
            TaxIdentificationNumber: { _text: customer.nif_cif }
          },
          AdministrativeCentre: {
            CentreCode: { _text: 'U00000001' },
            RoleTypeCode: { _text: '01' }
          }
        }
      },
      Invoices: {
        Invoice: {
          InvoiceHeader: {
            InvoiceNumber: { _text: invoice.numero_factura.split('/').pop() || '001' },
            InvoiceSeries: { _text: invoice.numero_factura.split('/')[0] || 'A' }
          },
          InvoiceIssueData: {
            IssueDate: { _text: invoice.fecha_emision.toISOString().split('T')[0] },
            InvoiceCurrencyCode: { _text: 'EUR' }
          },
          InvoiceTotals: {
            TotalGrossAmount: { _text: invoice.base_imponible_total.toFixed(2) },
            TotalOutstandingAmount: { _text: invoice.total_factura.toFixed(2) },
            InvoiceTotal: { _text: invoice.total_factura.toFixed(2) }
          },
          Items: {
            InvoiceLine: invoice.detalles.map((detalle) => ({
              ItemDescription: { _text: detalle.descripcion },
              Quantity: { _text: detalle.cantidad.toString() },
              UnitOfMeasure: { _text: '05' },
              UnitPriceWithoutTax: { _text: detalle.precio_unitario.toFixed(2) },
              GrossAmount: { _text: detalle.base_imponible_linea.toFixed(2) },
              TaxesOutputs: {
                Tax: {
                  TaxRate: { _text: detalle.tipo_iva.toFixed(2) },
                  TaxAmount: { _text: (detalle.base_imponible_linea * detalle.tipo_iva / 100).toFixed(2) }
                }
              }
            }))
          },
          TaxesOutputs: {
            Tax: {
              TaxRate: { _text: '21.00' },
              TaxableBase: {
                TotalAmount: { _text: invoice.base_imponible_total.toFixed(2) }
              },
              TaxAmount: { _text: invoice.impuestos_total.toFixed(2) }
            }
          }
        }
      },
      'ds:Signature': {
        'ds:SignedInfo': { _text: '...' },
        'ds:SignatureValue': { _text: '...' },
        'ds:KeyInfo': { _text: '...' }
      }
    }
  };

  return js2xml(facturae, { compact: true, spaces: 2 });
}

export function generateVerifactuXML(invoice: Invoice, company: Company, customer: Customer): string {
  const verifactu = {
    _declaration: {
      _attributes: {
        version: '1.0'
      }
    },
    'SOAP-ENV:Envelope': {
      _attributes: {
        'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
      },
      'SOAP-ENV:Body': {
        RegFactuSistemaFacturacion: {
          _attributes: {
            xmlns: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd'
          },
          Cabecera: {
            ObligadoEmision: {
              _attributes: {
                xmlns: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'
              },
              NombreRazon: { _text: company.nombre_razon_social },
              NIF: { _text: company.nif_cif }
            }
          },
          RegistroFactura: {
            RegistroAlta: {
              _attributes: {
                xmlns: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'
              },
              IDVersion: { _text: '1.0' },
              IDFactura: {
                IDEmisorFactura: { _text: company.nif_cif },
                NumSerieFactura: { _text: invoice.numero_factura },
                FechaExpedicionFactura: { _text: invoice.fecha_emision.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
              },
              NombreRazonEmisor: { _text: company.nombre_razon_social },
              Subsanacion: { _text: 'N' },
              RechazoPrevio: { _text: 'N' },
              TipoFactura: { _text: 'F1' },
              FechaOperacion: { _text: invoice.fecha_emision.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
              DescripcionOperacion: { _text: invoice.detalles.map(d => d.descripcion).join(', ') },
              FacturaSimplificadaArt7273: { _text: 'N' },
              FacturaSinIdentifDestinatarioArt61d: { _text: 'N' },
              Macrodato: { _text: 'N' },
              Destinatarios: {
                IDDestinatario: {
                  NombreRazon: { _text: customer.nombre_razon_social },
                  NIF: { _text: customer.nif_cif }
                }
              },
              Cupon: { _text: 'N' },
              Desglose: {
                DetalleDesglose: {
                  ClaveRegimen: { _text: '01' },
                  CalificacionOperacion: { _text: 'S1' },
                  TipoImpositivo: { _text: '21.00' },
                  BaseImponibleOimporteNoSujeto: { _text: invoice.base_imponible_total.toFixed(2) },
                  CuotaRepercutida: { _text: invoice.impuestos_total.toFixed(2) }
                }
              },
              CuotaTotal: { _text: invoice.impuestos_total.toFixed(2) },
              ImporteTotal: { _text: invoice.total_factura.toFixed(2) },
              Encadenamiento: {
                RegistroAnterior: {
                  IDEmisorFactura: { _text: company.nif_cif },
                  NumSerieFactura: { _text: '' },
                  FechaExpedicionFactura: { _text: '' },
                  Huella: { _text: '' }
                }
              },
              SistemaInformatico: {
                NombreRazon: { _text: company.nombre_razon_social },
                NIF: { _text: company.nif_cif },
                NombreSistemaInformatico: { _text: company.nombre_razon_social },
                IdSistemaInformatico: { _text: '10' },
                Version: { _text: '1.0' },
                NumeroInstalacion: { _text: '5' },
                TipoUsoPosibleSoloVerifactu: { _text: 'S' },
                TipoUsoPosibleMultiOT: { _text: 'N' },
                IndicadorMultiplesOT: { _text: 'N' }
              },
              FechaHoraHusoGenRegistro: { _text: new Date().toISOString() },
              NumRegistroAcuerdoFacturacion: { _text: '' },
              IdAcuerdoSistemaInformatico: { _text: '' },
              TipoHuella: { _text: '01' },
              Huella: { _text: 'B6455458254680C4660186AB3B6BB3AE20445879632573A3128A66BE2200A0' }
            }
          }
        }
      }
    }
  };

  return js2xml(verifactu, { compact: true, spaces: 2 });
}
