'use client';

import { useState, useEffect } from 'react';
import { Gasto } from '@/types';
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react';

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<Gasto | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await fetch('/api/gastos');
      if (response.ok) setGastos(await response.json());
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
      fechaPago: new Date(formData.get('fechaPago') as string),
      concepto: formData.get('concepto'),
      importe: parseFloat(formData.get('importe') as string),
      ivaDeducible: parseFloat(formData.get('ivaDeducible') as string),
      proveedor: formData.get('proveedor') || '',
      proveedorNif: formData.get('proveedorNif') || '',
      clasificacion: formData.get('clasificacion'),
      medioPago: formData.get('medioPago'),
      numeroFactura: formData.get('numeroFactura') || '',
      notas: formData.get('notas') || '',
    };

    try {
      const url = gastoEditar ? `/api/gastos/${gastoEditar._id}` : '/api/gastos';
      const method = gastoEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        await cargarDatos();
        setMostrarFormulario(false);
        setGastoEditar(undefined);
      }
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      const response = await fetch(`/api/gastos/${id}`, { method: 'DELETE' });
      if (response.ok) await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const gastosFiltrados = gastos.filter(g =>
    g.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
    (g.proveedor && g.proveedor.toLowerCase().includes(busqueda.toLowerCase())) ||
    (g.proveedorNif && g.proveedorNif.toLowerCase().includes(busqueda.toLowerCase())) ||
    g.clasificacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalGastos = gastos.reduce((sum, g) => sum + g.importe, 0);
  const totalIvaDeducible = gastos.reduce((sum, g) => sum + g.ivaDeducible, 0);
  const gastosPorClasificacion = gastos.reduce((acc, g) => {
    acc[g.clasificacion] = (acc[g.clasificacion] || 0) + g.importe;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Libro de Gastos</h1>
            <p className="mt-2 text-gray-600">Registro de gastos deducibles - AEAT</p>
          </div>
          <button
            onClick={() => { setGastoEditar(undefined); setMostrarFormulario(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Nuevo Gasto
          </button>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalGastos.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">IVA Deducible</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{totalIvaDeducible.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Número de Gastos</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{gastos.length}</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por concepto, proveedor, NIF o clasificación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {cargando ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">Cargando gastos...</p>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">No hay gastos registrados</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Concepto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Clasificación</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Importe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IVA Deducible</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Proveedor</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(gasto.fechaPago).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{gasto.concepto}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        gasto.clasificacion === 'suministros' ? 'bg-blue-100 text-blue-800' :
                        gasto.clasificacion === 'material' ? 'bg-purple-100 text-purple-800' :
                        gasto.clasificacion === 'servicios' ? 'bg-green-100 text-green-800' :
                        gasto.clasificacion === 'dietas' ? 'bg-yellow-100 text-yellow-800' :
                        gasto.clasificacion === 'transporte' ? 'bg-orange-100 text-orange-800' :
                        gasto.clasificacion === 'alquiler' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gasto.clasificacion.charAt(0).toUpperCase() + gasto.clasificacion.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{gasto.importe.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">{gasto.ivaDeducible.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {gasto.proveedor || '-'}
                      {gasto.proveedorNif && <span className="text-gray-500"> ({gasto.proveedorNif})</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setGastoEditar(gasto); setMostrarFormulario(true); }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(gasto._id!)}
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
                {gastoEditar ? 'Editar' : 'Nuevo'} Gasto
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha Pago *</label>
                    <input type="date" name="fechaPago"
                      defaultValue={gastoEditar?.fechaPago ? new Date(gastoEditar.fechaPago).toISOString().split('T')[0] : ''}
                      required className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Clasificación *</label>
                    <select name="clasificacion" defaultValue={gastoEditar?.clasificacion || 'otros'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="suministros">Suministros</option>
                      <option value="material">Material</option>
                      <option value="servicios">Servicios</option>
                      <option value="dietas">Dietas</option>
                      <option value="transporte">Transporte</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Concepto *</label>
                    <textarea name="concepto" defaultValue={gastoEditar?.concepto} rows={2} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Importe *</label>
                    <input type="number" name="importe" step="0.01" defaultValue={gastoEditar?.importe} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">IVA Deducible *</label>
                    <input type="number" name="ivaDeducible" step="0.01" defaultValue={gastoEditar?.ivaDeducible} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Medio de Pago *</label>
                    <select name="medioPago" defaultValue={gastoEditar?.medioPago || 'transferencia'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Número Factura</label>
                    <input type="text" name="numeroFactura" defaultValue={gastoEditar?.numeroFactura}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Proveedor</label>
                    <input type="text" name="proveedor" defaultValue={gastoEditar?.proveedor}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">NIF Proveedor</label>
                    <input type="text" name="proveedorNif" defaultValue={gastoEditar?.proveedorNif}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
                    <textarea name="notas" defaultValue={gastoEditar?.notas} rows={2}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => { setMostrarFormulario(false); setGastoEditar(undefined); }}
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
