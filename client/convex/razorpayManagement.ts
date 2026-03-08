import { mutation, query, action } from './_generated/server'
import { v } from 'convex/values'
import { api } from './_generated/api'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function nowMs() {
  return Date.now()
}

function makeReceiptId(franchiseId: string) {
  return `rcpt_${franchiseId}_${Date.now()}`
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/** Called by the API route after Razorpay confirms order creation */
export const saveOrder = mutation({
  args: {
    razorpayOrderId: v.string(),
    receiptId: v.string(),
    payerId: v.id('users'),
    franchiseId: v.optional(v.id('franchises')),
    franchiserId: v.optional(v.id('franchiser')),
    type: v.union(
      v.literal('franchise_fee'),
      v.literal('setup_cost'),
      v.literal('working_capital'),
      v.literal('platform_subscription'),
      v.literal('platform_wallet_load'),
      v.literal('in_store'),
    ),
    amountInPaise: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('razorpayOrders', {
      razorpayOrderId: args.razorpayOrderId,
      receiptId: args.receiptId,
      payerId: args.payerId,
      franchiseId: args.franchiseId,
      franchiserId: args.franchiserId,
      type: args.type,
      amountInPaise: args.amountInPaise,
      currency: 'INR',
      status: 'created',
      createdAt: nowMs(),
      updatedAt: nowMs(),
    })
  },
})

/** Called by webhook or verify-payment route on successful payment */
export const markOrderPaid = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query('razorpayOrders')
      .withIndex('by_razorpay_order', (q) => q.eq('razorpayOrderId', args.razorpayOrderId))
      .unique()

    if (!order) throw new Error(`Order not found: ${args.razorpayOrderId}`)

    await ctx.db.patch(order._id, {
      razorpayPaymentId: args.razorpayPaymentId,
      status: 'paid',
      webhookEvent: 'payment.captured',
      updatedAt: nowMs(),
    })

    // Update franchise stage if this is a franchise_fee payment
    if (order.franchiseId && order.type === 'franchise_fee') {
      const franchise = await ctx.db.get(order.franchiseId)
      if (franchise) {
        // Record payment in brandWalletTransactions
        await ctx.db.insert('brandWalletTransactions', {
          franchiserId: franchise.franchiserId,
          franchiseId: order.franchiseId,
          type: 'franchise_fee',
          amount: order.amountInPaise / 100, // store in INR
          description: `Franchise fee paid via Razorpay — ${args.razorpayPaymentId}`,
          status: 'completed',
          transactionHash: args.razorpayPaymentId,
          createdAt: nowMs(),
        })

        // Update franchise stage sub-stage to collecting_investments
        const stageRecord = await ctx.db
          .query('franchiseStages')
          .withIndex('by_franchise', (q) => q.eq('franchiseId', order.franchiseId!))
          .order('desc')
          .first()

        if (stageRecord) {
          await ctx.db.patch(stageRecord._id, {
            subStage: 'collecting_investments',
            progress: 20,
            updatedAt: nowMs(),
          })
        }
      }
    }

    return order._id
  },
})

/** Mark order as failed */
export const markOrderFailed = mutation({
  args: {
    razorpayOrderId: v.string(),
    webhookEvent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query('razorpayOrders')
      .withIndex('by_razorpay_order', (q) => q.eq('razorpayOrderId', args.razorpayOrderId))
      .unique()

    if (!order) return

    await ctx.db.patch(order._id, {
      status: 'failed',
      webhookEvent: args.webhookEvent,
      updatedAt: nowMs(),
    })
  },
})

/** Get all orders for a franchise */
export const getOrdersByFranchise = query({
  args: { franchiseId: v.id('franchises') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('razorpayOrders')
      .withIndex('by_franchise', (q) => q.eq('franchiseId', args.franchiseId))
      .order('desc')
      .collect()
  },
})

/** Get order by Razorpay order ID */
export const getOrderByRazorpayId = query({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('razorpayOrders')
      .withIndex('by_razorpay_order', (q) => q.eq('razorpayOrderId', args.razorpayOrderId))
      .unique()
  },
})

// ─── LINKED ACCOUNTS ─────────────────────────────────────────────────────────

/** Franchisor submits their bank details for Razorpay Route onboarding */
export const saveRazorpayAccount = mutation({
  args: {
    userId: v.id('users'),
    franchiserId: v.optional(v.id('franchiser')),
    accountType: v.union(
      v.literal('franchisor'),
      v.literal('franchisee'),
      v.literal('investor'),
    ),
    bankName: v.string(),
    accountHolderName: v.string(),
    accountNumberMasked: v.string(),
    ifscCode: v.string(),
    panNumber: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
    razorpayAccountId: v.optional(v.string()),
    razorpayFundAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if account already exists for this user
    const existing = await ctx.db
      .query('razorpayAccounts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        status: 'pending',
        updatedAt: nowMs(),
      })
      return existing._id
    }

    return await ctx.db.insert('razorpayAccounts', {
      ...args,
      status: 'pending',
      createdAt: nowMs(),
      updatedAt: nowMs(),
    })
  },
})

