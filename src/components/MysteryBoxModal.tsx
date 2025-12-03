'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Star } from 'lucide-react';
import { MysteryBox } from '@/types';

interface MysteryBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    boxType: MysteryBox['box_type'];
    reward?: { type: string; amount: number };
}

const boxColors = {
    Common: 'from-slate-600 to-slate-400',
    Rare: 'from-blue-600 to-cyan-400',
    Epic: 'from-purple-600 to-pink-400',
    Legendary: 'from-yellow-500 to-amber-300',
};

export function MysteryBoxModal({ isOpen, onClose, boxType, reward }: MysteryBoxModalProps) {
    const [step, setStep] = useState<'closed' | 'shaking' | 'opening' | 'revealed'>('closed');

    useEffect(() => {
        if (isOpen) {
            setStep('closed');
        }
    }, [isOpen]);

    const handleOpen = () => {
        if (step !== 'closed') return;
        setStep('shaking');

        // Sequence: Shake -> Open -> Reveal
        setTimeout(() => setStep('opening'), 1000);
        setTimeout(() => setStep('revealed'), 1500);
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

                    {/* Modal Content */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        {/* The Box */}
                        <div className="relative cursor-pointer" onClick={handleOpen}>
                            {/* Glow behind box */}
                            <motion.div
                                animate={{
                                    scale: step === 'opening' ? 2 : [1, 1.2, 1],
                                    opacity: step === 'opening' ? 0 : 0.5
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute inset-0 blur-3xl bg-gradient-to-r ${boxColors[boxType]} rounded-full`}
                            />

                            <motion.div
                                animate={
                                    step === 'shaking' ? {
                                        x: [-5, 5, -5, 5, 0],
                                        rotate: [-5, 5, -5, 5, 0]
                                    } : step === 'opening' ? {
                                        scale: 1.5,
                                        opacity: 0
                                    } : {}
                                }
                                transition={{ duration: 0.5 }}
                                className={`
                                    relative w-48 h-48 rounded-3xl bg-gradient-to-br ${boxColors[boxType]}
                                    shadow-2xl flex items-center justify-center border-4 border-white/20
                                `}
                            >
                                <Gift className="w-24 h-24 text-white drop-shadow-lg" />

                                {step === 'closed' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -bottom-12 text-white font-bold text-lg animate-bounce"
                                    >
                                        Tap to Open!
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        {/* Reward Reveal */}
                        {step === 'revealed' && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="bg-slate-900/90 p-8 rounded-3xl border border-purple-500/50 text-center min-w-[300px] shadow-2xl shadow-purple-500/20">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
                                    >
                                        <Star className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {boxType} Reward!
                                    </h3>

                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                                        +{reward?.amount} {reward?.type}
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Awesome!
                                    </button>
                                </div>

                                {/* Confetti / Particles */}
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 0, y: 0, opacity: 1 }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 400,
                                            y: (Math.random() - 0.5) * 400,
                                            opacity: 0,
                                            rotate: Math.random() * 360
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
