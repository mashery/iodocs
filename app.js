//
// Copyright (c) 2011 Mashery, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

//
// Module dependencies
//
var express     = require('express'),
    util        = require('util'),
    fs          = require('fs'),
    OAuth       = require('oauth').OAuth,
    OAuth2      = require('oauth/lib/oauth2').OAuth2,
    query       = require('querystring'),
    url         = require('url'),
    http        = require('http'),
    https       = require('https'),
    crypto      = require('crypto'),
    redis       = require('redis'),
    RedisStore  = require('connect-redis')(express);

// Configuration
try {
    var config = require('./config.json');
} catch(e) {
    console.error("File config.json not found or is invalid.  Try: `cp config.json.sample config.json`");
    process.exit(1);
}

//
// Redis connection
//
var defaultDB = '0';
var db;

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    db = require("redis").createClient(rtg.port, rtg.hostname);
    db.auth(rtg.auth.split(":")[1]);
} else {
    db = redis.createClient(config.redis.port, config.redis.host);
    db.auth(config.redis.password);
}

db.on("error", function(err) {
    if (config.debug) {
         console.log("Error " + err);
    }
});

//
// Load API Configs
//

try {
    var apisConfig = require('./public/data/apiconfig.json');
    if (config.debug) {
        console.log(util.inspect(apisConfig));
    }
} catch(e) {
    console.error("File apiconfig.json not found or is invalid.");
    process.exit(1);
}

var app = module.exports = express();

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    config.redis.host = rtg.hostname;
    config.redis.port = rtg.port;
    config.redis.password = rtg.auth.split(":")[1];
}

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.sessionSecret,
        store:  new RedisStore({
            'host':   config.redis.host,
            'port':   config.redis.port,
            'pass':   config.redis.password,
            'maxAge': 1209600000
        })
    }));

    // Global basic authentication on server (applied if configured)
    if (config.basicAuth && config.basicAuth.username && config.basicAuth.password) {
        app.use(express.basicAuth(function(user, pass, callback) {
            var result = (user === config.basicAuth.username && pass === config.basicAuth.password);
            callback(null /* error */, result);
        }));
    }

    app.use(checkPathForAPI);
    app.use(dynamicHelpers);

    // app.use(oauth2);
    
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

//
// Middleware
//
function oauth(req, res, next) {
    console.log('OAuth process started');
    var apiName = req.body.apiName,
        apiConfig = apisConfig[apiName];

    console.log(apiConfig.oauth);
    if (apiConfig.oauth) {
        var apiKey = req.body.apiKey || req.body.key,
            apiSecret = req.body.apiSecret || req.body.secret,
            refererURL = url.parse(req.headers.referer),
            callbackURL = refererURL.protocol + '//' + refererURL.host + '/authSuccess/' + apiName,
            oa = new OAuth(apiConfig.oauth.requestURL,
                           apiConfig.oauth.accessURL,
                           apiKey,
                           apiSecret,
                           apiConfig.oauth.version,
                           callbackURL,
                           apiConfig.oauth.crypt);

        console.log('callbackURL: ' + callbackURL);
        console.log('Method Security:' + req.body.oauth);

        if (config.debug) {
            console.log('OAuth type: ' + apiConfig.oauth.type);
            console.log('Method security: ' + req.body.oauth);
            console.log('Session authed: ' + req.session[apiName]);
            console.log('apiKey: ' + apiKey);
            console.log('apiSecret: ' + apiSecret);
        };

        // Check if the API even uses OAuth, then if the method requires oauth, then if the session is not authed
        if (apiConfig.oauth.type == 'three-legged' && req.body.oauth == 'authrequired' && (!req.session[apiName] || !req.session[apiName].authed) ) {
            if (config.debug) {
                console.log('req.session: ' + util.inspect(req.session));
                console.log('headers: ' + util.inspect(req.headers));

                console.log(util.inspect(oa));
                // console.log(util.inspect(req));
                console.log('sessionID: ' + util.inspect(req.sessionID));
                // console.log(util.inspect(req.sessionStore));
            };

            console.log('11111');
            oa.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results) {
                console.log('22222');
                if (err) {
                    res.send("Error getting OAuth request token : " + util.inspect(err), 500);
                } else {
                    // Unique key using the sessionID and API name to store tokens and secrets
                    var key = req.sessionID + ':' + apiName;

                    db.set(key + ':apiKey', apiKey, redis.print);
                    db.set(key + ':apiSecret', apiSecret, redis.print);

                    console.log(oauthToken);
                    db.set(key + ':requestToken', oauthToken, redis.print);
                    db.set(key + ':requestTokenSecret', oauthTokenSecret, redis.print);

                    // Set expiration to same as session
                    db.expire(key + ':apiKey', 1209600000);
                    db.expire(key + ':apiSecret', 1209600000);
                    db.expire(key + ':requestToken', 1209600000);
                    db.expire(key + ':requestTokenSecret', 1209600000);

                    // res.header('Content-Type', 'application/json');
                    res.send({'signin': apiConfig.oauth.signinURL + oauthToken });
                }
            });
        } else if (apiConfig.oauth.type == 'two-legged' && req.body.oauth == 'authrequired') {
            // Two legged stuff... for now nothing.
            next();
        } else {
            next();
        }
    } else {
        next();
    }

}

