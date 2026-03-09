import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user profile
export const getCurrentUserProfile = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) {
      return null;
    }

    // Find user by email - now all profile data is in users table
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    return user;
  },
});

// Get user by Privy ID
export const getUserByPrivyId = query({
  args: { privyUserId: v.string() },
  handler: async (ctx, { privyUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_privyUserId", (q) => q.eq("privyUserId", privyUserId))
      .first();

    return user;
  },
});

// Sync Privy user to database (creates or updates)
export const syncPrivyUser = mutation({
  args: {
    privyUserId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { privyUserId, email, fullName, avatarUrl }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_privyUserId", (q) => q.eq("privyUserId", privyUserId))
      .first();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: email || existingUser.email,
        fullName: fullName || existingUser.fullName,
        avatarUrl: avatarUrl || existingUser.avatarUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      const userId = await ctx.db.insert("users", {
        privyUserId,
        email,
        fullName,
        avatarUrl,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Update user fullName
export const updateUserFullName = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
  },
  handler: async (ctx, { userId, fullName }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      fullName,
      updatedAt: Date.now(),
    });

    return userId;
  },
});


// Get user by Clerk ID (for mobile app)
// Uses email-based lookup until schema with by_clerkUserId index is deployed
export const getUserByClerkId = query({
  args: { clerkUserId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) return null
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
  },
})

// Sync Clerk user to database (creates or updates by email)
// Uses only existing deployed indexes (by_email) until clerkUserId schema is deployed
export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { email, fullName, avatarUrl }) => {
    const now = Date.now()

    // Look up by email using the existing by_email index
    if (email) {
      const existingByEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first()

      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, {
          fullName: fullName || existingByEmail.fullName,
          avatarUrl: avatarUrl || existingByEmail.avatarUrl,
          updatedAt: now,
        })
        return existingByEmail._id
      }
    }

    // Create new user
    return await ctx.db.insert("users", {
      email,
      fullName,
      avatarUrl,
      createdAt: now,
      updatedAt: now,
    })
  },
})



// Get all investors with their share data (for admin view)
export const getAllUserWallets = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const walletsWithUserData = await Promise.all(
      allUsers.map(async (user) => {
        // Get user's franchise shares by user ID
        const shares = await ctx.db
          .query("franchiseShares")
          .withIndex("by_investor", (q) => q.eq("investorId", user._id))
          .filter((q) => q.eq(q.field("status"), "confirmed"))
          .collect();

        if (shares.length === 0) return null;

        const totalInvestedInPaise = shares.reduce((sum, share) => sum + (share.totalAmountInPaise ?? 0), 0);
        const totalShares = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);

        const lastActivity = Math.max(...shares.map(share => share.purchasedAt));

        return {
          id: user._id,
          totalInvestedInPaise,
          totalShares,
          totalEarnings: 0,
          transactionCount: shares.length,
          lastActivity: new Date(lastActivity).toISOString(),
          status: 'active' as 'active' | 'inactive' | 'suspended',
          user: {
            name: user.fullName || user.email || 'Unknown',
            email: user.email || '',
            joinedDate: new Date(user.createdAt || Date.now()).toISOString()
          },
          shares,
        };
      })
    );

    return walletsWithUserData.filter(Boolean);
  },
});


