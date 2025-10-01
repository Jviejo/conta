'use client';

import { useState, useEffect } from 'react';
import { Plantilla, PlantillaLinea, Ejercicio, Subconta } from '@/types';

type LineaConImporte = PlantillaLinea & { importeIngresado?: number };

export default function PlantillasAsientosPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    importe: '', // Solo para simples
    ejercicioYear: new Date().getFullYear(),
    subcontaId: '',
  });

  const [lineasEditables, setLineasEditables] = useState<LineaConImporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  useEffect(() => {
    fetchPlantillas();
    fetchEjercicios();
    fetchSubcontas();
  }, []);

  const fetchPlantillas = async () => {
    const res = await fetch('/api/plantillas');
    const data = await res.json();
    setPlantillas(data);
  };

  const fetchEjercicios = async () => {
    const res = await fetch('/api/ejercicios');
    const data = await res.json();
    setEjercicios(data);
    if (data.length > 0) {
      setFormData(prev => ({ ...prev, ejercicioYear: data[0].year }));
    }
  };

  const fetchSubcontas = async () => {
    const res = await fetch('/api/subcontas');
    const data = await res.json();
    setSubcontas(data);
    if (data.length > 0) {
      setFormData(prev => ({ ...prev, subcontaId: data[0].id.toString() }));
    }
  };

  const handlePlantillaSelect = (plantillaIndex: string) => {
    const index = parseInt(plantillaIndex);
    const plantilla = plantillas[index];
    if (plantilla) {
      setSelectedPlantilla(plantilla);
      setLineasEditables(plantilla.asiento.map(linea => ({ ...linea, importeIngresado: 0 })));
      setFormData(prev => ({ ...prev, importe: '' }));
      setBalanceError(false);
    }
  };

  const updateLineaEditable = (index: number, field: keyof LineaConImporte, value: string | number) => {
    const newLineas = [...lineasEditables];
    newLineas[index] = { ...newLineas[index], [field]: value };
    setLineasEditables(newLineas);

    // Si es compuesto, verificar balance en tiempo real
    if (selectedPlantilla?.tipo_asiento === 'compuesto') {
      checkBalance(newLineas);
    }
  };

  const checkBalance = (lineas: LineaConImporte[]) => {
    const debe = lineas
      .filter(l => l.naturaleza === 'DEBE')
      .reduce((sum, l) => sum + (l.importeIngresado || 0), 0);

    const haber = lineas
      .filter(l => l.naturaleza === 'HABER')
      .reduce((sum, l) => sum + (l.importeIngresado || 0), 0);

    setBalanceError(Math.abs(debe - haber) > 0.01);
    return Math.abs(debe - haber) < 0.01;
  };

  const calculateBalance = () => {
    if (selectedPlantilla?.tipo_asiento === 'simple') {
      return {
        debe: parseFloat(formData.importe) || 0,
        haber: parseFloat(formData.importe) || 0,
        balanced: true
      };
    } else {
      const debe = lineasEditables
        .filter(l => l.naturaleza === 'DEBE')
        .reduce((sum, l) => sum + (l.importeIngresado || 0), 0);

      const haber = lineasEditables
        .filter(l => l.naturaleza === 'HABER')
        .reduce((sum, l) => sum + (l.importeIngresado || 0), 0);

      return {
        debe,
        haber,
        balanced: Math.abs(debe - haber) < 0.01
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const balance = calculateBalance();

      if (!balance.balanced) {
        setBalanceError(true);
        setLoading(false);
        return;
      }

      // Get next asiento ID
      const asientosRes = await fetch('/api/asientos');
      const asientos = await asientosRes.json();
      const nextIdAsiento = asientos.length > 0
        ? Math.max(...asientos.map((a: any) => a.idAsiento)) + 1
        : 1;

      // Create apuntes based on tipo_asiento
      const apuntes = lineasEditables.map((linea, index) => {
        let importe = 0;

        if (selectedPlantilla?.tipo_asiento === 'simple') {
          importe = parseFloat(formData.importe);
        } else {
          importe = linea.importeIngresado || 0;
        }

        return {
          id: Date.now() + index,
          year: formData.ejercicioYear,
          subconta: formData.subcontaId,
          idAsiento: nextIdAsiento,
          idApunte: index + 1,
          idCuentaDebe: linea.naturaleza === 'DEBE' ? parseInt(linea.cuenta_codigo) : 0,
          idCuentaHaber: linea.naturaleza === 'HABER' ? parseInt(linea.cuenta_codigo) : 0,
          debe: linea.naturaleza === 'DEBE' ? importe : 0,
          haber: linea.naturaleza === 'HABER' ? importe : 0,
          idConcepto: 0,
          descripcion: linea.concepto,
        };
      });

      // Create asiento
      const asientoPayload = {
        id: Date.now(),
        year: formData.ejercicioYear,
        subconta: formData.subcontaId,
        idAsiento: nextIdAsiento,
        date: new Date(formData.fecha),
        apuntes
      };

      const response = await fetch('/api/asientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asientoPayload),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Error al crear asiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPlantilla(null);
    setLineasEditables([]);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      importe: '',
      ejercicioYear: ejercicios[0]?.year || new Date().getFullYear(),
      subcontaId: subcontas[0]?.id.toString() || '',
    });
    setSuccess(false);
    setBalanceError(false);
  };

  const balance = calculateBalance();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Asientos por Plantilla
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea asientos contables usando plantillas predefinidas (simples o compuestas)
        </p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ Asiento creado exitosamente
        </div>
      )}

      {balanceError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          ⚠️ El asiento no está balanceado. Debe = Haber
        </div>
      )}

      {/* Paso 1: Seleccionar Plantilla */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          1️⃣ Seleccionar Plantilla
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Operación
            </label>
            <select
              value={selectedPlantilla ? plantillas.indexOf(selectedPlantilla).toString() : ''}
              onChange={(e) => handlePlantillaSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona una plantilla...</option>
              {plantillas.map((plantilla, index) => (
                <option key={`plantilla-${index}-${plantilla.nombre}`} value={index.toString()}>
                  {plantilla.nombre} ({plantilla.tipo_asiento})
                </option>
              ))}
            </select>
          </div>

          {selectedPlantilla && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Descripción:</strong> {selectedPlantilla.evento}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tipo:</strong>{' '}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedPlantilla.tipo_asiento === 'simple'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {selectedPlantilla.tipo_asiento === 'simple' ? 'Simple (2 cuentas)' : 'Compuesto (múltiples cuentas)'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paso 2: Datos del Asiento */}
      {selectedPlantilla && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2️⃣ Datos del Asiento
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Solo mostrar campo importe único para plantillas simples */}
              {selectedPlantilla.tipo_asiento === 'simple' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Importe (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.importe}
                    onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ejercicio
                </label>
                <select
                  value={formData.ejercicioYear}
                  onChange={(e) => setFormData({ ...formData, ejercicioYear: parseInt(e.target.value) })}
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
                  Subconta
                </label>
                <select
                  value={formData.subcontaId}
                  onChange={(e) => setFormData({ ...formData, subcontaId: e.target.value })}
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
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Apuntes {selectedPlantilla.tipo_asiento === 'compuesto' && '(introduce el importe de cada línea)'}
            </h3>
            <div className="space-y-3">
              {lineasEditables.map((linea, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      linea.naturaleza === 'DEBE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {linea.naturaleza}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={linea.cuenta_codigo}
                      onChange={(e) => updateLineaEditable(index, 'cuenta_codigo', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                      placeholder="Código"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={linea.cuenta_nombre}
                      onChange={(e) => updateLineaEditable(index, 'cuenta_nombre', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                      placeholder="Nombre cuenta"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={linea.concepto}
                      onChange={(e) => updateLineaEditable(index, 'concepto', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                      placeholder="Concepto"
                    />
                  </div>
                  {/* Campo de importe solo para compuestos */}
                  {selectedPlantilla.tipo_asiento === 'compuesto' && (
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={linea.importeIngresado || ''}
                        onChange={(e) => updateLineaEditable(index, 'importeIngresado', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  )}
                  {selectedPlantilla.tipo_asiento === 'simple' && (
                    <div className="col-span-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {linea.importe}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Paso 3: Preview y Confirmación */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3️⃣ Resumen del Asiento
            </h2>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Fecha:</strong> {new Date(formData.fecha).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Ejercicio:</strong> {formData.ejercicioYear}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Subconta:</strong> {formData.subcontaId}
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                {lineasEditables.map((linea, idx) => {
                  const importe = selectedPlantilla?.tipo_asiento === 'simple'
                    ? parseFloat(formData.importe) || 0
                    : linea.importeIngresado || 0;

                  return (
                    <div key={idx} className="flex justify-between py-2">
                      <span className="text-sm">
                        {linea.naturaleza === 'DEBE' ? '↗️' : '↘️'} {linea.cuenta_codigo} - {linea.cuenta_nombre}
                      </span>
                      <span className="text-sm font-semibold">
                        {importe.toFixed(2)}€
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total DEBE:</span>
                    <span className="font-semibold">{balance.debe.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total HABER:</span>
                    <span className="font-semibold">{balance.haber.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Balance:</span>
                    <span className={balance.balanced ? 'text-green-600' : 'text-red-600'}>
                      {balance.balanced ? '✅ Balanceado' : `⚠️ ${(balance.debe - balance.haber).toFixed(2)}€`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !balance.balanced || (selectedPlantilla?.tipo_asiento === 'simple' && !formData.importe)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold"
              >
                {loading ? 'Creando...' : '✅ Crear Asiento'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}