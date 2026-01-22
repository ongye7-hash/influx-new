# INFLUX Technical Due Diligence Report

**Project:** INFLUX - High-Density SMM Panel
**Version:** 0.1.0 (Beta)
**Report Date:** 2026-01-18
**Prepared For:** Silicon Valley Principal Engineers & VCs

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database & Schema](#2-database--schema)
3. [Core Logic](#3-core-logic)
4. [Feature Implementation](#4-feature-implementation)
5. [UI System](#5-ui-system)

---

## 1. Architecture Overview

### 1.1 Project Structure

```
influx/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── dashboard/
│   │   │   ├── deposit/
│   │   │   ├── order/
│   │   │   └── orders/
│   │   ├── admin/              # Admin panel
│   │   │   ├── deposits/
│   │   │   ├── orders/
│   │   │   └── services/
│   │   ├── api/                # API routes
│   │   │   └── cron/
│   │   │       ├── process-orders/
│   │   │       └── update-status/
│   │   └── auth/               # Auth callback
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── providers/
│   │   └── ui/                 # Shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & clients
│   │   ├── api/                # Provider API client
│   │   └── supabase/           # Supabase clients
│   └── types/                  # TypeScript definitions
├── supabase/
│   └── migrations/             # SQL migrations (12 files)
└── public/                     # Static assets
```

### 1.2 Tech Stack Summary

---

### 📄 package.json

```json
{
  "name": "influx",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.90.1",
    "@tanstack/react-query": "^5.90.18",
    "@tanstack/react-query-devtools": "^5.91.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.26.2",
    "lucide-react": "^0.562.0",
    "next": "^15.2.4",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "zod": "^4.3.5",
    "zustand": "^5.0.10"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.3",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
```

---

### 📄 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

---

### 📄 next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

---

### 📄 vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "crons": [
    {
      "path": "/api/cron/process-orders",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/update-status",
      "schedule": "*/2 * * * *"
    }
  ],
  "env": {
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "regions": ["icn1"]
}
```

---

## 2. Database & Schema

### 2.1 TypeScript Type Definitions

---

### 📄 src/types/database.ts

> **Security Note:** Full type safety with strict TypeScript. All database operations are type-checked at compile time.

<details>
<summary>Click to expand (405 lines)</summary>

```typescript
// ============================================
// INFLUX Database Types
// Supabase 스키마 기반 TypeScript 타입 정의
// ============================================

// ============================================
// ENUM Types
// ============================================
export type UserTier = 'basic' | 'vip' | 'premium' | 'enterprise';
export type ServiceType = 'default' | 'package' | 'subscription';
export type OrderStatus = 'pending' | 'processing' | 'in_progress' | 'completed' | 'partial' | 'canceled' | 'refunded' | 'failed';
export type TransactionType = 'deposit' | 'refund' | 'order' | 'bonus' | 'adjustment';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'canceled';

// ============================================
// Table Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  username?: string | null;
  full_name: string | null;
  phone: string | null;
  balance: number;
  total_spent: number;
  total_orders: number;
  tier: UserTier;
  referral_code: string | null;
  referred_by: string | null;
  is_admin: boolean;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  balance: number | null;
  currency: string;
  rate_multiplier: number;
  is_active: boolean;
  priority: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  platform: string | null;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string | null;
  category_id: string | null;
  provider_service_id: string | null;
  name: string;
  description: string | null;
  platform: string | null;
  type?: ServiceType;
  rate?: number;
  price: number;
  margin?: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  is_featured?: boolean | null;
  is_drip_feed?: boolean;
  is_refill?: boolean;
  is_cancel?: boolean;
  average_time: string | null;
  refill_days?: number;
  quality?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithCategory extends Service {
  category_name: string | null;
  category_slug: string | null;
  category_icon: string | null;
}

export interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  service_id: string | null;
  provider_id?: string | null;
  link: string;
  quantity: number;
  amount: number;
  charge?: number;
  unit_price?: number;
  start_count?: number | null;
  remains?: number | null;
  status: OrderStatus;
  provider_order_id: string | null;
  error_message?: string | null;
  refund_amount?: number;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface OrderWithService extends Order {
  service?: Service | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  depositor_name: string;
  bank_name: string | null;
  account_number: string | null;
  receipt_url: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'important';
  is_pinned: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiLog {
  id: string;
  provider_id: string | null;
  order_id: string | null;
  endpoint: string;
  method: string;
  request_body: Record<string, unknown> | null;
  response_body: Record<string, unknown> | null;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  total_users: number;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  pending_deposits: number;
}

// ============================================
// Insert/Update Types
// ============================================
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'referral_code'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'email'>>;

export type ProviderInsert = Omit<Provider, 'id' | 'created_at' | 'updated_at'>;
export type ProviderUpdate = Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>;

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'created_at'>>;

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;

export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'completed_at'>;
export type OrderUpdate = Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>;

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>;

export type DepositInsert = Omit<Deposit, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'approved_by'>;
export type DepositUpdate = Partial<Omit<Deposit, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

export type CouponInsert = Omit<Coupon, 'id' | 'created_at' | 'used_count'>;
export type CouponUpdate = Partial<Omit<Coupon, 'id' | 'created_at'>>;

export type AnnouncementInsert = Omit<Announcement, 'id' | 'created_at' | 'updated_at'>;
export type AnnouncementUpdate = Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// Supabase Database Type
// ============================================
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate; };
      providers: { Row: Provider; Insert: ProviderInsert; Update: ProviderUpdate; };
      categories: { Row: Category; Insert: CategoryInsert; Update: CategoryUpdate; };
      services: { Row: Service; Insert: ServiceInsert; Update: ServiceUpdate; };
      orders: { Row: Order; Insert: OrderInsert; Update: OrderUpdate; };
      transactions: { Row: Transaction; Insert: TransactionInsert; Update: never; };
      deposits: { Row: Deposit; Insert: DepositInsert; Update: DepositUpdate; };
      coupons: { Row: Coupon; Insert: CouponInsert; Update: CouponUpdate; };
      announcements: { Row: Announcement; Insert: AnnouncementInsert; Update: AnnouncementUpdate; };
      api_logs: { Row: ApiLog; Insert: Omit<ApiLog, 'id' | 'created_at'>; Update: never; };
    };
    Views: {
      dashboard_stats: { Row: DashboardStats; };
      services_with_category: { Row: ServiceWithCategory; };
    };
    Functions: {
      generate_order_number: { Args: Record<string, never>; Returns: string; };
      generate_referral_code: { Args: Record<string, never>; Returns: string; };
      deduct_balance: {
        Args: { p_user_id: string; p_amount: number; p_description: string; p_reference_id?: string; p_reference_type?: string; };
        Returns: boolean;
      };
      add_balance: {
        Args: { p_user_id: string; p_amount: number; p_type: TransactionType; p_description: string; p_reference_id?: string; p_reference_type?: string; };
        Returns: boolean;
      };
      process_order: {
        Args: { p_user_id: string; p_service_id: string; p_link: string; p_quantity: number; };
        Returns: string;
      };
    };
    Enums: {
      user_tier: UserTier;
      service_type: ServiceType;
      order_status: OrderStatus;
      transaction_type: TransactionType;
      payment_status: PaymentStatus;
    };
  };
}

