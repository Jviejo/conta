'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Saldos, Ejercicio, Subconta, Cuenta } from '@/types';

function ConsultaCuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [idCuenta, setIdCuenta] = useState('');
  const [nombreCuenta, setNombreCuenta] = useState('');
  const [saldos, setSaldos] = useState<Saldos[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    subconta: '',
    agruparSubcontas: false,
  });

  useEffect(() => {
    fetchEjercicios();
    fetchSubcontas();

    // Leer parámetros de URL al cargar
    const cuentaParam = searchParams.get('cuenta');
    const yearParam = searchParams.get('year');
    const subcontaParam = searchParams.get('subconta');

    if (cuentaParam) {
      setIdCuenta(cuentaParam);
      setFiltros(prev => ({
        ...prev,
        year: yearParam ? parseInt(yearParam) : prev.year,
        subconta: subcontaParam || '',
      }));

      // Auto-buscar si hay cuenta en URL
      setTimeout(() => {
        handleSearchWithParams(cuentaParam, yearParam, subcontaParam);
      }, 100);
    }
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
  };

  const completarMeses = (saldosOriginales: Saldos[]): Saldos[] => {
    if (!filtros.year || saldosOriginales.length === 0) return saldosOriginales;

    const mesesCompletos: Saldos[] = [];

    for (let month = 1; month <= 12; month++) {
      const saldoExistente = saldosOriginales.find(s => s.month === month);

      if (saldoExistente) {
        mesesCompletos.push(saldoExistente);
      } else {
        // Crear saldo vacío para el mes
        mesesCompletos.push({
          id: Date.now() + month,
          idCuenta: parseInt(idCuenta),
          year: filtros.year,
          month,
          subconta: filtros.subconta || 'TODAS',
          debe: 0,
          haber: 0,
        });
      }
    }

    return mesesCompletos;
  };

  const handleSearchWithParams = async (cuenta: string, year?: string | null, subconta?: string | null) => {
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
      const yearValue = year ? parseInt(year) : filtros.year;
      const subcontaValue = subconta || filtros.subconta;

      if (yearValue) params.append('year', yearValue.toString());
      if (subcontaValue && subcontaValue !== 'TODAS' && !filtros.agruparSubcontas) {
        params.append('subconta', subcontaValue);
      }
      if (filtros.agruparSubcontas || subcontaValue === 'TODAS') {
        params.append('agrupar', 'true');
      }

      const res = await fetch(`/api/saldos/cuenta/${cuenta}?${params.toString()}`);
      const data = await res.json();

      // Completar todos los meses del año
      const saldosCompletos = completarMeses(data);
      setSaldos(saldosCompletos);
    } catch (error) {
      console.error('Error al buscar saldos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!idCuenta) {
      alert('Por favor introduce un código de cuenta');
      return;
    }

    // Actualizar URL con parámetros
    const params = new URLSearchParams();
    params.set('cuenta', idCuenta);
    if (filtros.year) params.set('year', filtros.year.toString());
    if (filtros.subconta) params.set('subconta', filtros.subconta);

    router.push(`/dashboard/consulta-cuenta?${params.toString()}`);

    // Realizar búsqueda
    await handleSearchWithParams(idCuenta, filtros.year.toString(), filtros.subconta);
  };

  const calcularAcumulado = (index: number): { debe: number; haber: number; saldo: number } => {
    const hasta = saldos.slice(0, index + 1);
    const debe = hasta.reduce((sum, s) => sum + s.debe, 0);
    const haber = hasta.reduce((sum, s) => sum + s.haber, 0);
    return {
      debe,
      haber,
      saldo: debe - haber,
    };
  };

  const totales = saldos.reduce(
    (acc, saldo) => ({
      debe: acc.debe + saldo.debe,
      haber: acc.haber + saldo.haber,
    }),
    { debe: 0, haber: 0 }
  );

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Consulta de Cuenta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busca una cuenta y visualiza sus saldos mensuales
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Búsqueda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <option value="">Todos los años</option>
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
              disabled={filtros.agruparSubcontas}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar subconta...</option>
              <option value="TODAS">📊 TODAS (suma agrupada)</option>
              {subcontas.map((sc) => (
                <option key={sc._id?.toString()} value={sc.id}>
                  {sc.id} - {sc.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="agrupar"
            checked={filtros.agruparSubcontas}
            onChange={(e) => setFiltros({ ...filtros, agruparSubcontas: e.target.checked, subconta: '' })}
            className="mr-2"
          />
          <label htmlFor="agrupar" className="text-sm text-gray-700 dark:text-gray-300">
            Agrupar todas las subcontas (mostrar suma total por mes)
          </label>
        </div>
      </div>

      {/* Resultados */}
      {saldos.length > 0 && (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cuenta: {idCuenta} - {nombreCuenta || 'Cargando...'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filtros.agruparSubcontas || filtros.subconta === 'TODAS'
                    ? 'Todas las subcontas agrupadas'
                    : filtros.subconta
                      ? `Subconta: ${filtros.subconta}`
                      : 'Selecciona una subconta o "TODAS"'}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href={`/dashboard/extracto?cuenta=${idCuenta}&year=${filtros.year}&subconta=${filtros.subconta || ''}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  📄 Ver Extracto
                </Link>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Total</p>
                  <p className={`text-2xl font-bold ${
                    totales.debe - totales.haber > 0
                      ? 'text-green-600'
                      : totales.debe - totales.haber < 0
                        ? 'text-red-600'
                        : 'text-gray-900 dark:text-white'
                  }`}>
                    {(totales.debe - totales.haber).toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Período
                    </th>
                    {!filtros.agruparSubcontas && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subconta
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Debe
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Haber
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Saldo Período
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Saldo Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {saldos.map((saldo, index) => {
                    const saldoPeriodo = saldo.debe - saldo.haber;
                    const acumulado = calcularAcumulado(index);

                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {meses[saldo.month - 1]} {saldo.year}
                        </td>
                        {!filtros.agruparSubcontas && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {saldo.subconta}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {saldo.debe.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {saldo.haber.toFixed(2)}€
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          saldoPeriodo > 0
                            ? 'text-green-600'
                            : saldoPeriodo < 0
                              ? 'text-red-600'
                              : 'text-gray-900 dark:text-white'
                        }`}>
                          {saldoPeriodo.toFixed(2)}€
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                          acumulado.saldo > 0
                            ? 'text-green-600'
                            : acumulado.saldo < 0
                              ? 'text-red-600'
                              : 'text-gray-900 dark:text-white'
                        }`}>
                          {acumulado.saldo.toFixed(2)}€
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      TOTALES
                    </td>
                    {!filtros.agruparSubcontas && <td></td>}
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {totales.debe.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {totales.haber.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {(totales.debe - totales.haber).toFixed(2)}€
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Gráfico visual simple */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolución del Saldo Acumulado
            </h3>
            <div className="space-y-2">
              {saldos.map((saldo, index) => {
                const acumulado = calcularAcumulado(index);
                const maxSaldo = Math.max(...saldos.map((_, i) => Math.abs(calcularAcumulado(i).saldo)));
                const porcentaje = maxSaldo > 0 ? (Math.abs(acumulado.saldo) / maxSaldo) * 100 : 0;
                const isPositivo = acumulado.saldo >= 0;

                return (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm text-gray-700 dark:text-gray-300">
                      {meses[saldo.month - 1].substring(0, 3)} {saldo.year}
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                        <div
                          className={`h-6 rounded-full ${
                            isPositivo ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
                          {acumulado.saldo.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {saldos.length === 0 && idCuenta && !loading && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron saldos para la cuenta {idCuenta} con los filtros especificados
          </p>
        </div>
      )}
    </div>
  );
}
export default function ConsultaCuentaPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <ConsultaCuentaContent />
    </Suspense>
  );
}
