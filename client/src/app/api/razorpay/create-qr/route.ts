/**
 * POST /api/razorpay/create-qr
 * Generates a UPI QR code for in-store payments at a franchise outlet.
 * Phase 3 — In-Store Payments
 */
import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, rupeesToPaise } from '@/lib/razorpay'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL_STAGING ||
  process.env.NEXT_PUBLIC_CONVEX_URL_PRODUCTION ||
  ''
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amountInr,      // number — sale amount in INR (optional for open QR)
      franchiseId,    // Convex franchise ID
      cashierId,      // Convex user ID of cashier
      description,    // shown on customer's UPI app
      customerPhone,
      customerEmail,
    } = body

    if (!franchiseId) {
      return NextResponse.json({ error: 'franchiseId is required' }, { status: 400 })
    }

    const razorpay = getRazorpayInstance()

    // Create a Razorpay QR Code
    const qrPayload: any = {
      type: 'upi_qr',
      name: description || 'Franchise Store Payment',
      usage: 'single_use',     // fresh QR per transaction
      fixed_amount: !!amountInr,
      payment_amount: amountInr ? rupeesToPaise(amountInr) : undefined,
      description: description || 'In-store payment',
      close_by: Math.floor(Date.now() / 1000) + 600, // expires in 10 minutes
    }

    const qr = await (razorpay.qrCode as any).create(qrPayload)

    // Save in-store payment record to Convex
    const recordId = await convex.mutation(api.razorpayManagement.saveInStorePayment, {
      franchiseId: franchiseId as Id<'franchises'>,
      cashierId: cashierId as Id<'users'> | undefined,
      amountInPaise: amountInr ? rupeesToPaise(amountInr) : 0,
      razorpayQrId: qr.id,
      customerPhone,
      customerEmail,
    })

    return NextResponse.json({
      qrId: qr.id,
      qrImageUrl: qr.image_url,
      shortUrl: qr.short_url,
      recordId,
      expiresAt: qr.close_by * 1000,
    })
  } catch (error: unknown) {
    console.error('[Razorpay] create-qr error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create QR' },
      { status: 500 }
    )
  }
}
