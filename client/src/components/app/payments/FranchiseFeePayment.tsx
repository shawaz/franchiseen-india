'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RazorpayCheckout } from './RazorpayCheckout'
import { ShieldCheck, Receipt } from 'lucide-react'

interface FranchiseFeePaymentProps {
    franchiseFee: number
    setupCost: number
    workingCapital: number
    payerId: string
    franchiseId: string
    franchiserId: string
    prefill?: {
        name?: string
        email?: string
        phone?: string
    }
    onSuccess?: (paymentId: string, orderId: string) => void
    disabled?: boolean
}

export function FranchiseFeePayment({
    franchiseFee,
    setupCost,
    workingCapital,
    payerId,
    franchiseId,
    franchiserId,
    prefill,
    onSuccess,
    disabled
}: FranchiseFeePaymentProps) {
    const totalAmount = franchiseFee + setupCost + workingCapital

    return (
        <Card className="w-full max-w-md overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Franchise Onboarding</h3>
                    <p className="text-sm text-zinc-500">Secure payment via Razorpay</p>
                </div>
            </div>

            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Franchise Fee</span>
                        <span className="font-medium">₹{franchiseFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Setup & Equipment</span>
                        <span className="font-medium">₹{setupCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Working Capital Reserve</span>
                        <span className="font-medium">₹{workingCapital.toLocaleString('en-IN')}</span>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total Due</span>
                        <span className="font-bold text-xl text-zinc-900 dark:text-zinc-100">
                            ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
                <RazorpayCheckout
                    amountInr={totalAmount}
                    type="franchise_fee"
                    description="Franchise Onboarding Payment"
                    payerId={payerId}
                    franchiseId={franchiseId}
                    franchiserId={franchiserId}
                    prefill={prefill}
                    onSuccess={onSuccess}
                    disabled={disabled}
                >
                    <Button
                        className="w-full h-12 text-base font-medium"
                        disabled={disabled}
                    >
                        <Receipt className="w-4 h-4 mr-2" />
                        Proceed to Pay ₹{totalAmount.toLocaleString('en-IN')}
                    </Button>
                </RazorpayCheckout>
            </CardFooter>
        </Card>
    )
}
