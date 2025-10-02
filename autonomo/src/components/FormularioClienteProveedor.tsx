'use client';

import { useState } from 'react';
import { ClienteProveedor } from '@/types';
import { X } from 'lucide-react';

interface Props {
  tipo: 'cliente' | 'proveedor';
  datosIniciales?: ClienteProveedor;
  onGuardar: (datos: Partial<ClienteProveedor>) => void;
  onCancelar: () => void;
}

export default function FormularioClienteProveedor({
  tipo,
  datosIniciales,
  onGuardar,
  onCancelar,
}: Props) {
  const [formData, setFormData] = useState<Partial<ClienteProveedor>>(
    datosIniciales || {
      tipo,
      nif: '',
      nombre: '',
      razonSocial: '',
      domicilioFiscal: {
        calle: '',
        numero: '',
        codigoPostal: '',
        poblacion: '',
        provincia: '',
        pais: 'España',
      },
      telefono: '',
      email: '',
      tipoEntidad: 'fisica',
      paisResidenciaFiscal: 'España',
      formaPago: 'transferencia',
      plazoPago: 30,
      contactos: [],
      visitas: [],
      comunicaciones: [],
      emails: [],
      documentos: [],
      fechaAlta: new Date(),
      volumenFacturacionAnual: 0,
      numeroFacturas: 0,
      importeMedioFactura: 0,
      estado: 'activo',
      riesgoImpago: 'bajo',
      valoracion: 'B',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      domicilioFiscal: {
        ...prev.domicilioFiscal!,
        [name]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {datosIniciales ? 'Editar' : 'Nuevo'}{' '}
            {tipo === 'cliente' ? 'Cliente' : 'Proveedor'}
          </h2>
          <button
            onClick={onCancelar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Obligatorios AEAT */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Datos Obligatorios (AEAT)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  NIF/CIF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo de Entidad <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoEntidad"
                  value={formData.tipoEntidad}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="fisica">Persona Física</option>
                  <option value="juridica">Persona Jurídica</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  País de Residencia Fiscal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="paisResidenciaFiscal"
                  value={formData.paisResidenciaFiscal}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <h4 className="mb-3 mt-6 font-semibold text-gray-900">
              Domicilio Fiscal
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Calle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="calle"
                  value={formData.domicilioFiscal?.calle}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.domicilioFiscal?.numero}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={formData.domicilioFiscal?.codigoPostal}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Población <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="poblacion"
                  value={formData.domicilioFiscal?.poblacion}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Provincia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="provincia"
                  value={formData.domicilioFiscal?.provincia}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  País <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pais"
                  value={formData.domicilioFiscal?.pais}
                  onChange={handleDomicilioChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Datos Comerciales */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Datos Comerciales
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  name="nombreComercial"
                  value={formData.nombreComercial || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Sector/Actividad
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Forma de Pago
                </label>
                <select
                  name="formaPago"
                  value={formData.formaPago}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="pagare">Pagaré</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Plazo de Pago (días)
                </label>
                <input
                  type="number"
                  name="plazoPago"
                  value={formData.plazoPago}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cuenta Bancaria (IBAN)
                </label>
                <input
                  type="text"
                  name="cuentaBancaria"
                  value={formData.cuentaBancaria || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descuentos (%)
                </label>
                <input
                  type="number"
                  name="descuentos"
                  value={formData.descuentos || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Condiciones Especiales
                </label>
                <textarea
                  name="condicionesEspeciales"
                  value={formData.condicionesEspeciales || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notas Internas
                </label>
                <textarea
                  name="notasInternas"
                  value={formData.notasInternas || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Histórico y Análisis */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Histórico y Análisis
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Riesgo de Impago
                </label>
                <select
                  name="riesgoImpago"
                  value={formData.riesgoImpago}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Valoración
                </label>
                <select
                  name="valoracion"
                  value={formData.valoracion}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="A">A - Alta importancia</option>
                  <option value="B">B - Media importancia</option>
                  <option value="C">C - Baja importancia</option>
                </select>
              </div>

              {formData.estado !== 'activo' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Motivo de Inactividad/Bloqueo
                  </label>
                  <input
                    type="text"
                    name="motivoInactividad"
                    value={formData.motivoInactividad || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
