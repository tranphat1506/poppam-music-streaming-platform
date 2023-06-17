// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Muzik3 is Ownable, ERC721URIStorage{
    bool private locked;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _totalAlbums;
    Counters.Counter private _totalSongs;
    
    uint256 feePercentage = 0; // 20% fee
    constructor() ERC721("Muzik3", "MUZ") {
    }

    struct MuzSong{
        uint256 id;
        address payable artist;
        string metaUrl;
        uint256 price;
        uint albumId;
        bool publish;
        bool exist;
    }
    struct MuzAlbum{
        uint256 id;
        address payable artist;
        string metaUrl;
        bool exist;
        bool publish;
        uint256 totalSongs;
    }
    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://";
    }
    
    mapping (string => uint256) private _albumIdByUrl;
    mapping (string => uint256) private _songIdByUrl;

    mapping (uint256 => MuzAlbum) private _albumById;
    mapping (uint256 => MuzSong) private _songById;

    mapping (uint256 => uint256) private _songIdByTokenId;
    mapping (uint256 => uint256) private _albumIdByTokenId;

    mapping (uint256 => mapping(uint256 => bool)) private _albumIdToAlbumStorage;

    function getUrlBySongId(uint256 songId) public view returns(string memory)
    {
        MuzSong memory song = _songById[songId];
        require(song.exist , "The song is not exist!");
        require(song.publish || msg.sender == song.artist, "The song is not exist or not published");
        return song.metaUrl;
    }

    function getUrlByAlbumId(uint256 albumId) public  view returns(string memory)
    {
        MuzAlbum memory album = _albumById[albumId];
        require(album.exist , "The album is not exist!");
        require(album.publish || msg.sender == album.artist, "The album is not published!");
        return album.metaUrl;
    }


    function createAlbum(address payable artistAddress, string memory uri, bool publish) public payable returns(uint256) {
        uint256 _fee = 1 * 1000000000000000000 * feePercentage / 100;
        require(msg.value == _fee, "You don't send enough the fee to create album");
        _totalAlbums.increment();
        _tokenIds.increment();
        uint256 _albumId = _totalAlbums.current();
        uint256 _tokenId = _tokenIds.current();
        _safeMint(artistAddress, _tokenId);
        _setTokenURI(_tokenId, uri);
        MuzAlbum memory _album = MuzAlbum({
            id : _albumId,
            artist : artistAddress,
            metaUrl : uri,
            exist : true,
            publish : publish,
            totalSongs : 0
        });

        _albumIdByUrl[uri] = _albumId;
        _albumById[_albumId] = _album;
        _albumIdByTokenId[_tokenId] = _albumId;

        return _tokenId;
    }

    function createSong(address payable artistAddress, string memory uri, bool _publish) public payable returns(uint256)
    {
        uint256 _fee = 1 * 1000000000000000000 * feePercentage / 100;
        require(msg.value == _fee, "You don't send enough the fee to create song");
        _totalSongs.increment();
        _tokenIds.increment();
        uint256 _songId = _totalSongs.current();
        uint256 _tokenId = _tokenIds.current();
        _safeMint(artistAddress, _tokenId);
        _setTokenURI(_tokenId, uri);
        MuzSong memory _song = MuzSong({
            id : _songId,
            artist : artistAddress,
            metaUrl : uri,
            exist : true,
            publish : _publish,
            price : 0,
            albumId : 0
        });

        _songIdByUrl[uri] = _songId;
        _songById[_songId] = _song;
        _songIdByTokenId[_tokenId] = _songId;

        return _tokenId;
    }

    function addSongToAlbumById(uint256 _songId, uint256 _albumId) public payable  {
        MuzSong storage _song = _songById[_songId];
        MuzAlbum storage _album = _albumById[_albumId];
        require(_song.exist && _album.exist, "Not exist !");
        require(_song.artist == msg.sender && _album.artist == msg.sender, "You do not the owner of this MUZs");
        require(!_albumIdToAlbumStorage[_albumId][_songId] && _song.albumId == 0, "This song already in another album!");
    
        _song.albumId = _albumId;
        _albumIdToAlbumStorage[_albumId][_songId] = true;
        _album.totalSongs++;
    }

    function _getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner nonReentrant{
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw; contract balance empty");
        
        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function getTotalTokenId() public view returns(uint256){
        return _tokenIds.current();
    }

    function getTotalSongId() public view returns(uint256){
        return _totalSongs.current();
    }

    function getTotalAlbumId() public view returns(uint256){
        return _totalAlbums.current();
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    modifier nonReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}
