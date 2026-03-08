import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, getRazorpayPublicKeyId, rupeesToPaise } from '@/lib/razorpay'
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
      amountInr,      // number — e.g. 50000 (₹50,000)
      type,           // 'franchise_fee' | 'setup_cost' | 'working_capital' | 'in_store'
      payerId,        // Convex user ID
      franchiseId,    // optional Convex franchise ID
      franchiserId,   // optional Convex franchiser ID
      notes,          // optional key-value notes shown on Razorpay checkout
    } = body

    if (!amountInr || !type || !payerId) {
      return NextResponse.json(
        { error: 'Missing required fields: amountInr, type, payerId' },
        { status: 400 }
      )
    }

    const razorpay = getRazorpayInstance()
    const amountInPaise = rupeesToPaise(amountInr)
    const receiptId = `rcpt_${franchiseId || payerId}_${Date.now()}`

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId.substring(0, 40), // Razorpay receipt max 40 chars
      notes: notes || {},
    })

    // Save order to Convex
    await convex.mutation(api.razorpayManagement.saveOrder, {
      razorpayOrderId: order.id,
      receiptId,
      payerId: payerId as Id<'users'>,
      franchiseId: franchiseId as Id<'franchises'> | undefined,
      franchiserId: franchiserId as Id<'franchiser'> | undefined,
      type,
      amountInPaise,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayPublicKeyId(),
      receiptId,
    })
  } catch (error: unknown) {
    console.error('[Razorpay] create-order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
