// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {PuzzleManager} from "../src/PuzzleManager.sol";
import {MockERC20} from "solady/test/utils/mocks/MockERC20.sol";

contract PuzzleManagerTest is Test {
    PuzzleManager public puzzleManager;
    MockERC20 public usdc;
    
    address public owner = address(0x1);
    address public payoutWallet = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    address public user3 = address(0x5);

    function setUp() public {
        vm.startPrank(owner);
        
        usdc = new MockERC20("USDC", "USDC", 6);
        puzzleManager = new PuzzleManager(payoutWallet, address(usdc));
        
        vm.stopPrank();

        usdc.mint(user1, 1000 * 1e6);
        usdc.mint(user2, 1000 * 1e6);
        usdc.mint(user3, 1000 * 1e6);
    }

    function test_CreatePuzzle() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(
            0.1 * 1e6, 
            100, 
            bytes32(0), 
            0,
            PuzzleManager.PuzzleType.Normal,
            24 hours
        );

        assertEq(puzzleManager.puzzleCount(), 1);
    }

    function test_MintPiece_Economics() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 24 hours);

        vm.prank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);

        vm.prank(user1);
        puzzleManager.mintPiece(1, 0);

        assertEq(usdc.balanceOf(payoutWallet), 0.15 * 1e6, "Dev fee incorrect (should be 15%)");
        assertEq(puzzleManager.superPuzzleFund(), 0.1 * 1e6, "Reserve fund incorrect (should be 10%)");
    }

    function test_MintLimit() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 100, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 24 hours);

        vm.startPrank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        
        for (uint256 i = 0; i < 10; i++) {
            puzzleManager.mintPiece(1, i);
            vm.warp(block.timestamp + 46);
        }

        vm.expectRevert(PuzzleManager.MaxPiecesExceeded.selector);
        puzzleManager.mintPiece(1, 10);
        vm.stopPrank();
    }

    function test_MintCooldown() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 24 hours);

        vm.startPrank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        
        puzzleManager.mintPiece(1, 0);
        
        vm.expectRevert(PuzzleManager.MintCooldownActive.selector);
        puzzleManager.mintPiece(1, 1);
        
        vm.warp(block.timestamp + 45);
        puzzleManager.mintPiece(1, 1);
        vm.stopPrank();
    }

    function test_SniperTimer() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 1 hours);

        vm.prank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        vm.prank(user1);
        puzzleManager.mintPiece(1, 0);

        // Warp past sniper duration
        vm.warp(block.timestamp + 1 hours + 1);

        // Force complete should work
        uint256 user1BalanceBefore = usdc.balanceOf(user1);
        puzzleManager.forceCompletePuzzle(1);
        uint256 user1BalanceAfter = usdc.balanceOf(user1);

        // User1 should receive 40% of prize pool (Sniper Timer)
        // Prize pool is 0.75 USDC (75% of 1 USDC), 40% = 0.3 USDC
        assertEq(user1BalanceAfter - user1BalanceBefore, 0.3 * 1e6, "Sniper payout should be 40%");
    }

    function test_PuzzleCompletion() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 2, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 24 hours);

        vm.startPrank(user1);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        puzzleManager.mintPiece(1, 0);
        vm.stopPrank();

        vm.warp(block.timestamp + 46);

        vm.startPrank(user2);
        usdc.approve(address(puzzleManager), 100 * 1e6);
        
        uint256 balanceBefore = usdc.balanceOf(user2);
        puzzleManager.mintPiece(1, 1);
        uint256 balanceAfter = usdc.balanceOf(user2);
        vm.stopPrank();

        // Winner should pay 1 USDC and receive 45% of prize pool back
        // Prize pool = 0.75 USDC per mint × 2 = 1.5 USDC total
        // Finisher gets 45% of 1.5 = 0.675 USDC
        // Net cost: 1 - 0.675 = 0.325 USDC
        assertEq(balanceBefore - balanceAfter, 0.325 * 1e6, "Winner payout incorrect (should be 45% of prize pool)");

        vm.prank(owner);
        puzzleManager.setRaffleWinner(1, user1);

        uint256 u1BalanceBefore = usdc.balanceOf(user1);
        vm.prank(user1);
        puzzleManager.claimRafflePrize(1);
        uint256 u1BalanceAfter = usdc.balanceOf(user1);

        // Raffle winner gets 30% of prize pool
        // Prize pool = 1.5 USDC, raffle gets 30% = 0.45 USDC
        assertEq(u1BalanceAfter - u1BalanceBefore, 0.45 * 1e6, "Raffle payout incorrect (should be 30% of prize pool)");
    }

    function test_TimeRemaining() public {
        vm.prank(owner);
        puzzleManager.createPuzzle(1 * 1e6, 10, bytes32(0), 0, PuzzleManager.PuzzleType.Normal, 24 hours);

        uint256 remaining = puzzleManager.getPuzzleTimeRemaining(1);
        assertGt(remaining, 0);
        assertLe(remaining, 24 hours);
    }
}
