const express = require("express");
const router = express.Router()

// Endpoints
router.get('/',(req,res)=>{ 
    res.status(200).render("home");
})
router.all('/*',(req,res)=>{
    res.sendStatus(404);
})

module.exports = router;