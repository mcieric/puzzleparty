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

    struct Puzzle {
        uint256 id;
        uint256 price;
        uint256 totalPieces;
        uint256 piecesMintedCount;
        bool isComplete;
        address lastMinter;
        bytes32 solutionHash; // Hash of the image or solution
    }

    /* =====================================================================================
                                            STATE
       ===================================================================================== */

    /// @notice Mapping from puzzle ID to Puzzle struct
    mapping(uint256 => Puzzle) public puzzles;

    /// @notice Mapping from puzzle ID to bitmap of minted pieces
    mapping(uint256 => LibBitmap.Bitmap) internal _mintedPieces;

    /// @notice Address of the admin wallet that receives funds
    address public payoutWallet;

    /// @notice Address of the USDC contract on Base
    address public usdcToken;

    /// @notice Total number of puzzles created
    uint256 public puzzleCount;

    /* =====================================================================================
                                            EVENTS
       ===================================================================================== */

    event PuzzleCreated(uint256 indexed puzzleId, uint256 price, uint256 totalPieces);
    event PieceMinted(uint256 indexed puzzleId, uint256 indexed pieceId, address indexed minter);
    event PuzzleCompleted(uint256 indexed puzzleId, address lastMinter);
    event PayoutWalletUpdated(address newWallet);

    /* =====================================================================================
                                            ERRORS
       ===================================================================================== */

    error PuzzleNotFound();
    error PieceAlreadyMinted();
    error PuzzleAlreadyComplete();
    error InvalidPieceId();
    error InsufficientAllowance();
    error TransferFailed();

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
    /// @param _price Price per piece in USDC (e.g. 0.1 USDC = 100000)
    /// @param _totalPieces Total number of pieces (e.g. 100 or 200)
    /// @param _solutionHash Hash of the solution for verification
    function createPuzzle(uint256 _price, uint256 _totalPieces, bytes32 _solutionHash) external onlyOwner {
        puzzleCount++;
        uint256 newId = puzzleCount;

        puzzles[newId] = Puzzle({
            id: newId,
            price: _price,
            totalPieces: _totalPieces,
            piecesMintedCount: 0,
            isComplete: false,
            lastMinter: address(0),
            solutionHash: _solutionHash
        });

        emit PuzzleCreated(newId, _price, _totalPieces);
    }

    /// @notice Updates the payout wallet address
    function setPayoutWallet(address _newWallet) external onlyOwner {
        payoutWallet = _newWallet;
        emit PayoutWalletUpdated(_newWallet);
    }

    /* =====================================================================================
                                        USER FUNCTIONS
       ===================================================================================== */

    /// @notice Mints a puzzle piece
    /// @param _puzzleId ID of the puzzle
    /// @param _pieceId ID of the piece to mint (0 to totalPieces - 1)
    function mintPiece(uint256 _puzzleId, uint256 _pieceId) external {
        Puzzle storage puzzle = puzzles[_puzzleId];

        if (puzzle.id == 0) revert PuzzleNotFound();
        if (puzzle.isComplete) revert PuzzleAlreadyComplete();
        if (_pieceId >= puzzle.totalPieces) revert InvalidPieceId();
        if (_mintedPieces[_puzzleId].get(_pieceId)) revert PieceAlreadyMinted();

        // 1. Transfer USDC from user to payout wallet
        // User must have approved this contract to spend USDC
        SafeTransferLib.safeTransferFrom(usdcToken, msg.sender, payoutWallet, puzzle.price);

        // 2. Update State
        _mintedPieces[_puzzleId].set(_pieceId);
        puzzle.piecesMintedCount++;
        
        // 3. Emit Event
        emit PieceMinted(_puzzleId, _pieceId, msg.sender);

        // 4. Check Completion
        if (puzzle.piecesMintedCount == puzzle.totalPieces) {
            puzzle.isComplete = true;
            puzzle.lastMinter = msg.sender;
            emit PuzzleCompleted(_puzzleId, msg.sender);
        }
    }

    /* =====================================================================================
                                        VIEW FUNCTIONS
       ===================================================================================== */

    /// @notice Checks if a specific piece is minted
    function isPieceMinted(uint256 _puzzleId, uint256 _pieceId) external view returns (bool) {
        return _mintedPieces[_puzzleId].get(_pieceId);
    }
}
