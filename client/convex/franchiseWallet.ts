import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function nowMs() { return Date.now(); }

// ─── CREATE ───────────────────────────────────────────────────────────────────

/** Create a franchise wallet when franchise is approved. Idempotent. */
export const createFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    initialBalanceInPaise: v.optional(v.number()),
  },
  handler: async (ctx, { franchiseId, initialBalanceInPaise = 0 }) => {
    const now = nowMs();

    const existing = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (existing) return { walletId: existing._id, alreadyExists: true };

    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId,
      walletName: `${franchise.businessName} Wallet`,
      balanceInPaise: initialBalanceInPaise,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    if (initialBalanceInPaise > 0) {
      await ctx.db.insert("franchiseWalletTransactions", {
        franchiseWalletId: walletId,
        franchiseId,
        transactionType: "funding",
        amountInPaise: initialBalanceInPaise,
        description: "Initial franchise funding from escrow release",
        status: "confirmed",
        createdAt: now,
      });
    }

    return { walletId, alreadyExists: false };
  },
});

// ─── QUERIES ─────────────────────────────────────────────────────────────────

export const getFranchiseWallet = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) return null;

    const franchise = await ctx.db.get(franchiseId);
    return {
      ...wallet,
      franchise: franchise
        ? { name: franchise.businessName, slug: franchise.franchiseSlug, stage: franchise.stage }
        : null,
    };
  },
});

export const getFranchiseWalletTransactions = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { franchiseId, limit = 50 }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) return [];

    return await ctx.db
      .query("franchiseWalletTransactions")
      .withIndex("by_franchise_wallet", (q) => q.eq("franchiseWalletId", wallet._id))
      .order("desc")
      .take(limit);
  },
});

export const getAllFranchiseWallets = query({
  args: {},
  handler: async (ctx) => {
    const wallets = await ctx.db.query("franchiseWallets").collect();

    return await Promise.all(
      wallets.map(async (wallet) => {
        const franchise = await ctx.db.get(wallet.franchiseId);
        return {
          ...wallet,
          franchise: franchise
            ? { name: franchise.businessName, slug: franchise.franchiseSlug, stage: franchise.stage }
            : null,
        };
      })
    );
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

/** Record a transaction and update wallet balance accordingly. */
export const addFranchiseWalletTransaction = mutation({
  args: {
    franchiseId: v.id("franchises"),
    transactionType: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("payout"),
      v.literal("royalty"),
      v.literal("transfer_in"),
      v.literal("transfer_out"),
      v.literal("funding"),
      v.literal("refund")
    ),
    amountInPaise: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed")
    )),
    metadata: v.optional(v.object({
      notes: v.optional(v.string()),
      attachments: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const now = nowMs();

    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!wallet) throw new Error("Franchise wallet not found");

    const transactionId = await ctx.db.insert("franchiseWalletTransactions", {
      franchiseWalletId: wallet._id,
      franchiseId: args.franchiseId,
      transactionType: args.transactionType,
      amountInPaise: args.amountInPaise,
      description: args.description,
      category: args.category,
      razorpayPaymentId: args.razorpayPaymentId,
      status: args.status ?? "confirmed",
      metadata: args.metadata,
      createdAt: now,
    });

    // Compute balance deltas
    const isCredit = ["income", "transfer_in", "funding"].includes(args.transactionType);
    const isDebit = ["expense", "payout", "royalty", "transfer_out", "refund"].includes(args.transactionType);

    const balanceDelta = isCredit ? args.amountInPaise : isDebit ? -args.amountInPaise : 0;

    await ctx.db.patch(wallet._id, {
      balanceInPaise: wallet.balanceInPaise + balanceDelta,
      totalIncome: wallet.totalIncome + (args.transactionType === "income" ? args.amountInPaise : 0),
      totalExpenses: wallet.totalExpenses + (args.transactionType === "expense" ? args.amountInPaise : 0),
      totalPayouts: wallet.totalPayouts + (args.transactionType === "payout" ? args.amountInPaise : 0),
      totalRoyalties: wallet.totalRoyalties + (args.transactionType === "royalty" ? args.amountInPaise : 0),
      transactionCount: wallet.transactionCount + 1,
      lastActivity: now,
      updatedAt: now,
    });

    // Also create a franchiseTransactions record for income (used for payout calculations)
    if (args.transactionType === "income") {
      await ctx.db.insert("franchiseTransactions", {
        franchiseId: args.franchiseId,
        walletId: wallet._id,
        type: "revenue",
        amount: args.amountInPaise,
        description: args.description,
        status: "completed",
        createdAt: now,
      });
    }

    return { transactionId };
  },
});

export const updateFranchiseWalletStatus = mutation({
  args: {
    franchiseId: v.id("franchises"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
      v.literal("maintenance")
    ),
  },
  handler: async (ctx, { franchiseId, status }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) throw new Error("Franchise wallet not found");

    await ctx.db.patch(wallet._id, { status, updatedAt: nowMs() });
    return { success: true };
  },
});

/** Reset monthly revenue/expense counters (call at start of each month). */
export const resetMonthlyCounters = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) throw new Error("Franchise wallet not found");

    await ctx.db.patch(wallet._id, {
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      updatedAt: nowMs(),
    });
  },
});
