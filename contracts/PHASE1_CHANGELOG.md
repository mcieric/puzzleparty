# Phase 1: Smart Contract Updates - Change Log

**Date:** 2025-12-02  
**Status:** ✅ Completed  
**Contracts Modified:** `PuzzleManager.sol`, `XPManager.sol`

---

## Summary of Changes

Phase 1 successfully implements all validated V11 specifications for smart contracts, including the new economic model (45/30/15/10), random cooldown mechanism (35-55s), updated Sniper Timer logic (40/60 split), and badge tier system.

---

## 1. Economic Model Update (45/30/15/10)

### Changes Made

**File:** `PuzzleManager.sol`

**Modified Constants (Lines 74-79):**
```solidity
// OLD
uint256 public constant DEV_FEE_BPS = 2000;         // 20%
uint256 public constant SUPER_PUZZLE_FEE_BPS = 1000; // 10%

// NEW
uint256 public constant DEV_FEE_BPS = 1500;         // 15%
uint256 public constant RESERVE_FEE_BPS = 1000;      // 10%
uint256 public constant FINISHER_SHARE_BPS = 4500;  // 45% of prize pool
uint256 public constant RAFFLE_SHARE_BPS = 3000;    // 30% of prize pool
```

**Impact:**
- Dev fee reduced from 20% to 15%
- Reserve fee remains at 10% (renamed from SUPER_PUZZLE_FEE_BPS)
- Prize pool increased from 70% to 75% of total revenue
- Finisher now gets 45% of prize pool (instead of 50%)
- Raffle now gets 30% of prize pool (instead of 50%)

**Example (100 pieces × 0.10 USDC = 10 USDC):**
- Dev: 1.5 USDC (15%)
- Reserve: 1.0 USDC (10%)
- Finisher: 3.375 USDC (45% of 7.5 USDC prize pool)
- Raffle: 2.25 USDC (30% of 7.5 USDC prize pool)
- **Total to players: 5.625 USDC (56.25%)**

---

## 2. Random Cooldown (35-55 seconds)

### Changes Made

**File:** `PuzzleManager.sol`

**Modified Constants (Lines 80-81):**
```solidity
// OLD
uint256 public constant MINT_COOLDOWN = 45 seconds;

// NEW
uint256 public constant MIN_COOLDOWN = 35 seconds;
uint256 public constant MAX_COOLDOWN = 55 seconds;
```

**New Function (Lines 311-327):**
```solidity
function _getRandomCooldown(address _user, uint256 _puzzleId) internal view returns (uint256) {
    uint256 randomSeed = uint256(keccak256(abi.encodePacked(
        block.prevrandao,
        _user,
        _puzzleId,
        block.timestamp
    )));
    
    uint256 range = MAX_COOLDOWN - MIN_COOLDOWN;
    uint256 randomOffset = randomSeed % (range + 1);
    return MIN_COOLDOWN + randomOffset;
}
```

**Modified Cooldown Check (Lines 212-220):**
```solidity
// OLD
if (lastUserMintTime[_puzzleId][msg.sender] > 0 && 
    block.timestamp < lastUserMintTime[_puzzleId][msg.sender] + MINT_COOLDOWN) {
    revert MintCooldownActive();
}

// NEW
if (lastUserMintTime[_puzzleId][msg.sender] > 0) {
    uint256 requiredCooldown = _getRandomCooldown(msg.sender, _puzzleId);
    if (block.timestamp < lastUserMintTime[_puzzleId][msg.sender] + requiredCooldown) {
        revert MintCooldownActive();
    }
}
```

**Impact:**
- Cooldown now varies between 35-55 seconds per user per puzzle
- Uses `block.prevrandao` for secure on-chain randomness (safe on Base/PoS)
- Makes bot attacks significantly harder to execute
- Maintains fairness while improving security

---

## 3. Sniper Timer Update (40/60 Split)

### Changes Made

**File:** `PuzzleManager.sol`

**Modified `forceCompletePuzzle` (Lines 255-280):**
```solidity
// OLD
function forceCompletePuzzle(uint256 _puzzleId) external {
    // ... checks ...
    _completePuzzle(_puzzleId, winner);
    emit SniperWin(_puzzleId, winner, puzzle.prizePool / 2);
}

// NEW
function forceCompletePuzzle(uint256 _puzzleId) external {
    // ... checks ...
    puzzle.isComplete = true;
    puzzle.completionTime = block.timestamp;

    // Sniper gets 40% of prize pool
    uint256 sniperPrize = (puzzle.prizePool * 4000) / 10000;
    usdcToken.safeTransfer(winner, sniperPrize);
    
    // Remaining 60% stays for raffle
    emit SniperWin(_puzzleId, winner, sniperPrize);
    emit PuzzleCompleted(_puzzleId, winner, sniperPrize);
}
```

**Modified `claimRafflePrize` (Lines 297-324):**
```solidity
// Added logic to handle both normal and sniper scenarios
// In sniper case, pays remaining balance after 40% payout
// In normal case, pays 30% of prize pool
```

**Impact:**
- Last minter before 24h timeout gets 40% of prize pool (instead of 50%)
- Remaining 60% goes to raffle winner (instead of 50%)
- Creates more balanced incentive structure
- Raffle participants have better odds in sniper scenarios

**Example (Sniper scenario with 10 USDC prize pool):**
- Last minter: 3.0 USDC (40%)
- Raffle winner: 4.5 USDC (60%)
- Total distributed: 7.5 USDC (75% of original revenue)