function oauth2(req, res, next){
    console.log('OAuth2 process started');
    var apiName = req.body.apiName,
        apiConfig = apisConfig[apiName],
        urlp = url.parse(req.originalUrl, true);

    // console.log('req.originalURL (OAUTH2): ' + req.originalUrl);
    // console.log('urlp: ' + util.inspect(urlp));


    if (apiConfig.oauth2) {
        var apiKey = req.body.apiKey || req.body.key,
            apiSecret = req.body.apiSecret || req.body.secret,
            refererURL = url.parse(req.headers.referer),
            callbackURL = refererURL.protocol + '//' + refererURL.host + '/oauth2Success/' + apiName,
            key = req.sessionID + ':' + apiName,
            oa = new OAuth2(apiKey,
                           apiSecret,
                           apiConfig.oauth2.baseSite,
                           apiConfig.oauth2.authorizeURL,
                           apiConfig.oauth2.accessTokenURL);

        if (apiConfig.oauth2.tokenName) {
            oa.setAccessTokenName(apiConfig.oauth2.tokenName);
        };

        if (config.debug) {
            console.log('OAuth type: ' + apiConfig.oauth2.type);
            console.log('Method security: ' + req.body.oauth2);
            console.log('Session authed: ' + req.session[apiName]);
            console.log('apiKey: ' + apiKey);
            console.log('apiSecret: ' + apiSecret);
        };

        // console.log('REFERERurl: ' + req.headers.referer);

        // if (apiConfig.oauth2.type == 'authorization-code') {
        //     console.log('AUTH CODE FTW');
        // };

        // req.getAuthDetails();
        console.log(req.headers.referer);

        //FIX THIS TO ACCOUNT FOR NONEXISTANT REDIRECT_URI (MAYBE) AND TO ACCOUNT FOR DIFFERENT RESPONSE TYPES
        var redirectUrl = oa.getAuthorizeUrl({redirect_uri : callbackURL, response_type : "code"});

        // var redirectUrl = apiConfig.oauth2.baseSite + apiConfig.oauth2.authorizeURL + '?' + 'redirect_uri=' + callbackURL + '?response_type=code&client_id=' + apiKey + '&type=web_server';


        db.set(key + ':apiKey', apiKey, redis.print);
        db.set(key + ':apiSecret', apiSecret, redis.print);
        db.set(key + ':baseURL', req.headers.referer, redis.print);

        // db.set(key + ':access_token', access_token, redis.print);
        // db.set(key + ':refresh_token', oauthTokenSecret, redis.print);

        // Set expiration to same as session
        db.expire(key + ':apiKey', 1209600000);
        db.expire(key + ':apiSecret', 1209600000);
        db.expire(key + ':baseURL', 1209600000)
        // db.expire(key + ':requestToken', 1209600000);
        // db.expire(key + ':requestTokenSecret', 1209600000);

        // console.log('did it work?');
        // console.log(redirectUrl);

        // console.log('signin: ' + apiConfig.oauth.signinURL);

        //GET BACK TO THIS SOON
        // res.send({ 'signin': apiConfig.oauth2.signinURL + oauthToken });
        res.send({'signin': redirectUrl});
        // console.log('AFTER THE SEND');

        // console.log('oa: ' + oa);

        // res.send(redirectUrl);

        // oa.redirect(res, redirectUrl, next());
        
    };



    //     //HERE (and a bit of before, too)
    //     //From here on it is only copied from oauth1 function; fix & make new
    //     // Check if the API even uses OAuth, then if the method requires oauth, then if the session is not authed

        // if (apiConfig.oauth2.type == 'authorization_code' && req.body.oauth2 == 'authrequired' && (!req.session[apiName] || !req.session[apiName].authed) ) {
    //         if (config.debug) {
    //             console.log('req.session: ' + util.inspect(req.session));
    //             console.log('headers: ' + util.inspect(req.headers));

    //             console.log(util.inspect(oa));
    //             // console.log(util.inspect(req));
    //             console.log('sessionID: ' + util.inspect(req.sessionID));
    //             // console.log(util.inspect(req.sessionStore));
    //         };



    //         oa.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results) {
    //             if (err) {
    //                 res.send("Error getting OAuth request token : " + util.inspect(err), 500);
    //             } else {
    //                 // Unique key using the sessionID and API name to store tokens and secrets
    //                 var key = req.sessionID + ':' + apiName;

    //                 db.set(key + ':apiKey', apiKey, redis.print);
    //                 db.set(key + ':apiSecret', apiSecret, redis.print);

    //                 db.set(key + ':requestToken', oauthToken, redis.print);
    //                 db.set(key + ':requestTokenSecret', oauthTokenSecret, redis.print);

    //                 // Set expiration to same as session
    //                 db.expire(key + ':apiKey', 1209600000);
    //                 db.expire(key + ':apiSecret', 1209600000);
    //                 db.expire(key + ':requestToken', 1209600000);
    //                 db.expire(key + ':requestTokenSecret', 1209600000);

    //                 // res.header('Content-Type', 'application/json');
    //                 res.send({ 'signin': apiConfig.oauth.signinURL + oauthToken });
    //             }
    //         });
    //     } else if (apiConfig.oauth.type == 'two-legged' && req.body.oauth == 'authrequired') {
    //         // Two legged stuff... for now nothing.
    //         next();
    //     } else {
    //         next();
    //     }
    // } else {
    //     next();
    // }

}


