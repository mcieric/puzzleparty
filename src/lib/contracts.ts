export const PUZZLE_MANAGER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with deployed address
export const XP_MANAGER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with deployed address
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

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
            { "name": "solutionHash", "type": "bytes32", "internalType": "bytes32" }
        ],
        "stateMutability": "view"
    }
] as const;
