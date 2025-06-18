import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'ADMIN') {
      fetchStats();
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session]);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data.announcements || []));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncementForm({ ...announcementForm, [e.target.name]: e.target.value });
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnouncementError('');
    setAnnouncementSuccess('');
    if (!announcementForm.title || !announcementForm.content) {
      setAnnouncementError('Başlık ve içerik zorunlu');
      return;
    }
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcementForm),
    });
    if (!res.ok) {
      setAnnouncementError('Duyuru eklenemedi');
      return;
    }
    setAnnouncementSuccess('Duyuru eklendi');
    setAnnouncementForm({ title: '', content: '' });
    // Listeyi güncelle
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data.announcements || []));
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    setAnnouncements(announcements.filter(a => a.id !== id));
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Paneli</h1>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Kullanıcı
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Randevu
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bugünkü Randevular
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bekleyen Şikayetler
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingComplaints}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Erişim Menüsü */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/admin/users" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Kullanıcı Yönetimi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tüm kullanıcıları görüntüle ve yönet
              </p>
            </div>
          </Link>

          <Link href="/admin/appointments" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Randevu Yönetimi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tüm randevuları görüntüle ve yönet
              </p>
            </div>
          </Link>

          <Link href="/admin/complaints" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Şikayet Yönetimi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Müşteri şikayetlerini görüntüle ve yanıtla
              </p>
            </div>
          </Link>

          <Link href="/admin/services" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Hizmetleri Yönet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Kuaför hizmetlerini ekle, düzenle veya kaldır
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Duyurular</h2>
          <form onSubmit={handleAnnouncementSubmit} className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
            <input
              type="text"
              name="title"
              value={announcementForm.title}
              onChange={handleAnnouncementChange}
              placeholder="Başlık"
              className="border rounded px-3 py-2 w-full md:w-1/4"
              required
            />
            <input
              type="text"
              name="content"
              value={announcementForm.content}
              onChange={handleAnnouncementChange}
              placeholder="İçerik"
              className="border rounded px-3 py-2 w-full md:w-1/2"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Ekle
            </button>
          </form>
          {announcementError && <div className="text-red-600 mb-2">{announcementError}</div>}
          {announcementSuccess && <div className="text-green-600 mb-2">{announcementSuccess}</div>}
          <ul className="divide-y divide-gray-200">
            {announcements.map(a => (
              <li key={a.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold">{a.title}:</span> <span>{a.content}</span>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  Sil
                </button>
              </li>
            ))}
            {announcements.length === 0 && <li className="text-gray-500 py-2">Henüz duyuru yok.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
} 