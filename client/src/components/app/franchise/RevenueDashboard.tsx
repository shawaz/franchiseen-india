'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, TrendingUp, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface RevenueDashboardProps {
    franchiseId: string
}

export function RevenueDashboard({ franchiseId }: RevenueDashboardProps) {
    // @ts-ignore
    const data = useQuery(api.razorpayManagement.getTodaysInStoreRevenue, { franchiseId })

    if (data === undefined) {
        return (
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-500">Today's In-Store Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <IndianRupee className="w-24 h-24" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Today's In-Store Revenue
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        ₹{data.totalInRupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center text-sm text-zinc-500 mt-1">
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium mr-2">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
                        </span>
                        completed today
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
