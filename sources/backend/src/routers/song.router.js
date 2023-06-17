const express = require('express')
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage()
const upload = multer({storage : storage})
const songController = require("../controllers/song.controller");
// get song info by unique id


router.post("/create", upload.fields([
    { name : 'audio', maxCount: 1},
    { name : 'poster', maxCount: 1},
    { name : 'cover_image', maxCount: 1}
]), songController.createSong);

router.get("/:songUri", songController.getSongByUri);

router.post("/verify", songController.verifySongInContract)

module.exports = router