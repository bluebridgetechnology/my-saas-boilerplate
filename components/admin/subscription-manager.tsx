"use client"

import { useState } from 'react'
import { Icon } from '@iconify/react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  email: string
  name?: string
  plan_name?: string
  subscription_status?: string
  subscription_expires_at?: string
}

interface SubscriptionManagerProps {
  user: User
  onUpdate: () => void
}

export function SubscriptionManager({ user, onUpdate }: SubscriptionManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [planName, setPlanName] = useState(user.plan_name || 'free')
  const [subscriptionStatus, setSubscriptionStatus] = useState(user.subscription_status || 'inactive')
  const [expiresAt, setExpiresAt] = useState(
    user.subscription_expires_at 
      ? new Date(user.subscription_expires_at).toISOString().split('T')[0]
      : ''
  )

  const handleUpdateSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_name: planName,
          subscription_status: subscriptionStatus,
          expires_at: expiresAt || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      setIsOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription')
      }

      setIsOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error removing subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentPlanBadge = () => {
    const plan = user.plan_name || 'free'
    const status = user.subscription_status || 'inactive'
    
    if (plan === 'pro' && status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Pro Active</Badge>
    } else if (plan === 'pro' && status === 'cancelled') {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Pro Cancelled</Badge>
    } else if (plan === 'pro' && status === 'expired') {
      return <Badge variant="outline" className="text-red-600 border-red-200">Pro Expired</Badge>
    } else {
      return <Badge variant="outline">Free</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="solar:crown-bold-duotone" className="h-4 w-4 mr-2" />
          Manage Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Update subscription for {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Current Plan:</Label>
            {getCurrentPlanBadge()}
          </div>
          
          {user.subscription_expires_at && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Expires:</span>
              <span>{new Date(user.subscription_expires_at).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={planName} onValueChange={setPlanName}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {planName === 'pro' && subscriptionStatus === 'active' && (
            <div className="space-y-2">
              <Label htmlFor="expires">Expires At (Optional)</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleRemoveSubscription}
            disabled={isLoading}
            className="flex items-center"
          >
            <Icon icon="solar:trash-bin-minimalistic-bold-duotone" className="h-4 w-4 mr-2" />
            Remove Subscription
          </Button>
          <Button onClick={handleUpdateSubscription} disabled={isLoading} className="flex items-center">
            {isLoading ? (
              <Icon icon="solar:loading-bold-duotone" className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 mr-2" />
            )}
            Update Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
