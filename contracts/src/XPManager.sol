// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "solady/src/tokens/ERC1155.sol";
import {Ownable} from "solady/src/auth/Ownable.sol";

/// @title XPManager
/// @notice Manages Soulbound Badges and XP items for Puzzle Party.
/// @dev ERC1155 Soulbound implementation.
contract XPManager is ERC1155, Ownable {
    
    /* =====================================================================================
                                            STATE
       ===================================================================================== */

    /// @notice Name of the collection
    string public name = "Puzzle Party Badges";
    
    /// @notice Symbol of the collection
    string public symbol = "PPXP";

    /// @notice Base URI for metadata
    string internal _baseURI;

    /// @notice Badge Tier Thresholds (XP required)
    uint256 public constant BRONZE_THRESHOLD = 0;
    uint256 public constant SILVER_THRESHOLD = 100;
    uint256 public constant GOLD_THRESHOLD = 500;
    uint256 public constant DIAMOND_THRESHOLD = 1500;

    /// @notice Badge Token IDs
    uint256 public constant BRONZE_BADGE = 1;
    uint256 public constant SILVER_BADGE = 2;
    uint256 public constant GOLD_BADGE = 3;
    uint256 public constant DIAMOND_BADGE = 4;

    /// @notice Authorized minters (e.g. backend wallet)
    mapping(address => bool) public minters;

    /* =====================================================================================
                                            EVENTS
       ===================================================================================== */

    event MinterStatusUpdated(address indexed minter, bool status);

    /* =====================================================================================
                                            ERRORS
       ===================================================================================== */

    error Soulbound();
    error NotAuthorized();

    /* =====================================================================================
                                        CONSTRUCTOR
       ===================================================================================== */

    constructor() {
        _initializeOwner(msg.sender);
    }

    /* =====================================================================================
                                        ADMIN FUNCTIONS
       ===================================================================================== */

    function setMinter(address _minter, bool _status) external onlyOwner {
        minters[_minter] = _status;
        emit MinterStatusUpdated(_minter, _status);
    }

    function setURI(string calldata newURI) external onlyOwner {
        _baseURI = newURI;
        emit URI(newURI, 0); // 0 indicates default for all
    }

    /* =====================================================================================
                                        MINTER FUNCTIONS
       ===================================================================================== */

    function mint(address _to, uint256 _id, uint256 _amount, bytes calldata _data) external {
        if (!minters[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _mint(_to, _id, _amount, _data);
    }

    function mintBatch(address _to, uint256[] calldata _ids, uint256[] calldata _amounts, bytes calldata _data) external {
        if (!minters[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _batchMint(_to, _ids, _amounts, _data);
    }

    /* =====================================================================================
                                        OVERRIDES
       ===================================================================================== */

    function uri(uint256) public view override returns (string memory) {
        return _baseURI;
    }

    /// @dev Hook that is called before any token transfer.
    /// @dev Reverts if it's a transfer (not mint or burn).
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, ids, amounts, data);

        // Allow mints (from == 0) and burns (to == 0)
        // Disallow transfers between users
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }
    }

    /* =====================================================================================
                                         HELPER FUNCTIONS
       ===================================================================================== */

    /// @notice Returns the badge tier for a given XP amount
    /// @param _xpAmount The total XP amount
    /// @return The badge token ID (1=Bronze, 2=Silver, 3=Gold, 4=Diamond)
    function getBadgeTier(uint256 _xpAmount) public pure returns (uint256) {
        if (_xpAmount >= DIAMOND_THRESHOLD) return DIAMOND_BADGE;
        if (_xpAmount >= GOLD_THRESHOLD) return GOLD_BADGE;
        if (_xpAmount >= SILVER_THRESHOLD) return SILVER_BADGE;
        return BRONZE_BADGE;
    }
}
