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
    path        = require('path'),
    OAuth       = require('oauth').OAuth,
    OAuth2      = require('oauth/lib/oauth2').OAuth2,
    query       = require('querystring'),
    url         = require('url'),
    http        = require('http'),
    https       = require('https'),
    crypto      = require('crypto'),
    clone       = require('clone'),
    redis       = require('redis'),
    RedisStore  = require('connect-redis')(express);

// Add minify to the JSON object
JSON.minify = JSON.minify || require("node-json-minify");

// Parse arguments
var yargs = require('yargs')
        .usage('Usage: $0 --config-file [file]')
        .alias('c', 'config-file')
        .alias('h', 'help')
        .describe('c', 'Specify the config file location')
        .default('c', './config.json');
var argv = yargs.argv;

if (argv.help) {
    yargs.showHelp();
    process.exit(0);
}

// Configuration
var configFilePath = path.resolve(argv['config-file']);
try {
    var config = JSON.parse(JSON.minify(fs.readFileSync(configFilePath, 'utf8')));

} catch(e) {
    console.error("File " + configFilePath + " not found or is invalid.  Try: `cp config.json.sample config.json`");
    process.exit(1);
}

//
// Redis connection
//
var defaultDB = '0';
if(config.redis) {
config.redis.database = config.redis.database || defaultDB;

if (process.env.REDISTOGO_URL || process.env.REDIS_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL || process.env.REDIS_URL);
    config.redis.host = rtg.hostname;
    config.redis.port = rtg.port;
    config.redis.password = rtg.auth && rtg.auth.split(":")[1] ? rtg.auth.split(":")[1] : '';
}

var db = redis.createClient(config.redis.port, config.redis.host);
db.auth(config.redis.password);

db.on("error", function(err) {
    if (config.debug) {
         console.log("Error " + err);
    }
});
}

//
// Load API Configs
//

config.apiConfigDir = path.resolve(config.apiConfigDir || 'public/data');
if (!fs.existsSync(config.apiConfigDir)) {
    console.error("Could not find API config directory: " + config.apiConfigDir);
    process.exit(1);
}

try {
    var apisConfig = JSON.parse(JSON.minify(fs.readFileSync(path.join(config.apiConfigDir, 'apiconfig.json'), 'utf8')));
    if (config.debug) {
        console.log(util.inspect(apisConfig));
    }
} catch(e) {
    console.error("File apiconfig.json not found or is invalid.");
    process.exit(1);
}

