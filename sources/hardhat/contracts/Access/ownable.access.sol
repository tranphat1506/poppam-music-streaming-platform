// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Utils/context.utils.sol";

abstract contract Ownable is Context{
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipRenounced(address indexed owner, string indexed reason);

    constructor (){
        _transferOwnership(_msgSender());
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    
    function renounceOwnership(string memory _reason) public virtual onlyOwner {
        address oldOwner = _owner;
        _transferOwnership(address(0));
        emit OwnershipRenounced(oldOwner, _reason);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    modifier onlyOwner {
        _checkOwner();
        _;
    }
}