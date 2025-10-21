"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

interface ProAccessGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProAccessGuard({ children, fallback }: ProAccessGuardProps) {
  const authContext = useAuth();
  const { profile, loading } = authContext || { profile: null, loading: false };
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && profile !== undefined) {
      // Check if user has pro access
      const isPro = ((profile?.plan_name === 'Pro' || profile?.plan_name === 'pro') && 
                     (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')) || 
                     profile?.is_admin === true
      
      console.log('ProAccessGuard - Profile:', profile)
      console.log('ProAccessGuard - Is Pro:', isPro)
      console.log('ProAccessGuard - Plan:', profile?.plan_name)
      console.log('ProAccessGuard - Status:', profile?.subscription_status)
      console.log('ProAccessGuard - Is Admin:', profile?.is_admin)
      
      setHasAccess(isPro)
    }
  }, [profile, loading])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Icon icon="solar:loading-bold-duotone" className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (hasAccess === false) {
    return fallback || (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:crown-bold-duotone" className="h-5 w-5 text-yellow-600" />
            Pro Feature
          </CardTitle>
          <CardDescription>
            This feature requires a Pro subscription to access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to unlock advanced image processing features and remove limitations.
            </p>
            <Button asChild>
              <Link href="/pricing">
                <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}