function oauth2Success(req, res, next) {
    var apiKey,
        apiSecret,
        apiName = req.params.api,
        apiConfig = apisConfig[apiName],
        key = req.sessionID + ':' + apiName;

    if (config.debug) {
        console.log('apiName: ' + apiName);
        console.log('key: ' + key);
        console.log(util.inspect(req.params));
    };
        // refererURL = url.parse(req.headers.referer),
        // callbackURL = refererURL.protocol + '//' + refererURL.host + '/' + apiName,
        // params = {grant_type : apiConfig.oauth2.type, redirect_uri : callbackURL};

    // console.log('url thing: ');
    // console.log(req.headers.referer);

    // console.log('req.params.api: ' + apiName);
    // console.log(apiConfig);
    
    // console.log('oauth2Success started');
    // console.log(req.query.code);
    // console.log(url.parse(req.originalUrl, true));
    

    // console.log('oa: ' + req.oa);
    // next();
    // console.log(callbackURL);
    db.mget([
        // key + ':access_token',
        // key + ':refresh_token',
        key + ':apiKey',
        key + ':apiSecret',
        key + ':baseURL'
    ], function(err, result) {
        if (err) {
            console.log(util.inspect(err));
        }
        console.log('RESULT: ' + result);
        // oauth2access_token = result[0],
        // oauth2refresh_token = result[1],
        apiKey = result[0],
        apiSecret = result[1],
        baseURL = result[2];

        if (config.debug) {
            // console.log(util.inspect(">>"+oauth2access_token));
            // console.log(util.inspect(">>"+oauth2refresh_token));
            console.log(util.inspect(">>"+req.query.oauth_verifier));
        };

        var oa = new OAuth2(apiKey,
               apiSecret,
               apiConfig.oauth2.baseSite,
               apiConfig.oauth2.authorizeURL,
               apiConfig.oauth2.accessTokenURL);

        if (apiConfig.oauth2.tokenName) {
            oa.setAccessTokenName(apiConfig.oauth2.tokenName);
        };


        if (config.debug) {
            console.log(util.inspect(oa));
        };

        //FIX THE REDIRECT_URI
        console.log('apiKey2: ' + apiKey);
        console.log('REDIRECT_URI: ' + util.inspect(baseURL));
        oa.getOAuthAccessToken(req.query.code,
            {grant_type : "authorization_code", redirect_uri : baseURL, client_id : apiKey, client_secret : apiSecret},
            function(error, oauth2access_token, oauth2refresh_token, results){
            if (error) {
                res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauth2access_token+"]"+ "["+oauth2refresh_token+"]", 500);
            } else {
                if (config.debug) {
                    console.log('results: ' + util.inspect(results));
                };
                console.log('ACCESS_TOKEN: ' + oauth2access_token);
                console.log('REQUEST_TOKEN' + oauth2refresh_token)
                db.mset([key + ':access_token', oauth2access_token,
                        key + ':refresh_token', oauth2refresh_token
                ], function(err, results2) {
                    req.session[apiName] = {};
                    req.session[apiName].authed = true;
                    if (config.debug) {
                        console.log('session[apiName].authed: ' + util.inspect(req.session));
                    };
                    next();
                });
            }
        });

    });



    // if(req.query && (req.query.code || req.query.error === 'access_denied')) {
    //         if(req.query.error == 'access_denied') {
    //             //PUT SOMETHING HERE
    //             console.log('done broke (access_denied)')
    //         } else {
    //             var apiKey = req.body.apiKey || req.body.key,
    //                 apiSecret = req.body.apiSecret || req.body.secret,
    //                 oa = new OAuth2(apiKey,
    //                        apiSecret,
    //                        apiConfig.oauth2.baseSite,
    //                        apiConfig.oauth2.authorizeURL,
    //                        apiConfig.oauth2.accessTokenURL);
    //           // console.log('parsedUrl.query: ' + parsedUrl.query);
    //             console.log('the CODE: ' + req.query.code);

    //             console.log(apiKey);
    //             console.log(apiSecret);
    // //             // req.session[apiName] = {};
    // //             // req.session[apiName].authed = true;
    // //             // next();
    // // //           console.log(parsedUrl.query.code);  
    // // {redirect_uri: my._redirectUri,
    //             oa.getOAuthAccessToken(req.query.code,
    //                 {grant_type : "authorization_code", redirect_uri : 'http://localhost:4000/foursquare', client_id : apiKey, client_secret : apiSecret},
    //                 function(error, access_token, refresh_token){
    //                     if(error) {
    //                         console.log('Error getting OAuth2 access token: ');
    //                         console.log(error);
    //                         console.log(access_token);
    //                         res.send("Error getting OAuth access token : " + util.inspect(error) + "["+access_token+"]"+ "["+refresh_token+"]", 500);
    //                     } else {
    //                         req.session["access_token"]= access_token;
    //                         if( refresh_token ) request.session["refresh_token"]= refresh_token;
    //                         oa.getProtectedResource("https://api.foursquare.com/v2/users/self", request.session["access_token"], function (error, data, response) {
    //                         if( error ) {
    //                             console.log('ERROR in getOAuthAccessToken')
    //                         }else {
    //                             req.session[apiName] = {};
    //                             req.session[apiName].authed = true;
    //                             next();                            }
    //                        });
    //                     };
    //             });
    //         }
    //       };




    // oa.getOAuthAccessToken(req.query.code, )
    // console.log(req);

};


