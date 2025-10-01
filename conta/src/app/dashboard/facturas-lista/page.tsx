'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Factura, Ejercicio, Subconta, Iva } from '@/types';

interface FacturaConIvas extends Factura {
  ivas?: Iva[];
}

function FacturasListaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [facturas, setFacturas] = useState<FacturaConIvas[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    year: new Date().getFullYear(),
    subconta: '',
    tipo: 'emitida' as 'emitida' | 'recibida' | 'todas',
    fechaDesde: '',
    fechaHasta: '',
    idCuenta: '',
    importeMin: '',
    importeMax: '',
  });

  useEffect(() => {
    const initData = async () => {
      await fetchEjercicios();
      const subcontasData = await fetchSubcontas();

      // Leer parámetros de URL
      const yearParam = searchParams.get('year');
      const subcontaParam = searchParams.get('subconta');
      const tipoParam = searchParams.get('tipo');
      const fechaDesdeParam = searchParams.get('fechaDesde');
      const fechaHastaParam = searchParams.get('fechaHasta');
      const idCuentaParam = searchParams.get('idCuenta');
      const importeMinParam = searchParams.get('importeMin');
      const importeMaxParam = searchParams.get('importeMax');

      const newFiltros = {
        year: yearParam ? parseInt(yearParam) : new Date().getFullYear(),
        subconta: subcontaParam || (subcontasData.length > 0 ? subcontasData[0].id : '1'),
        tipo: (tipoParam as any) || 'emitida',
        fechaDesde: fechaDesdeParam || '',
        fechaHasta: fechaHastaParam || '',
        idCuenta: idCuentaParam || '',
        importeMin: importeMinParam || '',
        importeMax: importeMaxParam || '',
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

  const handleSearchWithParams = async (params: typeof filtros) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', params.year.toString());
      if (params.subconta) queryParams.append('subconta', params.subconta);
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      if (params.idCuenta) queryParams.append('idCuenta', params.idCuenta);
      if (params.importeMin) queryParams.append('importeMin', params.importeMin);
      if (params.importeMax) queryParams.append('importeMax', params.importeMax);

      const res = await fetch(`/api/facturas/search?${queryParams.toString()}`);
      const facturasData = await res.json();

      // Obtener IVAs para cada factura
      const facturasConIvas = await Promise.all(
        facturasData.map(async (factura: Factura) => {
          const ivasRes = await fetch(`/api/iva?idFactura=${factura.id}`);
          const ivasData = await ivasRes.json();
          return { ...factura, ivas: ivasData };
        })
      );

      setFacturas(facturasConIvas);
    } catch (error) {
      console.error('Error al buscar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Actualizar URL
    const params = new URLSearchParams();
    if (filtros.year) params.set('year', filtros.year.toString());
    if (filtros.subconta) params.set('subconta', filtros.subconta);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.idCuenta) params.set('idCuenta', filtros.idCuenta);
    if (filtros.importeMin) params.set('importeMin', filtros.importeMin);
    if (filtros.importeMax) params.set('importeMax', filtros.importeMax);

    router.push(`/dashboard/facturas-lista?${params.toString()}`);

    await handleSearchWithParams(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      year: new Date().getFullYear(),
      subconta: '',
      tipo: 'todas',
      fechaDesde: '',
      fechaHasta: '',
      idCuenta: '',
      importeMin: '',
      importeMax: '',
    });
  };

  const totales = facturas.reduce((acc, f) => acc + f.importeTotal, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Listado de Facturas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busca y filtra facturas emitidas y recibidas
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Filtros de Búsqueda
        </h2>

        <div className="space-y-4">
          {/* Fila 1: Ejercicio, Subconta, Tipo */}
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
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="todas">📋 Todas</option>
                <option value="emitida">📤 Emitidas</option>
                <option value="recibida">📥 Recibidas</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Desde
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
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Fila 3: Cuenta e Importes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código Cuenta (Cliente/Proveedor)
              </label>
              <input
                type="number"
                value={filtros.idCuenta}
                onChange={(e) => setFiltros({ ...filtros, idCuenta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej: 4300001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe Desde (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={filtros.importeMin}
                onChange={(e) => setFiltros({ ...filtros, importeMin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe Hasta (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={filtros.importeMax}
                onChange={(e) => setFiltros({ ...filtros, importeMax: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="999999.99"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
            <button
              onClick={limpiarFiltros}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {facturas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resultados ({facturas.length})
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Importes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totales.toFixed(2)}€
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nº Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Su Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contrapartida</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Importe Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {facturas.map((factura) => {
                  const bruto = factura.ivas?.reduce((sum, iva) => sum + iva.baseIva, 0) || 0;
                  const totalIva = factura.ivas?.reduce((sum, iva) => sum + iva.cuota, 0) || 0;

                  return (
                    <React.Fragment key={factura._id?.toString()}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            factura.tipo === 'emitida'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {factura.tipo === 'emitida' ? '📤 Emitida' : '📥 Recibida'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          {factura.numeroRegistro}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {factura.suFactura}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(factura.fechaFactura).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {factura.idCuentaClienteProveedor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {factura.idCuentaContrapartida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">
                          {factura.importeTotal.toFixed(2)}€
                        </td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-xs">
                        <td colSpan={6} className="px-6 py-2">
                          <div className="flex gap-4 text-gray-600 dark:text-gray-400">
                            <span>Bruto: <strong className="text-gray-900 dark:text-white">{bruto.toFixed(2)}€</strong></span>
                            {factura.ivas && factura.ivas.map((iva, idx) => (
                              <span key={idx}>
                                IVA {iva.porcentaje}%: <strong className="text-gray-900 dark:text-white">{iva.cuota.toFixed(2)}€</strong>
                              </span>
                            ))}
                            {factura.importeRetencion > 0 && (
                              <span>
                                Retención {factura.porcentajeRetencion}%: <strong className="text-red-600">-{factura.importeRetencion.toFixed(2)}€</strong>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2 text-right text-gray-600 dark:text-gray-400">
                          Total IVA: <strong className="text-gray-900 dark:text-white">{totalIva.toFixed(2)}€</strong>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && facturas.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron facturas con los filtros especificados
          </p>
        </div>
      )}
    </div>
  );
}

export default function FacturasListaPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <FacturasListaContent />
    </Suspense>
  );
}
