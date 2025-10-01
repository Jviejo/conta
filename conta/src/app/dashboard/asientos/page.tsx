'use client';

import { useState, useEffect } from 'react';
import { Asiento, Apunte, Concepto, Ejercicio, Subconta } from '@/types';

type AsientoWithApuntes = Asiento & { apuntes?: Apunte[] };

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<AsientoWithApuntes[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAsiento, setSelectedAsiento] = useState<AsientoWithApuntes | null>(null);

  const [asientoData, setAsientoData] = useState({
    id: 0,
    year: new Date().getFullYear(),
    subconta: '',
    idAsiento: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const [apuntes, setApuntes] = useState<Partial<Apunte>[]>([]);

  useEffect(() => {
    fetchAsientos();
    fetchConceptos();
    fetchEjercicios();
    fetchSubcontas();
  }, []);

  const fetchAsientos = async () => {
    const res = await fetch('/api/asientos');
    const data = await res.json();
    setAsientos(data);
  };

  const fetchConceptos = async () => {
    const res = await fetch('/api/conceptos');
    const data = await res.json();
    setConceptos(data);
  };

  const fetchEjercicios = async () => {
    const res = await fetch('/api/ejercicios');
    const data = await res.json();
    setEjercicios(data);
  };

  const fetchSubcontas = async () => {
    const res = await fetch('/api/subcontas');
    const data = await res.json();
    setSubcontas(data);
  };

  const addApunte = () => {
    setApuntes([
      ...apuntes,
      {
        id: Date.now(),
        year: asientoData.year,
        subconta: asientoData.subconta,
        idAsiento: asientoData.idAsiento,
        idApunte: apuntes.length + 1,
        idCuentaDebe: 0,
        idCuentaHaber: 0,
        debe: 0,
        haber: 0,
        idConcepto: 0,
        descripcion: '',
      },
    ]);
  };

  const updateApunte = (index: number, field: keyof Apunte, value: any) => {
    const newApuntes = [...apuntes];
    newApuntes[index] = { ...newApuntes[index], [field]: value };
    setApuntes(newApuntes);
  };

  const removeApunte = (index: number) => {
    setApuntes(apuntes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...asientoData,
      date: new Date(asientoData.date),
      apuntes,
    };

    if (editingId) {
      await fetch(`/api/asientos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asientoData),
      });
    } else {
      await fetch('/api/asientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchAsientos();
  };

  const resetForm = () => {
    setAsientoData({
      id: 0,
      year: new Date().getFullYear(),
      subconta: '',
      idAsiento: 0,
      date: new Date().toISOString().split('T')[0],
    });
    setApuntes([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (asiento: AsientoWithApuntes) => {
    setAsientoData({
      id: asiento.id,
      year: asiento.year,
      subconta: asiento.subconta,
      idAsiento: asiento.idAsiento,
      date: new Date(asiento.date).toISOString().split('T')[0],
    });
    setEditingId(asiento._id?.toString() || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este asiento y sus apuntes?')) {
      await fetch(`/api/asientos/${id}`, { method: 'DELETE' });
      fetchAsientos();
    }
  };

  const viewApuntes = (asiento: AsientoWithApuntes) => {
    setSelectedAsiento(asiento);
  };

  const calculateBalance = (apuntes?: Apunte[]) => {
    if (!apuntes) return { debe: 0, haber: 0, balance: 0 };
    const debe = apuntes.reduce((sum, a) => sum + a.debe, 0);
    const haber = apuntes.reduce((sum, a) => sum + a.haber, 0);
    return { debe, haber, balance: debe - haber };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Asientos Contables
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          + Nuevo Asiento
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Editar Asiento' : 'Nuevo Asiento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID
                </label>
                <input
                  type="number"
                  value={asientoData.id}
                  onChange={(e) =>
                    setAsientoData({ ...asientoData, id: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                <select
                  value={asientoData.year}
                  onChange={(e) =>
                    setAsientoData({ ...asientoData, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar año</option>
                  {ejercicios.map((ejercicio) => (
                    <option key={ejercicio._id?.toString()} value={ejercicio.year}>
                      {ejercicio.year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subconta
                </label>
                <select
                  value={asientoData.subconta}
                  onChange={(e) => setAsientoData({ ...asientoData, subconta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar subconta</option>
                  {subcontas.map((subconta) => (
                    <option key={subconta._id?.toString()} value={subconta.id}>
                      {subconta.id} - {subconta.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Asiento
                </label>
                <input
                  type="number"
                  value={asientoData.idAsiento}
                  onChange={(e) =>
                    setAsientoData({ ...asientoData, idAsiento: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={asientoData.date}
                  onChange={(e) => setAsientoData({ ...asientoData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {!editingId && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Apuntes
                    </h3>
                    <button
                      type="button"
                      onClick={addApunte}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      + Añadir Apunte
                    </button>
                  </div>

                  {apuntes.map((apunte, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-2 mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <input
                        type="number"
                        placeholder="Cta. Debe"
                        value={apunte.idCuentaDebe || ''}
                        onChange={(e) =>
                          updateApunte(index, 'idCuentaDebe', parseInt(e.target.value))
                        }
                        className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Cta. Haber"
                        value={apunte.idCuentaHaber || ''}
                        onChange={(e) =>
                          updateApunte(index, 'idCuentaHaber', parseInt(e.target.value))
                        }
                        className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Debe"
                        value={apunte.debe || ''}
                        onChange={(e) => updateApunte(index, 'debe', parseFloat(e.target.value))}
                        className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Haber"
                        value={apunte.haber || ''}
                        onChange={(e) => updateApunte(index, 'haber', parseFloat(e.target.value))}
                        className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Descripción"
                        value={apunte.descripcion || ''}
                        onChange={(e) => updateApunte(index, 'descripcion', e.target.value)}
                        className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeApunte(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Año
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Subconta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Apuntes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {asientos.map((asiento) => (
              <tr key={asiento._id?.toString()}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {asiento.idAsiento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(asiento.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {asiento.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {asiento.subconta}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <button
                    onClick={() => viewApuntes(asiento)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  >
                    Ver {asiento.apuntes?.length || 0} apuntes
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(asiento)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(asiento._id?.toString() || '')}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {asientos.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No hay asientos registrados
          </div>
        )}
      </div>

      {selectedAsiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Apuntes del Asiento {selectedAsiento.idAsiento}
              </h2>
              <button
                onClick={() => setSelectedAsiento(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Fecha:</strong> {new Date(selectedAsiento.date).toLocaleDateString()} |{' '}
                <strong>Año:</strong> {selectedAsiento.year} | <strong>Subconta:</strong>{' '}
                {selectedAsiento.subconta}
              </p>
            </div>

            <table className="w-full mb-4">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cta. Debe
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cta. Haber
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Debe
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Haber
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedAsiento.apuntes?.map((apunte) => (
                  <tr key={apunte._id?.toString()}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {apunte.idCuentaDebe}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {apunte.idCuentaHaber}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                      {apunte.debe.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                      {apunte.haber.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {apunte.descripcion}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    TOTALES
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                    {calculateBalance(selectedAsiento.apuntes).debe.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                    {calculateBalance(selectedAsiento.apuntes).haber.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    Balance: {calculateBalance(selectedAsiento.apuntes).balance.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button
              onClick={() => setSelectedAsiento(null)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}