/**
 * solanaTransactions.ts — Solana removed stub
 *
 * Solana has been removed from the project. These stubs keep the API
 * surface intact so existing code that references these actions compiles,
 * but they always return a "not supported" response.
 */
import { action } from "./_generated/server";
import { v } from "convex/values";

export const executeSolanaTransfer = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(),
    toPublicKey: v.string(),
    amountSOL: v.number(),
    description: v.string(),
  },
  handler: async (_ctx, _args) => {
    return {
      success: false,
      error: "Solana has been removed from this project. Use Razorpay/PlatformWallet instead.",
      signature: null,
      explorerUrl: null,
    };
  },
});

export const executeBatchSolanaTransfers = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(),
    transfers: v.array(v.object({
      toPublicKey: v.string(),
      amountSOL: v.number(),
      description: v.string(),
    })),
  },
  handler: async (_ctx, _args) => {
    return {
      success: false,
      error: "Solana has been removed from this project. Use Razorpay/PlatformWallet instead.",
      signature: null,
      explorerUrl: null,
      transferCount: 0,
    };
  },
});
