'use client';

import { useState, useEffect } from 'react';
import { BienInversion } from '@/types';
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react';

export default function BienesInversionPage() {
  const [bienes, setBienes] = useState<BienInversion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [bienEditar, setBienEditar] = useState<BienInversion | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await fetch('/api/bienes-inversion');
      if (response.ok) setBienes(await response.json());
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
      fechaAdquisicion: new Date(formData.get('fechaAdquisicion') as string),
      descripcion: formData.get('descripcion'),
      proveedor: formData.get('proveedor'),
      proveedorNif: formData.get('proveedorNif'),
      importeAdquisicion: parseFloat(formData.get('importeAdquisicion') as string),
      ivaSoportado: parseFloat(formData.get('ivaSoportado') as string),
      tipoAmortizacion: formData.get('tipoAmortizacion'),
      porcentajeAmortizacion: parseFloat(formData.get('porcentajeAmortizacion') as string),
      vidaUtil: parseInt(formData.get('vidaUtil') as string),
      valorResidual: parseFloat(formData.get('valorResidual') as string),
      amortizacionAcumulada: parseFloat(formData.get('amortizacionAcumulada') as string),
      estado: formData.get('estado'),
      categoria: formData.get('categoria'),
      numeroFactura: formData.get('numeroFactura') || '',
      notas: formData.get('notas') || '',
    };

    try {
      const url = bienEditar ? `/api/bienes-inversion/${bienEditar._id}` : '/api/bienes-inversion';
      const method = bienEditar ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        await cargarDatos();
        setMostrarFormulario(false);
        setBienEditar(undefined);
      }
    } catch (error) {
      console.error('Error al guardar bien:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este bien de inversión?')) return;

    try {
      const response = await fetch(`/api/bienes-inversion/${id}`, { method: 'DELETE' });
      if (response.ok) await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const bienesFiltrados = bienes.filter(b =>
    b.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    b.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    b.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    b.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalInversion = bienes.reduce((sum, b) => sum + b.importeAdquisicion, 0);
  const totalIvaSoportado = bienes.reduce((sum, b) => sum + b.ivaSoportado, 0);
  const totalAmortizacionAcumulada = bienes.reduce((sum, b) => sum + b.amortizacionAcumulada, 0);
  const bienesActivos = bienes.filter(b => b.estado === 'activo').length;

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bienes de Inversión</h1>
            <p className="mt-2 text-gray-600">Libro de bienes de inversión y amortizaciones - AEAT</p>
          </div>
          <button
            onClick={() => { setBienEditar(undefined); setMostrarFormulario(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Nuevo Bien de Inversión
          </button>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inversión</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalInversion.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">IVA Soportado</p>
                <p className="mt-2 text-2xl font-bold text-purple-600">{totalIvaSoportado.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amortización</p>
                <p className="mt-2 text-2xl font-bold text-orange-600">{totalAmortizacionAcumulada.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bienes Activos</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{bienesActivos}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por descripción, proveedor, categoría o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {cargando ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">Cargando bienes de inversión...</p>
          </div>
        ) : bienesFiltrados.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">No hay bienes de inversión registrados</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Importe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IVA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amortización</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bienesFiltrados.map((bien) => (
                  <tr key={bien._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bien.fechaAdquisicion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{bien.descripcion}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        bien.categoria === 'inmueble' ? 'bg-blue-100 text-blue-800' :
                        bien.categoria === 'vehiculo' ? 'bg-purple-100 text-purple-800' :
                        bien.categoria === 'maquinaria' ? 'bg-green-100 text-green-800' :
                        bien.categoria === 'equipos_informaticos' ? 'bg-cyan-100 text-cyan-800' :
                        bien.categoria === 'mobiliario' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bien.categoria.replace('_', ' ').charAt(0).toUpperCase() + bien.categoria.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{bien.importeAdquisicion.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bien.ivaSoportado.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{bien.amortizacionAcumulada.toFixed(2)}€</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        bien.estado === 'activo' ? 'bg-green-100 text-green-800' :
                        bien.estado === 'vendido' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bien.estado.replace('_', ' ').charAt(0).toUpperCase() + bien.estado.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setBienEditar(bien); setMostrarFormulario(true); }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(bien._id!)}
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
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {bienEditar ? 'Editar' : 'Nuevo'} Bien de Inversión
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fecha Adquisición *</label>
                    <input type="date" name="fechaAdquisicion"
                      defaultValue={bienEditar?.fechaAdquisicion ? new Date(bienEditar.fechaAdquisicion).toISOString().split('T')[0] : ''}
                      required className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Categoría *</label>
                    <select name="categoria" defaultValue={bienEditar?.categoria || 'otros'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="inmueble">Inmueble</option>
                      <option value="vehiculo">Vehículo</option>
                      <option value="maquinaria">Maquinaria</option>
                      <option value="equipos_informaticos">Equipos Informáticos</option>
                      <option value="mobiliario">Mobiliario</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Descripción *</label>
                    <textarea name="descripcion" defaultValue={bienEditar?.descripcion} rows={2} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Proveedor *</label>
                    <input type="text" name="proveedor" defaultValue={bienEditar?.proveedor} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">NIF Proveedor *</label>
                    <input type="text" name="proveedorNif" defaultValue={bienEditar?.proveedorNif} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Importe Adquisición *</label>
                    <input type="number" name="importeAdquisicion" step="0.01" defaultValue={bienEditar?.importeAdquisicion} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">IVA Soportado *</label>
                    <input type="number" name="ivaSoportado" step="0.01" defaultValue={bienEditar?.ivaSoportado} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipo Amortización *</label>
                    <select name="tipoAmortizacion" defaultValue={bienEditar?.tipoAmortizacion || 'lineal'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="lineal">Lineal</option>
                      <option value="degresiva">Degresiva</option>
                      <option value="acelerada">Acelerada</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">% Amortización Anual *</label>
                    <input type="number" name="porcentajeAmortizacion" step="0.01" defaultValue={bienEditar?.porcentajeAmortizacion} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Vida Útil (años) *</label>
                    <input type="number" name="vidaUtil" defaultValue={bienEditar?.vidaUtil} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Valor Residual *</label>
                    <input type="number" name="valorResidual" step="0.01" defaultValue={bienEditar?.valorResidual} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Amortización Acumulada *</label>
                    <input type="number" name="amortizacionAcumulada" step="0.01" defaultValue={bienEditar?.amortizacionAcumulada || 0} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Estado *</label>
                    <select name="estado" defaultValue={bienEditar?.estado || 'activo'} required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="activo">Activo</option>
                      <option value="vendido">Vendido</option>
                      <option value="dado_de_baja">Dado de Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Número Factura</label>
                    <input type="text" name="numeroFactura" defaultValue={bienEditar?.numeroFactura}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
                    <textarea name="notas" defaultValue={bienEditar?.notas} rows={2}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => { setMostrarFormulario(false); setBienEditar(undefined); }}
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
