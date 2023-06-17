const { UserModel } = require("../models/users.model");
const { AlbumModel, SongModel } = require("../models/album.model");

const { Readable } = require("stream");
const FormData = require("form-data");
const fetch = require("node-fetch");
const PINATA_URL = process.env.PINATA_URL;
const PINATA_JWT = process.env.PINATA_JWT;

const removeTempFile = (file)=>{
    file.buffer = null;
}
const uploadFileToIpfs = async (file, filename)=>{
    const formData = new FormData();
    const stream = Readable.from(file.buffer)
    formData.append('file', stream, {
        filepath : filename
    });
    formData.append('pinataMetadata', JSON.stringify({
        name: filename,
    }));
    formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
    }));
    return fetch(PINATA_URL + "/pinning/pinFileToIPFS",{
        method : "POST",
        headers : {
            "Authorization" : `Bearer ${PINATA_JWT}`,
            "Content-Type" : `multipart/form-data; boundary=${formData._boundary}`
        },
        body : formData
    })
}

const uploadJsonToIpfs = (json)=>{
    return fetch( PINATA_URL + "/pinning/pinJSONToIPFS", {
        method : "POST",
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${PINATA_JWT}`
        },
        body : json
    })
}

const saveTempMusicToData = (address, { name, id, description, publish, posterUri, coverUri, audioUri, tokenUri })=>{
    const muzAudio = new SongModel({
        ownerAddress : address,
        id : id,
        songName : name,
        isPublish : publish,
        publishAt : publish ? new Date(Date.now() + 7*60*60*1000).toISOString() : 0,
        description : description,
        posterUrl : posterUri,
        audioUrl : audioUri,
        tokenUri : tokenUri,
        coverUrl: coverUri
    }) 
    muzAudio.artists.push({
        artistAddress : address
    })
    return muzAudio.save();
}

const getSongByUri = async (uri) =>{
    if (!uri) return false;
    return new Promise((resolve, reject)=>{
        SongModel.findOne({ tokenUri : uri })
        .then((song)=>{
            return resolve(song);
        })
        .catch((error)=>{
            console.log(error);
            return reject(error);
        })
    })
}

const verifySongInContract = (ownerAddress, { tokenUri, songId })=>{
    return new Promise((resolve, reject)=>{
        SongModel.findOne({ ownerAddress, tokenUri})
        .then(song=>{
            if (!song)  return reject("Not found!");
            if (song.ownerAddress != ownerAddress) return reject("Not the owner!")
            song.songId = songId;
            song.save()
            .then(()=>{
                return resolve(song);
            })
        })
        .catch(error=>{
            return reject(error);
        })
    })
}

module.exports = {
    removeTempFile,
    uploadFileToIpfs,
    uploadJsonToIpfs,
    getSongByUri,
    saveTempMusicToData,
    verifySongInContract
}