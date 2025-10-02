'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Company } from '@/types';

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre_razon_social: '',
    nif_cif: '',
    direccion_fiscal: '',
    logo_url: '',
    apikey_ia: '',
    certificado_verifactu: '',
    certificado_facturae: '',
    iban: ''
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      if (data && !data.error) {
        setCompany(data);
        setFormData({
          nombre_razon_social: data.nombre_razon_social || '',
          nif_cif: data.nif_cif || '',
          direccion_fiscal: data.direccion_fiscal || '',
          logo_url: data.logo_url || '',
          apikey_ia: data.apikey_ia || '',
          certificado_verifactu: data.certificado_verifactu || '',
          certificado_facturae: data.certificado_facturae || '',
          iban: data.iban || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = company ? 'PUT' : 'POST';
      await fetch('/api/company', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchCompany();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-3xl font-bold">Datos de la Empresa</h1>
          </div>
          {company && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Editar
            </button>
          )}
        </div>

        {(!company || isEditing) ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {company ? 'Editar Empresa' : 'Configurar Empresa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Razón Social *</label>
                  <input
                    type="text"
                    value={formData.nombre_razon_social}
                    onChange={(e) => setFormData({ ...formData, nombre_razon_social: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIF/CIF *</label>
                  <input
                    type="text"
                    value={formData.nif_cif}
                    onChange={(e) => setFormData({ ...formData, nif_cif: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Dirección Fiscal *</label>
                  <input
                    type="text"
                    value={formData.direccion_fiscal}
                    onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">IBAN</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL del Logo</label>
                  <input
                    type="text"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">API Key IA</label>
                  <input
                    type="password"
                    value={formData.apikey_ia}
                    onChange={(e) => setFormData({ ...formData, apikey_ia: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Certificado Verifactu</label>
                  <textarea
                    value={formData.certificado_verifactu}
                    onChange={(e) => setFormData({ ...formData, certificado_verifactu: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 font-mono text-xs"
                    rows={4}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Certificado Facturae</label>
                  <textarea
                    value={formData.certificado_facturae}
                    onChange={(e) => setFormData({ ...formData, certificado_facturae: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 font-mono text-xs"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  {company ? 'Actualizar' : 'Crear'}
                </button>
                {company && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Razón Social</h3>
                <p className="text-lg">{company.nombre_razon_social}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">NIF/CIF</h3>
                <p className="text-lg">{company.nif_cif}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dirección Fiscal</h3>
                <p className="text-lg">{company.direccion_fiscal}</p>
              </div>
              {company.iban && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">IBAN</h3>
                  <p className="text-lg font-mono">{company.iban}</p>
                </div>
              )}
              {company.logo_url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Logo</h3>
                  <p className="text-sm text-blue-600">{company.logo_url}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">API Key IA</h3>
                  <p className="text-sm">{company.apikey_ia ? '••••••••' : 'No configurada'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Certificado Verifactu</h3>
                  <p className="text-sm">{company.certificado_verifactu ? '✅ Configurado' : '❌ No configurado'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Certificado Facturae</h3>
                  <p className="text-sm">{company.certificado_facturae ? '✅ Configurado' : '❌ No configurado'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
