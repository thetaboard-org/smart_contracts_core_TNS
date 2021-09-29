// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

pragma experimental ABIEncoderV2;

import "./ENSRegistry.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ABIResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/AddrResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ContentHashResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/DNSResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/InterfaceResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/NameResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/PubkeyResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/TextResolver.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node to set its
 * address.
 */
contract PublicResolver is ABIResolver, AddrResolver, ContentHashResolver, DNSResolver, InterfaceResolver, NameResolver, PubkeyResolver, TextResolver {
    ENS ens;
    /**
     * A mapping of operators. An address that is authorised for an address
     * may make any changes to the name that the owner could, but may not update
     * the set of authorisations.
     * (owner, operator) => approved
     */
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Logged when an operator is added or removed.
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor(ENS _ens){
        ens = _ens;
    }

    /**
     * @dev See {IERC1155-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) external{
        require(
            msg.sender != operator,
            "ERC1155: setting approval status for self"
        );

        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isAuthorised(bytes32 node) internal override view returns(bool) {
        address owner = ens.owner(node);
        return owner == msg.sender || isApprovedForAll(owner, msg.sender);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator) public view returns (bool){
        return _operatorApprovals[account][operator];
    }

    function multicall(bytes[] calldata data) external returns(bytes[] memory results) {
        results = new bytes[](data.length);
        for(uint i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success);
            results[i] = result;
        }
        return results;
    }

    function supportsInterface(bytes4 interfaceID) virtual override(ABIResolver, AddrResolver, ContentHashResolver, DNSResolver, InterfaceResolver, NameResolver, PubkeyResolver, TextResolver) public pure returns(bool) {
        return super.supportsInterface(interfaceID);
    }
}