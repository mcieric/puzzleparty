'use client';

import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownLink
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { BadgeList } from '@/components/BadgeList';
import { Leaderboard } from '@/components/Leaderboard';
import { UserProfile } from '@/components/UserProfile';
import { DebugPanel } from '@/components/DebugPanel';
import { Sparkles, Trophy, Zap, Rocket } from 'lucide-react';
import { useReadContract, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PUZZLE_MANAGER_ABI, PUZZLE_MANAGER_ADDRESS } from '@/lib/contracts';
import { formatUnits } from 'viem';

export default function Home() {
    const puzzleId = 1; // TODO: Make dynamic

    // Debug State
    const [debugPuzzleType, setDebugPuzzleType] = useState<'classic' | 'super' | 'mega'>('classic');
    const [debugXP, setDebugXP] = useState(0);
    const [debugMintCooldown, setDebugMintCooldown] = useState(0);
    const [debugPuzzleCooldown, setDebugPuzzleCooldown] = useState(0);
    const [showMysteryBox, setShowMysteryBox] = useState(false);

    // Fetch Super Puzzle Fund
    const { data: superFund } = useReadContract({
        address: PUZZLE_MANAGER_ADDRESS,
        abi: PUZZLE_MANAGER_ABI,
        functionName: 'superPuzzleFund',
        query: { refetchInterval: 5000 }
    });

    // Fetch Puzzle Details
    const { data: puzzleData } = useReadContract({
        address: PUZZLE_MANAGER_ADDRESS,
        abi: PUZZLE_MANAGER_ABI,
        functionName: 'puzzles',
        args: [BigInt(puzzleId)],
        query: { refetchInterval: 5000 }
    });

    const jackpot = puzzleData ? Number(formatUnits(puzzleData[7], 6)) : 0; // prizePool is index 7
    const superFundAmount = superFund ? Number(formatUnits(superFund, 6)) : 0;
    const price = puzzleData ? Number(formatUnits(puzzleData[1], 6)) : 0.1;
    const progress = puzzleData ? Number(puzzleData[3]) : 0;

    const totalPieces = puzzleData ? Number(puzzleData[2]) : 100;

    // Fetch User ID for Badges
    const { address } = useAccount();
    const [userId, setUserId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const fetchUser = async () => {
            if (!address) {
                setUserId(undefined);
                return;
            }
            const { data } = await supabase.from('users').select('id').eq('wallet_address', address).single();
            if (data) setUserId(data.id);
        };
        fetchUser();
    }, [address]);

    // Cooldown timers
    useEffect(() => {
        if (debugMintCooldown > 0) {
            const timer = setInterval(() => {
                setDebugMintCooldown(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [debugMintCooldown]);

    useEffect(() => {
        if (debugPuzzleCooldown > 0) {
            const timer = setInterval(() => {
                setDebugPuzzleCooldown(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [debugPuzzleCooldown]);

    return (
        <main className="relative min-h-screen">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/50 border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50" />
                                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gradient">PUZZLE PARTY</h1>
                                <p className="text-xs text-purple-300">Season 1</p>
                            </div>
                        </div>

                        {/* Wallet */}
                        <Wallet>
                            <ConnectWallet className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50">
                                <Avatar className="h-6 w-6" />
                                <Name className="font-semibold" />
                            </ConnectWallet>
                            <WalletDropdown className="bg-slate-900 border border-purple-500/30 rounded-xl shadow-2xl">
                                <Identity className="px-4 pt-3 pb-2 hover:bg-purple-500/10 rounded-t-xl transition-colors" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address className="text-sm text-gray-400" />
                                    <EthBalance />
                                </Identity>
                                <WalletDropdownLink
                                    icon="wallet"
                                    href="https://keys.coinbase.com"
                                    className="hover:bg-purple-500/10 transition-colors"
                                >
                                    Wallet
                                </WalletDropdownLink>
                                <WalletDropdownDisconnect className="hover:bg-red-500/10 transition-colors rounded-b-xl" />
                            </WalletDropdown>
                        </Wallet>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Jackpot Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-300">Jackpot</span>
                            </div>
                            <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                                {jackpot.toFixed(2)} USDC
                            </div>
                            <div className="mt-2 text-xs text-gray-400">50% Winner / 50% Raffle</div>
                        </div>
                    </div>

                    {/* Super Puzzle Fund Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 rounded-2xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Rocket className="w-6 h-6 text-red-400" />
                                <span className="text-sm font-medium text-red-300">Super Fund</span>
                            </div>
                            <div className="text-4xl font-bold text-white">
                                {superFundAmount.toFixed(2)} USDC
                            </div>
                            <div className="mt-2 text-xs text-gray-400">Accumulating for Season Finale!</div>
                        </div>
                    </div>

                    {/* Price Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-6 h-6 text-purple-400" />
                                <span className="text-sm font-medium text-purple-300">Price / Piece</span>
                            </div>
                            <div className="text-4xl font-bold text-white">
                                {price.toFixed(2)} USDC
                            </div>
                            <div className="mt-2 text-xs text-gray-400">Mint a piece to reveal!</div>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                                <span className="text-sm font-medium text-blue-300">Progress</span>
                            </div>
                            <div className="text-4xl font-bold text-white">
                                {progress}/{totalPieces}
                            </div>
                            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                                    style={{ width: `${(progress / totalPieces) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-6xl font-bold mb-4">
                        <span className="text-gradient glow">Reveal the Mystery</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-2">Mint pieces to reveal the hidden image</p>
                    <p className="text-sm text-purple-300">Complete the puzzle to win the jackpot! 🎉</p>
                </div>

                {/* Puzzle Grid */}
                <div className="flex justify-center">
                    <PuzzleGrid puzzleId={puzzleId} totalPieces={totalPieces} price={price} userId={userId} />
                </div>

                {/* User Profile (Visible only when connected) */}
                <div className="mt-12">
                    <UserProfile />
                </div>

                {/* How to Play */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8 text-gradient">How to Play</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
                                1
                            </div>
                            <h4 className="text-lg font-semibold mb-2 text-purple-300">Connect Wallet</h4>
                            <p className="text-sm text-gray-400">Connect your wallet to start playing</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
                                2
                            </div>
                            <h4 className="text-lg font-semibold mb-2 text-purple-300">Mint Pieces</h4>
                            <p className="text-sm text-gray-400">Click on pieces to mint them for {price.toFixed(2)} USDC each</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
                                3
                            </div>
                            <h4 className="text-lg font-semibold mb-2 text-purple-300">Win Jackpot</h4>
                            <p className="text-sm text-gray-400">Complete the puzzle to win 50% of the jackpot immediately!</p>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mt-16">
                    <BadgeList userId={userId} />
                </div>

                {/* Leaderboard Section */}
                <div className="mt-16">
                    <Leaderboard />
                </div>
            </div>

            {/* Cooldown Indicators */}
            {(debugMintCooldown > 0 || debugPuzzleCooldown > 0) && (
                <div className="fixed top-24 right-4 z-50 space-y-2">
                    {debugMintCooldown > 0 && (
                        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-lg px-4 py-3 w-40">
                            <div className="text-xs text-red-300 font-semibold text-center">Mint Cooldown</div>
                            <div className="text-2xl font-bold text-white text-center tabular-nums">{debugMintCooldown}s</div>
                        </div>
                    )}
                    {debugPuzzleCooldown > 0 && (
                        <div className="bg-orange-500/20 backdrop-blur-xl border border-orange-500/50 rounded-lg px-4 py-3 w-40">
                            <div className="text-xs text-orange-300 font-semibold text-center">Puzzle Cooldown</div>
                            <div className="text-lg font-bold text-white text-center tabular-nums">
                                {Math.floor(debugPuzzleCooldown / 3600)}h {Math.floor((debugPuzzleCooldown % 3600) / 60)}m {debugPuzzleCooldown % 60}s
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Debug Panel */}
            <DebugPanel
                onPuzzleTypeChange={(type) => {
                    setDebugPuzzleType(type);
                    console.log('Puzzle type changed to:', type);
                }}
                onAddXP={(amount) => {
                    setDebugXP(prev => prev + amount);
                    console.log('Added XP:', amount, 'Total:', debugXP + amount);
                }}
                onPopulateLeaderboard={() => {
                    console.log('Populating leaderboard...');
                }}
                onUnlockBadge={(badgeId) => {
                    console.log('Unlocking badge:', badgeId);
                }}
                onTestMysteryBox={() => {
                    setShowMysteryBox(true);
                }}
                onSimMint={() => {
                    console.log('Simulating mint...');
                }}
                onStartCooldown={(type) => {
                    if (type === 'mint') {
                        setDebugMintCooldown(45);
                    } else {
                        setDebugPuzzleCooldown(24 * 60 * 60); // 24 hours in seconds
                    }
                }}
            />
        </main>
    );
}
