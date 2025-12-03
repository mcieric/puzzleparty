'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DebugPanelProps {
    onPuzzleTypeChange?: (type: 'classic' | 'super' | 'mega') => void;
    onAddXP?: (amount: number) => void;
    onPopulateLeaderboard?: () => void;
    onUnlockBadge?: (badgeId: string) => void;
    onTestMysteryBox?: () => void;
    onSimMint?: () => void;
    onStartCooldown?: (type: 'mint' | 'puzzle') => void;
}

export function DebugPanel({
    onPuzzleTypeChange,
    onAddXP,
    onPopulateLeaderboard,
    onUnlockBadge,
    onTestMysteryBox,
    onSimMint,
    onStartCooldown
}: DebugPanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [activeSection, setActiveSection] = useState<string | null>('puzzles');

    const sections = [
        { id: 'puzzles', label: 'Puzzles', color: 'purple' },
        { id: 'xp', label: 'XP & Tiers', color: 'blue' },
        { id: 'leaderboard', label: 'Leaderboard', color: 'yellow' },
        { id: 'badges', label: 'Badges', color: 'green' },
        { id: 'cooldowns', label: 'Cooldowns', color: 'red' },
        { id: 'other', label: 'Other', color: 'pink' }
    ];

    const toggleSection = (sectionId: string) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    return (
        <div className="fixed bottom-4 left-4 z-[200]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur-xl text-white rounded-lg border border-purple-500/50 hover:bg-slate-800/90 transition-all flex items-center gap-2"
            >
                <Bug className="w-4 h-4" />
                <span className="text-sm font-semibold">Debug Panel</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl max-w-sm overflow-hidden"
                    >
                        {/* Sections */}
                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* Puzzles Section */}
                            <DebugSection
                                title="Puzzle Types"
                                color="purple"
                                isActive={activeSection === 'puzzles'}
                                onToggle={() => toggleSection('puzzles')}
                            >
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => onPuzzleTypeChange?.('classic')}
                                        className="px-3 py-2 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/50 hover:bg-blue-500/30"
                                    >
                                        Classic
                                    </button>
                                    <button
                                        onClick={() => onPuzzleTypeChange?.('super')}
                                        className="px-3 py-2 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/50 hover:bg-purple-500/30"
                                    >
                                        Super
                                    </button>
                                    <button
                                        onClick={() => onPuzzleTypeChange?.('mega')}
                                        className="px-3 py-2 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/50 hover:bg-pink-500/30"
                                    >
                                        Mega
                                    </button>
                                </div>
                            </DebugSection>

                            {/* XP Section */}
                            <DebugSection
                                title="XP & Progression"
                                color="blue"
                                isActive={activeSection === 'xp'}
                                onToggle={() => toggleSection('xp')}
                            >
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => onAddXP?.(100)}
                                        className="px-3 py-2 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/50 hover:bg-green-500/30"
                                    >
                                        +100 XP
                                    </button>
                                    <button
                                        onClick={() => onAddXP?.(500)}
                                        className="px-3 py-2 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/50 hover:bg-green-500/30"
                                    >
                                        +500 XP
                                    </button>
                                    <button
                                        onClick={() => onAddXP?.(1000)}
                                        className="px-3 py-2 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/50 hover:bg-green-500/30"
                                    >
                                        +1000 XP
                                    </button>
                                </div>
                            </DebugSection>

                            {/* Leaderboard Section */}
                            <DebugSection
                                title="Leaderboard"
                                color="yellow"
                                isActive={activeSection === 'leaderboard'}
                                onToggle={() => toggleSection('leaderboard')}
                            >
                                <button
                                    onClick={onPopulateLeaderboard}
                                    className="w-full px-3 py-2 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/50 hover:bg-yellow-500/30"
                                >
                                    Populate Leaderboard
                                </button>
                            </DebugSection>

                            {/* Badges Section */}
                            <DebugSection
                                title="Badges"
                                color="green"
                                isActive={activeSection === 'badges'}
                                onToggle={() => toggleSection('badges')}
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onUnlockBadge?.('first_mint')}
                                        className="px-3 py-2 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/50 hover:bg-amber-500/30"
                                    >
                                        First Mint
                                    </button>
                                    <button
                                        onClick={() => onUnlockBadge?.('early_bird')}
                                        className="px-3 py-2 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/50 hover:bg-amber-500/30"
                                    >
                                        Early Bird
                                    </button>
                                </div>
                            </DebugSection>

                            {/* Cooldowns Section */}
                            <DebugSection
                                title="Cooldowns"
                                color="red"
                                isActive={activeSection === 'cooldowns'}
                                onToggle={() => toggleSection('cooldowns')}
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onStartCooldown?.('mint')}
                                        className="px-3 py-2 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/50 hover:bg-red-500/30"
                                    >
                                        Mint Cooldown (45s)
                                    </button>
                                    <button
                                        onClick={() => onStartCooldown?.('puzzle')}
                                        className="px-3 py-2 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/50 hover:bg-red-500/30"
                                    >
                                        Puzzle Cooldown (24h)
                                    </button>
                                </div>
                            </DebugSection>

                            {/* Other Section */}
                            <DebugSection
                                title="Other"
                                color="pink"
                                isActive={activeSection === 'other'}
                                onToggle={() => toggleSection('other')}
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={onTestMysteryBox}
                                        className="px-3 py-2 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/50 hover:bg-pink-500/30"
                                    >
                                        Test Mystery Box
                                    </button>
                                    <button
                                        onClick={onSimMint}
                                        className="px-3 py-2 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-500/50 hover:bg-cyan-500/30"
                                    >
                                        Sim Mint
                                    </button>
                                </div>
                            </DebugSection>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface DebugSectionProps {
    title: string;
    color: string;
    isActive: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function DebugSection({ title, color, isActive, onToggle, children }: DebugSectionProps) {
    const colorClasses = {
        purple: 'border-purple-500/30 bg-purple-500/5',
        blue: 'border-blue-500/30 bg-blue-500/5',
        yellow: 'border-yellow-500/30 bg-yellow-500/5',
        green: 'border-green-500/30 bg-green-500/5',
        red: 'border-red-500/30 bg-red-500/5',
        pink: 'border-pink-500/30 bg-pink-500/5'
    };

    return (
        <div className={`border-b ${colorClasses[color as keyof typeof colorClasses]}`}>
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <span className="text-sm font-semibold text-white">{title}</span>
                {isActive ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