//
// OAuth Success!
//
function oauthSuccess(req, res, next) {
    console.log('oauthSuccess started');
    var oauthRequestToken,
        oauthRequestTokenSecret,
        apiKey,
        apiSecret,
        apiName = req.params.api,
        apiConfig = apisConfig[apiName],
        key = req.sessionID + ':' + apiName; // Unique key using the sessionID and API name to store tokens and secrets

    if (config.debug) {
        console.log('apiName: ' + apiName);
        console.log('key: ' + key);
        console.log(util.inspect(req.params));
    };

    console.log('apiKey1: ' + apiKey);

    db.mget([
        key + ':requestToken',
        key + ':requestTokenSecret',
        key + ':apiKey',
        key + ':apiSecret'
    ], function(err, result) {
        if (err) {
            console.log(util.inspect(err));
        }
        oauthRequestToken = result[0],
        oauthRequestTokenSecret = result[1],
        apiKey = result[2],
        apiSecret = result[3];

        if (config.debug) {
            console.log(util.inspect(">>"+oauthRequestToken));
            console.log(util.inspect(">>"+oauthRequestTokenSecret));
            console.log(util.inspect(">>"+req.query.oauth_verifier));
        };

        var oa = new OAuth(apiConfig.oauth.requestURL,
                           apiConfig.oauth.accessURL,
                           apiKey,
                           apiSecret,
                           apiConfig.oauth.version,
                           null,
                           apiConfig.oauth.crypt);


        if (config.debug) {
            console.log(util.inspect(oa));
        };

        console.log('apiKey2: ' + apiKey);
        oa.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if (error) {
                res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
            } else {
                if (config.debug) {
                    console.log('results: ' + util.inspect(results));
                };
                db.mset([key + ':accessToken', oauthAccessToken,
                    key + ':accessTokenSecret', oauthAccessTokenSecret
                ], function(err, results2) {
                    req.session[apiName] = {};
                    req.session[apiName].authed = true;
                    if (config.debug) {
                        console.log('session[apiName].authed: ' + util.inspect(req.session));
                    };

                    next();
                });
            }
        });

    });
}


