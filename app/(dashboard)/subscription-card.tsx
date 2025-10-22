'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from '@/lib/types/database';
import { CreditCard, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionCardProps {
  userData: User;
}

export default function SubscriptionCard({ userData }: SubscriptionCardProps) {
  const router = useRouter();
  const isPro = userData.subscription_status === 'active' || userData.subscription_status === 'trialing';

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create customer portal session');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
    }
  };

  return (
    <Card className="mb-8 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {userData?.plan_name || 'Free Plan'}
                </h3>
                {isPro && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {userData?.subscription_status === 'active'
                  ? 'Billed monthly • Next billing date: ' + new Date().toLocaleDateString()
                  : userData?.subscription_status === 'trialing'
                  ? 'Trial period • Upgrade anytime'
                  : 'No active subscription • Upgrade to unlock Pro features'}
              </p>
            </div>
            <div className="flex gap-2">
              {userData?.stripe_customer_id && (
                <Button onClick={handleManageBilling} variant="outline" size="sm">
                  Manage Billing
                </Button>
              )}
              {!isPro && (
                <Link href="/pricing">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
