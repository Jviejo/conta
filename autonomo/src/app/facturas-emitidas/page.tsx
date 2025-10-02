'use client';

import { useState, useEffect } from 'react';
import { FacturaEmitida, ClienteProveedor } from '@/types';
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react';

export default function FacturasEmitidasPage() {
  const [facturas, setFacturas] = useState<FacturaEmitida[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaEditar, setFacturaEditar] = useState<FacturaEmitida | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [clientes, setClientes] = useState<ClienteProveedor[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [facturasRes, clientesRes] = await Promise.all([
        fetch('/api/facturas-emitidas'),
        fetch('/api/clientes')
      ]);

      if (facturasRes.ok) setFacturas(await facturasRes.json());
      if (clientesRes.ok) setClientes(await clientesRes.json());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseImponible = parseFloat(formData.get('baseImponible') as string);
    const tipoIva = parseFloat(formData.get('tipoIva') as string);
    const cuotaIva = (baseImponible * tipoIva) / 100;
    const totalFactura = baseImponible + cuotaIva;

    const clienteSeleccionado = clientes.find(c => c._id === formData.get('clienteId'));

    const datos = {
      numeroFactura: formData.get('numeroFactura'),
      fechaEmision: new Date(formData.get('fechaEmision') as string),
      clienteId: formData.get('clienteId'),
      clienteNombre: clienteSeleccionado?.nombre || '',
      clienteNif: clienteSeleccionado?.nif || '',
      baseImponible,
      tipoIva,
      cuotaIva,
      totalFactura,
      tipoOperacion: formData.get('tipoOperacion'),
      concepto: formData.get('concepto'),
      formaPago: formData.get('formaPago'),
      estado: formData.get('estado'),
      notas: formData.get('notas') || '',
    };

    try {
      const url = facturaEditar ? `/api/facturas-emitidas/${facturaEditar._id}` : '/api/facturas-emitidas';
      const method = facturaEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        await cargarDatos();
        setMostrarFormulario(false);
        setFacturaEditar(undefined);
      }
    } catch (error) {
      console.error('Error al guardar factura:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta factura?')) return;

    try {
      const response = await fetch(`/api/facturas-emitidas/${id}`, { method: 'DELETE' });
      if (response.ok) await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const facturasFiltradas = facturas.filter(f =>
    f.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.clienteNif.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalFacturado = facturas.reduce((sum, f) => sum + f.totalFactura, 0);
  const totalCobrado = facturas.filter(f => f.estado === 'cobrada').reduce((sum, f) => sum + f.totalFactura, 0);
  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + f.totalFactura, 0);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturas Emitidas</h1>
            <p className="mt-2 text-gray-600">Libro de facturas emitidas - AEAT</p>
          </div>
          <button
            onClick={() => { setFacturaEditar(undefined); setMostrarFormulario(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Nueva Factura
          </button>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalFacturado.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobrado</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{totalCobrado.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendiente</p>
                <p className="mt-2 text-2xl font-bold text-orange-600">{totalPendiente.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o NIF..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {cargando ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">No hay facturas registradas</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Número</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Base</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IVA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facturasFiltradas.map((factura) => (
                  <tr key={factura._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{factura.numeroFactura}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(factura.fechaEmision).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{factura.clienteNombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{factura.baseImponible.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{factura.cuotaIva.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{factura.totalFactura.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        factura.estado === 'cobrada' ? 'bg-green-100 text-green-800' :
                        factura.estado === 'vencida' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setFacturaEditar(factura); setMostrarFormulario(true); }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(factura._id!)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {facturaEditar ? 'Editar' : 'Nueva'} Factura Emitida
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Número Factura *</label>
                    <input type="text" name="numeroFactura" defaultValue={facturaEditar?.numeroFactura} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha Emisión *</label>
                    <input type="date" name="fechaEmision"
                      defaultValue={facturaEditar?.fechaEmision ? new Date(facturaEditar.fechaEmision).toISOString().split('T')[0] : ''}
                      required className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Cliente *</label>
                    <select name="clienteId" defaultValue={facturaEditar?.clienteId} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="">Seleccione un cliente</option>
                      {clientes.map(c => (
                        <option key={c._id} value={c._id}>{c.nombre} - {c.nif}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Base Imponible *</label>
                    <input type="number" name="baseImponible" step="0.01" defaultValue={facturaEditar?.baseImponible} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipo IVA (%) *</label>
                    <select name="tipoIva" defaultValue={facturaEditar?.tipoIva || 21} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="21">21%</option>
                      <option value="10">10%</option>
                      <option value="4">4%</option>
                      <option value="0">0% (Exento)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipo Operación *</label>
                    <select name="tipoOperacion" defaultValue={facturaEditar?.tipoOperacion || 'nacional'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="nacional">Nacional</option>
                      <option value="intracomunitaria">Intracomunitaria</option>
                      <option value="exportacion">Exportación</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Forma de Pago *</label>
                    <select name="formaPago" defaultValue={facturaEditar?.formaPago || 'transferencia'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="pagare">Pagaré</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Estado *</label>
                    <select name="estado" defaultValue={facturaEditar?.estado || 'pendiente'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="pendiente">Pendiente</option>
                      <option value="cobrada">Cobrada</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Concepto *</label>
                    <textarea name="concepto" defaultValue={facturaEditar?.concepto} rows={2} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
                    <textarea name="notas" defaultValue={facturaEditar?.notas} rows={2}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => { setMostrarFormulario(false); setFacturaEditar(undefined); }}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
