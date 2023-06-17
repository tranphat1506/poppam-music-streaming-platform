const whitelist = ['http://127.0.0.1:5501', 'http://127.0.0.1:5502', 'http://localhost:5501', 'http://localhost:3000', 'http://localhost', 'https://popam-web3.onrender.com']
const normalCorsOptions = {
    origin : (origin, callback) =>{
                                                /* Here mean localhost == undefinded */
        if (whitelist.indexOf(origin)!== -1 || !origin){
            callback(null, true)
        } else{
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials : true,
    optionsSuccessStatus : 200,
    allowedHeaders : ['Content-Type', 'Authorization']
}
module.exports = {
    normalCorsOptions
}