'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { LeaderboardEntry, Season } from '@/types';
import { supabase } from '@/lib/supabase';



export function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [season, setSeason] = useState<Season | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch active season
                const { data: activeSeason, error: seasonError } = await supabase
                    .from('seasons')
                    .select('*')
                    .eq('is_active', true)
                    .single();

                if (seasonError && seasonError.code !== 'PGRST116') { // Ignore no rows found
                    console.error('Error fetching season:', seasonError);
                }

                setSeason(activeSeason || null);

                if (activeSeason) {
                    // 2. Fetch leaderboard for the season
                    // We need to join with users table to get username/wallet
                    const { data: leaderboardData, error: leaderboardError } = await supabase
                        .from('season_xp')
                        .select(`
                            xp_amount,
                            users (
                                id,
                                wallet_address,
                                xp
                            )
                        `)
                        .eq('season_id', activeSeason.id)
                        .order('xp_amount', { ascending: false })
                        .limit(10);

                    if (leaderboardError) throw leaderboardError;

                    // Transform data to LeaderboardEntry
                    const entries: LeaderboardEntry[] = leaderboardData.map((item: any, index: number) => ({
                        rank: index + 1,
                        user_id: item.users.id.toString(),
                        wallet_address: item.users.wallet_address,
                        username: undefined, // We don't have usernames in users table yet, maybe add later
                        xp: item.xp_amount,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.users.wallet_address}`
                    }));

                    setEntries(entries);
                } else {
                    setEntries([]);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-slate-300" />;
            case 3: return <Medal className="w-6 h-6 text-amber-600" />;
            default: return <span className="font-bold text-gray-500">#{rank}</span>;
        }
    };

    const getRowStyle = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
            case 2: return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30';
            case 3: return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-600/30';
            default: return 'bg-slate-800/30 border-white/5 hover:bg-slate-700/30';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-purple-500" />
                        Leaderboard
                    </h2>
                    {season && (
                        <p className="text-purple-300 text-sm mt-1">
                            {season.name} • Ends {new Date(season.end_date).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Your Rank</div>
                    <div className="text-xl font-bold text-white">#42</div>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {entries.map((entry, index) => (
                    <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            relative flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-300
                            ${getRowStyle(entry.rank)}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="w-10 flex justify-center">
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-white/10">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">
                                        {entry.username || entry.wallet_address}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">
                                        {entry.wallet_address}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* XP */}
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {entry.xp.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 font-bold uppercase">XP</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