//
// processRequest - handles API call
//
function processRequest(req, res, next) {
    if (config.debug) {
        console.log(util.inspect(req.body, null, 3));
    };
    console.log('I AM HERE: processRequest');

    var reqQuery = req.body,
        customHeaders = {},
        params = reqQuery.params || {},
        locations = reqQuery.locations || {},
        methodURL = reqQuery.methodUri,
        httpMethod = reqQuery.httpMethod,
        apiKey = reqQuery.apiKey,
        apiSecret = reqQuery.apiSecret,
        apiName = reqQuery.apiName
        apiConfig = apisConfig[apiName],
        key = req.sessionID + ':' + apiName;

    // Extract custom headers from the params
    for( var param in params )
    {
         if (params.hasOwnProperty(param))
         {
            if (params[param] !== '' && locations[param] == 'header' )
            {
                customHeaders[param] = params[param];
                delete params[param];
            }
         }
    }

    // Replace placeholders in the methodURL with matching params
    for (var param in params) {
        if (params.hasOwnProperty(param)) {
            if (params[param] !== '') {
                // URL params are prepended with ":"
                var regx = new RegExp(':' + param);

                // If the param is actually a part of the URL, put it in the URL and remove the param
                if (!!regx.test(methodURL)) {
                    methodURL = methodURL.replace(regx, params[param]);
                    delete params[param]
                }
            } else {
                delete params[param]; // Delete blank params
            }
        }
    }

    var baseHostInfo = apiConfig.baseURL.split(':');
    var baseHostUrl = baseHostInfo[0],
        baseHostPort = (baseHostInfo.length > 1) ? baseHostInfo[1] : "";
    var headers = {};
    for( header in apiConfig.headers )
        headers[header] = apiConfig.headers[header];
    for( header in customHeaders )
        headers[header] = customHeaders[header];

    var paramString = query.stringify(params),
        privateReqURL = apiConfig.protocol + '://' + apiConfig.baseURL + apiConfig.privatePath + methodURL + ((paramString.length > 0) ? '?' + paramString : ""),
        options = {
            headers: headers,
            protocol: apiConfig.protocol + ':',
            host: baseHostUrl,
            port: baseHostPort,
            method: httpMethod,
            path: apiConfig.publicPath + methodURL// + ((paramString.length > 0) ? '?' + paramString : "")
        };

    if (['POST','DELETE','PUT'].indexOf(httpMethod) !== -1) {
        var requestBody = query.stringify(params);
    }

    if (apiConfig.oauth) {
        console.log('Using OAuth');

        // Three legged OAuth
        if (apiConfig.oauth.type == 'three-legged' && (reqQuery.oauth == 'authrequired' || (req.session[apiName] && req.session[apiName].authed))) {
            if (config.debug) {
                console.log('Three Legged OAuth');
            };

            db.mget([key + ':apiKey',
                     key + ':apiSecret',
                     key + ':accessToken',
                     key + ':accessTokenSecret'
                ],
                function(err, results) {

                    var apiKey = (typeof reqQuery.apiKey == "undefined" || reqQuery.apiKey == "undefined")?results[0]:reqQuery.apiKey,
                        apiSecret = (typeof reqQuery.apiSecret == "undefined" || reqQuery.apiSecret == "undefined")?results[1]:reqQuery.apiSecret,
                        accessToken = results[2],
                        accessTokenSecret = results[3];
                    console.log(apiKey);
                    console.log(apiSecret);
                    console.log(accessToken);
                    console.log(accessTokenSecret);

                    var oa = new OAuth(apiConfig.oauth.requestURL || null,
                                       apiConfig.oauth.accessURL || null,
                                       apiKey || null,
                                       apiSecret || null,
                                       apiConfig.oauth.version || null,
                                       null,
                                       apiConfig.oauth.crypt);

                    if (config.debug) {
                        console.log('Access token: ' + accessToken);
                        console.log('Access token secret: ' + accessTokenSecret);
                        console.log('key: ' + key);
                    };

                    oa.getProtectedResource(privateReqURL, httpMethod, accessToken, accessTokenSecret,  function (error, data, response) {
                        req.call = privateReqURL;

                        // console.log(util.inspect(response));
                        if (error) {
                            console.log('Got error: ' + util.inspect(error));

                            if (error.data == 'Server Error' || error.data == '') {
                                req.result = 'Server Error';
                            } else {
                                req.result = error.data;
                            }

                            res.statusCode = error.statusCode

                            next();
                        } else {
                            console.log('responseheaders: ' + util.inspect(response.headers));
                            req.resultHeaders = response.headers;
                            req.result = JSON.parse(data);

                            next();
                        }
                    });
                }
            );
        } else if (apiConfig.oauth.type == 'two-legged' && reqQuery.oauth == 'authrequired') { // Two-legged
            if (config.debug) {
                console.log('Two Legged OAuth');
            };

            var body,
                oa = new OAuth(null,
                               null,
                               apiKey || null,
                               apiSecret || null,
                               apiConfig.oauth.version || null,
                               null,
                               apiConfig.oauth.crypt);

            var resource = options.protocol + '://' + options.host + options.path,
                cb = function(error, data, response) {
                    if (error) {
                        if (error.data == 'Server Error' || error.data == '') {
                            req.result = 'Server Error';
                        } else {
                            console.log(util.inspect(error));
                            body = error.data;
                        }

                        res.statusCode = error.statusCode;

                    } else {
                        console.log(util.inspect(data));

                        var responseContentType = response.headers['content-type'];

                        switch (true) {
                            case /application\/javascript/.test(responseContentType):
                            case /text\/javascript/.test(responseContentType):
                            case /application\/json/.test(responseContentType):
                                body = JSON.parse(data);
                                break;
                            case /application\/xml/.test(responseContentType):
                            case /text\/xml/.test(responseContentType):
                            default:
                        }
                    }

                    // Set Headers and Call
                    if (response) {
                        req.resultHeaders = response.headers || 'None';
                    } else {
                        req.resultHeaders = req.resultHeaders || 'None';
                    }

                    req.call = url.parse(options.host + options.path);
                    req.call = url.format(req.call);

                    // Response body
                    req.result = body;

                    next();
                };

            switch (httpMethod) {
                case 'GET':
                    console.log(resource);
                    oa.get(resource, '', '',cb);
                    break;
                case 'PUT':
                case 'POST':
                    oa.post(resource, '', '', JSON.stringify(obj), null, cb);
                    break;
                case 'DELETE':
                    oa.delete(resource,'','',cb);
                    break;
            }

        } else {
            // API uses OAuth, but this call doesn't require auth and the user isn't already authed, so just call it.
            unsecuredCall();
        }
    } else if (apiConfig.oauth2) {
        console.log('Using OAuth2');
        console.log(reqQuery);

        // Three legged OAuth
        if (apiConfig.oauth2.type == 'authorization-code' && (reqQuery.oauth == 'authrequired' || (req.session[apiName] && req.session[apiName].authed))) {
            if (config.debug) {
                console.log('Auth Code OAuth');
            };

            db.mget([key + ':apiKey',
                     key + ':apiSecret',
                     key + ':access_token',
                     key + ':refresh_token'
                ],
                function(err, results) {

                    var apiKey = (typeof reqQuery.apiKey == "undefined" || reqQuery.apiKey == "undefined")?results[0]:reqQuery.apiKey,
                        apiSecret = (typeof reqQuery.apiSecret == "undefined" || reqQuery.apiSecret == "undefined")?results[1]:reqQuery.apiSecret,
                        access_token = results[2],
                        refresh_token = results[3];
                   
                    console.log(apiKey);
                    console.log(apiSecret);
                    console.log(access_token);
                    console.log(refresh_token);

                    // var oa = new OAuth(apiConfig.oauth.requestURL || null,
                    //                    apiConfig.oauth.accessURL || null,
                    //                    apiKey || null,
                    //                    apiSecret || null,
                    //                    apiConfig.oauth.version || null,
                    //                    null,
                    //                    apiConfig.oauth.crypt);
                    var oa = new OAuth2(apiKey,
                           apiSecret,
                           apiConfig.oauth2.baseSite,
                           apiConfig.oauth2.authorizeURL,
                           apiConfig.oauth2.accessTokenURL);


                    if (apiConfig.oauth2.tokenName) {
                        oa.setAccessTokenName(apiConfig.oauth2.tokenName);
                    };

                    if (config.debug) {
                        console.log('Access token: ' + access_token);
                        console.log('Access token secret: ' + refresh_token);
                        console.log('key: ' + key);
                    };

                    //HERE
                    console.log('httpMethod: ' + httpMethod);
                    console.log('HEADERS: ' + util.inspect(headers));
                    oa._request(httpMethod, privateReqURL, headers, access_token, function (error, data, response) {
                        console.log('REQ: ' + util.inspect(req));
                    // oa.getProtectedResource(privateReqURL, httpMethod, accessToken, accessTokenSecret,  function (error, data, response) {
                        req.call = privateReqURL;

                        // console.log(util.inspect(response));
                        if (error) {
                            console.log('Got error: ' + util.inspect(error));

                            if (error.data == 'Server Error' || error.data == '') {
                                req.result = 'Server Error';
                            } else {
                                req.result = error.data;
                            }

                            res.statusCode = error.statusCode

                            next();
                        } else {
                            req.resultHeaders = response.headers;
                            req.result = JSON.parse(data);

                            next();
                        }
                    });
                }
            );
        } else if (apiConfig.oauth.type == 'two-legged' && reqQuery.oauth == 'authrequired') { // Two-legged
            if (config.debug) {
                console.log('Two Legged OAuth');
            };

            var body,
                oa = new OAuth(null,
                               null,
                               apiKey || null,
                               apiSecret || null,
                               apiConfig.oauth.version || null,
                               null,
                               apiConfig.oauth.crypt);

            var resource = options.protocol + '://' + options.host + options.path,
                cb = function(error, data, response) {
                    if (error) {
                        if (error.data == 'Server Error' || error.data == '') {
                            req.result = 'Server Error';
                        } else {
                            console.log(util.inspect(error));
                            body = error.data;
                        }

                        res.statusCode = error.statusCode;

                    } else {
                        console.log(util.inspect(data));

                        var responseContentType = response.headers['content-type'];

                        switch (true) {
                            case /application\/javascript/.test(responseContentType):
                            case /text\/javascript/.test(responseContentType):
                            case /application\/json/.test(responseContentType):
                                body = JSON.parse(data);
                                break;
                            case /application\/xml/.test(responseContentType):
                            case /text\/xml/.test(responseContentType):
                            default:
                        }
                    }

                    // Set Headers and Call
                    if (response) {
                        req.resultHeaders = response.headers || 'None';
                    } else {
                        req.resultHeaders = req.resultHeaders || 'None';
                    }

                    req.call = url.parse(options.host + options.path);
                    req.call = url.format(req.call);

                    // Response body
                    req.result = body;

                    next();
                };

            switch (httpMethod) {
                case 'GET':
                    console.log(resource);
                    oa.get(resource, '', '',cb);
                    break;
                case 'PUT':
                case 'POST':
                    oa.post(resource, '', '', JSON.stringify(obj), null, cb);
                    break;
                case 'DELETE':
                    oa.delete(resource,'','',cb);
                    break;
            }

        } else {
            // API uses OAuth, but this call doesn't require auth and the user isn't already authed, so just call it.
            unsecuredCall();
        }
    } else {
        // API does not use authentication
        unsecuredCall();
    }

    // Unsecured API Call helper
    function unsecuredCall() {
        console.log('Unsecured Call');

        if (['POST','PUT','DELETE'].indexOf(httpMethod) === -1) {
            options.path += ((paramString.length > 0) ? '?' + paramString : "");
        }

        // Add API Key to params, if any.
        if (apiKey != '' && apiKey != 'undefined' && apiKey != undefined) {
            if (options.path.indexOf('?') !== -1) {
                options.path += '&';
            }
            else {
                options.path += '?';
            }
            options.path += apiConfig.keyParam + '=' + apiKey;
        }

        // Perform signature routine, if any.
        if (apiConfig.signature) {
            if (apiConfig.signature.type == 'signed_md5') {
                // Add signature parameter
                var timeStamp = Math.round(new Date().getTime()/1000);
                var sig = crypto.createHash('md5').update('' + apiKey + apiSecret + timeStamp + '').digest(apiConfig.signature.digest);
                options.path += '&' + apiConfig.signature.sigParam + '=' + sig;
            }
            else if (apiConfig.signature.type == 'signed_sha256') { // sha256(key+secret+epoch)
                // Add signature parameter
                var timeStamp = Math.round(new Date().getTime()/1000);
                var sig = crypto.createHash('sha256').update('' + apiKey + apiSecret + timeStamp + '').digest(apiConfig.signature.digest);
                options.path += '&' + apiConfig.signature.sigParam + '=' + sig;
            }
        }

        // Setup headers, if any
        if (reqQuery.headerNames && reqQuery.headerNames.length > 0) {
            if (config.debug) {
                console.log('Setting headers');
            };
            var headers = {};

            for (var x = 0, len = reqQuery.headerNames.length; x < len; x++) {
                if (config.debug) {
                  console.log('Setting header: ' + reqQuery.headerNames[x] + ':' + reqQuery.headerValues[x]);
                };
                if (reqQuery.headerNames[x] != '') {
                    headers[reqQuery.headerNames[x]] = reqQuery.headerValues[x];
                }
            }

            options.headers = headers;
        }
        if(options.headers === void 0){
            options.headers = {}
        }
        if (!options.headers['Content-Length']) {
            if (requestBody) {
                options.headers['Content-Length'] = requestBody.length;
            }
            else {
                options.headers['Content-Length'] = 0;
            }
        }

        if (!options.headers['Content-Type'] && requestBody) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (config.debug) {
            console.log(util.inspect(options));
        };

        var doRequest;
        if (options.protocol === 'https' || options.protocol === 'https:') {
            console.log('Protocol: HTTPS');
            options.protocol = 'https:'
            doRequest = https.request;
        } else {
            console.log('Protocol: HTTP');
            doRequest = http.request;
        }

        // API Call. response is the response from the API, res is the response we will send back to the user.
        var apiCall = doRequest(options, function(response) {
            response.setEncoding('utf-8');

            if (config.debug) {
                console.log('HEADERS: ' + JSON.stringify(response.headers));
                console.log('STATUS CODE: ' + response.statusCode);
            };

            res.statusCode = response.statusCode;

            var body = '';

            response.on('data', function(data) {
                body += data;
            })

            response.on('end', function() {
                delete options.agent;

                var responseContentType = response.headers['content-type'];

                switch (true) {
                    case /application\/javascript/.test(responseContentType):
                    case /application\/json/.test(responseContentType):
                        console.log(util.inspect(body));
                        // body = JSON.parse(body);
                        break;
                    case /application\/xml/.test(responseContentType):
                    case /text\/xml/.test(responseContentType):
                    default:
                }

                // Set Headers and Call
                req.resultHeaders = response.headers;
                req.call = url.parse(options.host + options.path);
                req.call = url.format(req.call);

                // Response body
                req.result = body;

                console.log(util.inspect(body));

                next();
            })
        }).on('error', function(e) {
            if (config.debug) {
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                console.log("Got error: " + e.message);
                console.log("Error: " + util.inspect(e));
            };
        });

        if (requestBody) {
            apiCall.end(requestBody, 'utf-8');
        }
        else {
            apiCall.end();
        }
    }
}


