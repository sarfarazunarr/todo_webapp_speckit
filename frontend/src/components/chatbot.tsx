'use client';

import { useAuth, authFetch } from '@/lib/auth';
import { ChatKit } from '@openai/chatkit-react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function Chatbot() {
  const { token } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      setError(null);
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/session`,
          { method: 'POST' },
          token
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch client secret.');
        }
        const data = await response.json();
        setClientSecret(data.client_secret);
      } catch (error: any) {
        console.error(error);
        setError(error.message);
      }
    };

    if (token) {
      fetchClientSecret();
    }
  }, [token]);

  if (error) {
    return (
        <Card className="w-[400px] h-[500px]">
            <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
            </CardContent>
        </Card>
    );
  }

  if (!clientSecret) {
    return (
        <Card className="w-[400px] h-[500px]">
            <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="mt-4 text-muted-foreground">Connecting to AI Assistant...</p>
            </CardContent>
        </Card>
    );
  }

  return <div className="w-[400px] h-[500px]"><ChatKit clientSecret={clientSecret} /></div>;
}