var app = module.exports = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
if(config.redis) {
    app.use(express.session({
        secret: config.sessionSecret,
        store:  new RedisStore({
            'host':   config.redis.host,
            'port':   config.redis.port,
            'pass':   config.redis.password,
            'db'  :   config.redis.database,
            'maxAge': 1209600000
        })
    }));
} else {
    app.use(express.session({
        secret: config.sessionSecret
    }));
} 

    // Global basic authentication on server (applied if configured)
    if (config.basicAuth && config.basicAuth.username && config.basicAuth.password) {
        app.use(express.basicAuth(function(user, pass, callback) {
            var result = (user === config.basicAuth.username && pass === config.basicAuth.password);
            callback(null /* error */, result);
        }));
    }

    app.use(checkPathForAPI);
    app.use(dynamicHelpers);
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

        if (config.debug) {
            console.log('OAuth type: ' + apiConfig.oauth.type);
            console.log('Method security: ' + req.body.oauth);
            console.log('Session authed: ' + req.session[apiName]);
            console.log('apiKey: ' + apiKey);
            console.log('apiSecret: ' + apiSecret);
        }

        // Check if the API even uses OAuth, then if the method requires oauth, then if the session is not authed
        if (apiConfig.oauth.type == 'three-legged' && req.body.oauth == 'authrequired' && (!req.session[apiName] || !req.session[apiName].authed) ) {
            if (config.debug) {
                console.log('req.session: ' + util.inspect(req.session));
                console.log('headers: ' + util.inspect(req.headers));
                console.log(util.inspect(oa));
                console.log('sessionID: ' + util.inspect(req.sessionID));
            }

            oa.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results) {
                if (err) {
                    res.send("Error getting OAuth request token : " + util.inspect(err), 500);
                } else {
                    // Unique key using the sessionID and API name to store tokens and secrets
                    var key = req.sessionID + ':' + apiName;

                    db.set(key + ':apiKey', apiKey, redis.print);
                    db.set(key + ':apiSecret', apiSecret, redis.print);

                    db.set(key + ':requestToken', oauthToken, redis.print);
                    db.set(key + ':requestTokenSecret', oauthTokenSecret, redis.print);

                    // Set expiration to same as session
                    db.expire(key + ':apiKey', 1209600000);
                    db.expire(key + ':apiSecret', 1209600000);
                    db.expire(key + ':requestToken', 1209600000);
                    db.expire(key + ':requestTokenSecret', 1209600000);

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
        apiConfig = apisConfig[apiName];

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
        }

        if (config.debug) {
            console.log('OAuth type: ' + apiConfig.oauth2.type);
            console.log('Method security: ' + req.body.oauth2);
            console.log('Session authed: ' + req.session[apiName]);
            console.log('apiKey: ' + apiKey);
            console.log('apiSecret: ' + apiSecret);
        }

        var redirectUrl;
        if (apiConfig.oauth2.type == 'authorization-code') {
            redirectUrl = oa.getAuthorizeUrl({redirect_uri : callbackURL, response_type : 'code'});

            db.set(key + ':apiKey', apiKey, redis.print);
            db.set(key + ':apiSecret', apiSecret, redis.print);
            db.set(key + ':callbackURL', callbackURL, redis.print);

            // Set expiration to same as session
            db.expire(key + ':apiKey', 1209600000);
            db.expire(key + ':apiSecret', 1209600000);
            db.expire(key + ':callbackURL', 1209600000);

            res.send({'signin': redirectUrl});
        }
        else if (apiConfig.oauth2.type == 'implicit') {
            oa._authorizeUrl = oa._accessTokenUrl;
            redirectUrl = oa.getAuthorizeUrl({redirect_uri : callbackURL, response_type : 'token'});

            db.set(key + ':apiKey', apiKey, redis.print);
            db.set(key + ':apiSecret', apiSecret, redis.print);
            db.set(key + ':callbackURL', callbackURL, redis.print);

            // Set expiration to same as session
            db.expire(key + ':apiKey', 1209600000);
            db.expire(key + ':apiSecret', 1209600000);
            db.expire(key + ':callbackURL', 1209600000);

            res.send({'implicit': redirectUrl});
        }
        else if (apiConfig.oauth2.type == 'client_credentials') {
            var accessURL = apiConfig.oauth2.baseSite + apiConfig.oauth2.accessTokenURL;
            var basic_cred = apiKey + ':' + apiSecret;
            var encoded_basic = new Buffer(basic_cred).toString('base64');
 
            var http_method = (apiConfig.oauth2.authorizationHeader == 'Y') ? "POST" : "GET";
            var header = { 'Content-Type': 'application/x-www-form-urlencoded' };
            if ( apiConfig.oauth2.authorizationHeader == 'Y' ) {
              header[ 'Authorization' ] = 'Basic ' + encoded_basic;
            }
            var fillerpost = query.stringify({grant_type : "client_credentials", client_id : apiKey, client_secret : apiSecret});

            db.set(key + ':apiKey', apiKey, redis.print);
            db.set(key + ':apiSecret', apiSecret, redis.print);
            db.set(key + ':callbackURL', callbackURL, redis.print);

            // Set expiration to same as session
            db.expire(key + ':apiKey', 1209600000);
            db.expire(key + ':apiSecret', 1209600000);
            db.expire(key + ':callbackURL', 1209600000);

            //client_credentials w/Authorization header
            oa._request(http_method, accessURL, header, 
                fillerpost,
                '', function(error, data, response) {
                if (error) {
                    res.send("Error getting OAuth access token : " + util.inspect(error), 500);
                }
                else {
                    var results;
                    try {
                        results = JSON.parse(data);
                    }
                    catch(e) {
                        results = query.parse(data)
                    }
                    var oauth2access_token = results["access_token"];
                    var oauth2refresh_token = results["refresh_token"];

                    if (config.debug) {
                        console.log('results: ' + util.inspect(results));
                    }
                    db.mset([key + ':access_token', oauth2access_token,
                            key + ':refresh_token', oauth2refresh_token
                    ], function(err, results2) {
                        db.set(key + ':accessToken', oauth2access_token, redis.print);
                        db.set(key + ':refreshToken', oauth2refresh_token, redis.print);
                        db.expire(key + ':accessToken', 1209600000);
                        db.expire(key + ':refreshToken', 1209600000);
                        
                        res.send({'refresh': callbackURL});
                    });
                }
            })
        }
    }
}


