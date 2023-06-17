const { UserModel } = require("../models/users.model");
const { AlbumModel } = require("../models/album.model");
const { PlaylistModel } = require("../models/playlist.model");

const getUserByAddress = async (address = '', getAddress = '')=>{
    const permit = address.toLowerCase() === getAddress.toLowerCase();
    return new Promise((resolve, reject)=>{
        UserModel.findOne({ publicAddress : getAddress })
        .then((user)=>{
            // if this is owner account
            if (permit){
                return resolve({
                    name : user.display_name,
                    publicAddress : user.publicAddress,
                    verify : user.isVerify,
                    profileType : user.profileType,
                    createdAt : user.created_at,
                    avt : user.avatar_url,
                    bg : user.background_url,
                    sex : user.sex.display,
                    library : user.library,
                    follower : user.follower,
                    following : user.following
                })
            }
        })
        .catch((error)=>{
            return reject(error);
        })
    })
}

const getAlbumByAddress = async (address = '', getAddress = '')=>{
    const owner = address.toLowerCase() === getAddress.toLowerCase();
    const filter = owner 
    ? { ownerAddress : getAddress } 
    : { ownerAddress : getAddress, isPublish : true }
    return new Promise((resolve, reject)=>{
        AlbumModel.find(filter)
        .then( async (albums)=>{
            resolve(albums);
        })
        .catch((error)=>{
            return reject(error);
        })
    })
}

const getPlaylistByAddress = async (address = '', getAddress = '')=>{
    const owner = address.toLowerCase() === getAddress.toLowerCase();
    const filter = owner 
    ? { ownerAddress : getAddress } 
    : { ownerAddress : getAddress, isPublic : true }
    return new Promise((resolve, reject)=>{
        PlaylistModel.find(filter)
        .then( async (playlists)=>{
            resolve(playlists);
        })
        .catch((error)=>{
            return reject(error);
        })
    })
}

const getLovedPlaylistByAddress = async (address = '', getAddress = '')=>{
    const owner = address.toLowerCase() === getAddress.toLowerCase();
    if (!owner) return false;
    return new Promise((resolve, reject)=>{
        PlaylistModel.findOne({ ownerAddress : getAddress, isLovedPlaylist : true })
        .then( async (playlist)=>{
            return resolve(playlist);
        })
        .catch((error)=>{
            return reject(error);
        })
    })
}

module.exports = {
    getUserByAddress,
    getAlbumByAddress,
    getPlaylistByAddress,
    getLovedPlaylistByAddress
}