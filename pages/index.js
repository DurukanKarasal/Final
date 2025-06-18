import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ComplaintForm from '../components/ComplaintForm';
import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

export default function Home() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setAvgRating(data.avgRating);
      });
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data.announcements || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Hoş Geldiniz</span>
            <span className="block text-indigo-600">Kuaför Salonumuza</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Profesyonel kuaförlerimiz ile size en iyi hizmeti sunmak için buradayız.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {session ? (
              <div className="rounded-md shadow">
                <Link
                  href="/appointments/new"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Randevu Al
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Duyurular */}
        {announcements.length > 0 && (
          <section className="max-w-3xl mx-auto mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <h2 className="text-lg font-bold mb-2 text-yellow-800">Duyurular</h2>
              <ul className="space-y-1">
                {announcements.map(a => (
                  <li key={a.id}>
                    <span className="font-semibold">{a.title}:</span> <span>{a.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Services Section */}
        <section className="max-w-4xl mx-auto my-12 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-4">
            Hizmetlerimiz
            {avgRating && (
              <span className="flex items-center text-yellow-500 text-lg ml-4">
                <StarIcon className="h-6 w-6" />
                <span className="ml-1 font-semibold">{avgRating.toFixed(1)}</span>
                <span className="ml-1 text-gray-500 text-base">/ 5</span>
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.length === 0 && <div className="text-gray-500">Henüz hizmet eklenmemiş.</div>}
            {services.map(service => (
              <div key={service.id} className="border rounded p-4 flex flex-col gap-2">
                <div className="font-semibold text-lg">{service.name}</div>
                {service.description && <div className="text-gray-600">{service.description}</div>}
                <div className="text-indigo-600 font-bold">₺{service.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* İletişim ve Şikayet Bölümü */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* İletişim Bilgileri */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">İletişim</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Adres</h3>
                    <p className="mt-1 text-gray-600">Alparslan, Beşyol Sk. No:1 İç kapı no. F,</p>
                    <p className="mt-1 text-gray-600">55400 Alaçam/Samsun</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Telefon</h3>
                    <p className="mt-1 text-gray-600">0538 832 86 16</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">E-posta</h3>
                    <p className="mt-1 text-gray-600">kemalyaman@gmail.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Çalışma Saatleri</h3>
                    <p className="mt-1 text-gray-600">Pazartesi - Cumartesi: 09:00 - 18:00</p>
                    <p className="mt-1 text-gray-600">Pazar: Kapalı</p>
                  </div>
                </div>
              </div>

              {/* Şikayet Formu */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Şikayet ve Önerileriniz</h2>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <ComplaintForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 