import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function nowMs() { return Date.now() }

// ─── GET OR CREATE WALLET ─────────────────────────────────────────────────────

export const getOrCreateWallet = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existing) return existing

    const id = await ctx.db.insert('platformWallets', {
      userId: args.userId,
      balanceInPaise: 0,
      totalLoadedInPaise: 0,
      totalSpentInPaise: 0,
      currency: 'INR',
      status: 'active',
      createdAt: nowMs(),
      updatedAt: nowMs(),
    })

    return await ctx.db.get(id)
  },
})

export const getWallet = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()
  },
})

// ─── LOAD (top-up via Razorpay) ──────────────────────────────────────────────

/** Called by webhook after payment.captured — credits user wallet */
export const creditWallet = mutation({
  args: {
    userId: v.id('users'),
    amountInPaise: v.number(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get or create wallet
    let wallet = await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!wallet) {
      const id = await ctx.db.insert('platformWallets', {
        userId: args.userId,
        balanceInPaise: 0,
        totalLoadedInPaise: 0,
        totalSpentInPaise: 0,
        currency: 'INR',
        status: 'active',
        createdAt: nowMs(),
        updatedAt: nowMs(),
      })
      wallet = await ctx.db.get(id)
    }

    if (!wallet) throw new Error('Failed to get wallet')
    if (wallet.status === 'frozen') throw new Error('Wallet is frozen')

    // Check for duplicate (idempotency)
    const duplicate = await ctx.db
      .query('platformWalletTransactions')
      .withIndex('by_razorpay_order', (q) => q.eq('razorpayOrderId', args.razorpayOrderId))
      .first()

    if (duplicate) return { walletId: wallet._id, alreadyProcessed: true }

    const newBalance = wallet.balanceInPaise + args.amountInPaise

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balanceInPaise: newBalance,
      totalLoadedInPaise: wallet.totalLoadedInPaise + args.amountInPaise,
      updatedAt: nowMs(),
    })

    // Record transaction
    await ctx.db.insert('platformWalletTransactions', {
      walletId: wallet._id,
      userId: args.userId,
      type: 'load',
      amountInPaise: args.amountInPaise,
      balanceAfterInPaise: newBalance,
      description: args.description || 'Wallet top-up',
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      createdAt: nowMs(),
    })

    return { walletId: wallet._id, newBalanceInPaise: newBalance, alreadyProcessed: false }
  },
})

// ─── SPEND (deduct for franchise fee / investment) ────────────────────────────

export const debitWallet = mutation({
  args: {
    userId: v.id('users'),
    amountInPaise: v.number(),
    description: v.string(),
    franchiseId: v.optional(v.id('franchises')),
    linkedOrderId: v.optional(v.id('razorpayOrders')),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!wallet) throw new Error('Wallet not found')
    if (wallet.status === 'frozen') throw new Error('Wallet is frozen')
    if (wallet.balanceInPaise < args.amountInPaise) {
      throw new Error(
        `Insufficient balance. Available: ₹${wallet.balanceInPaise / 100}, Required: ₹${args.amountInPaise / 100}`
      )
    }

    const newBalance = wallet.balanceInPaise - args.amountInPaise

    await ctx.db.patch(wallet._id, {
      balanceInPaise: newBalance,
      totalSpentInPaise: wallet.totalSpentInPaise + args.amountInPaise,
      updatedAt: nowMs(),
    })

    await ctx.db.insert('platformWalletTransactions', {
      walletId: wallet._id,
      userId: args.userId,
      type: 'spend',
      amountInPaise: args.amountInPaise,
      balanceAfterInPaise: newBalance,
      description: args.description,
      franchiseId: args.franchiseId,
      linkedOrderId: args.linkedOrderId,
      createdAt: nowMs(),
    })

    return { newBalanceInPaise: newBalance }
  },
})

// ─── REFUND (admin credits back) ─────────────────────────────────────────────

export const refundWallet = mutation({
  args: {
    userId: v.id('users'),
    amountInPaise: v.number(),
    reason: v.string(),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!wallet) throw new Error('Wallet not found')

    const newBalance = wallet.balanceInPaise + args.amountInPaise

    await ctx.db.patch(wallet._id, {
      balanceInPaise: newBalance,
      updatedAt: nowMs(),
    })

    await ctx.db.insert('platformWalletTransactions', {
      walletId: wallet._id,
      userId: args.userId,
      type: 'refund',
      amountInPaise: args.amountInPaise,
      balanceAfterInPaise: newBalance,
      description: args.reason,
      adminNote: args.adminNote,
      createdAt: nowMs(),
    })

    return { newBalanceInPaise: newBalance }
  },
})

// ─── QUERIES ─────────────────────────────────────────────────────────────────

export const getWalletTransactions = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('platformWalletTransactions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(args.limit ?? 20)
  },
})

export const getWalletBalance = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query('platformWallets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    return {
      balanceInPaise: wallet?.balanceInPaise ?? 0,
      balanceInRupees: (wallet?.balanceInPaise ?? 0) / 100,
      status: wallet?.status ?? 'active',
    }
  },
})
