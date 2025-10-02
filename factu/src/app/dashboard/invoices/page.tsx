'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice, Product, Customer, PaymentMethod } from '@/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showXML, setShowXML] = useState<{ type: 'facturae' | 'verifactu', content: string } | null>(null);
  const [formData, setFormData] = useState({
    numero_factura: '',
    id_cliente: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    id_forma_pago: '',
    dias_vencimiento: 30,
    estado: 'Pendiente' as 'Pendiente' | 'Pagada' | 'Vencida',
    detalles: [{
      id_producto: '',
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_monto: 0,
      tipo_iva: 21
    }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, productsRes, customersRes, paymentMethodsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/payment-methods')
      ]);
      setInvoices(await invoicesRes.json());
      setProducts(await productsRes.json());
      setCustomers(await customersRes.json());
      setPaymentMethods(await paymentMethodsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fecha_emision = new Date(formData.fecha_emision);
      const fecha_vencimiento = new Date(fecha_emision);
      fecha_vencimiento.setDate(fecha_vencimiento.getDate() + formData.dias_vencimiento);

      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fecha_emision: fecha_emision.toISOString(),
          fecha_vencimiento: fecha_vencimiento.toISOString(),
          retenciones_total: 0
        })
      });
      fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      numero_factura: '',
      id_cliente: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      id_forma_pago: '',
      dias_vencimiento: 30,
      estado: 'Pendiente',
      detalles: [{
        id_producto: '',
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento_monto: 0,
        tipo_iva: 21
      }]
    });
  };

  const addDetailLine = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, {
        id_producto: '',
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento_monto: 0,
        tipo_iva: 21
      }]
    });
  };

  const removeDetailLine = (index: number) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  const updateDetailLine = (index: number, field: string, value: string | number) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };

    // If product is selected, auto-fill fields
    if (field === 'id_producto' && value) {
      const product = products.find(p => p._id?.toString() === value);
      if (product) {
        newDetalles[index].descripcion = product.descripcion_larga;
        newDetalles[index].precio_unitario = product.precio_venta_base;
        newDetalles[index].tipo_iva = product.tipo_iva_defecto;
      }
    }

    setFormData({ ...formData, detalles: newDetalles });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const viewXML = (invoice: Invoice, type: 'facturae' | 'verifactu') => {
    const content = type === 'facturae' ? invoice.facturae_xml : invoice.verifactu_xml;
    setShowXML({ type, content: content || '' });
  };

  const downloadXML = (invoice: Invoice, type: 'facturae' | 'verifactu') => {
    const content = type === 'facturae' ? invoice.facturae_xml : invoice.verifactu_xml;
    const blob = new Blob([content || ''], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.numero_factura.replace('/', '-')}_${type}.xml`;
    a.click();
  };

  const calculateTotal = () => {
    return formData.detalles.reduce((total, detalle) => {
      const base = (detalle.cantidad * detalle.precio_unitario) - (detalle.descuento_monto || 0);
      const iva = base * detalle.tipo_iva / 100;
      return total + base + iva;
    }, 0);
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : '+ Nueva Factura'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Nueva Factura</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Factura *</label>
                  <input
                    type="text"
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="A/2025/001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente *</label>
                  <select
                    value={formData.id_cliente}
                    onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {customers.map(c => (
                      <option key={c._id?.toString()} value={c._id?.toString()}>
                        {c.nombre_razon_social}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Emisión *</label>
                  <input
                    type="date"
                    value={formData.fecha_emision}
                    onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forma de Pago *</label>
                  <select
                    value={formData.id_forma_pago}
                    onChange={(e) => setFormData({ ...formData, id_forma_pago: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {paymentMethods.map(pm => (
                      <option key={pm._id?.toString()} value={pm._id?.toString()}>
                        {pm.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Días Vencimiento</label>
                  <input
                    type="number"
                    value={formData.dias_vencimiento}
                    onChange={(e) => setFormData({ ...formData, dias_vencimiento: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Pendiente' | 'Pagada' | 'Vencida' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Vencida">Vencida</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Líneas de Factura</h3>
                  <button type="button" onClick={addDetailLine} className="text-blue-600 hover:underline text-sm">
                    + Añadir línea
                  </button>
                </div>
                {formData.detalles.map((detalle, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-2 bg-gray-50">
                    <div className="grid grid-cols-6 gap-2 items-end">
                      <div>
                        <label className="block text-xs mb-1">Producto</label>
                        <select
                          value={detalle.id_producto}
                          onChange={(e) => updateDetailLine(index, 'id_producto', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="">Manual...</option>
                          {products.map(p => (
                            <option key={p._id?.toString()} value={p._id?.toString()}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs mb-1">Descripción</label>
                        <input
                          type="text"
                          value={detalle.descripcion}
                          onChange={(e) => updateDetailLine(index, 'descripcion', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Cantidad</label>
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.cantidad}
                          onChange={(e) => updateDetailLine(index, 'cantidad', parseFloat(e.target.value))}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Precio (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.precio_unitario}
                          onChange={(e) => updateDetailLine(index, 'precio_unitario', parseFloat(e.target.value))}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">IVA (%)</label>
                        <input
                          type="number"
                          step="1"
                          value={detalle.tipo_iva}
                          onChange={(e) => updateDetailLine(index, 'tipo_iva', parseFloat(e.target.value))}
                          className="w-full border rounded px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      {formData.detalles.length > 1 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => removeDetailLine(index)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-right">
                  <span className="text-lg font-semibold">Total Estimado: {calculateTotal().toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  Crear Factura (con XMLs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const customer = customers.find(c => c._id?.toString() === invoice.id_cliente.toString());
                return (
                  <tr key={invoice._id?.toString()} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono">{invoice.numero_factura}</td>
                    <td className="px-6 py-4">{customer?.nombre_razon_social || 'N/A'}</td>
                    <td className="px-6 py-4">{new Date(invoice.fecha_emision).toLocaleDateString('es-ES')}</td>
                    <td className="px-6 py-4 font-semibold">{invoice.total_factura.toFixed(2)} €</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.estado === 'Pagada' ? 'bg-green-100 text-green-800' :
                        invoice.estado === 'Vencida' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => viewXML(invoice, 'facturae')}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        📄 Facturae
                      </button>
                      <button
                        onClick={() => viewXML(invoice, 'verifactu')}
                        className="text-green-600 hover:underline text-sm"
                      >
                        ✅ Verifactu
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id?.toString() || '')}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay facturas. Crea la primera.
            </div>
          )}
        </div>
      </div>

      {showXML && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                XML {showXML.type === 'facturae' ? 'Facturae' : 'Verifactu'}
              </h3>
              <button
                onClick={() => setShowXML(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                <code>{showXML.content}</code>
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  const invoice = invoices.find(inv =>
                    (showXML.type === 'facturae' ? inv.facturae_xml : inv.verifactu_xml) === showXML.content
                  );
                  if (invoice) downloadXML(invoice, showXML.type);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Descargar XML
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
