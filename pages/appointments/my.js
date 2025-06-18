import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { StarIcon } from '@heroicons/react/20/solid';

export default function MyAppointments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingLoading, setRatingLoading] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchAppointments = async () => {
        try {
          const res = await fetch('/api/appointments/list');
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Bir hata oluştu');
          }

          setAppointments(data.appointments);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAppointments();
    }
  }, [status]);

  // Oturum kontrolü
  if (status === 'loading') {
    return <div>Yükleniyor...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const handleCancel = async (appointmentId) => {
    if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      // Randevuları güncelle
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'CANCELLED' }
          : apt
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRate = async (appointmentId, rating) => {
    setRatingLoading(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: Number(rating) }),
      });
      if (!res.ok) throw new Error('Puanlama başarısız');
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, rating: Number(rating) } : apt
      ));
    } catch (err) {
      setError('Puanlama başarısız');
    } finally {
      setRatingLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Bekliyor',
      CONFIRMED: 'Onaylandı',
      CANCELLED: 'İptal Edildi',
      COMPLETED: 'Tamamlandı'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Randevularım</h1>
        <button
          onClick={() => router.push('/appointments/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Yeni Randevu
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div>Randevular yükleniyor...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz randevunuz bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="text-lg font-medium">
                        {appointment.timeSlot}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    {appointment.note && (
                      <p className="text-gray-500">{appointment.note}</p>
                    )}
                    {appointment.status === 'COMPLETED' && (
                      <div className="flex items-center mt-2">
                        {appointment.rating ? (
                          <span className="text-yellow-500 flex items-center">
                            {Array.from({ length: appointment.rating }).map((_, i) => (
                              <StarIcon key={i} className="h-5 w-5" />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">Puanınız</span>
                          </span>
                        ) : (
                          <>
                            {[1,2,3,4,5].map(star => (
                              <button
                                key={star}
                                onClick={() => handleRate(appointment.id, star)}
                                className={`text-yellow-400 hover:text-yellow-600 focus:outline-none ${ratingLoading === appointment.id ? 'opacity-50 pointer-events-none' : ''}`}
                                disabled={ratingLoading === appointment.id}
                              >
                                <StarIcon className="h-6 w-6" />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">Puanla</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 