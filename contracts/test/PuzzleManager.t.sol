// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {PuzzleManager} from "../src/PuzzleManager.sol";
import {MockERC20} from "solady/src/utils/MockERC20.sol";

contract PuzzleManagerTest is Test {
    PuzzleManager public puzzleManager;
    MockERC20 public usdc;
    
    address public owner = address(0x1);
    address public payoutWallet = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);

    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy Mock USDC
        usdc = new MockERC20("USDC", "USDC", 6);
        
        // Deploy PuzzleManager
        puzzleManager = new PuzzleManager(payoutWallet, address(usdc));
        
        vm.stopPrank();

        // Mint USDC to users
        usdc.mint(user1, 1000 * 1e6);
        usdc.mint(user2, 1000 * 1e6);
    }

    function test_CreatePuzzle() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(0.1 * 1e6, 100, bytes32(0));

        (uint256 id, uint256 price, uint256 totalPieces, uint256 minted, bool isComplete, , ) = puzzleManager.puzzles(1);
        
        assertEq(id, 1);
        assertEq(price, 0.1 * 1e6);
        assertEq(totalPieces, 100);
        assertEq(minted, 0);
        assertEq(isComplete, false);
    }

    function test_MintPiece() public {
        // 1. Create Puzzle
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0)); // 1 USDC per piece

        // 2. Approve USDC
        vm.prank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);

        // 3. Mint Piece 0
        vm.prank(user1);
        puzzleManager.mintPiece(1, 0);

        // 4. Verify State
        assertTrue(puzzleManager.isPieceMinted(1, 0));
        
        // 5. Verify Payout (User -> PayoutWallet)
        assertEq(usdc.balanceOf(user1), 999 * 1e6);
        assertEq(usdc.balanceOf(payoutWallet), 1 * 1e6);
        assertEq(usdc.balanceOf(address(puzzleManager)), 0); // Zero funds in contract
    }

    function test_RevertIfPieceAlreadyMinted() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0));

        vm.startPrank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        puzzleManager.mintPiece(1, 0);
        
        vm.expectRevert(PuzzleManager.PieceAlreadyMinted.selector);
        puzzleManager.mintPiece(1, 0);
        vm.stopPrank();
    }

    function test_PuzzleCompletion() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 2, bytes32(0)); // 2 pieces

        vm.startPrank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        
        puzzleManager.mintPiece(1, 0);
        
        // Check not complete
        (,,,, bool isComplete1,,) = puzzleManager.puzzles(1);
        assertFalse(isComplete1);

        puzzleManager.mintPiece(1, 1);
        
        // Check complete
        (,,,, bool isComplete2, address lastMinter,) = puzzleManager.puzzles(1);
        assertTrue(isComplete2);
        assertEq(lastMinter, user1);
        vm.stopPrank();
    }
}