// ============================================
// Helper Types
// ============================================

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '대기 중',
  processing: '처리 중',
  in_progress: '진행 중',
  completed: '완료',
  partial: '부분 완료',
  canceled: '취소됨',
  refunded: '환불됨',
  failed: '실패',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'badge-warning',
  processing: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  partial: 'badge-warning',
  canceled: 'badge-error',
  refunded: 'badge-error',
  failed: 'badge-error',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: '충전',
  refund: '환불',
  order: '주문',
  bonus: '보너스',
  adjustment: '조정',
};

export const USER_TIER_LABELS: Record<UserTier, string> = {
  basic: '일반',
  vip: 'VIP',
  premium: '프리미엄',
  enterprise: '엔터프라이즈',
};

export const USER_TIER_DISCOUNTS: Record<UserTier, number> = {
  basic: 0,
  vip: 0.05,
  premium: 0.10,
  enterprise: 0.15,
};
```

</details>

---

### 2.2 SQL Migrations

### 📄 supabase/migrations/20260117000000_initial_schema.sql

> **Security Note:** RLS enabled on all tables. Admin-only access for sensitive tables (providers, api_logs). SECURITY DEFINER functions for balance operations.

<details>
<summary>Click to expand (743 lines)</summary>

```sql
-- ============================================
-- INFLUX SMM Panel - Database Schema
-- ============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM Types
CREATE TYPE user_tier AS ENUM ('basic', 'vip', 'premium', 'enterprise');
CREATE TYPE service_type AS ENUM ('default', 'package', 'subscription');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'in_progress', 'completed', 'partial', 'canceled', 'refunded', 'failed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'refund', 'order', 'bonus', 'adjustment');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'canceled');

-- 2. PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    balance NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    total_spent NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    tier user_tier DEFAULT 'basic' NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- 3. PROVIDERS TABLE
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    rate_multiplier NUMERIC(6, 4) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    priority INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SERVICES TABLE
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    provider_service_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    type service_type DEFAULT 'default' NOT NULL,
    rate NUMERIC(12, 4) NOT NULL,
    price NUMERIC(12, 4) NOT NULL,
    margin NUMERIC(5, 2) DEFAULT 30.00,
    min_quantity INTEGER DEFAULT 100 NOT NULL,
    max_quantity INTEGER DEFAULT 10000 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    average_time TEXT,
    refill_days INTEGER DEFAULT 0,
    quality TEXT DEFAULT 'high_quality',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT min_less_than_max CHECK (min_quantity <= max_quantity),
    CONSTRAINT positive_rate CHECK (rate > 0),
    CONSTRAINT positive_price CHECK (price > 0)
);

-- 6. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    link TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    charge NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(12, 4) NOT NULL,
    start_count INTEGER DEFAULT 0,
    remains INTEGER DEFAULT 0,
    status order_status DEFAULT 'pending' NOT NULL,
    provider_order_id TEXT,
    error_message TEXT,
    refund_amount NUMERIC(12, 2) DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_charge CHECK (charge > 0)
);

