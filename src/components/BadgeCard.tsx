'use client';

import { motion } from 'framer-motion';
import { Lock, Shield, Trophy, Star, Crown, Zap } from 'lucide-react';
import { Badge } from '@/types';

interface BadgeCardProps {
    badge: Badge;
    isUnlocked: boolean;
    earnedAt?: string;
}

const tierColors = {
    Bronze: 'from-orange-700 to-orange-500',
    Silver: 'from-slate-400 to-slate-200',
    Gold: 'from-yellow-600 to-yellow-400',
    Diamond: 'from-cyan-500 to-blue-600',
    Special: 'from-purple-600 to-pink-600',
};

const tierIcons = {
    Bronze: Shield,
    Silver: Star,
    Gold: Trophy,
    Diamond: Crown,
    Special: Zap,
};

export function BadgeCard({ badge, isUnlocked, earnedAt }: BadgeCardProps) {
    const Icon = tierIcons[badge.tier] || Shield;

    return (
        <motion.div
            className={`relative group p-1 rounded-2xl overflow-hidden ${isUnlocked ? 'cursor-pointer' : 'opacity-60 grayscale'}`}
            whileHover={isUnlocked ? { scale: 1.05, rotate: 1 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isUnlocked ? 1 : 0.6, y: 0 }}
        >
            {/* Border Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isUnlocked ? tierColors[badge.tier] : 'from-gray-700 to-gray-800'} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Card Content */}
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 flex flex-col items-center gap-3 border border-white/5">

                {/* Icon / Image */}
                <div className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center
                    bg-gradient-to-br ${isUnlocked ? tierColors[badge.tier] : 'from-gray-800 to-gray-900'}
                    shadow-lg shadow-black/50
                `}>
                    {isUnlocked ? (
                        <Icon className="w-8 h-8 text-white drop-shadow-md" />
                    ) : (
                        <Lock className="w-6 h-6 text-gray-500" />
                    )}

                    {/* Shine effect */}
                    {isUnlocked && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 animate-pulse" />
                    )}
                </div>

                {/* Text Info */}
                <div className="text-center">
                    <h3 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {badge.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {badge.description}
                    </p>
                </div>

                {/* Earned Date */}
                {isUnlocked && earnedAt && (
                    <div className="mt-auto pt-2 border-t border-white/5 w-full text-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            Unlocked {new Date(earnedAt).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
