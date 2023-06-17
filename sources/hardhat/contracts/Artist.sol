// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Access/ownable.access.sol";
contract Artist is Ownable{
    string public version = '0.1.0';
    // init vars
    string internal artistName;

    constructor (string memory _initName){
        _renameArtist(_initName);
    }

    event RenameArtist(string indexed oldName, string indexed newName, address indexed byAddress);

    function renameArtist(string memory _newName) public virtual onlyOwner{
        // logic check _newName is empty
        _renameArtist(_newName);
    }
    function _renameArtist(string memory _newName) internal virtual{
        string memory oldName = _artistName();
        artistName = _newName;
        emit RenameArtist(oldName, _newName, _msgSender());
    }

    function _artistName() public view virtual returns(string memory){
        return artistName;
    }


}
