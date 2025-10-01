'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Apunte, Ejercicio, Subconta, Cuenta } from '@/types';

interface ApunteConFecha extends Apunte {
  fecha?: Date;
}

function ExtractoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [idCuenta, setIdCuenta] = useState('');
  const [nombreCuenta, setNombreCuenta] = useState('');
  const [apuntes, setApuntes] = useState<ApunteConFecha[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    subconta: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  useEffect(() => {
    const initData = async () => {
      await fetchEjercicios();
      const subcontasData = await fetchSubcontas();

      // Leer parámetros de URL
      const cuentaParam = searchParams.get('cuenta');
      const yearParam = searchParams.get('year');
      const subcontaParam = searchParams.get('subconta');
      const fechaDesdeParam = searchParams.get('fechaDesde');
      const fechaHastaParam = searchParams.get('fechaHasta');

      const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
      const subconta = subcontaParam || (subcontasData.length > 0 ? subcontasData[0].id : '');
      const fechaDesde = fechaDesdeParam || `${year}-01-01`;
      const fechaHasta = fechaHastaParam || `${year}-12-31`;

      if (cuentaParam) {
        setIdCuenta(cuentaParam);
        setFiltros({
          year,
          subconta,
          fechaDesde,
          fechaHasta,
        });

        setTimeout(() => {
          handleSearchWithParams(cuentaParam, year.toString(), subconta, fechaDesde, fechaHasta);
        }, 100);
      } else {
        // Establecer valores por defecto
        setFiltros({
          year,
          subconta,
          fechaDesde,
          fechaHasta,
        });
      }
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

  const handleSearchWithParams = async (
    cuenta: string,
    year?: string | null,
    subconta?: string | null,
    fechaDesde?: string | null,
    fechaHasta?: string | null
  ) => {
    if (!cuenta) {
      alert('Por favor introduce un código de cuenta');
      return;
    }

    setLoading(true);
    try {
      // Obtener nombre de cuenta
      const cuentaRes = await fetch(`/api/cuentas/codigo/${cuenta}`);
      const cuentaData: Cuenta = await cuentaRes.json();
      setNombreCuenta(cuentaData.nombre || 'Sin nombre');

      const params = new URLSearchParams();
      params.append('idCuenta', cuenta);
      if (year) params.append('year', year);
      if (subconta) params.append('subconta', subconta);
      if (fechaDesde) params.append('fechaDesde', fechaDesde);
      if (fechaHasta) params.append('fechaHasta', fechaHasta);

      const res = await fetch(`/api/extracto?${params.toString()}`);
      const data = await res.json();
      setApuntes(data);
    } catch (error) {
      console.error('Error al obtener extracto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!idCuenta) {
      alert('Por favor introduce un código de cuenta');
      return;
    }

    // Actualizar URL
    const params = new URLSearchParams();
    params.set('cuenta', idCuenta);
    if (filtros.year) params.set('year', filtros.year.toString());
    if (filtros.subconta) params.set('subconta', filtros.subconta);
    if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);

    router.push(`/dashboard/extracto?${params.toString()}`);

    await handleSearchWithParams(
      idCuenta,
      filtros.year.toString(),
      filtros.subconta,
      filtros.fechaDesde,
      filtros.fechaHasta
    );
  };

  const calcularSaldoAcumulado = (index: number): number => {
    let saldo = 0;
    for (let i = 0; i <= index; i++) {
      const apunte = apuntes[i];
      if (apunte.idCuentaDebe === parseInt(idCuenta)) {
        saldo += apunte.debe;
      }
      if (apunte.idCuentaHaber === parseInt(idCuenta)) {
        saldo -= apunte.haber;
      }
    }
    return saldo;
  };

  const totales = apuntes.reduce(
    (acc, apunte) => {
      if (apunte.idCuentaDebe === parseInt(idCuenta)) {
        acc.debe += apunte.debe;
      }
      if (apunte.idCuentaHaber === parseInt(idCuenta)) {
        acc.haber += apunte.haber;
      }
      return acc;
    },
    { debe: 0, haber: 0 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Extracto de Cuenta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza todos los apuntes de una cuenta en un periodo
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Cuenta *
            </label>
            <input
              type="number"
              value={idCuenta}
              onChange={(e) => setIdCuenta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 5720001"
            />
          </div>

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
              Desde
            </label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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

      {/* Resultados */}
      {apuntes.length > 0 && (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cuenta: {idCuenta} - {nombreCuenta}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {apuntes.length} apuntes encontrados
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Final</p>
                <p className={`text-2xl font-bold ${
                  (totales.debe - totales.haber) > 0
                    ? 'text-green-600'
                    : (totales.debe - totales.haber) < 0
                      ? 'text-red-600'
                      : 'text-gray-900 dark:text-white'
                }`}>
                  {(totales.debe - totales.haber).toFixed(2)}€
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Asiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debe</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Haber</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apuntes.map((apunte, index) => {
                    const saldoAcumulado = calcularSaldoAcumulado(index);
                    const debe = apunte.idCuentaDebe === parseInt(idCuenta) ? apunte.debe : 0;
                    const haber = apunte.idCuentaHaber === parseInt(idCuenta) ? apunte.haber : 0;

                    return (
                      <tr key={apunte._id?.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {apunte.fecha ? new Date(apunte.fecha).toLocaleDateString('es-ES') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                          {apunte.idAsiento}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {apunte.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {debe > 0 ? `${debe.toFixed(2)}€` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {haber > 0 ? `${haber.toFixed(2)}€` : '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                          saldoAcumulado > 0 ? 'text-green-600' : saldoAcumulado < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {saldoAcumulado.toFixed(2)}€
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      TOTALES
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {totales.debe.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {totales.haber.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {(totales.debe - totales.haber).toFixed(2)}€
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && apuntes.length === 0 && idCuenta && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron apuntes para la cuenta {idCuenta} con los filtros especificados
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExtractoPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <ExtractoContent />
    </Suspense>
  );
}
