import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Brand {
  id: string;
  title: string;
  budget: string;
  earnings: number;
  category: string;
  image: { uri: string };
  logo: { uri: string };
}

interface LikedBrandsContextType {
  likedBrands: Brand[];
  toggleLike: (brand: Brand) => void;
  isLiked: (id: string) => boolean;
}

const LikedBrandsContext = createContext<LikedBrandsContextType | undefined>(undefined);

export const LikedBrandsProvider = ({ children }: { children: ReactNode }) => {
  const [likedBrands, setLikedBrands] = useState<Brand[]>([]);

  const toggleLike = (brand: Brand) => {
    setLikedBrands(prev => {
      const isAlreadyLiked = prev.some(b => b.id === brand.id);
      if (isAlreadyLiked) {
        return prev.filter(b => b.id !== brand.id);
      } else {
        return [...prev, brand];
      }
    });
  };

  const isLiked = (id: string) => {
    return likedBrands.some(brand => brand.id === id);
  };

  return (
    <LikedBrandsContext.Provider value={{ likedBrands, toggleLike, isLiked }}>
      {children}
    </LikedBrandsContext.Provider>
  );
};

export const useLikedBrands = () => {
  const context = useContext(LikedBrandsContext);
  if (context === undefined) {
    throw new Error('useLikedBrands must be used within a LikedBrandsProvider');
  }
  return context;
};
