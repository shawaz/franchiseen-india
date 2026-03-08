"use client";

import React, { use } from 'react';
import FranchiseStore from '@/components/app/franchise/store/FranchiseStore';

interface FranchiseAccountProps {
  params: Promise<{
    brandSlug: string;
    franchiseSlug: string;
  }>;
}

export default function FranchiseAccount({ params }: FranchiseAccountProps) {
  const resolvedParams = use(params);

  return (
    <FranchiseStore
      franchiseId={resolvedParams.franchiseSlug}
      franchiserId={resolvedParams.brandSlug}
    />
  );
}