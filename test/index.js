require('./db');

var wx = require('../');
var client = new wx.client('wx40c5ec74b11feb4d', '197fd4fc2f4920501683c79401ff331d');

//client.getUserInfo('oWzuDjmOTy6LJjKZN7hzqWnW_fZI', function (err, data) {
//    console.log('err', err);
//    console.log('data', data);
//});

client.sendMsg('oWzuDjmOTy6LJjKZN7hzqWnW_fZI', client.sendText('测试主动发送消息'), function (err, msg) {
    console.log('err', err);
    console.log('data', msg);
});