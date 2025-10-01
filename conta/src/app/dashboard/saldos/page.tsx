'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Saldos, Ejercicio, Subconta, Cuenta } from '@/types';

type SaldoConNombre = Saldos & { nombreCuenta?: string };

export default function SaldosPage() {
  const [saldos, setSaldos] = useState<SaldoConNombre[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [cuentasCache, setCuentasCache] = useState<Map<number, string>>(new Map());

  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    subconta: '',
  });

  useEffect(() => {
    fetchEjercicios();
    fetchSubcontas();
  }, []);

  useEffect(() => {
    fetchSaldos();
  }, [filtros]);

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

  const fetchNombreCuenta = async (idCuenta: number): Promise<string> => {
    // Verificar cache primero
    if (cuentasCache.has(idCuenta)) {
      return cuentasCache.get(idCuenta)!;
    }

    try {
      const res = await fetch(`/api/cuentas/codigo/${idCuenta}`);
      const cuenta: Cuenta = await res.json();
      const nombre = cuenta.nombre || 'Sin nombre';

      // Guardar en cache
      setCuentasCache(prev => new Map(prev).set(idCuenta, nombre));
      return nombre;
    } catch (error) {
      return 'Desconocida';
    }
  };

  const fetchSaldos = async () => {
    const params = new URLSearchParams();
    if (filtros.year) params.append('year', filtros.year.toString());
    if (filtros.month) params.append('month', filtros.month.toString());
    if (filtros.subconta) params.append('subconta', filtros.subconta);

    const res = await fetch(`/api/saldos?${params.toString()}`);
    const data: Saldos[] = await res.json();

    // Obtener nombres de cuentas
    const saldosConNombres = await Promise.all(
      data.map(async (saldo) => ({
        ...saldo,
        nombreCuenta: await fetchNombreCuenta(saldo.idCuenta)
      }))
    );

    setSaldos(saldosConNombres);
  };

  const calcularSaldoNeto = (debe: number, haber: number) => {
    return debe - haber;
  };

  const totales = saldos.reduce(
    (acc, saldo) => ({
      debe: acc.debe + saldo.debe,
      haber: acc.haber + saldo.haber,
    }),
    { debe: 0, haber: 0 }
  );

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Saldos de Cuentas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consulta los saldos mensuales de las cuentas contables
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Filtros
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ejercicio
            </label>
            <select
              value={filtros.year}
              onChange={(e) => setFiltros({ ...filtros, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              {ejercicios.map((ej) => (
                <option key={ej._id?.toString()} value={ej.year}>
                  {ej.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mes
            </label>
            <select
              value={filtros.month}
              onChange={(e) => setFiltros({ ...filtros, month: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
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
        </div>
      </div>

      {/* Tabla de Saldos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cuenta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subconta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Debe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Haber
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {saldos.map((saldo) => {
                const saldoNeto = calcularSaldoNeto(saldo.debe, saldo.haber);
                return (
                  <tr key={saldo._id?.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                      <Link
                        href={`/dashboard/consulta-cuenta?cuenta=${saldo.idCuenta}&year=${saldo.year}&subconta=${saldo.subconta}`}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                      >
                        {saldo.idCuenta}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {saldo.nombreCuenta || 'Cargando...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {saldo.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {meses.find(m => m.value === saldo.month)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {saldo.subconta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {saldo.debe.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {saldo.haber.toFixed(2)}€
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      saldoNeto > 0 ? 'text-green-600' : saldoNeto < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {saldoNeto.toFixed(2)}€
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {saldos.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
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
            )}
          </table>
        </div>
        {saldos.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No hay saldos registrados para los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}