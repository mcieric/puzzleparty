'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PUZZLE_MANAGER_ABI, PUZZLE_MANAGER_ADDRESS, USDC_ADDRESS } from '@/lib/contracts';
import { erc20Abi } from 'viem';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { MysteryBoxModal } from './MysteryBoxModal';
import { MysteryBox } from '@/types';

interface PuzzleGridProps {
    puzzleId: number;
    totalPieces: number;
    price: number;
}

export function PuzzleGrid({ puzzleId, totalPieces, price }: PuzzleGridProps) {
    const { address } = useAccount();
    const [mintedPieces, setMintedPieces] = useState<boolean[]>(new Array(totalPieces).fill(false));
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [hoveredPiece, setHoveredPiece] = useState<number | null>(null);

    // Mystery Box State
    const [showMysteryBox, setShowMysteryBox] = useState(false);
    const [mysteryBoxType, setMysteryBoxType] = useState<MysteryBox['box_type']>('Common');
    const [mysteryReward, setMysteryReward] = useState<{ type: string; amount: number }>();

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Fetch minted pieces from Supabase
    useEffect(() => {
        const fetchState = async () => {
            const { data, error } = await supabase
                .from('mints')
                .select('piece_id')
                .eq('puzzle_id', puzzleId);

            if (error) {
                console.error('Error fetching mints:', error);
                return;
            }

            if (data) {
                const newMintedPieces = new Array(totalPieces).fill(false);
                data.forEach((mint: any) => {
                    if (mint.piece_id >= 0 && mint.piece_id < totalPieces) {
                        newMintedPieces[mint.piece_id] = true;
                    }
                });
                setMintedPieces(newMintedPieces);
            }
        };

        fetchState();

        // Real-time subscription
        const channel = supabase
            .channel('mints-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mints',
                    filter: `puzzle_id=eq.${puzzleId}`,
                },
                (payload: any) => {
                    const newPieceId = payload.new.piece_id;
                    setMintedPieces((prev) => {
                        const next = [...prev];
                        if (newPieceId >= 0 && newPieceId < totalPieces) {
                            next[newPieceId] = true;
                        }
                        return next;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [puzzleId, totalPieces]);

    const handleMint = async (pieceId: number) => {
        if (!address) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            writeContract({
                address: PUZZLE_MANAGER_ADDRESS,
                abi: PUZZLE_MANAGER_ABI,
                functionName: 'mintPiece',
                args: [BigInt(puzzleId), BigInt(pieceId)],
            });
            setSelectedPiece(pieceId);

            // Simulate Mystery Box Drop (Demo Only - Real logic is in webhook)
            // In production, we would listen to a Supabase subscription for 'mystery_boxes' insert
            if (Math.random() > 0.7) { // 30% chance for demo
                setTimeout(() => {
                    setMysteryBoxType('Epic');
                    setMysteryReward({ type: 'XP', amount: 500 });
                    setShowMysteryBox(true);
                }, 2000); // Show after mint transaction starts/completes
            }

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8">
            {/* Puzzle Container */}
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-gradient" />

                {/* Grid */}
                <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 shadow-2xl">
                    <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: totalPieces }).map((_, i) => {
                            const isMinted = mintedPieces[i];
                            const isSelected = selectedPiece === i;
                            const isHovered = hoveredPiece === i;

                            return (
                                <motion.button
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: i * 0.002,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    whileHover={{
                                        scale: isMinted ? 1 : 1.15,
                                        zIndex: 10,
                                        rotate: isMinted ? 0 : [0, -5, 5, 0]
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => !isMinted && !isPending && handleMint(i)}
                                    onHoverStart={() => setHoveredPiece(i)}
                                    onHoverEnd={() => setHoveredPiece(null)}
                                    disabled={isMinted || isPending}
                                    className={`
                                        relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-sm
                                        transition-all duration-300 overflow-hidden
                                        ${isMinted
                                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 cursor-default'
                                            : 'bg-slate-800/50 text-gray-500 hover:bg-slate-700/50 cursor-pointer border border-purple-500/20 hover:border-purple-500/50'
                                        }
                                        ${isSelected && isPending ? 'animate-pulse bg-gradient-to-br from-yellow-500 to-orange-500' : ''}
                                    `}
                                >
                                    {/* Shimmer effect for unminted pieces */}
                                    {!isMinted && isHovered && (
                                        <motion.div
                                            className="absolute inset-0 shimmer"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 flex items-center justify-center h-full">
                                        {isMinted ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            >
                                                <Check className="w-5 h-5" />
                                            </motion.div>
                                        ) : (
                                            <span className="relative">
                                                {i + 1}
                                                {isHovered && (
                                                    <motion.span
                                                        className="absolute -top-1 -right-1"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                                    </motion.span>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Glow for minted pieces */}
                                    {isMinted && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
                {hash && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col gap-3 items-center"
                    >
                        {isConfirming && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-xl">
                                <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                                <span className="text-yellow-300 font-medium">Confirming transaction...</span>
                            </div>
                        )}
                        {isConfirmed && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-xl"
                            >
                                <Check className="w-5 h-5 text-green-400" />
                                <span className="text-green-300 font-medium">Piece minted successfully! 🎉</span>
                            </motion.div>
                        )}
                        <div className="text-xs text-gray-400 font-mono">
                            Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mystery Box Modal */}
            <MysteryBoxModal
                isOpen={showMysteryBox}
                onClose={() => setShowMysteryBox(false)}
                boxType={mysteryBoxType}
                reward={mysteryReward}
            />
        </div>
    );
}
