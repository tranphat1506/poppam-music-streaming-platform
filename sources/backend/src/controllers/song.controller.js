const { v4: uuid } = require("uuid")
const audioService = require('../services/audio.service')
const { getPayload } = require("../helpers/jwt.helper")

const createSong = async (req, res) => {
    const { session_token } = req.cookies;
    if (!session_token) return res.status(401).json({
        code: 400,
        message: "Unauthorized"
    })
    const ownerAddress = getPayload(session_token).publicAddress;
    const { name, description, publish } = req.body;
    const { files } = req;
    if (!files || !name || !description) {
        audioService.removeTempFile(files.audio[0]);
        audioService.removeTempFile(files.poster[0]);
        audioService.removeTempFile(files["cover_image"][0]);
        return res.status(404).json({
            code: 404,
            message: "Please fill the form!"
        })
    }
    const uniqueId = uuid();
    console.log(uniqueId);
    try {
        // upload poster first
        const uploadCover = await audioService.uploadFileToIpfs(files["cover_image"][0], `cover#${uniqueId}`);
        const { error: errorCover, IpfsHash : cidCover } = await uploadCover.json();
        if (errorCover) {
            console.log(errorCover);
            throw Error("Fetch pinata fail");
        }
        // upload poster first
        const uploadPoster = await audioService.uploadFileToIpfs(files.poster[0], `poster#${uniqueId}`);
        const { error: errorPoster, IpfsHash : cidPoster } = await uploadPoster.json();
        if (errorPoster) {
            console.log(errorPoster);
            throw Error("Fetch pinata fail");
        }
        // upload audio file
        const uploadAudio = await audioService.uploadFileToIpfs(files.audio[0], `audio#${uniqueId}`);
        const { error: errorAudio, IpfsHash : cidAudio , isDuplicate} = await uploadAudio.json();
        if (errorAudio)
            throw Error("Fetch pinata fail");
        if (isDuplicate) {
            // prevent existed audio from clone audio
            // but the image file is still create
            return res.status(406).json({
                code: 406,
                message: "Your audio file is already exist! Please 'Contact Help Center' for help."
            })
        }
        const metadata = JSON.stringify({
            pinataOptions: {
                cidVersion: 0
            },
            pinataMetadata: {
                name: `metadata#${uniqueId}`
            },
            pinataContent: {
                name: name || 'test',
                description: description || 'test description',
                image: `ipfs://${cidPoster}`,
                audio: `ipfs://${cidAudio}`,
                cover_image: `ipfs://${cidCover}`
            }
        })
        const r = await audioService.uploadJsonToIpfs(metadata);
        const json = await r.json();
        const cid = await json.IpfsHash;
        await audioService.saveTempMusicToData(ownerAddress, {
            name: name,
            id: uniqueId,
            description: description,
            publish: publish,
            posterUri: cidPoster,
            coverUri: cidCover,
            audioUri: cidAudio,
            tokenUri : cid
        })
        return res.status(200).json({
            cid: cid,
            publish: publish
        });
    } catch (error) {
        console.log(error);
        audioService.removeTempFile(files.audio[0]);
        audioService.removeTempFile(files.poster[0]);
        audioService.removeTempFile(files["cover_image"][0]);
        return res.status(403).json({
            code: 403,
            message: "Forbidden"
        });
    }
}

const getSongByUri = async (req, res) => {
    const { songUri } = req.params;
    if (!songUri) return res.status(404).json({
        code: 404,
        message: "Cannot find this song!"
    });
    try {
        const song = await audioService.getSongByUri(songUri);
        if (!song || !song.songId) return res.status(404).json({
            code: 404,
            message: "Could not find this song! Or your song not verify in contract yet!"
        });
        return res.status(200).json({
            code: 200,
            message: "Found the song!",
            data: song
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: "Server is busy!"
        })
    }
}

const verifySongInContract = async (req, res) =>{
    const { session_token } = req.cookies;
    const { tokenUri, songId } = req.body;
    if (!session_token || !tokenUri || !songId) return res.status(401).json({
        code : 401,
        message : "Unauthorized!"
    })
    try {
        const ownerAddress = getPayload(session_token).publicAddress;
        await audioService.verifySongInContract(ownerAddress, {
            tokenUri,
            songId
        })
        return res.status(200).json({
            code : 200,
            message : `Verify song token ${songId}. Now everyone can listen or can buy it.`
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code : 500,
            message : "Server is busy!"
        })
    }
}

module.exports = {
    createSong,
    getSongByUri,
    verifySongInContract
}