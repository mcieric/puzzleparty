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

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-[#0a0a1a] text-white">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-gradient-to-b from-zinc-800/30 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-800/50 lg:p-4">
                    <span className="text-purple-400 font-bold text-xl mr-2">PUZZLE PARTY</span>
                    <span className="text-gray-400">Season 1</span>
                </p>

                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <Wallet>
                        <ConnectWallet>
                            <Avatar className="h-6 w-6" />
                            <Name />
                        </ConnectWallet>
                        <WalletDropdown>
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                                <EthBalance />
                            </Identity>
                            <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                                Wallet
                            </WalletDropdownLink>
                            <WalletDropdownDisconnect />
                        </WalletDropdown>
                    </Wallet>
                </div>
            </div>

            <div className="relative flex place-items-center flex-col gap-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Reveal the Mystery
                    </h1>
                    <p className="text-gray-400">Mint a piece to win the Jackpot!</p>

                    <div className="flex justify-center gap-8 text-sm">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/20">
                            <div className="text-gray-500">Jackpot</div>
                            <div className="text-2xl font-bold text-green-400">8.00 USDC</div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/20">
                            <div className="text-gray-500">Price / Piece</div>
                            <div className="text-2xl font-bold text-white">0.10 USDC</div>
                        </div>
                    </div>
                </div>

                <PuzzleGrid puzzleId={1} totalPieces={100} price={0.1} />
            </div>

            <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                {/* Stats or other info */}
            </div>
        </main>
    );
}
