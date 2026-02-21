-- ============================================================
-- Engineer Career Prep Platform — PostgreSQL Schema
-- Run this in your Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS
-- Synced from Clerk via webhook on signup/update.
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id        VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    avatar_url      TEXT,
    role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- ============================================================
-- 2. SUBSCRIPTIONS
-- Managed by Stripe webhooks.
-- ============================================================
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id  VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan                VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
    status              VARCHAR(50) DEFAULT 'inactive'
                        CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================================
-- 3. VIDEOS
-- Guest lecture videos hosted on Cloudinary.
-- ============================================================
CREATE TABLE videos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    cloudinary_id   VARCHAR(255) NOT NULL,
    cloudinary_url  TEXT NOT NULL,
    thumbnail_url   TEXT,
    duration        INTEGER,                -- duration in seconds
    category        VARCHAR(100),
    is_premium      BOOLEAN DEFAULT true,   -- requires paid subscription
    upload_by       UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_category ON videos(category);

-- ============================================================
-- 4. LEETCODE PLANS
-- Curated problem sets managed by admins.
-- ============================================================
CREATE TABLE leetcode_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    difficulty      VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category        VARCHAR(100),           -- e.g. "Arrays", "Trees", "DP"
    leetcode_number INTEGER,
    leetcode_url    TEXT,
    solution_hint   TEXT,
    "order"         INTEGER DEFAULT 0,      -- display order
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leetcode_plans_category ON leetcode_plans(category);
CREATE INDEX idx_leetcode_plans_difficulty ON leetcode_plans(difficulty);

-- ============================================================
-- 5. PROGRESS TRACKING
-- User progress on LeetCode problems.
-- ============================================================
CREATE TABLE progress_tracking (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id         UUID NOT NULL REFERENCES leetcode_plans(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'completed', 'revisit')),
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

CREATE INDEX idx_progress_user ON progress_tracking(user_id);
CREATE INDEX idx_progress_plan ON progress_tracking(plan_id);

-- ============================================================
-- Trigger: Auto-update `updated_at` on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_videos
    BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_leetcode_plans
    BEFORE UPDATE ON leetcode_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_progress_tracking
    BEFORE UPDATE ON progress_tracking FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
