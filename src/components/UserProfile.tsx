'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Star, Zap, Flame, Box } from 'lucide-react';
import { UserStats } from '@/types';
import { useAccount } from 'wagmi';

// Mock data removed in favor of Supabase fetch

import { supabase } from '@/lib/supabase';

// Helper to calculate next tier progress
const getNextTierProgress = (xp: number) => {
    if (xp >= 1500) return 100; // Diamond (Max)
    if (xp >= 500) return ((xp - 500) / (1500 - 500)) * 100; // Gold -> Diamond
    if (xp >= 100) return ((xp - 100) / (500 - 100)) * 100; // Silver -> Gold
    return (xp / 100) * 100; // Bronze -> Silver
};

const tierColors = {
    Bronze: 'text-orange-400',
    Silver: 'text-slate-300',
    Gold: 'text-yellow-400',
    Diamond: 'text-cyan-400',
};

export function UserProfile() {
    const { address, isConnected } = useAccount();
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!isConnected || !address) {
                setStats(null);
                return;
            }

            try {
                // 1. Get User ID & Basic Stats
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('id, xp, streak_days')
                    .eq('wallet_address', address)
                    .single();

                if (userError || !user) return;

                // 2. Get Monthly Tier
                const now = new Date();
                const monthDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

                const { data: monthlyData } = await supabase
                    .from('monthly_events')
                    .select('tier, xp_gained')
                    .eq('user_id', user.id)
                    .eq('month_date', monthDate)
                    .single();

                // 3. Get Total Mints
                const { count: mintsCount } = await supabase
                    .from('mints')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // 4. Get Mystery Boxes Found
                const { count: boxesCount } = await supabase
                    .from('mystery_boxes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                const currentMonthlyXp = monthlyData?.xp_gained || 0;

                setStats({
                    xp: currentMonthlyXp, // Showing Monthly XP for progress bar context
                    tier: (monthlyData?.tier as any) || 'Bronze',
                    mints: mintsCount || 0,
                    streak: user.streak_days || 0,
                    mystery_boxes_found: boxesCount || 0,
                    next_tier_progress: getNextTierProgress(currentMonthlyXp)
                });

            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchStats();
    }, [isConnected, address]);

    if (!isConnected || !stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mb-12"
        >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar & Identity */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">Player One</h3>
                            <p className="text-xs text-gray-400 font-mono">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* XP & Tier */}
                        <div className="col-span-2 bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-400 text-sm">Current Season XP</span>
                                <Star className={`w-5 h-5 ${tierColors[stats.tier]}`} />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">
                                {stats.xp.toLocaleString()}
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.next_tier_progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span className={tierColors[stats.tier]}>{stats.tier}</span>
                                <span>Next: Gold</span>
                            </div>
                        </div>

                        {/* Mints */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 flex flex-col justify-center items-center">
                            <Zap className="w-6 h-6 text-blue-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.mints}</div>
                            <div className="text-xs text-gray-400">Total Mints</div>
                        </div>

                        {/* Streak */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 flex flex-col justify-center items-center">
                            <Flame className="w-6 h-6 text-orange-500 mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.streak}</div>
                            <div className="text-xs text-gray-400">Day Streak</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
