var mongoose = require('mongoose');
var Schema = mongoose.Schema;
if (!mongoose.models['WeChatAccessTokenCache']) {
    var schema = new Schema({
        app_id: {type: String},
        access: {type: String},
        expire: {type: Number},
        created_at: {type: Date}
    });
    mongoose.model('WeChatAccessTokenCache', schema);
}
module.exports = mongoose.model('WeChatAccessTokenCache');