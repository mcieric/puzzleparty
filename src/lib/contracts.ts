export const PUZZLE_MANAGER_ADDRESS = '0x43ba12439d74256a109843c4d2a22cd0a88b6446'; // Deployed on Base Sepolia
export const XP_MANAGER_ADDRESS = '0xbf3e285ec8eaac4645d5f7fa2bd420b2e9c2f6b5'; // Deployed on Base Sepolia
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF'; // Base Sepolia USDC

export const PUZZLE_MANAGER_ABI = [
    {
        "type": "function",
        "name": "mintPiece",
        "inputs": [
            { "name": "_puzzleId", "type": "uint256", "internalType": "uint256" },
            { "name": "_pieceId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isPieceMinted",
        "inputs": [
            { "name": "_puzzleId", "type": "uint256", "internalType": "uint256" },
            { "name": "_pieceId", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "puzzles",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "id", "type": "uint256", "internalType": "uint256" },
            { "name": "price", "type": "uint256", "internalType": "uint256" },
            { "name": "totalPieces", "type": "uint256", "internalType": "uint256" },
            { "name": "piecesMintedCount", "type": "uint256", "internalType": "uint256" },
            { "name": "isComplete", "type": "bool", "internalType": "bool" },
            { "name": "lastMinter", "type": "address", "internalType": "address" },
            { "name": "solutionHash", "type": "bytes32", "internalType": "bytes32" },
            { "name": "prizePool", "type": "uint256", "internalType": "uint256" },
            { "name": "raffleWinner", "type": "address", "internalType": "address" },
            { "name": "raffleClaimed", "type": "bool", "internalType": "bool" },
            { "name": "startTime", "type": "uint256", "internalType": "uint256" },
            { "name": "completionTime", "type": "uint256", "internalType": "uint256" },
            { "name": "puzzleType", "type": "uint8", "internalType": "enum PuzzleManager.PuzzleType" },
            { "name": "lastGlobalMintTime", "type": "uint256", "internalType": "uint256" },
            { "name": "sniperDuration", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "superPuzzleFund",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "userMintCount",
        "inputs": [
            { "name": "puzzleId", "type": "uint256", "internalType": "uint256" },
            { "name": "user", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastUserMintTime",
        "inputs": [
            { "name": "puzzleId", "type": "uint256", "internalType": "uint256" },
            { "name": "user", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPuzzleTimeRemaining",
        "inputs": [{ "name": "puzzleId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "PieceMinted",
        "inputs": [
            { "name": "puzzleId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "pieceId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "minter", "type": "address", "indexed": true, "internalType": "address" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PuzzleCompleted",
        "inputs": [
            { "name": "puzzleId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "lastMinter", "type": "address", "indexed": false, "internalType": "address" },
            { "name": "winnerPrize", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    }
] as const;

export const XP_MANAGER_ABI = [
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" },
            { "name": "id", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    }
] as const;
