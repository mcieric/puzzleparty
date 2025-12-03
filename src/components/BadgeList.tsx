'use client';

import { useEffect, useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { Badge, UserBadge } from '@/types';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface BadgeListProps {
    userId?: number; // Optional, if we want to view another user's badges
}

export function BadgeList({ userId }: BadgeListProps) {
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                // 1. Fetch all available badges
                const { data: allBadges, error: badgesError } = await supabase
                    .from('badges')
                    .select('*')
                    .order('tier', { ascending: true }); // Simple ordering for now

                if (badgesError) throw badgesError;
                setAvailableBadges(allBadges || []);

                // 2. Fetch user's earned badges
                if (userId) {
                    const { data: earned, error: userBadgesError } = await supabase
                        .from('user_badges')
                        .select('*')
                        .eq('user_id', userId);

                    if (userBadgesError) throw userBadgesError;
                    setUserBadges(earned || []);
                } else {
                    setUserBadges([]);
                }
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setLoading(false);
            }
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
                    {userBadges.length} / {availableBadges.length} Unlocked
                </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableBadges.map((badge) => {
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
