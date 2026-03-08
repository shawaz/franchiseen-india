'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { RazorpayCheckout } from './RazorpayCheckout'
import { toast } from 'sonner'

interface PlatformWalletProps {
  userId: string
  userName?: string
  userEmail?: string
  userPhone?: string
}

const TOPUP_PRESETS = [10000, 25000, 50000, 100000, 250000, 500000] // INR

function formatInr(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function PlatformWallet({ userId, userName, userEmail, userPhone }: PlatformWalletProps) {
  const [customAmount, setCustomAmount] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [showTopup, setShowTopup] = useState(false)

  const walletData = useQuery(api.platformWallet.getWalletBalance, {
    userId: userId as any,
  })

  const transactions = useQuery(api.platformWallet.getWalletTransactions, {
    userId: userId as any,
    limit: 10,
  })

  const topupAmount = selectedPreset ?? (customAmount ? parseInt(customAmount) * 100 : 0)

  return (
    <div className="space-y-4">

      {/* Balance Card */}
      <div className="rounded-2xl bg-black text-white p-6 dark:bg-white dark:text-black">
        <p className="text-sm opacity-60 mb-1">Franchiseen Credits</p>
        <p className="text-4xl font-bold tracking-tight">
          {walletData ? formatInr(walletData.balanceInPaise) : '—'}
        </p>
        {walletData?.status === 'frozen' && (
          <span className="mt-2 inline-block text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            Frozen — contact support
          </span>
        )}
        <p className="text-xs opacity-40 mt-3">
          Non-withdrawable credits. Usable for franchise fees and investments on Franchiseen.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTopup(!showTopup)}
          className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          + Add Credits
        </button>
        <button
          className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium opacity-40 cursor-not-allowed"
          disabled
          title="Withdrawals not supported — credits are non-refundable"
        >
          Withdraw
        </button>
      </div>

      {/* Top-up Panel */}
      {showTopup && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 p-5 space-y-4">
          <p className="font-medium text-sm">Select amount to add</p>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2">
            {TOPUP_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => { setSelectedPreset(amount); setCustomAmount('') }}
                className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                  selectedPreset === amount
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                }`}
              >
                ₹{(amount / 100).toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500 text-sm">₹</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null) }}
              min={100}
              max={200000}
              className="flex-1 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {topupAmount > 0 && (
            <RazorpayCheckout
              amountInr={topupAmount / 100}
              type="platform_wallet_load"
              description={`Add ${formatInr(topupAmount)} to Franchiseen Credits`}
              payerId={userId}
              prefill={{ name: userName, email: userEmail, phone: userPhone }}
              onSuccess={(paymentId) => {
                toast.success(`${formatInr(topupAmount)} added to your credits!`)
                setShowTopup(false)
                setSelectedPreset(null)
                setCustomAmount('')
              }}
              onFailure={(err) => toast.error(`Top-up failed: ${err}`)}
            >
              <button className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                Pay {formatInr(topupAmount)} via Razorpay
              </button>
            </RazorpayCheckout>
          )}

          <p className="text-xs text-stone-400 text-center">
            Payments via UPI · Cards · Net Banking · Wallets (Paytm, PhonePe, Amazon Pay)
          </p>
        </div>
      )}

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-500 px-1">Recent Transactions</p>
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-900"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {tx.type === 'load' ? '⬇️' : tx.type === 'spend' ? '⬆️' : tx.type === 'refund' ? '↩️' : '🔧'}
                </span>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  tx.type === 'load' || tx.type === 'refund'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'load' || tx.type === 'refund' ? '+' : '-'}
                  {formatInr(tx.amountInPaise)}
                </p>
                <p className="text-xs text-stone-400">
                  Bal: {formatInr(tx.balanceAfterInPaise)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions?.length === 0 && (
        <p className="text-center text-sm text-stone-400 py-4">No transactions yet</p>
      )}
    </div>
  )
}

// ── Compact Wallet Balance chip (for use in nav/header) ───────────────────────

export function WalletBalanceChip({ userId }: { userId: string }) {
  const walletData = useQuery(api.platformWallet.getWalletBalance, {
    userId: userId as any,
  })

  if (!walletData || walletData.balanceInPaise === 0) return null

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-medium">
      <span className="text-xs">💳</span>
      <span>{formatInr(walletData.balanceInPaise)}</span>
    </div>
  )
}

// ── Pay with Wallet Button ────────────────────────────────────────────────────

interface PayWithWalletProps {
  userId: string
  amountInPaise: number
  description: string
  franchiseId?: string
  onSuccess?: () => void
  onFailure?: (reason: string) => void
  disabled?: boolean
}

export function PayWithWalletButton({
  userId,
  amountInPaise,
  description,
  franchiseId,
  onSuccess,
  onFailure,
  disabled,
}: PayWithWalletProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const debit = useMutation(api.platformWallet.debitWallet)

  const walletData = useQuery(api.platformWallet.getWalletBalance, {
    userId: userId as any,
  })

  const hasEnoughBalance = (walletData?.balanceInPaise ?? 0) >= amountInPaise

  const handlePay = async () => {
    if (!hasEnoughBalance || isProcessing || disabled) return
    setIsProcessing(true)
    try {
      await debit({
        userId: userId as any,
        amountInPaise,
        description,
        franchiseId: franchiseId as any,
      })
      toast.success('Payment successful from Franchiseen Credits!')
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      toast.error(message)
      onFailure?.(message)
    }
    setIsProcessing(false)
  }

  return (
    <button
      onClick={handlePay}
      disabled={!hasEnoughBalance || isProcessing || disabled}
      className="w-full py-3 rounded-xl border-2 border-black dark:border-white text-sm font-medium transition-all
        enabled:hover:bg-black enabled:hover:text-white dark:enabled:hover:bg-white dark:enabled:hover:text-black
        disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : hasEnoughBalance ? (
        `Pay ${formatInr(amountInPaise)} with Credits`
      ) : (
        `Insufficient Credits (have ${formatInr(walletData?.balanceInPaise ?? 0)})`
      )}
    </button>
  )
}
