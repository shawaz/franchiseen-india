'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BuildingIcon, Loader2 } from 'lucide-react'

// Mock IFSC validation for demo purposes. 
// In production, this would call a real IFSC API.
const getBankDetailsFromIFSC = async (ifsc: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (ifsc.length !== 11) throw new Error('Invalid IFSC code')

    // Return mock data
    return {
        BANK: ifsc.substring(0, 4).toUpperCase() + ' Bank',
        BRANCH: 'Main Branch',
        ADDRESS: 'Sample Address, City',
    }
}

const formSchema = z.object({
    accountHolderName: z.string().min(2, 'Name must be at least 2 characters.'),
    accountNumber: z.string().min(9, 'Account number must be between 9 and 18 digits.').max(18),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g., HDFC0001234)'),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    gstNumber: z.string().optional(),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers don't match",
    path: ["confirmAccountNumber"],
})

interface BankAccountFormProps {
    userId: Id<'users'>
    franchiserId?: Id<'franchiser'>
    accountType: 'franchisor' | 'franchisee' | 'investor'
    onSuccess?: () => void
}

export function BankAccountForm({ userId, franchiserId, accountType, onSuccess }: BankAccountFormProps) {
    const saveAccount = useMutation(api.razorpayManagement.saveRazorpayAccount)
    const [bankName, setBankName] = useState('')
    const [isVerifyingIfsc, setIsVerifyingIfsc] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountHolderName: '',
            accountNumber: '',
            confirmAccountNumber: '',
            ifscCode: '',
            panNumber: '',
            gstNumber: '',
        },
    })

    const verifyIfsc = async (ifsc: string) => {
        if (!ifsc || ifsc.length !== 11) {
            setBankName('')
            return
        }

        setIsVerifyingIfsc(true)
        try {
            const details = await getBankDetailsFromIFSC(ifsc)
            setBankName(`${details.BANK}, ${details.BRANCH}`)
            toast.success(`Bank found: ${details.BANK}`)
        } catch {
            setBankName('')
            toast.error('Could not verify IFSC code')
        } finally {
            setIsVerifyingIfsc(false)
        }
    }

    // Handle IFSC blur to trigger verification
    const handleIfscBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase()
        form.setValue('ifscCode', value)
        if (value.length === 11) {
            verifyIfsc(value)
        }
    }

    const maskAccountNumber = (acc: string) => {
        if (acc.length < 4) return acc
        return `${'X'.repeat(acc.length - 4)}${acc.slice(-4)}`
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!bankName) {
            toast.error('Please verify your IFSC code first')
            return
        }

        try {
            await saveAccount({
                userId,
                franchiserId,
                accountType,
                bankName,
                accountHolderName: values.accountHolderName,
                accountNumberMasked: maskAccountNumber(values.accountNumber),
                ifscCode: values.ifscCode,
                panNumber: values.panNumber,
                gstNumber: values.gstNumber,
            })

            toast.success('Bank details submitted successfully for KYC verification')
            form.reset()
            setBankName('')
            onSuccess?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save bank details')
        }
    }

    return (
        <Card className="w-full max-w-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="w-5 h-5" />
                    Bank Account Details
                </CardTitle>
                <CardDescription>
                    Enter your bank account details for payouts. These will be verified via Razorpay Route.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Must match exactly with the name on your bank account.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Number</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmAccountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Account Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter account number again" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="ifscCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IFSC Code</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., HDFC0001234"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                onBlur={handleIfscBlur}
                                                className="uppercase"
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => verifyIfsc(field.value)}
                                            disabled={field.value.length !== 11 || isVerifyingIfsc}
                                        >
                                            {isVerifyingIfsc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                        </Button>
                                    </div>
                                    {bankName && (
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center mt-2">
                                            <BuildingIcon className="w-3 h-3 mr-1" />
                                            {bankName}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="panNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PAN Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ABCDE1234F"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                className="uppercase"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gstNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GST Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="22AAAAA0000A1Z5"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                className="uppercase"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Details for Verification
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
