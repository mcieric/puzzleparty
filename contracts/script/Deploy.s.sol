// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {PuzzleManager} from "../src/PuzzleManager.sol";
import {XPManager} from "../src/XPManager.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address payoutWallet = vm.envAddress("PAYOUT_WALLET");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy XPManager
        XPManager xpManager = new XPManager();
        console2.log("XPManager deployed at:", address(xpManager));

        // 2. Deploy PuzzleManager
        PuzzleManager puzzleManager = new PuzzleManager(payoutWallet, usdcAddress);
        console2.log("PuzzleManager deployed at:", address(puzzleManager));

        vm.stopBroadcast();
    }
}