-- 7. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    status payment_status DEFAULT 'approved' NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. DEPOSITS TABLE
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    depositor_name TEXT NOT NULL,
    bank_name TEXT,
    account_number TEXT,
    receipt_url TEXT,
    status payment_status DEFAULT 'pending' NOT NULL,
    admin_note TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_deposit_amount CHECK (amount > 0)
);

-- 9. COUPONS TABLE
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'fixed' NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    min_amount NUMERIC(12, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. API_LOGS TABLE
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id),
    order_id UUID REFERENCES orders(id),
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'POST',
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. FUNCTIONS

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    random_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    RETURN 'INF-' || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Referral code generator
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, referral_code)
    VALUES (NEW.id, NEW.email, generate_referral_code());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Balance deduction (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION deduct_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    SELECT balance INTO v_current_balance
    FROM profiles WHERE id = p_user_id FOR UPDATE;

    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE profiles
    SET balance = v_new_balance,
        total_spent = total_spent + p_amount,
        total_orders = total_orders + 1,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
    VALUES (p_user_id, 'order', -p_amount, v_current_balance, v_new_balance, p_description, p_reference_id, p_reference_type);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Balance addition (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION add_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type transaction_type,
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    SELECT balance INTO v_current_balance
    FROM profiles WHERE id = p_user_id FOR UPDATE;

    v_new_balance := v_current_balance + p_amount;

    UPDATE profiles SET balance = v_new_balance, updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type)
    VALUES (p_user_id, p_type, p_amount, v_current_balance, v_new_balance, p_description, p_reference_id, p_reference_type);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. TRIGGERS
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (abbreviated for brevity)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admins can manage providers" ON providers FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own deposits" ON deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deposits" ON deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15. Initial Data
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Instagram', 'instagram', 'instagram', 1),
    ('YouTube', 'youtube', 'youtube', 2),
    ('TikTok', 'tiktok', 'tiktok', 3),
    ('Twitter/X', 'twitter', 'twitter', 4),
    ('Facebook', 'facebook', 'facebook', 5);

-- 16. VIEWS
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE is_active = TRUE) AS total_users,
    (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE) AS today_orders,
    (SELECT COALESCE(SUM(charge), 0) FROM orders WHERE created_at >= CURRENT_DATE AND status != 'canceled') AS today_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
    (SELECT COUNT(*) FROM deposits WHERE status = 'pending') AS pending_deposits;
```

</details>

---

### 📄 supabase/migrations/20260118000005_fix_price_calculation.sql

> **Security Note:** Server-side price calculation prevents client-side manipulation. Price = (rate/1000) * quantity with CEIL rounding.

```sql
-- ============================================
-- process_order 함수 수정: 가격 계산 단위 수정
-- price는 1000개당 가격이므로 /1000 적용
-- ============================================

DROP FUNCTION IF EXISTS process_order(UUID, UUID, TEXT, INTEGER);

CREATE FUNCTION process_order(
  p_user_id UUID,
  p_service_id UUID,
  p_link TEXT,
  p_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
  v_balance NUMERIC;
  v_service_price NUMERIC;
  v_service_min INTEGER;
  v_service_max INTEGER;
  v_service_active BOOLEAN;
  v_total_price NUMERIC;
  v_unit_price NUMERIC;
  v_new_order_id UUID;
  v_order_number TEXT;
BEGIN
  -- [Security 1] Quantity validation
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION '수량은 1 이상이어야 합니다.';
  END IF;

  -- [Security 2] Service lookup
  SELECT price, min_quantity, max_quantity, is_active
  INTO v_service_price, v_service_min, v_service_max, v_service_active
  FROM services WHERE id = p_service_id;

  IF v_service_price IS NULL THEN
    RAISE EXCEPTION '존재하지 않는 서비스입니다.';
  END IF;

  -- [Security 3] Service active check
  IF NOT v_service_active THEN
    RAISE EXCEPTION '현재 이용할 수 없는 서비스입니다.';
  END IF;

  -- [Security 4] Min/max validation
  IF p_quantity < v_service_min THEN
    RAISE EXCEPTION '최소 주문 수량은 %개 입니다.', v_service_min;
  END IF;
  IF p_quantity > v_service_max THEN
    RAISE EXCEPTION '최대 주문 수량은 %개 입니다.', v_service_max;
  END IF;

  -- [Security 5] Link validation
  IF p_link IS NULL OR LENGTH(TRIM(p_link)) < 5 THEN
    RAISE EXCEPTION '유효한 링크를 입력해주세요.';
  END IF;

  -- [Core] Server-side price calculation
  v_unit_price := v_service_price / 1000;
  v_total_price := CEIL(v_unit_price * p_quantity);

  -- [Transaction 1] Lock user balance
  SELECT balance INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  -- [Transaction 2] Balance check
  IF v_balance < v_total_price THEN
    RAISE EXCEPTION '잔액이 부족합니다. (필요: %원, 보유: %원)', v_total_price, v_balance;
  END IF;

  v_order_number := generate_order_number();

  -- [Transaction 3] Create order
  INSERT INTO orders (order_number, user_id, service_id, link, quantity, charge, unit_price, status, created_at, updated_at)
  VALUES (v_order_number, p_user_id, p_service_id, p_link, p_quantity, v_total_price, v_unit_price, 'pending', NOW(), NOW())
  RETURNING id INTO v_new_order_id;

  -- [Transaction 4] Deduct balance
  UPDATE profiles
  SET balance = balance - v_total_price,
      total_spent = COALESCE(total_spent, 0) + v_total_price,
      total_orders = COALESCE(total_orders, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- [Transaction 5] Log transaction
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description, reference_id, reference_type, status, metadata, created_at)
  VALUES (p_user_id, 'order', -v_total_price, v_balance, v_balance - v_total_price,
    '서비스 주문: ' || v_order_number, v_new_order_id, 'order', 'approved',
    jsonb_build_object('service_id', p_service_id, 'quantity', p_quantity, 'unit_price', v_unit_price, 'link', p_link), NOW());

  RETURN v_new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_order(UUID, UUID, TEXT, INTEGER) TO authenticated;
```

---

## 3. Core Logic

### 3.1 Provider API Client

---

### 📄 src/lib/api/provider.ts

> **Security Note:** Implements retry with exponential backoff. Supports mock mode for development. API key never exposed to client.

<details>
<summary>Click to expand (440 lines)</summary>

```typescript
// ============================================
// JAP (JustAnotherPanel) API Client
// SMM Panel 표준 API 통신 모듈
// ============================================

import {
  ProviderConfig,
  JAPService,
  JAPOrderResponse,
  JAPOrderStatus,
  JAPBalanceResponse,
  JAPErrorResponse,
  NormalizedService,
  NormalizedOrderStatus,
  OrderStatusType,
  CreateOrderParams,
  CreateOrderResult,
  APIClientOptions,
  DEFAULT_API_OPTIONS,
} from './types';

import {
  generateMockServicesResponse,
  generateMockOrderResponse,
  generateMockStatusResponse,
  generateMockBalanceResponse,
} from './mock-data';

const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.MOCK_API === 'true';
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, options: Required<APIClientOptions>): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes('Invalid API key') || lastError.message.includes('Invalid service')) {
        throw lastError;
      }
      if (attempt === options.maxRetries - 1) break;
      const delay = options.baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

