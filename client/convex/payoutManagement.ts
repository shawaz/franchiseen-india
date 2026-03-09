import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function nowMs() { return Date.now(); }

// ─── DISTRIBUTION LOGIC ───────────────────────────────────────────────────────

/**
 * Decides how much of net revenue goes to investors vs. reserve,
 * based on the franchise's current reserve health.
 */
function calculatePayoutDistribution(
  reserveBalanceInPaise: number,
  workingCapitalInPaise: number,
  netRevenueInPaise: number
): {
  toInvestors: number;
  toReserve: number;
  reservePercentage: number;
  distributionRule: string;
} {
  const reservePercentage = workingCapitalInPaise > 0
    ? (reserveBalanceInPaise / workingCapitalInPaise) * 100
    : 100;

  let investorPct = 0;
  let reservePct = 0;
  let distributionRule = "";

  if (reservePercentage < 25) {
    investorPct = 25; reservePct = 75;
    distributionRule = "Critical Reserve (< 25%)";
  } else if (reservePercentage < 50) {
    investorPct = 50; reservePct = 50;
    distributionRule = "Low Reserve (< 50%)";
  } else if (reservePercentage < 75) {
    investorPct = 75; reservePct = 25;
    distributionRule = "Building Reserve (< 75%)";
  } else {
    investorPct = 100; reservePct = 0;
    distributionRule = "Full Reserve (≥ 75%)";
  }

  return {
    toInvestors: Math.floor((netRevenueInPaise * investorPct) / 100),
    toReserve: Math.floor((netRevenueInPaise * reservePct) / 100),
    reservePercentage,
    distributionRule,
  };
}

// ─── MONTHLY FRANCHISE PAYOUT ─────────────────────────────────────────────────

/**
 * Process monthly franchise payout:
 *  1. Deduct royalty (to franchisor) + platform fee
 *  2. Distribute net revenue between reserve and investors
 *  3. Queue Razorpay X payouts for franchisor and each investor
 *
 * All amounts are in paise (INR × 100).
 */
