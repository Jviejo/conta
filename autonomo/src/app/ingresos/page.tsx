'use client';

import { useState, useEffect } from 'react';
import { Ingreso } from '@/types';
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react';

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ingresoEditar, setIngresoEditar] = useState<Ingreso | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await fetch('/api/ingresos');
      if (response.ok) setIngresos(await response.json());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const datos = {
      fechaCobro: new Date(formData.get('fechaCobro') as string),
      concepto: formData.get('concepto'),
      importe: parseFloat(formData.get('importe') as string),
      medioPago: formData.get('medioPago'),
      clienteOrigen: formData.get('clienteOrigen') || '',
      clienteNif: formData.get('clienteNif') || '',
      numeroFactura: formData.get('numeroFactura') || '',
      notas: formData.get('notas') || '',
    };

    try {
      const url = ingresoEditar ? `/api/ingresos/${ingresoEditar._id}` : '/api/ingresos';
      const method = ingresoEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        await cargarDatos();
        setMostrarFormulario(false);
        setIngresoEditar(undefined);
      }
    } catch (error) {
      console.error('Error al guardar ingreso:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este ingreso?')) return;

    try {
      const response = await fetch(`/api/ingresos/${id}`, { method: 'DELETE' });
      if (response.ok) await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const ingresosFiltrados = ingresos.filter(i =>
    i.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
    (i.clienteOrigen && i.clienteOrigen.toLowerCase().includes(busqueda.toLowerCase())) ||
    (i.clienteNif && i.clienteNif.toLowerCase().includes(busqueda.toLowerCase())) ||
    (i.numeroFactura && i.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const totalIngresos = ingresos.reduce((sum, i) => sum + i.importe, 0);
  const ingresosPorEfectivo = ingresos.filter(i => i.medioPago === 'efectivo').reduce((sum, i) => sum + i.importe, 0);
  const ingresosPorTransferencia = ingresos.filter(i => i.medioPago === 'transferencia').reduce((sum, i) => sum + i.importe, 0);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Libro de Ingresos</h1>
            <p className="mt-2 text-gray-600">Registro de ingresos - AEAT</p>
          </div>
          <button
            onClick={() => { setIngresoEditar(undefined); setMostrarFormulario(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Nuevo Ingreso
          </button>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalIngresos.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efectivo</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{ingresosPorEfectivo.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transferencia</p>
                <p className="mt-2 text-2xl font-bold text-purple-600">{ingresosPorTransferencia.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por concepto, cliente, NIF o número de factura..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {cargando ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">Cargando ingresos...</p>
          </div>
        ) : ingresosFiltrados.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">No hay ingresos registrados</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Concepto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Importe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medio de Pago</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente/Origen</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ingresosFiltrados.map((ingreso) => (
                  <tr key={ingreso._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ingreso.fechaCobro).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{ingreso.concepto}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ingreso.importe.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ingreso.medioPago === 'efectivo' ? 'bg-green-100 text-green-800' :
                        ingreso.medioPago === 'transferencia' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {ingreso.medioPago.charAt(0).toUpperCase() + ingreso.medioPago.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ingreso.clienteOrigen || '-'}
                      {ingreso.clienteNif && <span className="text-gray-500"> ({ingreso.clienteNif})</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setIngresoEditar(ingreso); setMostrarFormulario(true); }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(ingreso._id!)}
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
                {ingresoEditar ? 'Editar' : 'Nuevo'} Ingreso
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha Cobro *</label>
                    <input type="date" name="fechaCobro"
                      defaultValue={ingresoEditar?.fechaCobro ? new Date(ingresoEditar.fechaCobro).toISOString().split('T')[0] : ''}
                      required className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Importe *</label>
                    <input type="number" name="importe" step="0.01" defaultValue={ingresoEditar?.importe} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Concepto *</label>
                    <textarea name="concepto" defaultValue={ingresoEditar?.concepto} rows={2} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Medio de Pago *</label>
                    <select name="medioPago" defaultValue={ingresoEditar?.medioPago || 'transferencia'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Número Factura</label>
                    <input type="text" name="numeroFactura" defaultValue={ingresoEditar?.numeroFactura}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Cliente/Origen</label>
                    <input type="text" name="clienteOrigen" defaultValue={ingresoEditar?.clienteOrigen}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">NIF Cliente</label>
                    <input type="text" name="clienteNif" defaultValue={ingresoEditar?.clienteNif}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
                    <textarea name="notas" defaultValue={ingresoEditar?.notas} rows={2}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => { setMostrarFormulario(false); setIngresoEditar(undefined); }}
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
