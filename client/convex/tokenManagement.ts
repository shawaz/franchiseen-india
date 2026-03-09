/**
 * shareManagement.ts (formerly tokenManagement.ts)
 *
 * Manages franchise investment shares. Blockchain/SPL tokens have been removed.
 * Shares are now pure database records backed by Razorpay escrow payments.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function nowMs() { return Date.now(); }

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/** All confirmed shares for a franchise (for payout calculations). */
export const getFranchiseShares = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    return await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();
  },
});

/** All shares held by a specific investor across all franchises. */
export const getInvestorPortfolio = query({
  args: { investorId: v.id("users") },
  handler: async (ctx, { investorId }) => {
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    const portfolio = await Promise.all(
      shares.map(async (share) => {
        const franchise = await ctx.db.get(share.franchiseId);
        const franchiser = franchise
          ? await ctx.db.get(franchise.franchiserId)
          : null;
        return {
          ...share,
          franchise: franchise
            ? {
                name: franchise.businessName,
                slug: franchise.franchiseSlug,
                stage: franchise.stage,
              }
            : null,
          brand: franchiser ? { name: franchiser.name, slug: franchiser.slug } : null,
        };
      })
    );

    const totalInvestedInPaise = portfolio.reduce((s, p) => s + p.totalAmountInPaise, 0);
    const totalShares = portfolio.reduce((s, p) => s + p.sharesPurchased, 0);

    return { shares: portfolio, totalInvestedInPaise, totalShares };
  },
});

/** Summary of share distribution for a franchise. */
export const getFranchiseShareSummary = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const allShares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .collect();

    const confirmed = allShares.filter((s) => s.status === "confirmed");
    const pending = allShares.filter((s) => s.status === "pending");
    const refunded = allShares.filter((s) => s.status === "refunded");

    const totalSharesPurchased = confirmed.reduce((s, sh) => s + sh.sharesPurchased, 0);
    const totalRaisedInPaise = confirmed.reduce((s, sh) => s + sh.totalAmountInPaise, 0);

    return {
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      refundedCount: refunded.length,
      totalSharesPurchased,
      totalRaisedInPaise,
      investors: confirmed,
    };
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

/**
 * Reserve shares for a pending payment.
 * Call before creating the Razorpay order. Confirmed via recordEscrowContribution in razorpayManagement.
 */
export const reserveShares = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.id("users"),
    sharesPurchased: v.number(),
    sharePrice: v.number(),      // INR per share
    totalAmountInPaise: v.number(),
  },
  handler: async (ctx, args) => {
    const now = nowMs();

    // Validate franchise is in funding stage
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");
    if (franchise.stage !== "funding") {
      throw new Error("Franchise is not currently accepting investments");
    }

    // Validate share availability
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) throw new Error("Investment data not found");

    const purchasedSoFar = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "confirmed"),
          q.eq(q.field("status"), "pending"),
        )
      )
      .collect()
      .then((s) => s.reduce((sum, sh) => sum + sh.sharesPurchased, 0));

    const availableShares = investment.sharesIssued - purchasedSoFar;
    if (args.sharesPurchased > availableShares) {
      throw new Error(`Only ${availableShares} shares available`);
    }

    const shareId = await ctx.db.insert("franchiseShares", {
      franchiseId: args.franchiseId,
      investorId: args.investorId,
      sharesPurchased: args.sharesPurchased,
      sharePrice: args.sharePrice,
      totalAmountInPaise: args.totalAmountInPaise,
      status: "pending",
      purchasedAt: now,
      createdAt: now,
    });

    return { shareId };
  },
});

/** Confirm a pending share reservation after successful payment. */
export const confirmShares = mutation({
  args: {
    shareId: v.id("franchiseShares"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) throw new Error("Share record not found");
    if (share.status !== "pending") throw new Error(`Share is already ${share.status}`);

    await ctx.db.patch(args.shareId, {
      status: "confirmed",
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
    });
  },
});

/** Mark a pending share reservation as failed (payment failed). */
export const failShareReservation = mutation({
  args: { shareId: v.id("franchiseShares") },
  handler: async (ctx, { shareId }) => {
    const share = await ctx.db.get(shareId);
    if (!share) throw new Error("Share record not found");
    await ctx.db.patch(shareId, { status: "failed" });
  },
});
