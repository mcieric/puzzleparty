'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PUZZLE_MANAGER_ABI, PUZZLE_MANAGER_ADDRESS, USDC_ADDRESS } from '@/lib/contracts';
import { erc20Abi } from 'viem';

interface PuzzleGridProps {
    puzzleId: number;
    totalPieces: number;
    price: number; // in USDC units (e.g. 0.1)
}

export function PuzzleGrid({ puzzleId, totalPieces, price }: PuzzleGridProps) {
    const { address } = useAccount();
    const [mintedPieces, setMintedPieces] = useState<boolean[]>(new Array(totalPieces).fill(false));
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Mock fetching minted pieces (replace with Supabase/Contract call)
    useEffect(() => {
        // In a real app, fetch this from Supabase for speed
        // const fetchState = async () => { ... }
    }, [puzzleId]);

    const handleMint = async (pieceId: number) => {
        if (!address) return alert('Please connect wallet');

        // 1. Approve USDC
        // Note: In a real app, check allowance first. For simplicity, we assume approval flow or use Permit.
        // For this demo, we'll try to mint directly assuming approval (or handle approval in a separate step).
        // A better UX is a "Mint" button that handles Approval then Mint.

        try {
            writeContract({
                address: PUZZLE_MANAGER_ADDRESS,
                abi: PUZZLE_MANAGER_ABI,
                functionName: 'mintPiece',
                args: [BigInt(puzzleId), BigInt(pieceId)],
            });
            setSelectedPiece(pieceId);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-10 gap-1 p-4 bg-gray-900 rounded-xl shadow-2xl border border-purple-500/30">
                {Array.from({ length: totalPieces }).map((_, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !mintedPieces[i] && handleMint(i)}
                        disabled={mintedPieces[i] || isPending}
                        className={`
              w-8 h-8 sm:w-12 sm:h-12 rounded-md flex items-center justify-center text-xs font-bold transition-colors
              ${mintedPieces[i]
                                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700 cursor-pointer'}
              ${selectedPiece === i && isPending ? 'animate-pulse bg-yellow-500' : ''}
            `}
                    >
                        {mintedPieces[i] ? '✓' : i + 1}
                    </motion.button>
                ))}
            </div>

            {hash && <div className="text-blue-400 text-sm">Transaction Hash: {hash}</div>}
            {isConfirming && <div className="text-yellow-400 text-sm">Confirming...</div>}
            {isConfirmed && <div className="text-green-400 text-sm">Piece Minted!</div>}
        </div>
    );
}