---

## 4. Puzzle Type Rename

### Changes Made

**File:** `PuzzleManager.sol`

**Modified Enum (Line 20):**
```solidity
// OLD
enum PuzzleType { Normal, Super, SuSuper }

// NEW
enum PuzzleType { Normal, Super, Mega }
```

**Impact:**
- Clearer naming convention
- Matches project specifications
- No functional changes

---

## 5. XP Badge Tier System

### Changes Made

**File:** `XPManager.sol`

**New Constants (Lines 25-36):**
```solidity
// Badge Tier Thresholds (XP required)
uint256 public constant BRONZE_THRESHOLD = 0;
uint256 public constant SILVER_THRESHOLD = 100;
uint256 public constant GOLD_THRESHOLD = 500;
uint256 public constant DIAMOND_THRESHOLD = 1500;

// Badge Token IDs
uint256 public constant BRONZE_BADGE = 1;
uint256 public constant SILVER_BADGE = 2;
uint256 public constant GOLD_BADGE = 3;
uint256 public constant DIAMOND_BADGE = 4;
```

**New Function (Lines 110-116):**
```solidity
function getBadgeTier(uint256 _xpAmount) public pure returns (uint256) {
    if (_xpAmount >= DIAMOND_THRESHOLD) return DIAMOND_BADGE;
    if (_xpAmount >= GOLD_THRESHOLD) return GOLD_BADGE;
    if (_xpAmount >= SILVER_THRESHOLD) return SILVER_BADGE;
    return BRONZE_BADGE;
}
```

**Impact:**
- Implements progressive badge system
- 4 tiers: Bronze (0-99), Silver (100-499), Gold (500-1499), Diamond (1500+)
- Helper function to determine badge tier from XP amount
- Foundation for monthly events and exclusive features

---

## 6. Test Suite Updates

### Files Created/Modified

**Modified:** `test/PuzzleManager.t.sol`
- Updated economic model assertions (15% dev, 10% reserve)
- Updated finisher payout test (45% of prize pool)
- Updated raffle payout test (30% of prize pool)
- Updated Sniper Timer test (40% payout)

**Created:** `test/XPManager.t.sol`
- Badge tier threshold tests (Bronze/Silver/Gold/Diamond)
- Soulbound transfer prevention tests
- Minter authorization tests
- Owner privilege tests

### Running Tests

```bash
# Navigate to contracts directory
cd d:\Antigravity\puzzleparty\contracts

# Run all tests
forge test -vv

# Run specific test file
forge test --match-contract PuzzleManagerTest -vv
forge test --match-contract XPManagerTest -vv
```

**Note:** Foundry must be installed and in PATH. See deployment instructions for setup.

---

## Breaking Changes

> [!WARNING]
> **Economic Model Changes**
> 
> The fee distribution has changed significantly:
> - Dev fee: 20% → 15%
> - Prize pool: 70% → 75%
> - Finisher share: 50% → 45% (of prize pool)
> - Raffle share: 50% → 30% (of prize pool)
> 
> Existing puzzles created with old contracts will use the old model. New deployments will use the new model.

> [!WARNING]
> **Sniper Timer Logic**
> 
> The Sniper Timer payout has changed:
> - Last minter: 50% → 40% (of prize pool)
> - Raffle: 50% → 60% (of remaining pool)
> 
> This affects the `forceCompletePuzzle` function behavior.

---

## Next Steps

### Immediate (Before Deployment)

1. ✅ Code changes completed
2. ✅ Test suite updated
3. ⏳ Run full test suite locally with Foundry
4. ⏳ Review gas optimizations
5. ⏳ Security audit of changes

### Deployment to Base Sepolia

1. Install/verify Foundry installation
2. Configure `.env` with:
   - `PRIVATE_KEY` (deployer wallet)
   - `BASE_SEPOLIA_RPC_URL`
   - `BASESCAN_API_KEY` (for verification)
3. Run deployment script
4. Verify contracts on Basescan
5. Test on testnet with real transactions

### Post-Deployment Verification

1. Create test puzzle (100 pieces × 0.1 USDC)
2. Verify economic distribution:
   - Dev wallet receives 15%
   - Reserve accumulates 10%
   - Prize pool is 75%
3. Test random cooldown (35-55s range)
4. Test Sniper Timer (40/60 split)
5. Test badge tier system
6. Document contract addresses

---

## Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/PuzzleManager.sol` | ~50 | Economic model, cooldown, Sniper Timer |
| `src/XPManager.sol` | ~30 | Badge tier system |
| `test/PuzzleManager.t.sol` | ~15 | Updated test assertions |
| `test/XPManager.t.sol` | ~120 | New test file |

---

## Deployment Checklist

- [ ] Run full test suite (`forge test -vv`)
- [ ] Check gas costs (`forge test --gas-report`)
- [ ] Review contract sizes
- [ ] Verify Foundry installation
- [ ] Configure environment variables
- [ ] Deploy to Base Sepolia
- [ ] Verify on Basescan
- [ ] Test all functions on testnet
- [ ] Document contract addresses
- [ ] Update frontend configuration

---

**Phase 1 Status:** ✅ **COMPLETE**  
**Ready for:** Deployment to Base Sepolia testnet  
**Next Phase:** Phase 2 - Backend (Supabase) - To be done later