export const processFranchisePayout = mutation({
  args: {
    franchiseId: v.id("franchises"),
    grossRevenueInPaise: v.number(),
    period: v.string(),            // e.g. "2024-03"
    payoutType: v.union(v.literal("daily"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const now = nowMs();

    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");
    if (franchise.stage !== "ongoing") throw new Error("Payouts only available for operational franchises");

    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) throw new Error("Franchiser not found");

    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) throw new Error("Investment data not found");

    const franchiseWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!franchiseWallet) throw new Error("Franchise wallet not found");

    // ── Fee calculations ───────────────────────────────────────────────────────
    const royaltyPct = franchiser.royaltyPercentage ?? 5;
    const platformFeePct = 2;

    const royaltyAmount = Math.floor((args.grossRevenueInPaise * royaltyPct) / 100);
    const platformFeeAmount = Math.floor((args.grossRevenueInPaise * platformFeePct) / 100);
    const netRevenue = args.grossRevenueInPaise - royaltyAmount - platformFeeAmount;

    // ── Distribution ──────────────────────────────────────────────────────────
    const workingCapitalInPaise = (investment.workingCapital ?? 0) * 100;
    const distribution = calculatePayoutDistribution(
      franchiseWallet.balanceInPaise,
      workingCapitalInPaise,
      netRevenue
    );

    // ── Get investors ─────────────────────────────────────────────────────────
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    const totalShares = shares.reduce((s, sh) => s + sh.sharesPurchased, 0);
    if (totalShares === 0) throw new Error("No confirmed investors found");

    // ── Create payout record ──────────────────────────────────────────────────
    const payoutId = await ctx.db.insert("franchisePayouts", {
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      period: args.period,
      payoutType: args.payoutType,
      grossRevenue: args.grossRevenueInPaise,
      royaltyAmount,
      platformFeeAmount,
      netRevenue,
      toInvestors: distribution.toInvestors,
      toReserve: distribution.toReserve,
      reserveBalanceBefore: franchiseWallet.balanceInPaise,
      reserveBalanceAfter: franchiseWallet.balanceInPaise + distribution.toReserve,
      reservePercentage: distribution.reservePercentage,
      distributionRule: distribution.distributionRule,
      totalShares,
      investorCount: shares.length,
      status: "queued",
      createdAt: now,
    });

    // ── Royalty transaction to brand wallet ───────────────────────────────────
    await ctx.db.insert("brandWalletTransactions", {
      franchiserId: franchise.franchiserId,
      franchiseId: args.franchiseId,
      type: "royalty",
      amount: royaltyAmount / 100, // stored in INR (rupees)
      description: `Royalty from ${franchise.franchiseSlug} — ${args.period}`,
      status: "pending",
      createdAt: now,
    });

    // ── Platform fee record ───────────────────────────────────────────────────
    await ctx.db.insert("companyIncome", {
      type: "platform_fee_payout",
      amount: platformFeeAmount / 100,
      description: `Platform fee from ${franchise.franchiseSlug} payout — ${args.period}`,
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      status: "pending",
      createdAt: now,
    });

    // ── Update franchise wallet reserve ───────────────────────────────────────
    await ctx.db.patch(franchiseWallet._id, {
      balanceInPaise: franchiseWallet.balanceInPaise + distribution.toReserve,
      totalIncome: franchiseWallet.totalIncome + args.grossRevenueInPaise,
      lastActivity: now,
      updatedAt: now,
    });

    // ── Queue Razorpay X payout for franchisor (royalty) ─────────────────────
    const franchisorAccount = await ctx.db
      .query("razorpayAccounts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchise.franchiserId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (franchisorAccount?.razorpayFundAccountId) {
      const ownerUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", undefined))
        .first(); // fallback — ideally look up by franchiser.ownerUserId
      if (ownerUser) {
        await ctx.db.insert("razorpayPayouts", {
          recipientId: franchiser.ownerUserId,
          franchiseId: args.franchiseId,
          franchiserId: franchise.franchiserId,
          linkedFranchisePayoutId: payoutId,
          type: "royalty",
          amountInPaise: royaltyAmount,
          currency: "INR",
          narration: `Royalty ${args.period} — ${franchise.franchiseSlug}`,
          fundAccountId: franchisorAccount.razorpayFundAccountId,
          period: args.period,
          status: "queued",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // ── Queue Razorpay X dividend payouts for each investor ───────────────────
    const payoutPerShare = totalShares > 0
      ? Math.floor(distribution.toInvestors / totalShares)
      : 0;

    for (const share of shares) {
      const investorPayout = payoutPerShare * share.sharesPurchased;
      if (investorPayout <= 0) continue;

      const shareholderPayoutId = await ctx.db.insert("shareholderPayouts", {
        payoutId,
        franchiseId: args.franchiseId,
        investorId: share.investorId,
        shares: share.sharesPurchased,
        totalShares,
        sharePercentage: (share.sharesPurchased / totalShares) * 100,
        payoutAmountInPaise: investorPayout,
        period: args.period,
        status: "queued",
        createdAt: now,
      });

      // Queue Razorpay X payout if investor has an active linked account
      const investorAccount = await ctx.db
        .query("razorpayAccounts")
        .withIndex("by_user", (q) => q.eq("userId", share.investorId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (investorAccount?.razorpayFundAccountId) {
        const razorpayPayoutId = await ctx.db.insert("razorpayPayouts", {
          recipientId: share.investorId,
          franchiseId: args.franchiseId,
          linkedFranchisePayoutId: payoutId,
          type: "dividend",
          amountInPaise: investorPayout,
          currency: "INR",
          narration: `Dividend ${args.period} — ${franchise.franchiseSlug}`,
          fundAccountId: investorAccount.razorpayFundAccountId,
          period: args.period,
          status: "queued",
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.patch(shareholderPayoutId, {
          razorpayPayoutId: razorpayPayoutId as unknown as string,
        });
      }
    }

    await ctx.db.patch(payoutId, { status: "processing", processedAt: now });

    return {
      success: true,
      payoutId,
      grossRevenue: args.grossRevenueInPaise,
      royaltyAmount,
      platformFeeAmount,
      netRevenue,
      toInvestors: distribution.toInvestors,
      toReserve: distribution.toReserve,
      distributionRule: distribution.distributionRule,
      reservePercentage: distribution.reservePercentage,
      newReserveBalance: franchiseWallet.balanceInPaise + distribution.toReserve,
      investorCount: shares.length,
      payoutPerShare,
    };
  },
});

// ─── STAFF SALARY PAYOUTS ─────────────────────────────────────────────────────

/**
 * Queue monthly salary payouts for all active staff at a franchise via Razorpay X.
 * Staff must have an active linked bank account (razorpayAccounts).
 */
export const processMonthlyStaffPayouts = mutation({
  args: {
    franchiseId: v.id("franchises"),
    period: v.string(), // e.g. "2024-03"
  },
  handler: async (ctx, args) => {
    const now = nowMs();

    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    const staffMembers = await ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (staffMembers.length === 0) throw new Error("No active staff found");

    const queued = [];
    const skipped = [];

    for (const staff of staffMembers) {
      const salaryInPaise = Math.round(staff.salary * 100);
      if (salaryInPaise <= 0) { skipped.push({ userId: staff.userId, reason: "zero salary" }); continue; }

      const account = await ctx.db
        .query("razorpayAccounts")
        .withIndex("by_user", (q) => q.eq("userId", staff.userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (!account?.razorpayFundAccountId) {
        skipped.push({ userId: staff.userId, reason: "no linked bank account" });
        continue;
      }

      const user = await ctx.db.get(staff.userId);

      await ctx.db.insert("razorpayPayouts", {
        recipientId: staff.userId,
        franchiseId: args.franchiseId,
        type: "staff_salary",
        amountInPaise: salaryInPaise,
        currency: "INR",
        narration: `Salary ${args.period} — ${franchise.franchiseSlug} (${staff.role})`,
        fundAccountId: account.razorpayFundAccountId,
        period: args.period,
        status: "queued",
        createdAt: now,
        updatedAt: now,
      });

      // Deduct from franchise wallet
      const wallet = await ctx.db
        .query("franchiseWallets")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .first();

      if (wallet) {
        await ctx.db.patch(wallet._id, {
          balanceInPaise: wallet.balanceInPaise - salaryInPaise,
          totalExpenses: wallet.totalExpenses + salaryInPaise,
          updatedAt: now,
        });
        await ctx.db.insert("franchiseWalletTransactions", {
          franchiseWalletId: wallet._id,
          franchiseId: args.franchiseId,
          transactionType: "expense",
          amountInPaise: salaryInPaise,
          description: `Salary — ${user?.fullName ?? staff.userId} (${staff.role}) — ${args.period}`,
          category: "staff_salary",
          status: "confirmed",
          createdAt: now,
        });
      }

      queued.push({ userId: staff.userId, role: staff.role, amountInPaise: salaryInPaise });
    }

    return { success: true, period: args.period, queued, skipped };
  },
});

// ─── VENDOR PAYMENTS ──────────────────────────────────────────────────────────

/**
 * Queue a one-off vendor payment via Razorpay X.
 * The vendor must have an active razorpayAccounts record.
 */
export const processVendorPayment = mutation({
  args: {
    franchiseId: v.id("franchises"),
    vendorUserId: v.id("users"),
    amountInPaise: v.number(),
    description: v.string(),
    period: v.string(),
  },
  handler: async (ctx, args) => {
    const now = nowMs();

    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    const account = await ctx.db
      .query("razorpayAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.vendorUserId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!account?.razorpayFundAccountId) {
      throw new Error("Vendor does not have an active linked bank account");
    }

    await ctx.db.insert("razorpayPayouts", {
      recipientId: args.vendorUserId,
      franchiseId: args.franchiseId,
      type: "vendor_payment",
      amountInPaise: args.amountInPaise,
      currency: "INR",
      narration: args.description.slice(0, 30),
      fundAccountId: account.razorpayFundAccountId,
      period: args.period,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    // Deduct from franchise wallet
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (wallet) {
      await ctx.db.patch(wallet._id, {
        balanceInPaise: wallet.balanceInPaise - args.amountInPaise,
        totalExpenses: wallet.totalExpenses + args.amountInPaise,
        updatedAt: now,
      });
      await ctx.db.insert("franchiseWalletTransactions", {
        franchiseWalletId: wallet._id,
        franchiseId: args.franchiseId,
        transactionType: "expense",
        amountInPaise: args.amountInPaise,
        description: args.description,
        category: "vendor_payment",
        status: "confirmed",
        createdAt: now,
      });
    }

    return { success: true, amountInPaise: args.amountInPaise };
  },
});

// ─── QUERIES ─────────────────────────────────────────────────────────────────

export const getFranchisePayouts = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    return await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .order("desc")
      .collect();
  },
});

export const getShareholderPayouts = query({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.id("users"),
  },
  handler: async (ctx, { franchiseId, investorId }) => {
    return await ctx.db
      .query("shareholderPayouts")
      .withIndex("by_franchise_investor", (q) =>
        q.eq("franchiseId", franchiseId).eq("investorId", investorId)
      )
      .order("desc")
      .collect();
  },
});

export const getPayoutSummary = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const payouts = await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "completed"),
          q.eq(q.field("status"), "processing"),
          q.eq(q.field("status"), "queued"),
        )
      )
      .collect();

    const totalGrossRevenue = payouts.reduce((s, p) => s + p.grossRevenue, 0);
    const totalRoyalty = payouts.reduce((s, p) => s + p.royaltyAmount, 0);
    const totalPlatformFee = payouts.reduce((s, p) => s + p.platformFeeAmount, 0);
    const totalToInvestors = payouts.reduce((s, p) => s + p.toInvestors, 0);
    const totalToReserve = payouts.reduce((s, p) => s + p.toReserve, 0);
    const latestPayout = payouts[0] ?? null;

    return {
      totalPayouts: payouts.length,
      totalGrossRevenue,
      totalRoyalty,
      totalPlatformFee,
      totalToInvestors,
      totalToReserve,
      latestPayout,
      currentReserveBalance: latestPayout?.reserveBalanceAfter ?? 0,
      currentReservePercentage: latestPayout?.reservePercentage ?? 0,
    };
  },
});
