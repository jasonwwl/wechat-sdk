var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    app_id: {type: String},
    access: {type: String},
    expire: {type: Number},
    created_at: {type: Date}
});

mongoose.model('WxAccessTokenCache', schema);
module.exports = mongoose.model('WxAccessTokenCache');