function oauth2Success(req, res, next) {
    console.log('oauth2Success started');
        var apiKey,
            apiSecret,
            apiName = req.params.api,
            apiConfig = apisConfig[apiName],
            key = req.sessionID + ':' + apiName,
            baseURL;

        if (config.debug) {
            console.log('apiName: ' + apiName);
            console.log('key: ' + key);
            console.log(util.inspect(req.params));
        }
        db.mget([
            key + ':apiKey',
            key + ':apiSecret',
            key + ':callbackURL',
            key + ':accessToken',
            key + ':refreshToken'
        ], function(err, result) {
            if (err) {
                console.log(util.inspect(err));
            }
            apiKey = result[0],
            apiSecret = result[1],
            callbackURL = result[2];

            if (result[3] && apiConfig.oauth2.type == 'client_credentials') {
                req.session[apiName] = {};
                req.session[apiName].authed = true;
                if (config.debug) {
                    console.log('session[apiName].authed: ' + util.inspect(req.session));
                }
                next();
            }

            if (config.debug) {
                console.log(util.inspect(">>"+req.query.oauth_verifier));
            }

            var oa = new OAuth2(apiKey,
                   apiSecret,
                   apiConfig.oauth2.baseSite,
                   apiConfig.oauth2.authorizeURL,
                   apiConfig.oauth2.accessTokenURL);

            if (apiConfig.oauth2.tokenName) {
                oa.setAccessTokenName(apiConfig.oauth2.tokenName);
            }

            if (config.debug) {
                console.log(util.inspect(oa));
            }

            if (apiConfig.oauth2.type == 'authorization-code') {
                oa.getOAuthAccessToken(req.query.code,
                    {grant_type : "authorization_code", redirect_uri : callbackURL, client_id : apiKey, client_secret : apiSecret},
                    function(error, oauth2access_token, oauth2refresh_token, results){
                    if (error) {
                        res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauth2access_token+"]"+ "["+oauth2refresh_token+"]", 500);
                    } else {
                        if (config.debug) {
                            console.log('results: ' + util.inspect(results));
                        }
                        db.mset([key + ':access_token', oauth2access_token,
                                key + ':refresh_token', oauth2refresh_token
                        ], function(err, results2) {
                            req.session[apiName] = {};
                            req.session[apiName].authed = true;
                            if (config.debug) {
                                console.log('session[apiName].authed: ' + util.inspect(req.session));
                            }
                            next();
                        });
                    }
                });
            }
            else if (apiConfig.oauth2.type == 'implicit') {
                next();
            }
        });
}


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
    }

    db.mget([
        key + ':requestToken',
        key + ':requestTokenSecret',
        key + ':apiKey',
        key + ':apiSecret'
    ], function(err, result) {
        if (err) {
            console.log(util.inspect(err));
        }
        oauthRequestToken = result[0];
        oauthRequestTokenSecret = result[1];
        apiKey = result[2];
        apiSecret = result[3];

        if (config.debug) {
            console.log(util.inspect(">>"+oauthRequestToken));
            console.log(util.inspect(">>"+oauthRequestTokenSecret));
            console.log(util.inspect(">>"+req.query.oauth_verifier));
        }

        var oa = new OAuth(apiConfig.oauth.requestURL,
                           apiConfig.oauth.accessURL,
                           apiKey,
                           apiSecret,
                           apiConfig.oauth.version,
                           null,
                           apiConfig.oauth.crypt);


        if (config.debug) {
            console.log(util.inspect(oa));
        }

        oa.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if (error) {
                res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
            } else {
                if (config.debug) {
                    console.log('results: ' + util.inspect(results));
                }
                db.mset([key + ':accessToken', oauthAccessToken,
                    key + ':accessTokenSecret', oauthAccessTokenSecret
                ], function(err, results2) {
                    req.session[apiName] = {};
                    req.session[apiName].authed = true;
                    if (config.debug) {
                        console.log('session[apiName].authed: ' + util.inspect(req.session));
                    }
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
    }

    var reqQuery = req.body,
        customHeaders = {},
        params    = {},
        keys      = reqQuery.keys || {},
        values    = reqQuery.values || {},
        locations = reqQuery.locations || {},
        methodURL = reqQuery.methodUri,
        httpMethod = reqQuery.httpMethod,
        apiKey = reqQuery.apiKey,
        apiSecret = reqQuery.apiSecret,
        apiName = reqQuery.apiName,
        apiConfig = apisConfig[apiName],
        key = req.sessionID + ':' + apiName,
        implicitAccessToken = reqQuery.accessToken;

    for( var i in keys )
    {
        var k = keys[i];
        var v = values[i];
        if (v !== '')
        {
            // Set custom headers from the params
            if (locations[i] == 'header' ) {
                customHeaders[k] = v;
            } else {
                // URL params are prepended with ":"
                var regx = new RegExp(':' + k);

                // If the param is actually a part of the URL, put it in the URL
                if (!!regx.test(methodURL)) {
                    methodURL = methodURL.replace(regx, v);
                } else {
                    params[k] = v;
                }
            }
        }
    }

    var baseHostInfo = apiConfig.baseURL.split(':');
    var baseHostUrl = baseHostInfo[0],
        baseHostPort = (baseHostInfo.length > 1) ? baseHostInfo[1] : "";
    var headers = {};
    for (var configHeader in apiConfig.headers) {
        if (apiConfig.headers.hasOwnProperty(configHeader)) {
            headers[configHeader] = apiConfig.headers[configHeader];
        }
    }
    for (var customHeader in customHeaders) {
        if (customHeaders.hasOwnProperty(customHeader)) {
            headers[customHeader] = customHeaders[customHeader];

        }
    }

    var paramString = query.stringify(params),
        privateReqURL = apiConfig.protocol + '://' + apiConfig.baseURL + apiConfig.privatePath + methodURL + ((paramString.length > 0) ? '?' + paramString : ""),
        options = {
            headers: clone(headers),
            protocol: apiConfig.protocol + ':',
            host: baseHostUrl,
            port: baseHostPort,
            method: httpMethod,
            path: apiConfig.publicPath + methodURL// + ((paramString.length > 0) ? '?' + paramString : "")
        };

    if (['POST','DELETE','PUT'].indexOf(httpMethod) !== -1) {
        var requestBody;
        requestBody = (options.headers['Content-Type'] === 'application/json') ?
             JSON.stringify(params) : query.stringify(params);
    }

    if (apiConfig.oauth) {
        console.log('Using OAuth');

        // Three legged OAuth
        if (apiConfig.oauth.type == 'three-legged' && (reqQuery.oauth == 'authrequired' || (req.session[apiName] && req.session[apiName].authed))) {
            if (config.debug) {
                console.log('Three Legged OAuth');
            }

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
                    }

                    oa.getProtectedResource(privateReqURL, httpMethod, accessToken, accessTokenSecret,  function (error, data, response) {
                        req.call = privateReqURL;

                        if (error) {
                            console.log('Got error: ' + util.inspect(error));

                            if (error.data == 'Server Error' || error.data == '') {
                                req.result = 'Server Error';
                            } else {
                                req.result = error.data;
                            }

                            res.statusCode = error.statusCode;

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
            }

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
                        var responseContentType = response.headers['content-type'];

                        if (/application\/javascript/.test(responseContentType)
                            || /text\/javascript/.test(responseContentType)
                            || /application\/json/.test(responseContentType)) {
                            body = JSON.parse(data);
                        }
                    }

                    // Set Headers and Call
                    if (options.headers) req.requestHeaders = options.headers;
                    if (requestBody) req.requestBody = requestBody;
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

        if (implicitAccessToken) {
            db.mset([key + ':access_token', implicitAccessToken
                    ], function(err, results2) {
                        req.session[apiName] = {};
                        req.session[apiName].authed = true;
                        if (config.debug) {
                            console.log('session[apiName].authed: ' + util.inspect(req.session));
                        }
                    });
        }

        if (reqQuery.oauth == 'authrequired' || (req.session[apiName] && req.session[apiName].authed)) {
            if (config.debug) {
                console.log('Session authed');
            }

            db.mget([key + ':apiKey',
                     key + ':apiSecret',
                     key + ':access_token',
                     key + ':refresh_token'
                ],
                function(err, results) {
                    var apiKey = (typeof reqQuery.apiKey == "undefined" || reqQuery.apiKey == "undefined")?results[0]:reqQuery.apiKey,
                        apiSecret = (typeof reqQuery.apiSecret == "undefined" || reqQuery.apiSecret == "undefined")?results[1]:reqQuery.apiSecret,
                        access_token = (implicitAccessToken) ? implicitAccessToken : results[2],
                        refresh_token = results[3];

                    var oa = new OAuth2(apiKey,
                           apiSecret,
                           apiConfig.oauth2.baseSite,
                           apiConfig.oauth2.authorizeURL,
                           apiConfig.oauth2.accessTokenURL);

                    if (apiConfig.oauth2.tokenName) {
                        oa.setAccessTokenName(apiConfig.oauth2.tokenName);
                    }

                    if (config.debug) {
                        console.log('Access token: ' + access_token);
                        console.log('Access token secret: ' + refresh_token);
                        console.log('key: ' + key);
                    }

                    if (apiConfig.oauth2.authorizationHeader && (apiConfig.oauth2.authorizationHeader == 'Y')) {
                        var headers = {Authorization : "Bearer " + access_token};
                    }

                    oa._request(httpMethod, privateReqURL, headers, requestBody, access_token, function (error, data, response) {
                        req.call = privateReqURL;

                        if (error) {
                            console.log('Got error: ' + util.inspect(error));

                            if (error.data == 'Server Error' || error.data == '') {
                                req.result = 'Server Error';
                            } else {
                                req.result = error.data;
                            }

                            res.statusCode = error.statusCode;

                            next();
                        } else {
                            if (options.headers) req.requestHeaders = options.headers;
                            if (requestBody) req.requestBody = requestBody;
                            req.resultHeaders = response.headers;
                            req.result = JSON.parse(data);
                            next();
                        }
                    });
                }
            );
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
            var timeStamp, sig;
            if (apiConfig.signature.type == 'signed_md5') {
                // Add signature parameter
                timeStamp = Math.round(new Date().getTime()/1000);
                sig = crypto.createHash('md5').update('' + apiKey + apiSecret + timeStamp + '').digest(apiConfig.signature.digest);
                options.path += '&' + apiConfig.signature.sigParam + '=' + sig;
            }
            else if (apiConfig.signature.type == 'signed_sha256') { // sha256(key+secret+epoch)
                // Add signature parameter
                timeStamp = Math.round(new Date().getTime()/1000);
                sig = crypto.createHash('sha256').update('' + apiKey + apiSecret + timeStamp + '').digest(apiConfig.signature.digest);
                options.path += '&' + apiConfig.signature.sigParam + '=' + sig;
            }
        }

        // Setup headers, if any
        if (reqQuery.headerNames && reqQuery.headerNames.length > 0) {
            if (config.debug) {
                console.log('Setting headers');
            }
            var headers = {};

            for (var x = 0, len = reqQuery.headerNames.length; x < len; x++) {
                if (config.debug) {
                  console.log('Setting header: ' + reqQuery.headerNames[x] + ':' + reqQuery.headerValues[x]);
                }
                if (reqQuery.headerNames[x] != '') {
                    headers[reqQuery.headerNames[x]] = reqQuery.headerValues[x];
                }
            }

            options.headers = headers;
        }
        if(options.headers === void 0){
            options.headers = {}
        }
        if (['POST','PUT'].indexOf(httpMethod) !== -1 && !options.headers['Content-Length']) {
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
        }

        var doRequest;
        if (options.protocol === 'https' || options.protocol === 'https:') {
            console.log('Protocol: HTTPS');
            options.protocol = 'https:';
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
            }

            res.statusCode = response.statusCode;

            var body = '';

            response.on('data', function(data) {
                body += data;
            });

            response.on('end', function() {
                delete options.agent;

                var responseContentType = response.headers['content-type'];

                if (/application\/javascript/.test(responseContentType)
                    || /application\/json/.test(responseContentType)) {
                    console.log(util.inspect(body));
                }

                // Set Headers and Call
                if (options.headers) req.requestHeaders = options.headers;
                if (requestBody) req.requestBody = requestBody;
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
            }
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
        fs.stat(path.join(config.apiConfigDir, pathName + '.json'), function (error, stats) {
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
        res.locals.apiDefinition = JSON.parse(JSON.minify(fs.readFileSync(path.join(config.apiConfigDir, req.params.api + '.json'), 'utf8')));

        // If the cookie says we're authed for this particular API, set the session to authed as well
        if (req.session[req.params.api] && req.session[req.params.api]['authed']) {
            req.session['authed'] = true;
        }
    } else {
        res.locals.apiInfo = apisConfig;
    }

    res.locals.session = req.session;
    next();
}

//
// Routes
//
app.get('/', function(req, res) {
    res.render('listAPIs', {
        title: config.title
    });
});

// Process the API request
app.post('/processReq', oauth, processRequest, function(req, res) {
    var result = {
        headers: req.resultHeaders,
        response: req.result,
        call: req.call,
        code: req.res.statusCode
    };
    if (req.requestHeaders) result.requestHeaders = req.requestHeaders;
    if (req.requestBody) result.requestBody = req.requestBody;
    res.send(result);
});

// Just auth
app.all('/auth', oauth);
app.all('/auth2', oauth2);


// OAuth callback page, closes the window immediately after storing access token/secret
app.get('/authSuccess/:api', oauthSuccess, function(req, res) {
    res.render('authSuccess', {
        title: 'OAuth Successful'
    });
});

// OAuth callback page, closes the window immediately after storing access token/secret
app.get('/oauth2Success/:api', oauth2Success, function(req, res) {
    res.render('authSuccess', {
        title: 'OAuth Successful'
    });
});

app.post('/upload', function(req, res) {
  res.redirect('back');
});

// API shortname, all lowercase
app.get('/:api([^\.]+)', function(req, res) {
    req.params.api=req.params.api.replace(/\/$/,'');
    res.render('api');
});

// Only listen on $ node app.js

if (!module.parent) {
    if (typeof config.socket != "undefined") {
        var args = [config.socket];
        console.log("Express server starting on UNIX socket %s", args[0]);
    } else {
        var args = [process.env.PORT || config.port, config.address];
        console.log("Express server starting on %s:%d", args[1], args[0]);
    }

    app.listen.apply(app, args);
}