/** Admin activates a franchisor's linked account after KYC approval */
export const activateRazorpayAccount = mutation({
  args: {
    userId: v.id('users'),
    razorpayAccountId: v.string(),
    razorpayFundAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query('razorpayAccounts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!account) throw new Error('Account not found')

    await ctx.db.patch(account._id, {
      razorpayAccountId: args.razorpayAccountId,
      razorpayFundAccountId: args.razorpayFundAccountId,
      status: 'active',
      updatedAt: nowMs(),
    })
  },
})

export const getRazorpayAccount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('razorpayAccounts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()
  },
})

// ─── PAYOUTS (Razorpay X) ────────────────────────────────────────────────────

/** Queue a payout for processing */
export const queuePayout = mutation({
  args: {
    recipientId: v.id('users'),
    franchiseId: v.optional(v.id('franchises')),
    franchiserId: v.optional(v.id('franchiser')),
    linkedFranchisePayoutId: v.optional(v.id('franchisePayouts')),
    type: v.union(
      v.literal('royalty'),
      v.literal('dividend'),
      v.literal('refund'),
      v.literal('platform_fee'),
    ),
    amountInPaise: v.number(),
    narration: v.string(),
    fundAccountId: v.string(),
    period: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('razorpayPayouts', {
      ...args,
      currency: 'INR',
      status: 'queued',
      createdAt: nowMs(),
      updatedAt: nowMs(),
    })
  },
})

/** Update payout status from webhook */
export const updatePayoutStatus = mutation({
  args: {
    razorpayPayoutId: v.string(),
    status: v.union(
      v.literal('queued'),
      v.literal('pending'),
      v.literal('processing'),
      v.literal('processed'),
      v.literal('cancelled'),
      v.literal('rejected'),
      v.literal('reversed'),
    ),
    failureReason: v.optional(v.string()),
    processedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db
      .query('razorpayPayouts')
      .withIndex('by_razorpay_payout', (q) => q.eq('razorpayPayoutId', args.razorpayPayoutId))
      .unique()

    if (!payout) return

    await ctx.db.patch(payout._id, {
      status: args.status,
      failureReason: args.failureReason,
      processedAt: args.processedAt,
      updatedAt: nowMs(),
    })
  },
})

export const getPayoutsByPeriod = query({
  args: {
    franchiseId: v.id('franchises'),
    period: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('razorpayPayouts')
      .withIndex('by_franchise', (q) => q.eq('franchiseId', args.franchiseId))
      .filter((q) => q.eq(q.field('period'), args.period))
      .collect()
  },
})

// ─── IN-STORE PAYMENTS ───────────────────────────────────────────────────────

/** Save in-store payment record */
export const saveInStorePayment = mutation({
  args: {
    franchiseId: v.id('franchises'),
    cashierId: v.optional(v.id('users')),
    amountInPaise: v.number(),
    razorpayQrId: v.optional(v.string()),
    razorpayPaymentLinkId: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    productIds: v.optional(v.array(v.id('franchiserProducts'))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('inStorePayments', {
      ...args,
      currency: 'INR',
      status: 'created',
      createdAt: nowMs(),
      updatedAt: nowMs(),
    })
  },
})

/** Mark in-store payment as paid (from webhook) */
export const markInStorePaymentPaid = mutation({
  args: {
    razorpayPaymentId: v.string(),
    razorpayQrId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find by QR ID if provided
    let record = null
    if (args.razorpayQrId) {
      record = await ctx.db
        .query('inStorePayments')
        .withIndex('by_franchise', (q) => q.gt('franchiseId', '' as any))
        .filter((q) => q.eq(q.field('razorpayQrId'), args.razorpayQrId))
        .first()
    }

    if (!record) return

    await ctx.db.patch(record._id, {
      razorpayPaymentId: args.razorpayPaymentId,
      paymentMethod: args.paymentMethod,
      status: 'paid',
      paidAt: nowMs(),
      updatedAt: nowMs(),
    })

    // Update franchise wallet revenue
    const wallet = await ctx.db
      .query('franchiseWallets')
      .withIndex('by_franchise', (q) => q.eq('franchiseId', record!.franchiseId))
      .first()

    if (wallet) {
      const amountInr = record.amountInPaise / 100
      await ctx.db.patch(wallet._id, {
        monthlyRevenue: wallet.monthlyRevenue + amountInr,
        totalIncome: wallet.totalIncome + amountInr,
        lastActivity: nowMs(),
        updatedAt: nowMs(),
      })
    }

    return record._id
  },
})

/** Get today's in-store payments for a franchise */
export const getTodaysInStoreRevenue = query({
  args: { franchiseId: v.id('franchises') },
  handler: async (ctx, args) => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const payments = await ctx.db
      .query('inStorePayments')
      .withIndex('by_franchise', (q) => q.eq('franchiseId', args.franchiseId))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'paid'),
          q.gte(q.field('paidAt'), startOfDay.getTime()),
        ),
      )
      .collect()

    const totalPaise = payments.reduce((sum, p) => sum + p.amountInPaise, 0)
    return {
      totalInPaise: totalPaise,
      totalInRupees: totalPaise / 100,
      count: payments.length,
      payments,
    }
  },
})
