'use client';

import { useEffect, useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { Badge, UserBadge } from '@/types';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

// Mock data removed in favor of Supabase fetch
const AVAILABLE_BADGES: Badge[] = [
    {
        id: 'first_mint',
        name: 'First Mint',
        description: 'Minted your first puzzle piece',
        imageUrl: '/badges/first_mint.png',
        tier: 'Bronze'
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Joined in the first week',
        imageUrl: '/badges/early_bird.png',
        tier: 'Silver'
    },
    {
        id: 'puzzle_master',
        name: 'Puzzle Master',
        description: 'Completed a full puzzle',
        imageUrl: '/badges/puzzle_master.png',
        tier: 'Gold'
    },
    {
        id: 'whale',
        name: 'Whale',
        description: 'Own 100+ pieces',
        imageUrl: '/badges/whale.png',
        tier: 'Diamond'
    }
];

interface BadgeListProps {
    userId?: number; // Optional, if we want to view another user's badges
}

export function BadgeList({ userId }: BadgeListProps) {
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            // In a real app, we would fetch from 'badges' table too.
            // For now, we use mock AVAILABLE_BADGES and check 'user_badges' for unlocks.

            // Mocking a fetch for demonstration if no userId provided (or current user)
            // const { data } = await supabase.from('user_badges').select('*').eq('user_id', userId);

            // SIMULATED DATA for demo purposes
            setTimeout(() => {
                setUserBadges([
                    { badge_id: 'first_mint', earned_at: new Date().toISOString() },
                    { badge_id: 'early_bird', earned_at: new Date(Date.now() - 86400000).toISOString() }
                ]);
                setLoading(false);
            }, 1000);
        };

        fetchBadges();
    }, [userId]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Achievements
                    </h2>
                    <p className="text-gray-400 text-sm">Collect badges to prove your mastery.</p>
                </div>
                <div className="px-4 py-2 bg-slate-800/50 rounded-full border border-white/10 text-sm text-gray-300">
                    {userBadges.length} / {AVAILABLE_BADGES.length} Unlocked
                </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {AVAILABLE_BADGES.map((badge) => {
                    const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                    return (
                        <BadgeCard
                            key={badge.id}
                            badge={badge}
                            isUnlocked={!!userBadge}
                            earnedAt={userBadge?.earned_at}
                        />
                    );
                })}
            </div>
        </div>
    );
}
