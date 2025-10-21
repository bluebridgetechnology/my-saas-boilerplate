'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth/supabase-client';

export function AuthDebug() {
  const { user, profile, session, loading, refreshProfile, syncAuthFromAPI } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);

  const refreshData = () => {
    // Check localStorage for Supabase session
    const keys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'));
    const data = keys.map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`).join('\n');
    setLocalStorageData(data);

    // Test the API endpoint
    fetch('/api/user/pro-access')
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => setApiResponse({ error: err.message }));
  };

  const forceSessionRefresh = async () => {
    try {
      console.log('Forcing session refresh...');
      
      // Try to get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Force session result:', { session: !!session, error });
      
      if (session) {
        console.log('Found session, storing manually...');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
        const storageKey = `sb-${projectId}-auth-token`;
        
        localStorage.setItem(storageKey, JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
          user: session.user
        }));
        
        console.log('Session stored manually with key:', storageKey);
        refreshData();
        
        // Trigger auth state change
        window.location.reload();
      } else {
        console.log('No session found, trying sync from API...');
        await syncAuthFromAPI();
      }
    } catch (error) {
      console.error('Error forcing session refresh:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Temporarily hidden - can be re-enabled by changing this to false
  if (process.env.NODE_ENV !== 'development' || true) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={refreshData}
            className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button 
            onClick={refreshProfile}
            className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
          >
            Refresh Auth
          </button>
          <button 
            onClick={syncAuthFromAPI}
            className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
          >
            Sync from API
          </button>
          <button 
            onClick={forceSessionRefresh}
            className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
          >
            Force Session
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user?.id || 'null'}</div>
        <div>Profile: {profile?.email || 'null'}</div>
        <div>Session: {session ? 'exists' : 'null'}</div>
        <div>Plan: {profile?.plan_name || 'null'}</div>
        <div>Status: {profile?.subscription_status || 'null'}</div>
        <div>Is Admin: {profile?.is_admin ? 'true' : 'false'}</div>
      </div>
      
      <details className="mt-2">
        <summary className="cursor-pointer">API Response</summary>
        <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
      </details>
      
      <details className="mt-2">
        <summary className="cursor-pointer">LocalStorage</summary>
        <pre className="text-xs mt-1 whitespace-pre-wrap">{localStorageData}</pre>
      </details>
    </div>
  );
}