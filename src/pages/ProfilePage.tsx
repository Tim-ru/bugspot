import React, { useEffect, useState } from 'react';

interface UserProfileResponse {
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  api_key: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('bugspot_token');
    if (!token) return;
    fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(data => data && setUser(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile & Subscription</h2>
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-medium capitalize">{user.plan}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">API Key</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{user.api_key}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Loading profile...</p>
        )}
      </div>
    </div>
  );
}