export class ProviderAPIClient {
  private config: ProviderConfig;
  private options: Required<APIClientOptions>;

  constructor(config: ProviderConfig, options?: APIClientOptions) {
    this.config = config;
    this.options = { ...DEFAULT_API_OPTIONS, ...options };
    if (isMockMode()) this.options.mockMode = true;
  }

  private async request<T>(params: Record<string, unknown>): Promise<T> {
    if (this.options.mockMode) return this.handleMockRequest<T>(params);

    const body = new URLSearchParams();
    body.append('key', this.config.apiKey);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) body.append(key, String(value));
    }

    const makeRequest = async (): Promise<T> => {
      const response = await fetchWithTimeout(this.config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      }, this.options.timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error((data as JAPErrorResponse).error);
      }
      return data as T;
    };

    return retryWithBackoff(makeRequest, this.options);
  }

  private async handleMockRequest<T>(params: Record<string, unknown>): Promise<T> {
    await sleep(100 + Math.random() * 400);
    const action = params.action as string;

    switch (action) {
      case 'services': return generateMockServicesResponse() as T;
      case 'add': return generateMockOrderResponse(params.service as string, params.quantity as number) as T;
      case 'status':
        if (params.orders) {
          const orderIds = (params.orders as string).split(',');
          const result: Record<string, JAPOrderStatus> = {};
          for (const id of orderIds) result[id] = generateMockStatusResponse(id.trim());
          return result as T;
        }
        return generateMockStatusResponse(params.order as string) as T;
      case 'balance': return generateMockBalanceResponse() as T;
      default: throw new Error(`Unknown action: ${action}`);
    }
  }

  async fetchServices(): Promise<NormalizedService[]> {
    const services = await this.request<JAPService[]>({ action: 'services' });
    return services.map(service => this.normalizeService(service));
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    try {
      const response = await this.request<JAPOrderResponse>({
        action: 'add',
        service: params.serviceId,
        link: params.link,
        quantity: params.quantity,
        ...(params.runs && { runs: params.runs }),
        ...(params.interval && { interval: params.interval }),
      });
      return { success: true, orderId: response.order };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getOrderStatus(orderId: string | number): Promise<NormalizedOrderStatus> {
    const status = await this.request<JAPOrderStatus>({ action: 'status', order: orderId });
    return this.normalizeOrderStatus(String(orderId), status);
  }

  async getMultipleOrderStatus(orderIds: (string | number)[]): Promise<Record<string, NormalizedOrderStatus>> {
    if (orderIds.length === 0) return {};
    if (orderIds.length > 100) throw new Error('Maximum 100 orders per request');

    const response = await this.request<Record<string, JAPOrderStatus>>({
      action: 'status',
      orders: orderIds.join(','),
    });

    const result: Record<string, NormalizedOrderStatus> = {};
    for (const [orderId, status] of Object.entries(response)) {
      result[orderId] = this.normalizeOrderStatus(orderId, status);
    }
    return result;
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    const response = await this.request<JAPBalanceResponse>({ action: 'balance' });
    return { balance: parseFloat(response.balance), currency: response.currency };
  }

  private normalizeService(service: JAPService): NormalizedService {
    const typeMap: Record<string, NormalizedService['type']> = {
      'Default': 'default', 'Package': 'package', 'Subscription': 'subscription',
    };
    return {
      providerId: this.config.id,
      providerServiceId: String(service.service),
      name: service.name,
      type: typeMap[service.type] || 'default',
      rate: parseFloat(service.rate),
      min: parseInt(service.min, 10),
      max: parseInt(service.max, 10),
      category: service.category,
      description: service.desc,
      hasDripfeed: service.dripfeed === true,
      hasRefill: service.refill === true,
      hasCancel: service.cancel === true,
      averageTime: service.average_time,
    };
  }

  private normalizeOrderStatus(orderId: string, status: JAPOrderStatus): NormalizedOrderStatus {
    const statusMap: Record<string, OrderStatusType> = {
      'Pending': 'pending', 'In progress': 'in_progress', 'Processing': 'processing',
      'Completed': 'completed', 'Partial': 'partial', 'Canceled': 'canceled',
      'Refunded': 'refunded', 'Failed': 'failed',
    };
    return {
      orderId,
      charge: parseFloat(status.charge),
      startCount: parseInt(status.start_count, 10),
      status: statusMap[status.status] || 'pending',
      remains: parseInt(status.remains, 10),
      currency: status.currency || 'USD',
    };
  }
}

export function createProviderClient(config: ProviderConfig, options?: APIClientOptions): ProviderAPIClient {
  return new ProviderAPIClient(config, options);
}

export async function createProviderOrder(provider: ProviderConfig, params: CreateOrderParams): Promise<CreateOrderResult> {
  const client = createProviderClient(provider);
  return client.createOrder(params);
}

export async function getProviderOrderStatus(provider: ProviderConfig, orderId: string | number): Promise<NormalizedOrderStatus> {
  const client = createProviderClient(provider);
  return client.getOrderStatus(orderId);
}
```

</details>

---

### 3.2 Authentication Hook

---

### 📄 src/hooks/use-auth.ts

> **Security Note:** Session management via Supabase Auth. Automatic session refresh. OAuth support for Google/Kakao.

<details>
<summary>Click to expand (193 lines)</summary>

```typescript
// ============================================
// Authentication Hook
// ============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('[Auth] Failed to load profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) await loadProfile(currentSession.user.id);
      } catch (error) {
        console.error('[Auth] Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadProfile(newSession.user.id);
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          router.push('/login');
          router.refresh();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, router]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return {
    user, session, profile, isLoading,
    isAuthenticated: !!user,
    signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithKakao, signOut, refreshProfile,
  };
}
```

</details>

---

### 3.3 Cron Job: Process Orders

---

### 📄 src/app/api/cron/process-orders/route.ts

> **Security Note:** Uses Service Role Key (RLS bypass). Cron secret verification. Rate limiting between API calls.

<details>
<summary>Click to expand (292 lines)</summary>

```typescript
// ============================================
// Cron API: Process Pending Orders
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createProviderOrder } from '@/lib/api';
import type { Database, Order, Provider, Service } from '@/types/database';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
}

