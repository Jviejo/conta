'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Asiento, Apunte, Ejercicio, Subconta } from '@/types';

interface AsientoConApuntes extends Asiento {
  apuntes: Apunte[];
}

function AsientosListaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [asientos, setAsientos] = useState<AsientoConApuntes[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [loading, setLoading] = useState(false);
  const [cuentasCache, setCuentasCache] = useState<Map<number, string>>(new Map());

  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    subconta: '',
    idAsientoDesde: '',
  });

  useEffect(() => {
    const initData = async () => {
      await fetchEjercicios();
      const subcontasData = await fetchSubcontas();

      // Leer parámetros de URL
      const yearParam = searchParams.get('year');
      const subcontaParam = searchParams.get('subconta');
      const idAsientoDesdeParam = searchParams.get('idAsientoDesde');

      const newFiltros = {
        year: yearParam ? parseInt(yearParam) : new Date().getFullYear(),
        subconta: subcontaParam || (subcontasData.length > 0 ? subcontasData[0].id : '1'),
        idAsientoDesde: idAsientoDesdeParam || '',
      };

      setFiltros(newFiltros);
      await handleSearchWithParams(newFiltros);
    };

    initData();
  }, []);

  const fetchEjercicios = async () => {
    const res = await fetch('/api/ejercicios');
    const data = await res.json();
    setEjercicios(data);
  };

  const fetchSubcontas = async () => {
    const res = await fetch('/api/subcontas');
    const data = await res.json();
    setSubcontas(data);
    return data;
  };

  const fetchNombreCuenta = async (idCuenta: number): Promise<string> => {
    if (cuentasCache.has(idCuenta)) {
      return cuentasCache.get(idCuenta)!;
    }

    try {
      const res = await fetch(`/api/cuentas/codigo/${idCuenta}`);
      const data = await res.json();
      const nombre = data.nombre || '';
      setCuentasCache(new Map(cuentasCache.set(idCuenta, nombre)));
      return nombre;
    } catch (error) {
      return '';
    }
  };

  const handleSearchWithParams = async (params: typeof filtros) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', params.year.toString());
      if (params.subconta) queryParams.append('subconta', params.subconta);
      if (params.idAsientoDesde) queryParams.append('idAsientoDesde', params.idAsientoDesde);

      const res = await fetch(`/api/asientos/lista?${queryParams.toString()}`);
      const asientosData = await res.json();

      // Obtener nombres de cuentas
      const cuentasIds = new Set<number>();
      asientosData.forEach((asiento: AsientoConApuntes) => {
        asiento.apuntes.forEach((apunte) => {
          if (apunte.idCuentaDebe) cuentasIds.add(apunte.idCuentaDebe);
          if (apunte.idCuentaHaber) cuentasIds.add(apunte.idCuentaHaber);
        });
      });

      await Promise.all(Array.from(cuentasIds).map(fetchNombreCuenta));

      setAsientos(asientosData);
    } catch (error) {
      console.error('Error al buscar asientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Actualizar URL
    const params = new URLSearchParams();
    if (filtros.year) params.set('year', filtros.year.toString());
    if (filtros.subconta) params.set('subconta', filtros.subconta);
    if (filtros.idAsientoDesde) params.set('idAsientoDesde', filtros.idAsientoDesde);

    router.push(`/dashboard/asientos-lista?${params.toString()}`);

    await handleSearchWithParams(filtros);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Listado de Asientos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consulta los asientos contables con sus apuntes
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Filtros
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ejercicio
              </label>
              <select
                value={filtros.year}
                onChange={(e) => setFiltros({ ...filtros, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {ejercicios.map((ej) => (
                  <option key={ej._id?.toString()} value={ej.year}>
                    {ej.year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subconta
              </label>
              <select
                value={filtros.subconta}
                onChange={(e) => setFiltros({ ...filtros, subconta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas</option>
                {subcontas.map((sc) => (
                  <option key={sc._id?.toString()} value={sc.id}>
                    {sc.id} - {sc.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desde Nº Asiento
              </label>
              <input
                type="number"
                value={filtros.idAsientoDesde}
                onChange={(e) => setFiltros({ ...filtros, idAsientoDesde: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej: 1"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? 'Buscando...' : '🔍 Buscar'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {asientos.length > 0 && (
        <div className="space-y-6">
          {asientos.map((asiento) => {
            const totalDebe = asiento.apuntes.reduce((sum, ap) => sum + ap.debe, 0);
            const totalHaber = asiento.apuntes.reduce((sum, ap) => sum + ap.haber, 0);
            const descuadre = Math.abs(totalDebe - totalHaber);

            return (
              <div
                key={asiento._id?.toString()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                {/* Cabecera del asiento */}
                <div className="bg-indigo-50 dark:bg-indigo-900 p-4 border-b border-indigo-200 dark:border-indigo-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                        Asiento Nº {asiento.idAsiento}
                      </h3>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        Fecha: {new Date(asiento.date).toLocaleDateString('es-ES')} |
                        Ejercicio: {asiento.year} |
                        Subconta: {asiento.subconta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">Apuntes: {asiento.apuntes.length}</p>
                      {descuadre > 0.01 && (
                        <p className="text-xs text-red-600 font-semibold">
                          ⚠️ Descuadre: {descuadre.toFixed(2)}€
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabla de apuntes */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Apunte</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cuenta Debe</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cuenta Haber</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debe</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Haber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {asiento.apuntes.map((apunte) => (
                        <tr key={apunte._id?.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {apunte.idApunte}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {apunte.idCuentaDebe > 0 && (
                              <div>
                                <Link
                                  href={`/dashboard/consulta-cuenta?cuenta=${apunte.idCuentaDebe}&year=${asiento.year}&subconta=${asiento.subconta}`}
                                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  {apunte.idCuentaDebe}
                                </Link>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {cuentasCache.get(apunte.idCuentaDebe)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {apunte.idCuentaHaber > 0 && (
                              <div>
                                <Link
                                  href={`/dashboard/consulta-cuenta?cuenta=${apunte.idCuentaHaber}&year=${asiento.year}&subconta=${asiento.subconta}`}
                                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  {apunte.idCuentaHaber}
                                </Link>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {cuentasCache.get(apunte.idCuentaHaber)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {apunte.descripcion}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                            {apunte.debe > 0 ? `${apunte.debe.toFixed(2)}€` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                            {apunte.haber > 0 ? `${apunte.haber.toFixed(2)}€` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                          TOTALES:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                          {totalDebe.toFixed(2)}€
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                          {totalHaber.toFixed(2)}€
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && asientos.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron asientos con los filtros especificados
          </p>
        </div>
      )}
    </div>
  );
}

export default function AsientosListaPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <AsientosListaContent />
    </Suspense>
  );
}
