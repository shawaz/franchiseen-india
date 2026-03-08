/**
 * POST /api/razorpay/verify-payment
 *
 * Called client-side after Razorpay checkout completes successfully.
 * Verifies the payment signature and marks the order as paid in Convex.
 * This is the LOCAL fallback for when webhook hasn't fired yet.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL_STAGING ||
  process.env.NEXT_PUBLIC_CONVEX_URL_PRODUCTION ||
  ''
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing fields: razorpayOrderId, razorpayPaymentId, razorpaySignature' },
        { status: 400 }
      )
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    if (!isValid) {
      console.error('[Razorpay] Invalid signature for order:', razorpayOrderId)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Mark order as paid in Convex
    await convex.mutation(api.razorpayManagement.markOrderPaid, {
      razorpayOrderId,
      razorpayPaymentId,
    })

    console.log('[Razorpay] Payment verified:', razorpayPaymentId)
    return NextResponse.json({ success: true, paymentId: razorpayPaymentId })
  } catch (error: unknown) {
    console.error('[Razorpay] verify-payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}
