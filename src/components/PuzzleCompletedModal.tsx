'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles, Star } from 'lucide-react';

interface PuzzleCompletedModalProps {
    isOpen: boolean;
    onClose: () => void;
    puzzleType?: 'classic' | 'super' | 'mega';
}

export function PuzzleCompletedModal({ isOpen, onClose, puzzleType = 'classic' }: PuzzleCompletedModalProps) {
    const [step, setStep] = useState<'closed' | 'celebrating' | 'revealed'>('closed');

    useEffect(() => {
        if (isOpen) {
            setStep('celebrating');
            setTimeout(() => setStep('revealed'), 1500);
        } else {
            setStep('closed');
        }
    }, [isOpen]);

    const puzzleTypeColors = {
        classic: 'from-purple-600 to-pink-600',
        super: 'from-blue-600 to-cyan-400',
        mega: 'from-yellow-500 to-orange-500',
    };

    const puzzleTypeTitles = {
        classic: 'Puzzle Completed!',
        super: 'Super Puzzle Completed!',
        mega: 'Mega Puzzle Completed!',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={step === 'revealed' ? onClose : undefined}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative z-10 max-w-md w-full"
                    >
                        {/* Close button */}
                        {step === 'revealed' && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={onClose}
                                className="absolute -top-4 -right-4 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors border-2 border-white/20"
                            >
                                <X className="w-5 h-5 text-white" />
                            </motion.button>
                        )}

                        {/* Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl relative overflow-hidden">
                            {/* Animated background sparkles */}
                            <div className="absolute inset-0 overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0, x: Math.random() * 400, y: Math.random() * 600 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0],
                                            y: [Math.random() * 600, -100]
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.1,
                                            repeat: Infinity,
                                            repeatDelay: 2
                                        }}
                                        className="absolute"
                                    >
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                {/* Badge */}
                                <motion.div
                                    animate={step === 'celebrating' ? {
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    } : {}}
                                    transition={{ duration: 0.5, repeat: step === 'celebrating' ? Infinity : 0 }}
                                    className="relative"
                                >
                                    {/* Glow effect */}
                                    <div className={`absolute inset-0 blur-3xl bg-gradient-to-r ${puzzleTypeColors[puzzleType]} opacity-50 animate-pulse`} />

                                    {/* Badge image */}
                                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                            <Trophy className="w-16 h-16 text-yellow-400" />
                                        </div>
                                    </div>

                                    {/* Stars around badge */}
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.5 + i * 0.1 }}
                                            className="absolute"
                                            style={{
                                                top: `${50 + 50 * Math.cos((i * Math.PI * 2) / 8)}%`,
                                                left: `${50 + 50 * Math.sin((i * Math.PI * 2) / 8)}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        >
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center"
                                >
                                    <h2 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${puzzleTypeColors[puzzleType]} bg-clip-text text-transparent`}>
                                        {puzzleTypeTitles[puzzleType]}
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        Congratulations! You've completed the puzzle! 🎉
                                    </p>
                                </motion.div>

                                {/* Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="w-full grid grid-cols-2 gap-4"
                                >
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-purple-500/20">
                                        <div className="text-2xl font-bold text-purple-400">+500</div>
                                        <div className="text-xs text-gray-400">XP Earned</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-pink-500/20">
                                        <div className="text-2xl font-bold text-pink-400">🏆</div>
                                        <div className="text-xs text-gray-400">Badge Unlocked</div>
                                    </div>
                                </motion.div>

                                {/* Close button */}
                                {step === 'revealed' && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        onClick={onClose}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
                                    >
                                        Awesome!
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