function checkPathForAPI(req, res, next) {
    if (!req.params) req.params = {};
    if (!req.params.api) {
        // If api wasn't passed in as a parameter, check the path to see if it's there
        var pathName = req.url.replace('/','');
        // Is it a valid API - if there's a config file we can assume so
        fs.stat(__dirname + '/public/data/' + pathName + '.json', function (error, stats) {
            if (stats) {
                req.params.api = pathName;
            }
            next();
        });
    } else {
        next();
    }

}

// Replaces deprecated app.dynamicHelpers that were dropped in Express 3.x
// Passes variables to the view
function dynamicHelpers(req, res, next) {
    if (req.params.api) {
        res.locals.apiInfo = apisConfig[req.params.api];
        res.locals.apiName = req.params.api;
        res.locals.apiDefinition = require(__dirname + '/public/data/' + req.params.api + '.json');
        // If the cookie says we're authed for this particular API, set the session to authed as well
        if (req.session[req.params.api] && req.session[req.params.api]['authed']) {
            req.session['authed'] = true;
        }
    } else {
        res.locals.apiInfo = apisConfig;
    }

    res.locals.session = req.session;
    console.log('originalUrl (DYNAMIC HELPERS): ' + req.originalUrl);
    next();
}

//
// Routes
//
app.get('/', function(req, res) {
    console.log('11111');
    res.render('listAPIs', {
        title: config.title
    });
});

