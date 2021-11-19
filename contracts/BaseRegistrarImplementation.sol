// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/ENS.sol";
import "./abstract_contracts/BaseRegistrar.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BaseRegistrarImplementation is BaseRegistrar, ERC721 {
    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant private ERC721_ID = bytes4(
        keccak256("balanceOf(address)") ^
        keccak256("ownerOf(uint256)") ^
        keccak256("approve(address,uint256)") ^
        keccak256("getApproved(uint256)") ^
        keccak256("setApprovalForAll(address,bool)") ^
        keccak256("isApprovedForAll(address,address)") ^
        keccak256("transferFrom(address,address,uint256)") ^
        keccak256("safeTransferFrom(address,address,uint256)") ^
        keccak256("safeTransferFrom(address,address,uint256,bytes)")
    );
    bytes4 constant private RECLAIM_ID = bytes4(keccak256("reclaim(uint256,address)"));

    constructor(ENS _ens, bytes32 _baseNode) ERC721("ThetaboardRegistrar", "TBR")  {
        ens = _ens;
        baseNode = _baseNode;
    }

    modifier live {
        require(ens.owner(baseNode) == address(this));
        _;
    }

    modifier onlyController {
        require(controllers[msg.sender]);
        _;
    }

    // Authorises a controller, who can register and renew domains.
    function addController(address controller) external override  {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    // Revoke controller permission for an address.
    function removeController(address controller) external override onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    // Set the resolver for the TLD this registrar manages.
    function setResolver(address resolver) external override onlyOwner {
        ens.setResolver(baseNode, resolver);
    }

     // Returns true iff the specified name is available for registration.
    function available(uint256 id) public view override returns(bool) {
        // Not available if it's registered here or in its grace period.
        return !_exists(id);
    }

    /**
     * @dev Register a name.
     * @param id The token ID (keccak256 of the label).
     * @param owner The address that should own the registration.
     */
    function register(uint256 id, address owner) external override {
        _register(id, owner, true);
    }

    /**
     * @dev Register a name, without modifying the registry.
     * @param id The token ID (keccak256 of the label).
     * @param owner The address that should own the registration.
     */
    function registerOnly(uint256 id, address owner) external {
      _register(id, owner, false);
    }

    function _register(uint256 id, address owner, bool updateRegistry) internal live onlyController {
        require(_exists(id) == false, "BaseRegistrarImplementation: _register, this ID already exist");

        _mint(owner, id);

        if(updateRegistry) {
            ens.setSubnodeOwner(baseNode, bytes32(id), owner);
        }

        emit NameRegistered(id, owner);
    }

    /**
     * @dev Reclaim ownership of a name in ENS, if you own it in the registrar.
     */
    function reclaim(uint256 id, address owner) external override live {
        require(_isApprovedOrOwner(msg.sender, id));
        ens.setSubnodeOwner(baseNode, bytes32(id), owner);
    }

    function supportsInterface(bytes4 interfaceId) public pure override(ERC721, IERC165) returns (bool) {
        return interfaceId == INTERFACE_META_ID ||
            interfaceId == ERC721_ID ||
            interfaceId == RECLAIM_ID;
    }
}