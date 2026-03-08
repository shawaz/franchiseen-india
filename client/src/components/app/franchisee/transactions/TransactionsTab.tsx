"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

export default function TransactionsTab() {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Get shares data from Convex using Clerk user ID
  const sharesData = useQuery(api.franchiseManagement.getSharesByInvestor, {
    investorId: userProfile?._id || 'no-user'
  });

  // Get platform wallet transactions (credits top-ups and spends)
  const walletTxns = useQuery(
    api.platformWallet.getWalletTransactions,
    userProfile?._id ? { userId: userProfile._id as any, limit: 50 } : 'skip'
  );

  // Build unified transaction list from Convex data
  const allTransactions = useMemo(() => {
    const shareTxns = (sharesData || []).map((share) => ({
      id: share._id,
      type: 'share_purchase' as const,
      amount: share.totalAmount,
      description: `Purchased ${share.sharesPurchased} share${share.sharesPurchased > 1 ? 's' : ''} in ${share.franchise?.franchiseSlug || 'Unknown Franchise'}`,
      franchiseSlug: share.franchise?.franchiseSlug,
      status: 'confirmed' as const,
      transactionHash: share.transactionHash,
      timestamp: share.purchasedAt,
      sharesPurchased: share.sharesPurchased,
      sharePrice: share.sharePrice,
    }));

    const creditTxns = (walletTxns || []).map((tx) => ({
      id: tx._id,
      type: tx.type === 'load' ? 'deposit' as const :
            tx.type === 'refund' ? 'refund' as const : 'withdrawal' as const,
      amount: tx.amountInPaise / 100,
      description: tx.description,
      franchiseSlug: undefined as string | undefined,
      status: 'confirmed' as const,
      transactionHash: undefined as string | undefined,
      timestamp: tx.createdAt,
      sharesPurchased: undefined as number | undefined,
      sharePrice: undefined as number | undefined,
    }));

    return [...shareTxns, ...creditTxns].sort((a, b) => b.timestamp - a.timestamp);
  }, [sharesData, walletTxns]);

  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.franchiseSlug?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (tx.transactionHash?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'share_purchase': return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'refund': return <ArrowDownLeft className="h-4 w-4 text-purple-500" />;
      default: return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!userProfile?._id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Sign in to view your transactions</p>
        </div>
      </div>
    );
  }

  if (sharesData === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-gray-600 dark:text-gray-400">Share purchases and credits activity</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="all">All Types</option>
          <option value="share_purchase">Share Purchases</option>
          <option value="deposit">Credits Added</option>
          <option value="withdrawal">Credits Spent</option>
          <option value="refund">Refunds</option>
        </select>
      </div>

      {/* Transactions List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Franchise</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(tx.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</div>
                          {tx.sharesPurchased && (
                            <div className="text-xs text-gray-500">
                              {tx.sharesPurchased} share{tx.sharesPurchased > 1 ? 's' : ''} @ ₹{tx.sharePrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {tx.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tx.franchiseSlug || '-'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(tx.status)}
                        <span className="ml-2 text-sm capitalize">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {tx.transactionHash ? (
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                            {tx.transactionHash.slice(0, 8)}...
                          </span>
                          <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery || filterType !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Share purchases and credit activity will appear here'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-xl font-bold">{filteredTransactions.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            <p className="text-xl font-bold">
              ₹{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Share Purchases</p>
            <p className="text-xl font-bold">
              {filteredTransactions.filter((t) => t.type === 'share_purchase').length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
