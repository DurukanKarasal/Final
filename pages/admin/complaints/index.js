import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminComplaints() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }

    fetchComplaints();
  }, [session, status]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/admin/complaints');
      if (!response.ok) {
        throw new Error('Şikayetler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setComplaints(data.complaints);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Şikayetler</h1>
      
      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{complaint.name || 'İsimsiz'}</p>
                <p className="text-sm text-gray-600">{complaint.email}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {complaint.status}
              </span>
            </div>
            
            <p className="text-gray-700 mb-2">{complaint.message}</p>
            
            {complaint.response && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm font-semibold">Yanıt:</p>
                <p className="text-sm text-gray-600">{complaint.response}</p>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              {new Date(complaint.createdAt).toLocaleString('tr-TR')}
            </div>
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-center text-gray-500">
            Henüz şikayet bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
} 