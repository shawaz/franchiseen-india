/**
 * POST /api/razorpay/release-escrow
 *
 * Admin-only: releases collected escrow funds to the franchise wallet.
 * Call this after the franchise has reached its funding target and is ready to launch.
 *
 * Body:
 *   franchiseId  – Convex franchise ID
 *   adminNote    – optional note for the transaction
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
    const { franchiseId, adminNote } = body

    if (!franchiseId) {
      return NextResponse.json(
        { error: 'Missing required field: franchiseId' },
        { status: 400 }
      )
    }

    const result = await convex.mutation(api.razorpayManagement.releaseEscrowToFranchise, {
      franchiseId: franchiseId as Id<'franchises'>,
      adminNote: adminNote || 'Escrow released by admin',
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[Razorpay] release-escrow error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to release escrow' },
      { status: 500 }
    )
  }
}
