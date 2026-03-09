/**
 * POST /api/razorpay/webhook
 *
 * Razorpay sends signed POST requests here for all payment events.
 * Add this URL in Razorpay Dashboard → Webhooks:
 *   https://franchiseen.vercel.app/api/razorpay/webhook
 *
 * For local testing: use ngrok → https://abc.ngrok.io/api/razorpay/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _platformWalletImport = api.platformWallet // ensures types are generated

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL_STAGING ||
  process.env.NEXT_PUBLIC_CONVEX_URL_PRODUCTION ||
  ''
)

// Next.js 13+ App Router: disable body parsing so we can read raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string = event.event

    console.log('[Razorpay Webhook] Event:', eventType)

    // ── Payment Events ────────────────────────────────────────────────────────
    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity
      const order = await convex.query(api.razorpayManagement.getOrderByRazorpayId, {
        razorpayOrderId: payment.order_id,
      })

      await convex.mutation(api.razorpayManagement.markOrderPaid, {
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
      })

      // If this was a wallet top-up, credit the platform wallet
      if (order?.type === 'platform_wallet_load') {
        await convex.mutation(api.platformWallet.creditWallet, {
          userId: order.payerId,
          amountInPaise: order.amountInPaise,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          description: 'Wallet top-up via Razorpay',
        })
        console.log('[Razorpay Webhook] Wallet credited:', payment.id)
      }

      // If this was an escrow funding contribution, record it
      if (order?.type === 'escrow_funding' && order.franchiseId) {
        await convex.mutation(api.razorpayManagement.recordEscrowContribution, {
          franchiseId: order.franchiseId,
          investorId: order.payerId,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          amountInPaise: order.amountInPaise,
        })
        console.log('[Razorpay Webhook] Escrow contribution recorded:', payment.id)
      }

      console.log('[Razorpay Webhook] Payment captured:', payment.id)
    }

    else if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity
      await convex.mutation(api.razorpayManagement.markOrderFailed, {
        razorpayOrderId: payment.order_id,
        webhookEvent: 'payment.failed',
      })
      console.log('[Razorpay Webhook] Payment failed:', payment.id)
    }

    // ── Payout Events (Razorpay X) ────────────────────────────────────────────
    else if (
      eventType === 'payout.processed' ||
      eventType === 'payout.failed' ||
      eventType === 'payout.reversed' ||
      eventType === 'payout.cancelled'
    ) {
      const payout = event.payload.payout.entity
      const statusMap: Record<string, string> = {
        'payout.processed': 'processed',
        'payout.failed': 'rejected',
        'payout.reversed': 'reversed',
        'payout.cancelled': 'cancelled',
      }
      await convex.mutation(api.razorpayManagement.updatePayoutStatus, {
        razorpayPayoutId: payout.id,
        status: statusMap[eventType] as any,
        failureReason: payout.failure_reason || undefined,
        processedAt: eventType === 'payout.processed' ? Date.now() : undefined,
      })
      console.log('[Razorpay Webhook] Payout event:', eventType, payout.id)
    }

    // ── In-Store QR Payment ───────────────────────────────────────────────────
    else if (eventType === 'payment.captured' && event.payload.payment.entity.description?.includes('qr_')) {
      const payment = event.payload.payment.entity
      await convex.mutation(api.razorpayManagement.markInStorePaymentPaid, {
        razorpayPaymentId: payment.id,
        razorpayQrId: payment.vpa, // QR ID stored in VPA field for QR payments
        paymentMethod: payment.method,
      })
    }

    // ── Transfer Events (Route escrow) ─────────────────────────────────────────
    else if (eventType === 'transfer.processed') {
      // Transfer to franchisor completed — log it
      console.log('[Razorpay Webhook] Transfer processed:', event.payload.transfer?.entity?.id)
    }

    // Return 200 for all events (even unhandled) so Razorpay doesn't retry
    return NextResponse.json({ status: 'ok' })
  } catch (error: unknown) {
    console.error('[Razorpay Webhook] Error:', error)
    // Return 200 to prevent Razorpay retrying — log the error separately
    return NextResponse.json({ status: 'error_logged' })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Razorpay webhook endpoint active' })
}
