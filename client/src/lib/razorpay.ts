/**
 * Razorpay server-side helpers
 * Uses _STAGING / _PRODUCTION suffixed env vars picked by hostname at runtime.
 * In API routes (server-side), we can't use window.location, so we use a
 * RAZORPAY_ENV env var to signal which set of keys to use, OR fall back to
 * checking if the staging key exists.
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

function getRazorpayEnv(): 'staging' | 'production' {
  // Set RAZORPAY_ENV=production in your Vercel production environment
  return (process.env.RAZORPAY_ENV as 'staging' | 'production') || 'staging'
}

export function getRazorpayInstance(): Razorpay {
  const env = getRazorpayEnv()
  const keyId =
    env === 'production'
      ? process.env.RAZORPAY_KEY_ID_PRODUCTION!
      : process.env.RAZORPAY_KEY_ID_STAGING!
  const keySecret =
    env === 'production'
      ? process.env.RAZORPAY_KEY_SECRET_PRODUCTION!
      : process.env.RAZORPAY_KEY_SECRET_STAGING!

  if (!keyId || !keySecret) {
    throw new Error(`[Razorpay] Missing keys for environment: ${env}`)
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function getRazorpayPublicKeyId(): string {
  const env = getRazorpayEnv()
  return env === 'production'
    ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_PRODUCTION!
    : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_STAGING!
}

export function getWebhookSecret(): string {
  const env = getRazorpayEnv()
  return env === 'production'
    ? process.env.RAZORPAY_WEBHOOK_SECRET_PRODUCTION!
    : process.env.RAZORPAY_WEBHOOK_SECRET_STAGING!
}

/** Verify Razorpay payment signature (post-checkout client-side verification) */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const env = getRazorpayEnv()
  const keySecret =
    env === 'production'
      ? process.env.RAZORPAY_KEY_SECRET_PRODUCTION!
      : process.env.RAZORPAY_KEY_SECRET_STAGING!

  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')

  return expectedSignature === params.razorpaySignature
}

/** Verify Razorpay webhook signature */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getWebhookSecret()
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return expectedSignature === signature
}

/** Convert rupees to paise (Razorpay uses smallest currency unit) */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/** Convert paise to rupees */
export function paiseToRupees(paise: number): number {
  return paise / 100
}

/** Format INR amount for display */
export function formatInr(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}
