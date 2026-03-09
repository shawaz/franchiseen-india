/**
 * POST /api/razorpay/process-payouts
 *
 * Admin-only: triggers the monthly payout cycle for a franchise.
 * Distributes revenue to franchise owner (royalty) and investors (dividends).
 *
 * Body:
 *   franchiseId     – Convex franchise ID
 *   netRevenueInr   – Net revenue in INR for the period (e.g. 150000)
 *   periodLabel     – Human-readable period label (e.g. "March 2026")
 */
import { NextRequest, NextResponse } from 'next/server'
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
    // TODO: add admin auth check here (e.g. verify session cookie or API key)

    const body = await req.json()
    const { franchiseId, netRevenueInr, periodLabel } = body

    if (!franchiseId || !netRevenueInr) {
      return NextResponse.json(
        { error: 'Missing required fields: franchiseId, netRevenueInr' },
        { status: 400 }
      )
    }

    const netRevenueInPaise = Math.round(netRevenueInr * 100)

    const result = await convex.mutation(api.payoutManagement.processFranchisePayout, {
      franchiseId: franchiseId as Id<'franchises'>,
      netRevenueInPaise,
      periodLabel: periodLabel || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[Razorpay] process-payouts error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payouts' },
      { status: 500 }
    )
  }
}
