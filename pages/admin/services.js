import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'ADMIN') {
      fetchServices();
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      setError('Hizmetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        }),
      });
      if (!res.ok) throw new Error('Hizmet eklenemedi');
      setForm({ name: '', description: '', price: '' });
      fetchServices();
    } catch (err) {
      setError('Hizmet eklenemedi');
    }
  };

  const handleEdit = (service) => {
    setEditing(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/services/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
        }),
      });
      if (!res.ok) throw new Error('Hizmet güncellenemedi');
      setEditing(null);
      setForm({ name: '', description: '', price: '' });
      fetchServices();
    } catch (err) {
      setError('Hizmet güncellenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Hizmet silinemedi');
      fetchServices();
    } catch (err) {
      setError('Hizmet silinemedi');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
    router.push('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hizmetleri Yönet</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Admin Paneline Dön
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={editing ? handleUpdate : handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Hizmet Adı"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Açıklama (opsiyonel)"
            value={form.description}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="number"
            name="price"
            placeholder="Fiyat"
            value={form.price}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
            min="0"
            step="0.01"
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {editing ? 'Güncelle' : 'Ekle'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '' }); }}
              className="col-span-1 md:col-span-3 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              İptal
            </button>
          )}
        </form>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{service.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₺{service.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(service)}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded mr-2 hover:bg-yellow-200"
                    >Düzenle</button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                    >Sil</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-4">Henüz hizmet eklenmemiş.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 