'use client';

import { useState, useEffect } from 'react';
import { Factura, Ejercicio, Subconta, Cuenta } from '@/types';

interface LineaIva {
  porcentaje: number;
  baseIva: number;
  cuota: number;
}

export default function FacturasPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(false);

  const [factura, setFactura] = useState({
    tipo: 'emitida' as 'emitida' | 'recibida',
    year: new Date().getFullYear(),
    subconta: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    numeroRegistro: '',
    suFactura: '',
    fechaFactura: new Date().toISOString().split('T')[0],
    idCuentaClienteProveedor: 0,
    idCuentaContrapartida: 0,
    baseRetencion: 0,
    porcentajeRetencion: 0,
    importeRetencion: 0,
    importeTotal: 0,
  });

  const [lineasIva, setLineasIva] = useState<LineaIva[]>([
    { porcentaje: 21, baseIva: 0, cuota: 0 }
  ]);

  useEffect(() => {
    fetchEjercicios();
    fetchSubcontas();
    fetchCuentas();
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
    // Seleccionar la primera subconta por defecto
    if (data.length > 0 && !factura.subconta) {
      setFactura(prev => ({ ...prev, subconta: data[0].id }));
    }
  };

  const fetchCuentas = async () => {
    const res = await fetch('/api/cuentas');
    const data = await res.json();
    setCuentas(data);
  };

  const agregarLineaIva = () => {
    setLineasIva([...lineasIva, { porcentaje: 21, baseIva: 0, cuota: 0 }]);
  };

  const eliminarLineaIva = (index: number) => {
    setLineasIva(lineasIva.filter((_, i) => i !== index));
  };

  const actualizarLineaIva = (index: number, campo: keyof LineaIva, valor: number) => {
    const nuevasLineas = [...lineasIva];
    nuevasLineas[index][campo] = valor;

    // Auto-calcular cuota si se modifica base o porcentaje
    if (campo === 'baseIva' || campo === 'porcentaje') {
      const base = campo === 'baseIva' ? valor : nuevasLineas[index].baseIva;
      const porcentaje = campo === 'porcentaje' ? valor : nuevasLineas[index].porcentaje;
      nuevasLineas[index].cuota = (base * porcentaje) / 100;
    }

    setLineasIva(nuevasLineas);
    calcularImporteTotal(nuevasLineas);
  };

  const calcularImporteTotal = (ivas: LineaIva[]) => {
    const totalBase = ivas.reduce((sum, iva) => sum + iva.baseIva, 0);
    const totalIva = ivas.reduce((sum, iva) => sum + iva.cuota, 0);
    const importeTotal = totalBase + totalIva - factura.importeRetencion;
    setFactura({ ...factura, importeTotal });
  };

  const calcularRetencion = (base: number, porcentaje: number) => {
    const importe = (base * porcentaje) / 100;
    setFactura({
      ...factura,
      baseRetencion: base,
      porcentajeRetencion: porcentaje,
      importeRetencion: importe,
    });

    // Recalcular total
    const totalBase = lineasIva.reduce((sum, iva) => sum + iva.baseIva, 0);
    const totalIva = lineasIva.reduce((sum, iva) => sum + iva.cuota, 0);
    const importeTotal = totalBase + totalIva - importe;
    setFactura(prev => ({ ...prev, importeTotal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!factura.subconta) {
      alert('Por favor selecciona una subconta');
      return;
    }

    if (!factura.idCuentaClienteProveedor || !factura.idCuentaContrapartida) {
      alert('Por favor selecciona las cuentas');
      return;
    }

    if (lineasIva.length === 0) {
      alert('Debe haber al menos una línea de IVA');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factura,
          ivas: lineasIva,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Factura creada correctamente');
        // Reset form
        setFactura({
          tipo: 'emitida',
          year: new Date().getFullYear(),
          subconta: '',
          fechaRegistro: new Date().toISOString().split('T')[0],
          numeroRegistro: '',
          suFactura: '',
          fechaFactura: new Date().toISOString().split('T')[0],
          idCuentaClienteProveedor: 0,
          idCuentaContrapartida: 0,
          baseRetencion: 0,
          porcentajeRetencion: 0,
          importeRetencion: 0,
          importeTotal: 0,
        });
        setLineasIva([{ porcentaje: 21, baseIva: 0, cuota: 0 }]);
      } else {
        alert('❌ Error al crear factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const porcentajesIva = [21, 10, 4, 0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nueva Factura
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registra una factura emitida o recibida
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Generales, Registro y Factura */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Datos de la Factura
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                value={factura.tipo}
                onChange={(e) => setFactura({ ...factura, tipo: e.target.value as 'emitida' | 'recibida' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="emitida">📤 Emitida</option>
                <option value="recibida">📥 Recibida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ejercicio *
              </label>
              <select
                value={factura.year}
                onChange={(e) => setFactura({ ...factura, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
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
                Subconta *
              </label>
              <select
                value={factura.subconta}
                onChange={(e) => setFactura({ ...factura, subconta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                {subcontas.map((sc) => (
                  <option key={sc._id?.toString()} value={sc.id}>
                    {sc.id} - {sc.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Registro *
              </label>
              <input
                type="date"
                value={factura.fechaRegistro}
                onChange={(e) => setFactura({ ...factura, fechaRegistro: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nº Registro *
              </label>
              <input
                type="text"
                value={factura.numeroRegistro}
                onChange={(e) => setFactura({ ...factura, numeroRegistro: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="2025/001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Su Factura *
              </label>
              <input
                type="text"
                value={factura.suFactura}
                onChange={(e) => setFactura({ ...factura, suFactura: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="A-2025-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Factura *
              </label>
              <input
                type="date"
                value={factura.fechaFactura}
                onChange={(e) => setFactura({ ...factura, fechaFactura: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Cuentas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Cuentas Contables
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe Bruto (Base) *
              </label>
              <input
                type="number"
                step="0.01"
                value={lineasIva.reduce((sum, iva) => sum + iva.baseIva, 0)}
                onChange={(e) => {
                  const nuevoBruto = parseFloat(e.target.value) || 0;
                  if (lineasIva.length === 1) {
                    actualizarLineaIva(0, 'baseIva', nuevoBruto);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-bold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuenta {factura.tipo === 'emitida' ? 'Cliente' : 'Proveedor'} *
              </label>
              <select
                value={factura.idCuentaClienteProveedor}
                onChange={(e) => setFactura({ ...factura, idCuentaClienteProveedor: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Seleccionar...</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta._id?.toString()} value={cuenta.id}>
                    {cuenta.id} - {cuenta.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contrapartida ({factura.tipo === 'emitida' ? 'Ventas' : 'Compras'}) *
              </label>
              <select
                value={factura.idCuentaContrapartida}
                onChange={(e) => setFactura({ ...factura, idCuentaContrapartida: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Seleccionar...</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta._id?.toString()} value={cuenta.id}>
                    {cuenta.id} - {cuenta.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Líneas de IVA */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Líneas de IVA
            </h2>
            <button
              type="button"
              onClick={agregarLineaIva}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ➕ Agregar Línea
            </button>
          </div>

          <div className="space-y-4">
            {lineasIva.map((linea, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    % IVA
                  </label>
                  <select
                    value={linea.porcentaje}
                    onChange={(e) => actualizarLineaIva(index, 'porcentaje', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {porcentajesIva.map((p) => (
                      <option key={p} value={p}>{p}%</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base IVA (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={linea.baseIva}
                    onChange={(e) => actualizarLineaIva(index, 'baseIva', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuota (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={linea.cuota}
                    onChange={(e) => actualizarLineaIva(index, 'cuota', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {lineasIva.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarLineaIva(index)}
                    className="mt-8 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Base:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {lineasIva.reduce((sum, iva) => sum + iva.baseIva, 0).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total IVA:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {lineasIva.reduce((sum, iva) => sum + iva.cuota, 0).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Retención */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Retención (Opcional)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Retención (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={factura.baseRetencion}
                onChange={(e) => calcularRetencion(parseFloat(e.target.value) || 0, factura.porcentajeRetencion)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                % Retención
              </label>
              <input
                type="number"
                step="0.01"
                value={factura.porcentajeRetencion}
                onChange={(e) => calcularRetencion(factura.baseRetencion, parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej: 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe Retención (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={factura.importeRetencion}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Importe Total
            </h2>
            <p className="text-4xl font-bold">
              {factura.importeTotal.toFixed(2)}€
            </p>
          </div>
          <p className="text-sm mt-2 opacity-90">
            (Base + IVA - Retención)
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-lg"
          >
            {loading ? 'Guardando...' : '💾 Guardar Factura'}
          </button>
        </div>
      </form>
    </div>
  );
}
