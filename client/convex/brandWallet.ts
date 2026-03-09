import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Create/refresh a brand wallet entry for a franchiser. */
export const createBrandWallet = mutation({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) throw new Error("Franchiser not found");

    await ctx.db.patch(args.franchiserId, { updatedAt: Date.now() });
    return { success: true };
  },
});

/** Get franchiser wallet info. */
export const getFranchiserWallet = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) throw new Error("Franchiser not found");
    return { ownerUserId: franchiser.ownerUserId };
  },
});

/** Update franchiser record (no-op for wallet fields removed in Solana cleanup). */
export const updateFranchiserWallet = mutation({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) throw new Error("Franchiser not found");
    await ctx.db.patch(args.franchiserId, { updatedAt: Date.now() });
    return { success: true };
  },
});

/** Get franchiser by owner user ID. */
export const getFranchiserByOwner = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const franchiser = await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", args.userId))
      .first();

    if (!franchiser) return null;
    return { _id: franchiser._id, ownerUserId: franchiser.ownerUserId, name: franchiser.name, slug: franchiser.slug, status: franchiser.status };
  },
});

/** Get brand wallet transactions for a franchiser. */
export const getBrandWalletTransactions = query({
  args: {
    franchiserId: v.id("franchiser"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("brandWalletTransactions")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .order("desc")
      .take(args.limit ?? 50);

    return await Promise.all(
      transactions.map(async (tx) => {
        const franchise = tx.franchiseId ? await ctx.db.get(tx.franchiseId) : null;
        return { ...tx, franchise: franchise ? { slug: franchise.franchiseSlug } : null };
      })
    );
  },
});

/** Get total brand wallet balance (sum of completed transactions). */
export const getBrandWalletBalance = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("brandWalletTransactions")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    let balance = 0;
    for (const tx of transactions) {
      if (["franchise_funding_complete", "franchise_fee", "setup_cost", "royalty", "revenue"].includes(tx.type)) {
        balance += tx.amount;
      } else if (["expense", "transfer"].includes(tx.type)) {
        balance -= tx.amount;
      }
    }

    return { balance, transactionCount: transactions.length };
  },
});
