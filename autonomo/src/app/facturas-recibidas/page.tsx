'use client';

import { useState, useEffect } from 'react';
import { FacturaRecibida } from '@/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function FacturasRecibidasPage() {
  const [facturas, setFacturas] = useState<FacturaRecibida[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaEditar, setFacturaEditar] = useState<FacturaRecibida | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [proveedores, setProveedores] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [facturasRes, proveedoresRes] = await Promise.all([
      fetch('/api/facturas-recibidas'),
      fetch('/api/proveedores')
    ]);
    if (facturasRes.ok) setFacturas(await facturasRes.json());
    if (proveedoresRes.ok) setProveedores(await proveedoresRes.json());
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const baseImponible = parseFloat(formData.get('baseImponible') as string);
    const tipoIva = parseFloat(formData.get('tipoIva') as string);
    const cuotaIvaDeducible = (baseImponible * tipoIva) / 100;
    const proveedorSeleccionado = proveedores.find(p => p._id === formData.get('proveedorId'));

    const datos = {
      numeroFactura: formData.get('numeroFactura'),
      fechaRecepcion: new Date(formData.get('fechaRecepcion') as string),
      proveedorId: formData.get('proveedorId'),
      proveedorNombre: proveedorSeleccionado?.nombre || '',
      proveedorNif: proveedorSeleccionado?.nif || '',
      baseImponible,
      tipoIva,
      cuotaIvaDeducible,
      totalFactura: baseImponible + cuotaIvaDeducible,
      conceptoGasto: formData.get('conceptoGasto'),
      categoriaGasto: formData.get('categoriaGasto'),
      formaPago: formData.get('formaPago'),
      estado: formData.get('estado'),
      notas: formData.get('notas') || '',
    };

    const url = facturaEditar ? `/api/facturas-recibidas/${facturaEditar._id}` : '/api/facturas-recibidas';
    const response = await fetch(url, {
      method: facturaEditar ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (response.ok) {
      await cargarDatos();
      setMostrarFormulario(false);
      setFacturaEditar(undefined);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    const response = await fetch(`/api/facturas-recibidas/${id}`, { method: 'DELETE' });
    if (response.ok) await cargarDatos();
  };

  const facturasFiltradas = facturas.filter(f =>
    f.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.proveedorNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Facturas Recibidas</h1>
          <button onClick={() => { setFacturaEditar(undefined); setMostrarFormulario(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            <Plus className="h-5 w-5" />Nueva Factura
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Número</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Base</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">IVA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facturasFiltradas.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{f.numeroFactura}</td>
                  <td className="px-6 py-4 text-sm">{new Date(f.fechaRecepcion).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4 text-sm">{f.proveedorNombre}</td>
                  <td className="px-6 py-4 text-sm">{f.categoriaGasto}</td>
                  <td className="px-6 py-4 text-sm">{f.baseImponible.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-sm">{f.cuotaIvaDeducible.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-sm font-semibold">{f.totalFactura.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      f.estado === 'pagada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {f.estado.charAt(0).toUpperCase() + f.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setFacturaEditar(f); setMostrarFormulario(true); }}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleEliminar(f._id!)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
              <h2 className="mb-6 text-2xl font-bold">{facturaEditar ? 'Editar' : 'Nueva'} Factura Recibida</h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Número Factura *</label>
                    <input type="text" name="numeroFactura" defaultValue={facturaEditar?.numeroFactura} required
                      className="w-full rounded-lg border px-4 py-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Fecha Recepción *</label>
                    <input type="date" name="fechaRecepcion"
                      defaultValue={facturaEditar?.fechaRecepcion ? new Date(facturaEditar.fechaRecepcion).toISOString().split('T')[0] : ''}
                      required className="w-full rounded-lg border px-4 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Proveedor *</label>
                    <select name="proveedorId" defaultValue={facturaEditar?.proveedorId} required
                      className="w-full rounded-lg border px-4 py-2">
                      <option value="">Seleccione un proveedor</option>
                      {proveedores.map(p => <option key={p._id} value={p._id}>{p.nombre} - {p.nif}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Base Imponible *</label>
                    <input type="number" name="baseImponible" step="0.01" defaultValue={facturaEditar?.baseImponible} required
                      className="w-full rounded-lg border px-4 py-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tipo IVA (%) *</label>
                    <select name="tipoIva" defaultValue={facturaEditar?.tipoIva || 21} required
                      className="w-full rounded-lg border px-4 py-2">
                      <option value="21">21%</option>
                      <option value="10">10%</option>
                      <option value="4">4%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Categoría Gasto *</label>
                    <select name="categoriaGasto" defaultValue={facturaEditar?.categoriaGasto || 'otros'} required
                      className="w-full rounded-lg border px-4 py-2">
                      <option value="suministros">Suministros</option>
                      <option value="material">Material</option>
                      <option value="servicios">Servicios</option>
                      <option value="dietas">Dietas</option>
                      <option value="transporte">Transporte</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Forma de Pago *</label>
                    <select name="formaPago" defaultValue={facturaEditar?.formaPago || 'transferencia'} required
                      className="w-full rounded-lg border px-4 py-2">
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="pagare">Pagaré</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Estado *</label>
                    <select name="estado" defaultValue={facturaEditar?.estado || 'pendiente'} required
                      className="w-full rounded-lg border px-4 py-2">
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Concepto *</label>
                    <textarea name="conceptoGasto" defaultValue={facturaEditar?.conceptoGasto} rows={2} required
                      className="w-full rounded-lg border px-4 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Notas</label>
                    <textarea name="notas" defaultValue={facturaEditar?.notas} rows={2}
                      className="w-full rounded-lg border px-4 py-2" />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => { setMostrarFormulario(false); setFacturaEditar(undefined); }}
                    className="rounded-lg border px-6 py-2 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                    Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
