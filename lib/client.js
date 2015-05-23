var request = require('request');
var EventProxy = require('eventproxy');
var Models = require('./TokenCacheModel');
var moment = require('moment');
/**
 * 实现微信服务端api
 * @param appid
 * @param secret
 * @constructor
 */
function Client(appid, secret) {
    this.appid = appid;
    this.secret = secret;
}

/**
 * 获得微信的accessToken
 * @param cb
 */
Client.prototype.getAccessToken = function (cb) {
    var appid = this.appid;
    var secret = this.secret;
    var url = 'https://api.weixin.qq.com/cgi-bin/token';
    var ep = new EventProxy;
    ep.fail(function (msg) {
        cb(msg);
    });
    Models.findOne({app_id: appid}, ep.done('tokenCache'));
    //当在cache中查找以往的accessToken记录成功后
    ep.on('tokenCache', function (data) {
        if (!data) {
            return ep.emit('getFormApi');
        }
        var diffExpireTime = moment().diff(data.created_at, 'seconds');
        if (diffExpireTime > data.expire - 10) {
            return ep.emit('getFormApi');
        }
        return cb(null, data.access);
    });
    //当cache中没有或已过期token
    ep.on('getFormApi', function () {
        apiGET(url, 'GET', {
            grant_type: 'client_credential',
            appid: appid,
            secret: secret
        }, ep.done('getToken'));
    });
    //当api成功拿到token后走这里
    ep.on('getToken', function (tokenData) {
        //更新或新增token缓存，这里不管他是不是成功保存，都直接把token丢回cb中
        Models.findOneAndUpdate({app_id: appid}, {
            access: tokenData['access_token'],
            expire: tokenData['expires_in'],
            created_at: new Date()
        }, {upsert: true, new: true}, function (err, data) {
            console.log('缓存err', err);
            console.log('缓存data', data);
        });
        return cb(null, tokenData.access_token);
    });
};

Client.prototype.getUserInfo = function (openId, cb) {
    var url = 'https://api.weixin.qq.com/cgi-bin/user/info';
    var ep = new EventProxy();
    this.getAccessToken(ep.done('accessToken'));
    ep.on('accessToken', function (token) {
        apiGET(url, 'GET', {
            access_token: token,
            openid: openId
        }, ep.done('userInfo'));
    });
    ep.on('userInfo', function (userData) {
        cb(null, userData);
    });
    ep.fail(function (err) {
        cb(err);
    });
};
Client.MESSAGE_TYPE = {
    TEXT: 'text',
    IMAGE: 'image',
    VOICE: 'voice',
    VIDEO: 'video',
    MUSIC: 'music',
    NEWS: 'news'
};
/**
 * 发送消息
 * @param openId
 * @param data
 * @param cb
 */
Client.prototype.sendMsg = function (openId, data, cb) {
    var url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=';
    this.getAccessToken(function (err, token) {
        if (err) return cb(err);
        url = url + token;
        data.touser = openId;
        apiGET(url, 'POST', data, cb);
    })
};
/**
 * 组织待发送的文本消息
 * @param content
 * @returns {{msgtype: string, text: {content: *}}}
 */
Client.prototype.sendText = function (content) {
    return {
        msgtype: 'text',
        text: {content: content}
    };
};

/**
 * 发起一个请求
 * @param url
 * @param method
 * @param data
 * @param cb
 */
function apiGET(url, method, data, cb) {
    var ep = new EventProxy;
    ep.fail(cb);
    var options = {
        method: method,
        uri: url,
        json: true
    };
    if ('GET' === method) {
        options.qs = data;
    } else if ('POST' === method) {
        options.body = data;
    }
    request(options, ep.done('request'));
    ep.on('request', function (requestData) {
        var body = requestData.body;
        if (body && body['errcode'] && body['errcode'] !== 0) {
            return ep.emit('error', '[' + body['errcode'] + ']' + body['errmsg']);
        }
        cb(null, body);
    });
}

/**
 *
 * @returns {Client}
 * @private
 */
function _exports() {
    return Client;
}
/**
 *
 * @type {Client}
 */
module.exports = _exports();