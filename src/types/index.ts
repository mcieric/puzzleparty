export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Special';
}

export interface UserBadge {
    badge_id: string;
    earned_at: string;
    badge?: Badge; // Joined data
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    wallet_address: string;
    username?: string;
    xp: number;
    avatar_url?: string;
}

export interface Season {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface MysteryBox {
    id: number;
    box_type: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    status: 'locked' | 'ready' | 'opened';
    reward_amount?: number;
    reward_type?: 'XP' | 'USDC' | 'BADGE';
}

export interface UserStats {
    xp: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    mints: number;
    streak: number;
    mystery_boxes_found: number;
    next_tier_progress: number; // 0-100
}
