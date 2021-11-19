// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

abstract contract NameResolver {
    function setName(bytes32 node, string memory name) public virtual;
}