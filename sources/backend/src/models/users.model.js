const User = require('mongoose');
const UserSchema = new User.Schema({
    publicAddress : String,
    nonce : String,
    created_at : { type : String, default : new Date(Date.now() + 7*60*60*1000)},
    display_name : {type : String, default : 'Chưa cập nhật'},
    isVerify : {type : Boolean, default : false},
    profileType : {type : String, default : 'profile'},
    birth : {
        day : Number,
        month : Number,
        year : Number
    },
    sex : {
        display : {type : String, default: 'Chưa cập nhật'},
        info : Number
    },
    avatar_url : { type : String , default : 'https://cdn141.picsart.com/357697367045201.jpg'},
    background_url : { type : String , default : 'https://cdn141.picsart.com/357697367045201.jpg'},
    library : [
        { 
            dateAdded : String,
            type : String, // album || playlist || artist
            id : String // unique id to find playlist
        }
    ],
    follower : {
        count : { type : Number, default : 0},
        list : []
    },
    following : {
        count : { type : Number, default : 0},
        list : []
    },
})
const UserModel = User.model('Users',UserSchema);
module.exports = {
    UserModel
}