const DB = require('mongoose');
const { v4 : uuid } = require("uuid");
const PlaylistSchema = new DB.Schema({
    id : { type : String,default : uuid()},
    isLovedPlaylist : { type : Boolean, default : 0},
    ownerAddress : String,
    playlistName : String,
    isPublic : { type : Boolean, default : false},
    posterUrl : String,
    createdAt : { type : String, default : new Date(Date.now() + 7*60*60*1000)},
    songs : [
    ],
    totalSongs : { type : Number, default : 0},
    listened : { type : Number, default : 0},
    loved : { type : Number, default : 0},
    tags : ['playlist']
})
const PlaylistModel = DB.model('Playlist',PlaylistSchema);
module.exports = {
    PlaylistModel
}