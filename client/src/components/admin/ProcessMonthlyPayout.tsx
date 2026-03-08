'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, IndianRupee, Briefcase, HandCoins } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface ProcessMonthlyPayoutProps {
    franchiseId: Id<'franchises'>
    franchiserId: Id<'franchiser'>
    franchiserUserId: Id<'users'> // Required to find linked fund account
    period: string // e.g., 'October 2024'
}

export function ProcessMonthlyPayout({
    franchiseId,
    franchiserId,
    franchiserUserId,
    period
}: ProcessMonthlyPayoutProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    // Real implementation would calculate this based on wallet transactions,
    // but for the UI we'll fetch existing payouts for the period to see if already processed.
    const existingPayouts = useQuery(api.razorpayManagement.getPayoutsByPeriod, {
        franchiseId,
        period,
    })

    // Mock revenue data for the UI
    const grossRevenue = 1500000 // ₹15.0L
    const royaltyPercentage = 5
    const royaltyAmount = grossRevenue * (royaltyPercentage / 100) // ₹75K

    const queuePayout = useMutation(api.razorpayManagement.queuePayout)

    // Fetch linked account for the recipient
    const razorpayAccount = useQuery(api.razorpayManagement.getRazorpayAccount, {
        userId: franchiserUserId
    })

    const hasProcessed = existingPayouts && existingPayouts.length > 0
    const isAccountReady = razorpayAccount && razorpayAccount.status === 'active' && razorpayAccount.razorpayFundAccountId

    const handleProcessPayout = async () => {
        if (!isAccountReady || !razorpayAccount.razorpayFundAccountId) {
            toast.error('Recipient does not have an active Razorpay fund account')
            return
        }

        setIsProcessing(true)
        try {
            await queuePayout({
                recipientId: franchiserUserId,
                franchiseId,
                franchiserId,
                type: 'royalty',
                amountInPaise: Math.round(royaltyAmount * 100),
                narration: `Royalty for ${period}`,
                fundAccountId: razorpayAccount.razorpayFundAccountId,
                period,
            })

            toast.success('Payout queued successfully via RazorpayX')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to queue payout')
        } finally {
            setIsProcessing(false)
        }
    }

    if (existingPayouts === undefined || razorpayAccount === undefined) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="w-48 h-6 mb-2" />
                    <Skeleton className="w-72 h-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            {!isAccountReady && !hasProcessed && (
                <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 text-sm flex items-start gap-2 border-b border-amber-100 dark:border-amber-900/50">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold block mb-0.5">Missing Fund Account</span>
                        The recipient has not linked or verified their bank account through Razorpay KYC. Payouts cannot be processed.
                    </div>
                </div>
            )}

            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <IndianRupee className="w-5 h-5" />
                            Process Payout: {period}
                        </CardTitle>
                        <CardDescription>Review and trigger monthly royalty & dividend payouts</CardDescription>
                    </div>
                    <Badge variant={hasProcessed ? "secondary" : "default"} className={hasProcessed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                        {hasProcessed ? 'Processed' : 'Pending Action'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500 text-sm flex items-center gap-1.5 mb-1">
                            <Briefcase className="w-4 h-4" /> Gross Revenue
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            ₹{(grossRevenue / 100000).toFixed(2)}L
                        </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500 text-sm flex items-center gap-1.5 mb-1">
                            <HandCoins className="w-4 h-4" /> Brand Royalty ({royaltyPercentage}%)
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            ₹{royaltyAmount.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-3">Payout Breakdown</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-zinc-600 dark:text-zinc-400">Brand Royalty ({royaltyPercentage}%)</span>
                            </div>
                            <span className="font-medium">₹{royaltyAmount.toLocaleString('en-IN')}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-zinc-600 dark:text-zinc-400">Investor Dividends (Profit Share)</span>
                            </div>
                            <span className="font-medium text-zinc-400 italic">calculated automatically by smart contract</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-zinc-500">
                        Powered by <span className="font-semibold text-zinc-700 dark:text-zinc-300">RazorpayX</span> routing
                    </div>
                    <Button
                        onClick={handleProcessPayout}
                        disabled={hasProcessed || !isAccountReady || isProcessing}
                        className="w-full sm:w-auto"
                    >
                        {isProcessing ? 'Processing...' : hasProcessed ? 'Payout Processed' : 'Trigger Payout Cycle'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
