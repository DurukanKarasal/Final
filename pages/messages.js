import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ receiver: '', content: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []));
    }
  }, [status]);

  if (status === 'loading') return <div>Yükleniyor...</div>;
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.receiver || !form.content) {
      setError('Alıcı ve mesaj zorunlu');
      return;
    }
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver: form.receiver, content: form.content }),
    });
    if (!res.ok) {
      setError('Mesaj gönderilemedi');
      return;
    }
    setSuccess('Mesaj gönderildi');
    setForm({ receiver: '', content: '' });
    // Mesajları güncelle
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));
  };

  const incoming = messages.filter(m => m.receiver.email === session.user.email);
  const outgoing = messages.filter(m => m.sender.email === session.user.email);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mesajlar</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col md:flex-row gap-2 md:items-end">
        <select
          name="receiver"
          value={form.receiver}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full md:w-1/3"
          required
        >
          <option value="">Alıcı Seç</option>
          {users.filter(u => u.id !== session.user.id).map(u => (
            <option key={u.id} value={u.id}>{u.email}</option>
          ))}
        </select>
        <input
          type="text"
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Mesajınız"
          className="border rounded px-3 py-2 w-full md:w-1/2"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Gönder
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="text-lg font-bold mb-2">Gelen Mesajlar</h2>
        <ul className="divide-y divide-gray-200">
          {incoming.length === 0 && <li className="text-gray-500 py-2">Henüz gelen mesaj yok.</li>}
          {incoming.map(m => (
            <li key={m.id} className="py-2">
              <span className="font-semibold">{m.sender.email}</span>
              {': '}
              <span>{m.content}</span>
              <span className="ml-2 text-xs text-gray-500">({new Date(m.createdAt).toLocaleString('tr-TR')})</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-bold mb-2">Giden Mesajlar</h2>
        <ul className="divide-y divide-gray-200">
          {outgoing.length === 0 && <li className="text-gray-500 py-2">Henüz giden mesaj yok.</li>}
          {outgoing.map(m => (
            <li key={m.id} className="py-2">
              <span className="font-semibold">{m.receiver.email}</span>
              {': '}
              <span>{m.content}</span>
              <span className="ml-2 text-xs text-gray-500">({new Date(m.createdAt).toLocaleString('tr-TR')})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 