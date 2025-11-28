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

    function setURI(string calldata _uri) external onlyOwner {
        _setURI(_uri);
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
        _mintBatch(_to, _ids, _amounts, _data);
    }

    /* =====================================================================================
                                        OVERRIDES
       ===================================================================================== */

    function uri(uint256 id) public view override returns (string memory) {
        // Implement logic to return specific URI per ID if needed, or default to base URI
        return super.uri(id);
    }

    /// @dev Hook that is called before any token transfer.
    /// @dev Reverts if it's a transfer (not mint or burn).
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        // Allow mints (from == 0) and burns (to == 0)
        // Disallow transfers between users
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }
    }
}
