"use strict";
var crypto = require('crypto');

/**
 * 验证微信来的签名是否正确
 * @param sign
 * @param timestamp
 * @param nonce
 * @param wxToken
 * @returns {boolean}
 */
module.exports.checkSignature = function (sign, timestamp, nonce, wxToken) {
    var tmpStr = [wxToken, timestamp, nonce].sort().join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(tmpStr);
    return (sha1.digest('hex') === sign);
};

/**
 * 构建被动发送文本消息
 * @param text 消息内容
 * @param from 来自谁(自己公众账号id)
 * @param to 发给谁(用户openid)
 * @returns {string}
 */
module.exports.textMessage = function (text, from, to) {
    return '<xml>'
        + '<ToUserName><![CDATA[' + to + ']]></ToUserName>'
        + '<FromUserName><![CDATA[' + from + ']]></FromUserName>'
        + '<CreateTime>' + Math.floor(Date.now() / 1000) + '</CreateTime>'
        + '<MsgType><![CDATA[' + 'text' + ']]></MsgType>'
        + '<Content><![CDATA[' + text + ']]></Content>'
        + '</xml>'
};