const DB = require('mongoose');
const { v4 : uuid } = require("uuid");
const SongSchema = new DB.Schema({
    ownerAddress : String,
    description : String,
    posterUrl : String,
    audioUrl : String,
    coverUrl : String,
    tokenUri : String,
    albumId : { type : Number, default : 0},
    id : { type : String,default : uuid()},
    songName : String,
    isPublish : { type : Boolean, default : false},
    createdAt : { type : String, default : new Date(Date.now() + 7*60*60*1000)},
    publishAt : { type : String, default : '0'},
    songId : { type : Number, default : 0},
    artists : [
        {
            artistName : String,
            artistAddress : String
        }
    ],
    listened : { type : Number, default : 0},
    loved : { type : Number, default : 0},
    tags : ['song']
})
const AlbumSchema = new DB.Schema({
    ownerAddress : String,
    albumContractAddress : String,
    posterUrl : String,
    id : { type : String, default : uuid()},
    albumName : String,
    albumType : Number, // dia don, album
    createdAt : { type : String, default : new Date(Date.now() + 7*60*60*1000)},
    totalSongs : { type : Number, default : 0},
    isPublish : { type : Boolean, default : false},
    songs : [
        SongSchema
    ],
    loved : { type : Number, default : 0},
    tags : ['album']
})
const AlbumModel = DB.model('Album',AlbumSchema);
const SongModel = DB.model('Song',SongSchema);
module.exports = {
    AlbumModel,
    SongModel
}