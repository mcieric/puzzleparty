// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {XPManager} from "../src/XPManager.sol";

contract XPManagerTest is Test {
    XPManager public xpManager;
    
    address public owner = address(0x1);
    address public minter = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);

    function setUp() public {
        vm.prank(owner);
        xpManager = new XPManager();
        
        vm.prank(owner);
        xpManager.setMinter(minter, true);
    }

    /* =====================================================================================
                                    BADGE TIER TESTS
       ===================================================================================== */

    function test_BadgeTierBronze() public {
        // 0-99 XP = Bronze (ID 1)
        assertEq(xpManager.getBadgeTier(0), 1, "0 XP should be Bronze");
        assertEq(xpManager.getBadgeTier(50), 1, "50 XP should be Bronze");
        assertEq(xpManager.getBadgeTier(99), 1, "99 XP should be Bronze");
    }

    function test_BadgeTierSilver() public {
        // 100-499 XP = Silver (ID 2)
        assertEq(xpManager.getBadgeTier(100), 2, "100 XP should be Silver");
        assertEq(xpManager.getBadgeTier(250), 2, "250 XP should be Silver");
        assertEq(xpManager.getBadgeTier(499), 2, "499 XP should be Silver");
    }

    function test_BadgeTierGold() public {
        // 500-1499 XP = Gold (ID 3)
        assertEq(xpManager.getBadgeTier(500), 3, "500 XP should be Gold");
        assertEq(xpManager.getBadgeTier(1000), 3, "1000 XP should be Gold");
        assertEq(xpManager.getBadgeTier(1499), 3, "1499 XP should be Gold");
    }

    function test_BadgeTierDiamond() public {
        // 1500+ XP = Diamond (ID 4)
        assertEq(xpManager.getBadgeTier(1500), 4, "1500 XP should be Diamond");
        assertEq(xpManager.getBadgeTier(2000), 4, "2000 XP should be Diamond");
        assertEq(xpManager.getBadgeTier(10000), 4, "10000 XP should be Diamond");
    }

    /* =====================================================================================
                                    SOULBOUND TESTS
       ===================================================================================== */

    function test_SoulboundTransferReverts() public {
        // Mint badge to user1
        vm.prank(minter);
        xpManager.mint(user1, 1, 1, "");

        // Try to transfer (should revert)
        vm.prank(user1);
        vm.expectRevert(XPManager.Soulbound.selector);
        xpManager.safeTransferFrom(user1, user2, 1, 1, "");
    }

    function test_MintingWorks() public {
        // Authorized minter can mint
        vm.prank(minter);
        xpManager.mint(user1, 1, 1, "");
        
        assertEq(xpManager.balanceOf(user1, 1), 1, "User should have 1 badge");
    }

    function test_UnauthorizedMintReverts() public {
        // Unauthorized address cannot mint
        vm.prank(user1);
        vm.expectRevert(XPManager.NotAuthorized.selector);
        xpManager.mint(user2, 1, 1, "");
    }

    function test_OwnerCanMint() public {
        // Owner can always mint
        vm.prank(owner);
        xpManager.mint(user1, 1, 1, "");
        
        assertEq(xpManager.balanceOf(user1, 1), 1, "User should have 1 badge");
    }

    function test_MinterManagement() public {
        address newMinter = address(0x6);
        
        // Owner can add minter
        vm.prank(owner);
        xpManager.setMinter(newMinter, true);
        
        // New minter can mint
        vm.prank(newMinter);
        xpManager.mint(user1, 1, 1, "");
        
        assertEq(xpManager.balanceOf(user1, 1), 1, "Minting should work");
        
        // Owner can remove minter
        vm.prank(owner);
        xpManager.setMinter(newMinter, false);
        
        // Removed minter cannot mint
        vm.prank(newMinter);
        vm.expectRevert(XPManager.NotAuthorized.selector);
        xpManager.mint(user1, 2, 1, "");
    }
}
