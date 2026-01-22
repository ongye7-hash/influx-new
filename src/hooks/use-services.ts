// ============================================
// Services Hook
// 서비스 목록 조회 훅
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Service, Category } from '@/types/database';

// ============================================
// Types
// ============================================
export interface ServiceWithCategory extends Service {
  category?: Category | null;
}

interface UseServicesReturn {
  services: ServiceWithCategory[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getServicesByCategory: (categoryId: string) => ServiceWithCategory[];
  searchServices: (query: string) => ServiceWithCategory[];
}

// ============================================
// Hook
// ============================================
export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<ServiceWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 조회
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 서비스와 카테고리 동시 조회
      const [servicesResult, categoriesResult] = await Promise.all([
        supabase
          .from('services')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

      if (servicesResult.error) throw servicesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setServices(servicesResult.data as ServiceWithCategory[] || []);
      setCategories(categoriesResult.data || []);
    } catch (err) {
      console.error('[useServices] Error:', err);
      setError(err instanceof Error ? err.message : '서비스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 카테고리별 서비스 필터링
  const getServicesByCategory = useCallback((categoryId: string): ServiceWithCategory[] => {
    return services.filter(s => s.category_id === categoryId);
  }, [services]);

  // 서비스 검색
  const searchServices = useCallback((query: string): ServiceWithCategory[] => {
    if (!query.trim()) return services;
    const lowerQuery = query.toLowerCase();
    return services.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery)
    );
  }, [services]);

  return {
    services,
    categories,
    isLoading,
    error,
    refetch: fetchData,
    getServicesByCategory,
    searchServices,
  };
}

// ============================================
// Helper: 카테고리 아이콘 매핑
// ============================================
export const CATEGORY_ICONS: Record<string, string> = {
  instagram: 'Users',
  youtube: 'Play',
  tiktok: 'Heart',
  twitter: 'Eye',
  telegram: 'MessageCircle',
  facebook: 'ThumbsUp',
  discord: 'MessageSquare',
  threads: 'AtSign',
  default: 'Sparkles',
};

// 카테고리 색상 매핑
export const CATEGORY_COLORS: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-600',
  youtube: 'from-red-500 to-red-600',
  tiktok: 'from-cyan-400 to-blue-500',
  twitter: 'from-blue-400 to-blue-600',
  telegram: 'from-sky-400 to-sky-600',
  facebook: 'from-blue-600 to-blue-700',
  discord: 'from-indigo-500 to-indigo-600',
  threads: 'from-gray-700 to-gray-900',
  default: 'from-violet-500 to-purple-600',
};