// Process the API request
app.post('/processReq', oauth, processRequest, function(req, res) {
    console.log('22222');
    var result = {
        headers: req.resultHeaders,
        response: req.result,
        call: req.call,
        code: req.res.statusCode
    };
    console.log('RESULT: ');
    console.log(result);
    res.send(result);
});

// Just auth
app.all('/auth', oauth);
app.all('/auth2', oauth2);

// OAuth callback page, closes the window immediately after storing access token/secret
app.get('/authSuccess/:api', oauthSuccess, function(req, res) {
    console.log('33333');
    res.render('authSuccess', {
        title: 'OAuth Successful'
    });
});

// OAuth callback page, closes the window immediately after storing access token/secret
app.get('/oauth2Success/:api', oauth2Success, function(req, res) {
    console.log('33333aaaaa');
    res.render('authSuccess', {
        title: 'OAuth Successful'
    });
});

app.post('/upload', function(req, res) {
  console.log('44444');  
  console.log(req.body.user);
  res.redirect('back');
});

// API shortname, all lowercase
app.get('/:api([^\.]+)', function(req, res) {
    console.log('55555');
    req.params.api=req.params.api.replace(/\/$/,'');
    res.render('api');
});

// Only listen on $ node app.js

if (!module.parent) {
    var port = process.env.PORT || config.port;
    var l = app.listen(port);
    l.on('listening', function(err) {
        console.log("Express server listening on port %d", port);
    });
}
