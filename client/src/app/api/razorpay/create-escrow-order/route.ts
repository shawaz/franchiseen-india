/**
 * POST /api/razorpay/create-escrow-order
 *
 * Creates a Razorpay order for an investor contributing to franchise escrow.
 * Call this before showing the Razorpay checkout modal.
 *
 * Body:
 *   investorId   – Convex user ID of the investor
 *   franchiseId  – Convex franchise ID
 *   sharesPurchased – number of shares to purchase
 *   sharePrice   – INR per share (must match investment record)
 */
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
    const { investorId, franchiseId, sharesPurchased, sharePrice } = body

    if (!investorId || !franchiseId || !sharesPurchased || !sharePrice) {
      return NextResponse.json(
        { error: 'Missing required fields: investorId, franchiseId, sharesPurchased, sharePrice' },
        { status: 400 }
      )
    }

    const totalAmountInPaise = rupeesToPaise(sharesPurchased * sharePrice)
    const receiptId = `escrow_${franchiseId}_${investorId}_${Date.now()}`.substring(0, 40)

    // Reserve shares in Convex (pending payment)
    const { shareId } = await convex.mutation(api.tokenManagement.reserveShares, {
      franchiseId: franchiseId as Id<'franchises'>,
      investorId: investorId as Id<'users'>,
      sharesPurchased,
      sharePrice,
      totalAmountInPaise,
    })

    // Create Razorpay order
    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: totalAmountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        franchiseId,
        investorId,
        shareId,
        type: 'escrow_funding',
      },
    })

    // Save order to Convex
    await convex.mutation(api.razorpayManagement.saveOrder, {
      razorpayOrderId: order.id,
      receiptId,
      payerId: investorId as Id<'users'>,
      franchiseId: franchiseId as Id<'franchises'>,
      type: 'escrow_funding',
      amountInPaise: totalAmountInPaise,
    })

    return NextResponse.json({
      orderId: order.id,
      shareId,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayPublicKeyId(),
      receiptId,
    })
  } catch (error: unknown) {
    console.error('[Razorpay] create-escrow-order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create escrow order' },
      { status: 500 }
    )
  }
}
