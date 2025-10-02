'use client';

import { useState, useEffect } from 'react';
import { ClienteProveedor } from '@/types';
import FormularioClienteProveedor from '@/components/FormularioClienteProveedor';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<ClienteProveedor[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<ClienteProveedor | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (datos: Partial<ClienteProveedor>) => {
    try {
      if (proveedorEditar) {
        // Actualizar
        const response = await fetch(`/api/proveedores/${proveedorEditar._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        });

        if (response.ok) {
          await cargarProveedores();
          setMostrarFormulario(false);
          setProveedorEditar(undefined);
        }
      } else {
        // Crear nuevo
        const response = await fetch('/api/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos),
        });

        if (response.ok) {
          await cargarProveedores();
          setMostrarFormulario(false);
        }
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await cargarProveedores();
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  const handleEditar = (proveedor: ClienteProveedor) => {
    setProveedorEditar(proveedor);
    setMostrarFormulario(true);
  };

  const handleNuevo = () => {
    setProveedorEditar(undefined);
    setMostrarFormulario(true);
  };

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.nif.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.razonSocial.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      bloqueado: 'bg-red-100 text-red-800',
    };
    return colores[estado as keyof typeof colores] || colores.activo;
  };

  const getValoracionBadge = (valoracion: string) => {
    const colores = {
      A: 'bg-blue-100 text-blue-800',
      B: 'bg-yellow-100 text-yellow-800',
      C: 'bg-gray-100 text-gray-800',
    };
    return colores[valoracion as keyof typeof colores] || colores.B;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
            <p className="mt-2 text-gray-600">
              Gestión de proveedores y datos AEAT
            </p>
          </div>
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Nuevo Proveedor
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, NIF o razón social..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {cargando ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">Cargando proveedores...</p>
          </div>
        ) : proveedoresFiltrados.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-gray-600">
              {busqueda
                ? 'No se encontraron proveedores con ese criterio'
                : 'No hay proveedores registrados. Crea el primero.'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      NIF
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Razón Social
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Teléfono
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Valoración
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proveedoresFiltrados.map((proveedor) => (
                    <tr key={proveedor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {proveedor.nif}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {proveedor.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {proveedor.razonSocial}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {proveedor.telefono}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {proveedor.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getEstadoBadge(
                            proveedor.estado
                          )}`}
                        >
                          {proveedor.estado.charAt(0).toUpperCase() +
                            proveedor.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getValoracionBadge(
                            proveedor.valoracion
                          )}`}
                        >
                          {proveedor.valoracion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditar(proveedor)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(proveedor._id!)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Eliminar"
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
          </div>
        )}

        {mostrarFormulario && (
          <FormularioClienteProveedor
            tipo="proveedor"
            datosIniciales={proveedorEditar}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setMostrarFormulario(false);
              setProveedorEditar(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
