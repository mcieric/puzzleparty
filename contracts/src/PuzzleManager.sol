// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "solady/src/auth/Ownable.sol";
import {LibBitmap} from "solady/src/utils/LibBitmap.sol";
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @title PuzzleManager
/// @notice Manages puzzle creation, minting, and completion for Puzzle Party.
/// @dev Uses Solady for gas optimization. Zero funds stored in contract.
contract PuzzleManager is Ownable {
    using LibBitmap for LibBitmap.Bitmap;
    using SafeTransferLib for address;

    /* =====================================================================================
                                        STRUCTS & ENUMS
       ===================================================================================== */

    enum PuzzleType { Normal, Super, Mega }

    struct Puzzle {
        uint256 id;
        uint256 price;
        uint256 totalPieces;
        uint256 piecesMintedCount;
        bool isComplete;
        address lastMinter;
        bytes32 solutionHash; // Hash of the image or solution
        
        // Economics
        uint256 prizePool;      // Accumulated prize pool (70% of mints)
        address raffleWinner;   // Address of the raffle winner
        bool raffleClaimed;     // Whether raffle prize has been claimed
        
        // Timing & Gamification
        uint256 startTime;      // Timestamp when minting can start
        uint256 completionTime; // Timestamp when puzzle was completed
        PuzzleType puzzleType;  // Type of puzzle for visual themes
        
        // Sniper Logic
        uint256 lastGlobalMintTime; // Timestamp of the last mint by anyone
        uint256 sniperDuration;     // Duration without mints to trigger sniper win (e.g. 24h)
    }

    /* =====================================================================================
                                            STATE
       ===================================================================================== */

    /// @notice Mapping from puzzle ID to Puzzle struct
    mapping(uint256 => Puzzle) public puzzles;

    /// @notice Mapping from puzzle ID to bitmap of minted pieces
    mapping(uint256 => LibBitmap.Bitmap) internal _mintedPieces;

    /// @notice Mapping from puzzle ID to user address to mint count
    mapping(uint256 => mapping(address => uint256)) public userMintCount;

    /// @notice Mapping from puzzle ID to user address to last mint timestamp
    mapping(uint256 => mapping(address => uint256)) public lastUserMintTime;

    /// @notice Address of the admin wallet that receives dev fees
    address public payoutWallet;

    /// @notice Address of the USDC contract on Base
    address public usdcToken;

    /// @notice Total number of puzzles created
    uint256 public puzzleCount;

    /// @notice Accumulated fund for the "Su Super Puzzle"
    uint256 public superPuzzleFund;

    // Fees (Basis Points: 10000 = 100%)
    // New Economic Model: 45% Finisher / 30% Raffle / 15% Dev / 10% Reserve
    uint256 public constant DEV_FEE_BPS = 1500;         // 15%
    uint256 public constant RESERVE_FEE_BPS = 1000;      // 10% (renamed from SUPER_PUZZLE_FEE_BPS)
    uint256 public constant FINISHER_SHARE_BPS = 4500;  // 45% of prize pool
    uint256 public constant RAFFLE_SHARE_BPS = 3000;    // 30% of prize pool

    // Global Rules
    uint256 public constant MAX_PIECES_PER_WALLET = 10;
    uint256 public constant MIN_COOLDOWN = 35 seconds;  // Random cooldown range
    uint256 public constant MAX_COOLDOWN = 55 seconds;  // Random cooldown range

    /* =====================================================================================
                                            EVENTS
       ===================================================================================== */

    event PuzzleCreated(uint256 indexed puzzleId, uint256 price, uint256 totalPieces, uint256 startTime, PuzzleType puzzleType);
    event PieceMinted(uint256 indexed puzzleId, uint256 indexed pieceId, address indexed minter);
    event PuzzleCompleted(uint256 indexed puzzleId, address lastMinter, uint256 winnerPrize);
    event RaffleWinnerSelected(uint256 indexed puzzleId, address winner);
    event RafflePrizeClaimed(uint256 indexed puzzleId, address winner, uint256 amount);
    event PayoutWalletUpdated(address newWallet);
    event SuperPuzzleFundWithdrawn(uint256 amount);
    event SniperWin(uint256 indexed puzzleId, address winner, uint256 prize);

    /* =====================================================================================
                                            ERRORS
       ===================================================================================== */

    error PuzzleNotFound();
    error PieceAlreadyMinted();
    error PuzzleAlreadyComplete();
    error InvalidPieceId();
    error InsufficientAllowance();
    error TransferFailed();
    error PuzzleNotStarted();
    error RaffleWinnerAlreadySet();
    error NotRaffleWinner();
    error RaffleAlreadyClaimed();
    error RaffleWinnerNotSet();
    error MaxPiecesExceeded();
    error MintCooldownActive();
    error SniperTimerExpired(); // Used if trying to mint after timer expired
    error SniperTimerNotExpired(); // Used if trying to force complete before timer expired

    /* =====================================================================================
                                        CONSTRUCTOR
       ===================================================================================== */

    constructor(address _payoutWallet, address _usdcToken) {
        _initializeOwner(msg.sender);
        payoutWallet = _payoutWallet;
        usdcToken = _usdcToken;
    }

    /* =====================================================================================
                                        ADMIN FUNCTIONS
       ===================================================================================== */

    /// @notice Creates a new puzzle
    function createPuzzle(
        uint256 _price, 
        uint256 _totalPieces, 
        bytes32 _solutionHash,
        uint256 _startTime,
        PuzzleType _puzzleType,
        uint256 _sniperDuration
    ) external onlyOwner {
        puzzleCount++;
        uint256 newId = puzzleCount;

        // If startTime is 0, start immediately
        uint256 start = _startTime == 0 ? block.timestamp : _startTime;
        // Default sniper duration 24h if 0
        uint256 duration = _sniperDuration == 0 ? 24 hours : _sniperDuration;

        puzzles[newId] = Puzzle({
            id: newId,
            price: _price,
            totalPieces: _totalPieces,
            piecesMintedCount: 0,
            isComplete: false,
            lastMinter: address(0),
            solutionHash: _solutionHash,
            prizePool: 0,
            raffleWinner: address(0),
            raffleClaimed: false,
            startTime: start,
            completionTime: 0,
            puzzleType: _puzzleType,
            lastGlobalMintTime: start,
            sniperDuration: duration
        });

        emit PuzzleCreated(newId, _price, _totalPieces, start, _puzzleType);
    }

    /// @notice Updates the payout wallet address
    function setPayoutWallet(address _newWallet) external onlyOwner {
        payoutWallet = _newWallet;
        emit PayoutWalletUpdated(_newWallet);
    }

    /// @notice Sets the raffle winner for a completed puzzle
    function setRaffleWinner(uint256 _puzzleId, address _winner) external onlyOwner {
        Puzzle storage puzzle = puzzles[_puzzleId];
        if (!puzzle.isComplete) revert PuzzleNotFound();
        if (puzzle.raffleWinner != address(0)) revert RaffleWinnerAlreadySet();
        
        puzzle.raffleWinner = _winner;
        emit RaffleWinnerSelected(_puzzleId, _winner);
    }

    /// @notice Withdraws the accumulated Super Puzzle Fund
    function withdrawSuperPuzzleFund() external onlyOwner {
        uint256 amount = superPuzzleFund;
        superPuzzleFund = 0;
        usdcToken.safeTransfer(msg.sender, amount);
        emit SuperPuzzleFundWithdrawn(amount);
    }

    /* =====================================================================================
                                        USER FUNCTIONS
       ===================================================================================== */

    /// @notice Mints a puzzle piece
    function mintPiece(uint256 _puzzleId, uint256 _pieceId) external {
        Puzzle storage puzzle = puzzles[_puzzleId];

        if (puzzle.id == 0) revert PuzzleNotFound();
        if (puzzle.isComplete) revert PuzzleAlreadyComplete();
        if (block.timestamp < puzzle.startTime) revert PuzzleNotStarted();
        
        // Sniper Check
        if (block.timestamp > puzzle.lastGlobalMintTime + puzzle.sniperDuration) {
            revert SniperTimerExpired();
        }

        // Gamification Checks
        if (userMintCount[_puzzleId][msg.sender] >= MAX_PIECES_PER_WALLET) revert MaxPiecesExceeded();
        
        // Random cooldown check (35-55 seconds)
        if (lastUserMintTime[_puzzleId][msg.sender] > 0) {
            uint256 requiredCooldown = _getRandomCooldown(msg.sender, _puzzleId);
            if (block.timestamp < lastUserMintTime[_puzzleId][msg.sender] + requiredCooldown) {
                revert MintCooldownActive();
            }
        }

        if (_pieceId >= puzzle.totalPieces) revert InvalidPieceId();
        if (_mintedPieces[_puzzleId].get(_pieceId)) revert PieceAlreadyMinted();

        // 1. Calculate Fees & Prize
        uint256 price = puzzle.price;
        uint256 devFee = (price * DEV_FEE_BPS) / 10000;      // 15%
        uint256 reserveFee = (price * RESERVE_FEE_BPS) / 10000; // 10%
        uint256 prizePart = price - devFee - reserveFee;     // 75% goes to prize pool

        // 2. Transfer USDC from user
        usdcToken.safeTransferFrom(msg.sender, payoutWallet, devFee);
        usdcToken.safeTransferFrom(msg.sender, address(this), price - devFee);

        // 3. Update State
        superPuzzleFund += reserveFee;  // Accumulate for Mega Puzzle
        puzzle.prizePool += prizePart;  // 75% of price goes to prize pool
        
        _mintedPieces[_puzzleId].set(_pieceId);
        puzzle.piecesMintedCount++;
        puzzle.lastMinter = msg.sender;
        puzzle.lastGlobalMintTime = block.timestamp;
        
        userMintCount[_puzzleId][msg.sender]++;
        lastUserMintTime[_puzzleId][msg.sender] = block.timestamp;
        
        emit PieceMinted(_puzzleId, _pieceId, msg.sender);

        // 4. Check Completion
        if (puzzle.piecesMintedCount == puzzle.totalPieces) {
            _completePuzzle(_puzzleId, msg.sender);
        }
    }

    /// @notice Forces puzzle completion if sniper timer expired
    /// @dev Last minter gets 40% of prize pool, 60% remains for raffle
    function forceCompletePuzzle(uint256 _puzzleId) external {
        Puzzle storage puzzle = puzzles[_puzzleId];
        if (puzzle.isComplete) revert PuzzleAlreadyComplete();
        
        // Check if timer expired
        if (block.timestamp <= puzzle.lastGlobalMintTime + puzzle.sniperDuration) {
            revert SniperTimerNotExpired();
        }

        // Last minter wins 40% of current prize pool
        address winner = puzzle.lastMinter;
        if (winner == address(0)) revert PuzzleNotStarted(); // Should not happen if at least one mint

        puzzle.isComplete = true;
        puzzle.completionTime = block.timestamp;

        // Sniper gets 40% of prize pool
        uint256 sniperPrize = (puzzle.prizePool * 4000) / 10000; // 40%
        usdcToken.safeTransfer(winner, sniperPrize);
        
        // Remaining 60% stays in prize pool for raffle
        // Note: puzzle.prizePool is not modified, raffle claim will get the remaining amount

        emit SniperWin(_puzzleId, winner, sniperPrize);
        emit PuzzleCompleted(_puzzleId, winner, sniperPrize);
    }

    function _completePuzzle(uint256 _puzzleId, address _winner) internal {
        Puzzle storage puzzle = puzzles[_puzzleId];
        puzzle.isComplete = true;
        puzzle.completionTime = block.timestamp;

        // Payout 45% of prize pool to finisher (60% of 75% total)
        uint256 winnerPrize = (puzzle.prizePool * FINISHER_SHARE_BPS) / 10000;
        usdcToken.safeTransfer(_winner, winnerPrize);

        emit PuzzleCompleted(_puzzleId, _winner, winnerPrize);
    }

    /// @notice Claims the raffle prize
    /// @dev Handles both normal completion (30% of pool) and sniper scenarios (60% remaining)
    function claimRafflePrize(uint256 _puzzleId) external {
        Puzzle storage puzzle = puzzles[_puzzleId];
        
        if (puzzle.raffleWinner == address(0)) revert RaffleWinnerNotSet();
        if (msg.sender != puzzle.raffleWinner) revert NotRaffleWinner();
        if (puzzle.raffleClaimed) revert RaffleAlreadyClaimed();

        puzzle.raffleClaimed = true;
        
        // Calculate raffle share
        // For normal completion: 30% of prize pool (RAFFLE_SHARE_BPS)
        // For sniper: Remaining balance after 40% sniper payout
        uint256 contractBalance = IERC20(usdcToken).balanceOf(address(this));
        uint256 raffleShare;
        
        // Check if this is a sniper scenario by looking at remaining balance
        // In sniper case, 40% was already paid out, so we pay the remainder
        // In normal case, 45% was paid to finisher, we pay 30%
        uint256 expectedRaffleShare = (puzzle.prizePool * RAFFLE_SHARE_BPS) / 10000;
        
        // Use the minimum of expected share and available balance to handle both cases
        raffleShare = expectedRaffleShare;
        if (contractBalance < raffleShare) {
            raffleShare = contractBalance; // Sniper scenario: pay remaining balance
        }

        usdcToken.safeTransfer(msg.sender, raffleShare);
        
        emit RafflePrizeClaimed(_puzzleId, msg.sender, raffleShare);
    }

    /* =====================================================================================
                                        VIEW FUNCTIONS
       ===================================================================================== */

    function isPieceMinted(uint256 _puzzleId, uint256 _pieceId) external view returns (bool) {
        return _mintedPieces[_puzzleId].get(_pieceId);
    }

    /// @notice Generates a random cooldown between MIN_COOLDOWN and MAX_COOLDOWN
    /// @dev Uses block.prevrandao for randomness (secure on Base/PoS chains)
    function _getRandomCooldown(address _user, uint256 _puzzleId) internal view returns (uint256) {
        // Create pseudo-random number using prevrandao, user address, and puzzle ID
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            _user,
            _puzzleId,
            block.timestamp
        )));
        
        // Map to range [MIN_COOLDOWN, MAX_COOLDOWN]
        uint256 range = MAX_COOLDOWN - MIN_COOLDOWN;
        uint256 randomOffset = randomSeed % (range + 1);
        return MIN_COOLDOWN + randomOffset;
    }
    
    function getPuzzleTimeRemaining(uint256 _puzzleId) external view returns (uint256) {
        Puzzle storage puzzle = puzzles[_puzzleId];
        if (puzzle.isComplete) return 0;
        
        uint256 deadline = puzzle.lastGlobalMintTime + puzzle.sniperDuration;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }
}