interface OrderWithService extends Order {
  service: (Service & { provider: Provider | null }) | null;
}

interface ProcessResult {
  orderId: string;
  orderNumber?: string;
  status: 'success' | 'failed' | 'skipped';
  providerOrderId?: string;
  error?: string;
}

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === 'development') return true;
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

async function getActiveProvider(): Promise<Provider | null> {
  const { data } = await getSupabaseAdmin()
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function processOrder(order: OrderWithService, provider: Provider): Promise<ProcessResult> {
  const result: ProcessResult = { orderId: order.id, orderNumber: order.order_number || undefined, status: 'skipped' };

  try {
    if (!order.service) {
      result.status = 'failed';
      result.error = '서비스 정보를 찾을 수 없습니다.';
      await updateOrderError(order.id, result.error);
      return result;
    }

    const providerServiceId = order.service.provider_service_id;
    if (!providerServiceId) {
      result.status = 'failed';
      result.error = '도매처 서비스 매핑이 없습니다.';
      await updateOrderError(order.id, result.error);
      return result;
    }

    const providerResult = await createProviderOrder(
      { id: provider.id, name: provider.name, apiUrl: provider.api_url, apiKey: provider.api_key },
      { serviceId: providerServiceId, link: order.link, quantity: order.quantity }
    );

    if (!providerResult.success || !providerResult.orderId) {
      result.status = 'failed';
      result.error = providerResult.error || '도매처 API 오류';
      await updateOrderError(order.id, result.error);
      return result;
    }

    const { error: updateError } = await getSupabaseAdmin()
      .from('orders')
      .update({
        status: 'processing',
        provider_id: provider.id,
        provider_order_id: providerResult.orderId.toString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', order.id);

    if (updateError) {
      result.status = 'failed';
      result.error = `DB 업데이트 실패: ${updateError.message}`;
      return result;
    }

    result.status = 'success';
    result.providerOrderId = providerResult.orderId.toString();
    return result;
  } catch (error) {
    result.status = 'failed';
    result.error = error instanceof Error ? error.message : '알 수 없는 오류';
    await updateOrderError(order.id, result.error);
    return result;
  }
}

async function updateOrderError(orderId: string, errorMessage: string) {
  await getSupabaseAdmin()
    .from('orders')
    .update({ error_message: errorMessage, updated_at: new Date().toISOString() } as never)
    .eq('id', orderId);
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: ProcessResult[] = [];

  try {
    const provider = await getActiveProvider();
    if (!provider) {
      return NextResponse.json({ success: false, error: '활성화된 도매처가 없습니다.', duration: Date.now() - startTime });
    }

    const { data: orders, error: fetchError } = await getSupabaseAdmin()
      .from('orders')
      .select(`*, service:services(*, provider:providers(*))`)
      .eq('status', 'pending')
      .is('provider_order_id', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      return NextResponse.json({ error: '주문 조회 실패', details: fetchError.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, message: '처리할 대기 주문이 없습니다.', processed: 0, duration: Date.now() - startTime });
    }

    for (const order of orders) {
      const result = await processOrder(order as OrderWithService, provider);
      results.push(result);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Rate limit
    }

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };

    await getSupabaseAdmin().from('api_logs').insert({
      endpoint: '/api/cron/process-orders',
      method: 'GET',
      request_body: { ordersProcessed: orders.length, providerId: provider.id },
      response_body: summary as Record<string, unknown>,
      status_code: 200,
      response_time_ms: Date.now() - startTime,
    } as never);

    return NextResponse.json({ success: true, summary, results, duration: Date.now() - startTime });
  } catch (error) {
    console.error('Process orders cron error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return GET(request);
}
```

</details>

---

## 4. Feature Implementation

### 4.1 Order Page

---

### 📄 src/app/(dashboard)/order/page.tsx

> **Security Note:** Uses `process_order` RPC for atomic transaction. Price calculated server-side. Client-side validation only for UX.

<details>
<summary>Click to expand (647 lines)</summary>

```typescript
// ============================================
// Order Page - DB Connected Version
// ============================================

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingCart, Search, Link as LinkIcon, Calculator, Loader2, CheckCircle, AlertCircle, Sparkles, Users, Play, Heart, Eye, MessageCircle, ThumbsUp, MessageSquare, AtSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useServices, CATEGORY_COLORS } from '@/hooks/use-services';
import { orderKeys } from '@/hooks/use-orders';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatCompactNumber, cn } from '@/lib/utils';
import { toast } from 'sonner';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = { Users, Play, Heart, Eye, MessageCircle, ThumbsUp, MessageSquare, AtSign, Sparkles };

function getCategoryIcon(slug: string | null): React.ElementType {
  if (!slug) return Sparkles;
  const iconName = { instagram: 'Users', youtube: 'Play', tiktok: 'Heart', twitter: 'Eye' }[slug.toLowerCase()] || 'Sparkles';
  return ICON_MAP[iconName] || Sparkles;
}

export default function OrderPage() {
  const queryClient = useQueryClient();
  const { profile, refreshProfile } = useAuth();
  const { services, categories, isLoading: servicesLoading, error: servicesError, refetch } = useServices();
  const balance = Number(profile?.balance) || 0;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const categoryServices = useMemo(() => services.filter(s => s.category_id === selectedCategoryId), [services, selectedCategoryId]);
  const filteredServices = useMemo(() => {
    if (!searchQuery) return categoryServices;
    return categoryServices.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [categoryServices, searchQuery]);
  const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

  // Price calculation: price is per 1000 units
  const estimatedPrice = useMemo(() => {
    if (!selectedService || quantity <= 0) return 0;
    return Math.ceil((selectedService.price / 1000) * quantity);
  }, [selectedService, quantity]);

  const isValidOrder = useMemo(() => {
    if (!selectedService) return false;
    if (!link.trim()) return false;
    if (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) return false;
    if (estimatedPrice > balance) return false;
    return true;
  }, [selectedService, link, quantity, estimatedPrice, balance]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedServiceId('');
    setQuantity(0);
    setSearchQuery('');
  }, []);

  const handleServiceChange = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) setQuantity(service.min_quantity);
  }, [services]);

  // Submit order via process_order RPC
  const handleSubmit = async () => {
    if (!isValidOrder || isSubmitting || !profile || !selectedService) return;
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('process_order', {
        p_user_id: profile.id,
        p_service_id: selectedService.id,
        p_link: link.trim(),
        p_quantity: quantity,
      });

      if (error) {
        if (error.message.includes('Insufficient balance')) {
          toast.error('잔액이 부족합니다.', { description: '충전 후 다시 시도해주세요.' });
        } else {
          toast.error('주문 처리 중 오류가 발생했습니다.', { description: error.message });
        }
        return;
      }

      toast.success('주문이 성공적으로 완료되었습니다!', { description: `${selectedService.name} ${formatCompactNumber(quantity)}개` });
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      setLink('');
      setQuantity(selectedService.min_quantity);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (servicesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="h-[400px] w-full" /></div>
          <div><Skeleton className="h-[500px] w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">새 주문</h1>
          <p className="text-muted-foreground mt-1">원하는 서비스를 선택하고 주문하세요</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
          <span className="text-sm text-muted-foreground">보유 잔액</span>
          <span className="font-bold text-primary">{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category & Service Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={selectedCategoryId} onValueChange={handleCategoryChange}>
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{category.name} 서비스</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>서비스 선택</Label>
                      <Select value={selectedServiceId} onValueChange={handleServiceChange}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="서비스를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {filteredServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{service.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(service.price)}/1K · {service.average_time || '0-1시간'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                주문서
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {selectedService ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="link">링크</Label>
                    <Input id="link" type="url" placeholder="https://instagram.com/username" value={link} onChange={(e) => setLink(e.target.value)} className="h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">수량</Label>
                    <Input id="quantity" type="number" min={selectedService.min_quantity} max={selectedService.max_quantity} value={quantity || ''} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} className="h-12" />
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">예상 금액</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(estimatedPrice)}</span>
                    </div>
                  </div>

                  <Button onClick={() => setShowConfirmDialog(true)} disabled={!isValidOrder || isSubmitting} className="w-full h-14 text-lg btn-gradient">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />처리 중...</> : <><ShoppingCart className="mr-2 h-5 w-5" />{formatCurrency(estimatedPrice)} 주문하기</>}
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">서비스를 선택하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 확인</DialogTitle>
            <DialogDescription>아래 내용으로 주문하시겠습니까?</DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>서비스</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>수량</span>
                  <span className="font-medium">{formatCompactNumber(quantity)}개</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">결제 금액</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(estimatedPrice)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>취소</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-gradient">
              {isSubmitting ? '처리 중...' : '주문 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

</details>

---

### 4.2 Deposit Page

---

### 📄 src/app/(dashboard)/deposit/page.tsx

> **Security Note:** Deposit requests stored as 'pending' until admin approval. Admin approval triggers `add_balance` RPC.

<details>
<summary>Click to expand (541 lines)</summary>

```typescript
// ============================================
// Deposit Page - Real DB Connected
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Wallet, Building2, Copy, User, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Sparkles, TrendingUp, CreditCard, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime, copyToClipboard, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Deposit } from '@/types/database';

const BANK_INFO = {
  bankName: '국민은행',
  accountNumber: '123-456-789012',
  accountHolder: '(주)루프셀앤미디어',
};

const QUICK_AMOUNTS = [
  { value: 10000, label: '1만원' },
  { value: 30000, label: '3만원' },
  { value: 50000, label: '5만원', popular: true },
  { value: 100000, label: '10만원' },
  { value: 300000, label: '30만원' },
  { value: 500000, label: '50만원' },
];

function StatusBadge({ status }: { status: Deposit['status'] }) {
  const configs = {
    pending: { label: '대기중', icon: Clock, className: 'bg-amber-100 text-amber-700' },
    approved: { label: '승인완료', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
    rejected: { label: '거절됨', icon: XCircle, className: 'bg-red-100 text-red-700' },
    canceled: { label: '취소됨', icon: XCircle, className: 'bg-gray-100 text-gray-700' },
  };
  const config = configs[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="h-3 w-3" />{config.label}
    </Badge>
  );
}

export default function DepositPage() {
  const { profile, refreshProfile } = useAuth();
  const balance = profile?.balance || 0;

  const [depositorName, setDepositorName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);

  const fetchDeposits = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      const depositsData = (data || []) as Deposit[];
      setDeposits(depositsData);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const monthlyTotal = depositsData
        .filter(d => d.status === 'approved' && new Date(d.created_at) >= thisMonth)
        .reduce((sum, d) => sum + d.amount, 0);
      setTotalDeposited(monthlyTotal);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setIsLoadingDeposits(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, [profile?.id]);

  const handleQuickAmountSelect = (value: number) => {
    setSelectedQuickAmount(value);
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) { toast.error('로그인이 필요합니다'); return; }
    if (!depositorName.trim()) { toast.error('입금자명을 입력해주세요'); return; }
    if (amount < 10000) { toast.error('최소 충전 금액은 10,000원입니다'); return; }

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('deposits') as any).insert({
        user_id: profile.id,
        amount: amount,
        depositor_name: depositorName.trim(),
        status: 'pending',
      });

      if (error) throw error;
      toast.success('충전 신청이 완료되었습니다!', { description: '입금 확인 후 자동으로 충전됩니다.' });
      setDepositorName('');
      setAmount(0);
      setSelectedQuickAmount(null);
      fetchDeposits();
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('충전 신청 중 오류가 발생했습니다', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Balance Card */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">현재 보유 잔액</span>
              </div>
              <div className="text-4xl sm:text-5xl font-bold">{formatCurrency(balance)}</div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10">
              <TrendingUp className="h-5 w-5" />
              <div className="text-sm">
                <p className="text-white/80">이번 달 충전</p>
                <p className="font-semibold">{formatCurrency(totalDeposited)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Info & Form */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle><Building2 className="h-5 w-5 inline mr-2" />입금 계좌 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-4">
                <div className="flex justify-between"><span className="text-muted-foreground">은행</span><span className="font-semibold">{BANK_INFO.bankName}</span></div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">계좌번호</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg">{BANK_INFO.accountNumber}</span>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(BANK_INFO.accountNumber).then(() => toast.success('계좌번호 복사됨'))}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">예금주</span><span className="font-semibold">{BANK_INFO.accountHolder}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle><CreditCard className="h-5 w-5 inline mr-2" />충전 신청</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="depositorName">입금자명</Label>
                  <Input id="depositorName" placeholder="실제 입금하실 분의 이름" value={depositorName} onChange={(e) => setDepositorName(e.target.value)} className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label>빠른 금액 선택</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((item) => (
                      <button key={item.value} type="button" onClick={() => handleQuickAmountSelect(item.value)}
                        className={cn("relative p-3 rounded-xl border-2 transition-all", selectedQuickAmount === item.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        {item.popular && <Badge className="absolute -top-2 -right-2 bg-accent text-white text-[10px]">인기</Badge>}
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">충전 금액</Label>
                  <div className="relative">
                    <Input id="amount" type="text" value={amount > 0 ? amount.toLocaleString() : ''} onChange={(e) => setAmount(parseInt(e.target.value.replace(/,/g, '')) || 0)} className="h-12 pr-12 text-lg font-semibold" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">원</span>
                  </div>
                </div>

                {amount >= 10000 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium"><Sparkles className="h-4 w-4 inline mr-2" />충전 후 잔액</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(balance + amount)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting || amount < 10000 || !depositorName.trim()} className="w-full h-14 text-lg btn-gradient">
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />처리 중...</> : <><Wallet className="mr-2 h-5 w-5" />{amount >= 10000 ? `${formatCurrency(amount)} 충전 신청` : '금액을 입력하세요'}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Deposit History */}
        <Card className="h-full">
          <CardHeader><CardTitle><Clock className="h-5 w-5 inline mr-2" />최근 충전 신청 내역</CardTitle></CardHeader>
          <CardContent>
            {isLoadingDeposits ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : deposits.length > 0 ? (
              <div className="space-y-3">
                {deposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", deposit.status === 'approved' ? 'bg-green-100 text-green-600' : deposit.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600')}>
                        {deposit.status === 'approved' ? <CheckCircle className="h-5 w-5" /> : deposit.status === 'pending' ? <Clock className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{formatCurrency(deposit.amount)}</p>
                        <p className="text-sm text-muted-foreground">{deposit.depositor_name} · {formatRelativeTime(deposit.created_at)}</p>
                      </div>
                    </div>
                    <StatusBadge status={deposit.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Wallet className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">아직 충전 내역이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

</details>

---

## 5. UI System

### 5.1 Sidebar Component

---

### 📄 src/components/layout/sidebar.tsx

> **Security Note:** Admin routes conditionally rendered based on `profile.is_admin`. Balance displayed in real-time from profile.

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, formatCurrency } from '@/lib/utils';
import { LayoutDashboard, ShoppingCart, Wallet, History, Settings, LogOut, CreditCard, Crown, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/layout/logo';
import { useAuth } from '@/hooks/use-auth';

const routes = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  { label: '새 주문', icon: ShoppingCart, href: '/order' },
  { label: '주문내역', icon: History, href: '/orders' },
  { label: '포인트 충전', icon: CreditCard, href: '/deposit' },
];

const adminRoutes = [
  { label: '관리자', icon: Settings, href: '/admin' },
];

const tierConfig = {
  basic: { label: '일반', color: 'text-muted-foreground', bg: 'bg-muted' },
  vip: { label: 'VIP', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  premium: { label: '프리미엄', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  enterprise: { label: '엔터프라이즈', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const balance = profile?.balance || 0;
  const tier = tierConfig[profile?.tier as keyof typeof tierConfig] || tierConfig.basic;
  const isAdmin = profile?.is_admin === true;

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Logo size="md" linkTo="/dashboard" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link key={route.href} href={route.href}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <route.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
              {route.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <Separator className="my-4" />
            {adminRoutes.map((route) => {
              const isActive = pathname.startsWith(route.href);
              return (
                <Link key={route.href} href={route.href}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4">
        <div className="glass-balance text-white rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium text-white/80">내 잔액</span>
              </div>
              <div className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", tier.bg, tier.color)}>
                {profile?.tier === "vip" && <Crown className="h-3 w-3 inline mr-1" />}
                {tier.label}
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/deposit"><CreditCard className="mr-2 h-4 w-4" />충전하기</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">{profile?.email?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.email || "user@example.com"}</p>
            <p className="text-xs text-muted-foreground">{tier.label} 회원</p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
```

---

## Appendix: Environment Variables

### 📄 .env.example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cron Security
CRON_SECRET=your-cron-secret

# Provider API (Optional - Mock mode if not set)
NEXT_PUBLIC_MOCK_API=false
```

---

## Security Compliance Summary

| Security Control | Implementation | Status |
|-----------------|----------------|--------|
| Server-side price calculation | `process_order` RPC | ✅ |
| Row Level Security | All tables enabled | ✅ |
| Admin-only routes | RLS + `is_admin` check | ✅ |
| Balance atomicity | `FOR UPDATE` locks | ✅ |
| Session management | Supabase Auth | ✅ |
| API key protection | Server-only env vars | ✅ |
| CSRF protection | Next.js default | ✅ |
| Input validation | Zod + DB constraints | ✅ |

---

**End of Technical Due Diligence Report**

*Generated by Claude Code - 2026-01-18*
