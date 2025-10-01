'use client';

import { useState, useEffect } from 'react';
import { Factura, Asiento, Cuenta } from '@/types';

interface SearchFilters {
  tipo: 'facturas' | 'asientos' | 'cuentas';
  idCuenta?: string;
  idAsiento?: string;
  suFactura?: string;
  numeroRegistro?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  importeMin?: number;
  importeMax?: number;
  periodo?: 'semana' | 'mes' | 'trimestre' | 'personalizado';
}

export default function BuscadorPage() {
  const [filtros, setFiltros] = useState<SearchFilters>({
    tipo: 'facturas',
    periodo: 'personalizado',
  });

  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const aplicarPeriodo = (periodo: string) => {
    const hoy = new Date();
    let fechaDesde = '';

    switch (periodo) {
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - 7);
        fechaDesde = inicioSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        const inicioMes = new Date(hoy);
        inicioMes.setMonth(hoy.getMonth() - 1);
        fechaDesde = inicioMes.toISOString().split('T')[0];
        break;
      case 'trimestre':
        const inicioTrimestre = new Date(hoy);
        inicioTrimestre.setMonth(hoy.getMonth() - 3);
        fechaDesde = inicioTrimestre.toISOString().split('T')[0];
        break;
    }

    if (fechaDesde) {
      setFiltros({
        ...filtros,
        periodo: periodo as any,
        fechaDesde,
        fechaHasta: hoy.toISOString().split('T')[0],
      });
    } else {
      setFiltros({ ...filtros, periodo: 'personalizado' });
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('tipo', filtros.tipo);

      if (filtros.idCuenta) params.append('idCuenta', filtros.idCuenta);
      if (filtros.idAsiento) params.append('idAsiento', filtros.idAsiento);
      if (filtros.suFactura) params.append('suFactura', filtros.suFactura);
      if (filtros.numeroRegistro) params.append('numeroRegistro', filtros.numeroRegistro);
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
      if (filtros.importeMin !== undefined) params.append('importeMin', filtros.importeMin.toString());
      if (filtros.importeMax !== undefined) params.append('importeMax', filtros.importeMax.toString());

      const res = await fetch(`/api/buscador?${params.toString()}`);
      const data = await res.json();
      setResultados(data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: 'facturas',
      periodo: 'personalizado',
    });
    setResultados([]);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Buscador Avanzado
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busca facturas, asientos y cuentas con múltiples filtros
        </p>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Filtros de Búsqueda
        </h2>

        {/* Tipo de búsqueda */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ¿Qué deseas buscar?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFiltros({ ...filtros, tipo: 'facturas' })}
              className={`px-6 py-3 rounded-lg font-semibold ${
                filtros.tipo === 'facturas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🧾 Facturas
            </button>
            <button
              type="button"
              onClick={() => setFiltros({ ...filtros, tipo: 'asientos' })}
              className={`px-6 py-3 rounded-lg font-semibold ${
                filtros.tipo === 'asientos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📊 Asientos
            </button>
            <button
              type="button"
              onClick={() => setFiltros({ ...filtros, tipo: 'cuentas' })}
              className={`px-6 py-3 rounded-lg font-semibold ${
                filtros.tipo === 'cuentas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              💼 Cuentas
            </button>
          </div>
        </div>

        {/* Filtros por campos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {filtros.tipo !== 'cuentas' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Cuenta
                </label>
                <input
                  type="number"
                  value={filtros.idCuenta || ''}
                  onChange={(e) => setFiltros({ ...filtros, idCuenta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: 430"
                />
              </div>

              {filtros.tipo === 'asientos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID Asiento
                  </label>
                  <input
                    type="number"
                    value={filtros.idAsiento || ''}
                    onChange={(e) => setFiltros({ ...filtros, idAsiento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: 12345"
                  />
                </div>
              )}

              {filtros.tipo === 'facturas' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número Factura
                    </label>
                    <input
                      type="text"
                      value={filtros.suFactura || ''}
                      onChange={(e) => setFiltros({ ...filtros, suFactura: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: A-2025-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número Registro
                    </label>
                    <input
                      type="text"
                      value={filtros.numeroRegistro || ''}
                      onChange={(e) => setFiltros({ ...filtros, numeroRegistro: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: 2025/001"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {filtros.tipo === 'cuentas' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID o Nombre de Cuenta
              </label>
              <input
                type="text"
                value={filtros.idCuenta || ''}
                onChange={(e) => setFiltros({ ...filtros, idCuenta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej: 430 o Clientes"
              />
            </div>
          )}
        </div>

        {/* Filtros de fecha y periodo - Solo para facturas y asientos */}
        {filtros.tipo !== 'cuentas' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periodo
            </label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => aplicarPeriodo('semana')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  filtros.periodo === 'semana'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Última Semana
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('mes')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  filtros.periodo === 'mes'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Último Mes
              </button>
              <button
                type="button"
                onClick={() => aplicarPeriodo('trimestre')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  filtros.periodo === 'trimestre'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Último Trimestre
              </button>
              <button
                type="button"
                onClick={() => setFiltros({ ...filtros, periodo: 'personalizado' })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  filtros.periodo === 'personalizado'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Personalizado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde || ''}
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
                  value={filtros.fechaHasta || ''}
                  onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtros de importe - Para facturas y asientos */}
        {(filtros.tipo === 'facturas' || filtros.tipo === 'asientos') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe Desde (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={filtros.importeMin || ''}
                onChange={(e) => setFiltros({ ...filtros, importeMin: parseFloat(e.target.value) })}
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
                value={filtros.importeMax || ''}
                onChange={(e) => setFiltros({ ...filtros, importeMax: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="999999.99"
              />
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? 'Buscando...' : '🔍 Buscar'}
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resultados ({resultados.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {filtros.tipo === 'facturas' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nº Registro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Su Factura</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Factura</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Importe Total</th>
                    </>
                  )}
                  {filtros.tipo === 'asientos' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID Asiento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Año</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subconta</th>
                    </>
                  )}
                  {filtros.tipo === 'cuentas' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {resultados.map((resultado, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {filtros.tipo === 'facturas' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {resultado.tipo === 'emitida' ? '📤 Emitida' : '📥 Recibida'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{resultado.numeroRegistro}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resultado.suFactura}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(resultado.fechaFactura).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                          {resultado.importeTotal.toFixed(2)}€
                        </td>
                      </>
                    )}
                    {filtros.tipo === 'asientos' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{resultado.idAsiento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(resultado.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resultado.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resultado.subconta}</td>
                      </>
                    )}
                    {filtros.tipo === 'cuentas' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{resultado.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resultado.nombre}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && resultados.length === 0 && filtros.tipo && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron resultados. Ajusta los filtros e intenta nuevamente.
          </p>
        </div>
      )}
    </div>
  );
}
