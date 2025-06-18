import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ComplaintForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Giriş yapmış kullanıcının bilgilerini otomatik doldur
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Form verilerini kontrol et
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Lütfen şikayetinizi yazın' });
      setLoading(false);
      return;
    }

    if (!session && (!formData.name.trim() || !formData.email.trim())) {
      setStatus({ type: 'error', message: 'Lütfen isim ve e-posta adresinizi girin' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      setStatus({ type: 'success', message: 'Şikayetiniz başarıyla gönderildi' });
      setFormData(prev => ({ ...prev, message: '' })); // Sadece mesajı temizle
    } catch (error) {
      console.error('Complaint submission error:', error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!session && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              İsim
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="ornek@email.com"
            />
          </div>
        </>
      )}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Şikayetiniz
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Şikayet veya önerinizi buraya yazabilirsiniz..."
        />
      </div>

      {status.message && (
        <div className={`p-4 rounded-md ${
          status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Gönderiliyor...' : 'Şikayet Gönder'}
      </button>
    </form>
  );
} 