'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: { color?: string }
  notes?: Record<string, string>
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  close: () => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutProps {
  // Payment details
  amountInr: number
  type: 'franchise_fee' | 'setup_cost' | 'working_capital' | 'platform_subscription' | 'in_store' | 'platform_wallet_load'
  description: string

  // Convex IDs
  payerId: string
  franchiseId?: string
  franchiserId?: string

  // Prefill
  prefill?: {
    name?: string
    email?: string
    phone?: string
  }

  // Callbacks
  onSuccess?: (paymentId: string, orderId: string) => void
  onFailure?: (error: string) => void
  onDismiss?: () => void

  // UI
  children: React.ReactNode  // trigger button / element
  disabled?: boolean
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function RazorpayCheckout({
  amountInr,
  type,
  description,
  payerId,
  franchiseId,
  franchiserId,
  prefill,
  onSuccess,
  onFailure,
  onDismiss,
  children,
  disabled = false,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const openCheckout = useCallback(async () => {
    if (disabled || isLoading) return
    setIsLoading(true)

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your connection.')
        setIsLoading(false)
        return
      }

      // 2. Create order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInr,
          type,
          payerId,
          franchiseId,
          franchiserId,
          notes: { description },
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        toast.error(orderData.error || 'Failed to create payment order')
        setIsLoading(false)
        return
      }

      // 3. Open Razorpay Checkout
      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Franchiseen',
        description,
        order_id: orderData.orderId,
        prefill: {
          name: prefill?.name,
          email: prefill?.email,
          contact: prefill?.phone,
        },
        theme: { color: '#000000' },
        notes: { type, franchiseId: franchiseId || '', franchiserId: franchiserId || '' },

        handler: async (response: RazorpayResponse) => {
          // 4. Verify signature on server
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment successful!')
              onSuccess?.(response.razorpay_payment_id, response.razorpay_order_id)
            } else {
              toast.error('Payment verification failed. Please contact support.')
              onFailure?.(verifyData.error || 'Verification failed')
            }
          } catch {
            toast.error('Payment recorded but verification call failed. Please contact support.')
          }
          setIsLoading(false)
        },

        modal: {
          ondismiss: () => {
            setIsLoading(false)
            onDismiss?.()
          },
        },
      })

      razorpay.open()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      toast.error(message)
      onFailure?.(message)
      setIsLoading(false)
    }
  }, [amountInr, type, description, payerId, franchiseId, franchiserId, prefill, onSuccess, onFailure, onDismiss, disabled, isLoading])

  return (
    <div
      onClick={openCheckout}
      className={isLoading || disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Opening payment...</span>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

// ── In-Store QR Component ─────────────────────────────────────────────────────

interface InStoreQRProps {
  amountInr?: number       // optional — if not set, customer enters amount
  franchiseId: string
  cashierId?: string
  description?: string
  onPaymentReceived?: (paymentId: string) => void
}

export function InStoreQRPayment({
  amountInr,
  franchiseId,
  cashierId,
  description,
  onPaymentReceived,
}: InStoreQRProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  const generateQR = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/razorpay/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountInr, franchiseId, cashierId, description }),
      })
      const data = await res.json()
      if (res.ok) {
        setQrUrl(data.qrImageUrl)
        setExpiresAt(data.expiresAt)
      } else {
        toast.error(data.error || 'Failed to generate QR')
      }
    } catch {
      toast.error('Failed to generate QR code')
    }
    setIsLoading(false)
  }

  const minutesLeft = expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / 60000)) : null

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!qrUrl ? (
        <button
          onClick={generateQR}
          disabled={isLoading}
          className="px-6 py-3 bg-black text-white rounded-lg font-medium disabled:opacity-60"
        >
          {isLoading ? 'Generating QR...' : 'Generate UPI QR'}
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {amountInr ? `₹${amountInr.toLocaleString('en-IN')}` : 'Open amount'} —
            scan with any UPI app
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="UPI QR Code" className="w-56 h-56" />
          {minutesLeft !== null && (
            <p className="text-xs text-gray-400">Expires in ~{minutesLeft} min</p>
          )}
          <button
            onClick={generateQR}
            className="text-sm text-gray-500 underline"
          >
            Generate new QR
          </button>
        </>
      )}
    </div>
  )
}
