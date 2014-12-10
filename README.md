I/O Docs Community Edition in Node.js
=====================================
Copyright 2011-2014 Mashery, Inc.

[http://www.mashery.com](http://www.mashery.com)

[http://developer.mashery.com](http://developer.mashery.com)

MAJOR CHANGE LOG
================
### 2014-07-22 - Summer Release Feature Enhancements
#### This set of updates addresses several feature requests around POST/PUT calls. There are several other enhancements listed below. Note, if you are using a version of I/O Docs Community Edition that pre-dates this release, you will need to update your schema. The structure is similar in many ways, but the top level objects have been renamed, as well as many of the key names.

* Numerous schema changes and improvements
  * Support for references
  * Base paths and authorization moved from apiConfig to api{name}.json files
  * More robust/extensible auth definition block
* POST/PUT request body capabilities added
  * Array type and interface added for use in request body
  * Size and order support
  * Serialized JSON support
* Parameter location enhancements
  * Placement in the query string, path or header
* Method form UI generation driven by Alpaca/jQuery

SYNOPSIS
--------
I/O Docs is a live interactive documentation system for RESTful web APIs. By defining APIs at the resource, method and parameter levels in a JSON schema, I/O Docs will generate a JavaScript client interface. API calls can be executed from this interface, which are then proxied through the I/O Docs server with payload data cleanly formatted (pretty-printed if JSON or XML). Basic HTML text tags are enabled in the JSON schema.

You can find the latest version here: [https://github.com/mashery/iodocs](https://github.com/mashery/iodocs)

However, we recommend that you install I/O Docs with *npm*, the Node package manager. See instructions below.

BUILD/RUNTIME DEPENDENCIES
--------------------------
1. Node.js - server-side JS engine
2. npm - node package manager
3. Redis - key+value storage engine 

Build note: If you're not using a package manager, Node and some of the modules require compiler (like gcc). If you are on a Mac, you will need to install XCode. If you're on Linux, you'll need to install build-essentials, or something equivalent.

Redis note: Redis is considered a runtime dependency. It is used to store OAuth information server side. If you are not implementing OAuth, redis is not required. You can simply remove the redis block from config.json. However, if you do implement OAuth down the road, you will need to use Redis, otherwise you will see 500 errors during the auth dance.

INSTALLATION INSTRUCTIONS FOR NODE, NPM & REDIS
-----------------------------------------------
1. Node.js - [https://github.com/joyent/node/wiki/Installation](https://github.com/joyent/node/wiki/Installation)
2. npm (Node package manager) - [https://github.com/isaacs/npm](https://github.com/isaacs/npm)
3. Redis - [http://redis.io/download](http://redis.io/download)

INSTALLATION INSTRUCTIONS FOR I/O DOCS
--------------------------------------
From the command line type in:
<pre>  git clone http://github.com/mashery/iodocs.git
  cd iodocs
  npm install
</pre>


### Node Module Dependencies
These will be automatically installed when you use any of the above *npm* installation methods above.

1. [express](http://expressjs.com/) - framework
2. [oauth](https://github.com/ciaranj/node-oauth) - oauth library
3. [redis](https://github.com/mranney/node_redis) - connector to Redis
4. [connect-redis](https://github.com/visionmedia/connect-redis) - Redis session store
5. [querystring](https://github.com/visionmedia/node-querystring) - used to parse query string
6. [jade](http://jade-lang.com/) - the view engine
7. [supervisor](https://github.com/isaacs/node-supervisor) - restart node upon an error or changed javascript file

Note: hashlib is no longer a required module -- we're using the internal crypto module for signatures and digests.

RUNNING I/O DOCS
----------------
**Create your config** file by copying the default config:

```
cp config.json.sample config.json
```
The defaults will work, but feel free to change them.

**Run a Redis instance:**

```
redis-server
```

**Start I/O Docs**:

```
npm start (*nix, Mac OSX)
npm run-script startwin (Windows)
```

**Start I/O Docs with a custom config file**:

```
./node_modules/.bin/supervisor -e 'js|json' -- app --config-file ../config.json (*nix, Mac OSX)
supervisor -e 'js' -- app --config-file ../config.json (Windows)
```

Ideally, the `--config-file` arg would be possible to use with `npm start`, but until
[npm issue #3494](https://github.com/isaacs/npm/issues/3494) is resolved, this is not supported.

**Point your browser** to: [localhost:3000](http://localhost:3000)

CONFIGURING API DEFINITION LOCATION
-----------------------------------
API definitions are, by default, stored in `./public/data/` and described by `./public/data/"apiName".json` and referenced by `./public/data/apiconfig.json`. This can
be overridden in `config.json` by setting the `"apiConfigDir"` property.


BASIC AUTH FOR SERVER
---------------------
Enabling HTTP basic authentication on the server is simple. By default, the username and password values are empty ("").

1. Open up *config.json*
2. Navigate down to the *basicAuth* object
3. Add values for username and password within the object


QUICK API CONFIGURATION EXAMPLE
-------------------------------
Adding an API to the I/O Docs configuration is relatively simple.

First, append the api name to the `./public/data/apiconfig.json` file.

Example:
   
```js
"lowercaseapi": {
    "name": "Lower Case API"
}
```

Add the file `./public/data/lowercaseapi.json` to define the API. 

Example:
   
```js

{
    "name": "Lower Case API",
    "description": "An example api.",
    "protocol": "rest",
    "basePath": "http://api.lowercase.sample.com",
    "publicPath": "/v1",
    "auth": {
        "key": {
            "param": "key"
        }
    },
    "headers": {
        "Accept": "application/json",
        "Foo": "bar"
    },
    "resources": {
        "Resource Group A": {
            "methods": {
                "MethodA1": {
                    "name": "Method A1",
                    "path": "/a1/grab",
                    "httpMethod": "GET",
                    "description": "Grabs information from the A1 data set.",
                    "parameters": {
                        "param1": {
                            "type": "string",
                            "required": true,
                            "default": "",
                            "description": "Description of the first parameter."
                        }
                    }
                },
                "MethodA1User": {
                    "name": "Method A1 User",
                    "path": "/a1/grab/{userId}",
                    "httpMethod": "GET",
                    "description": "Grabs information from the A1 data set for a specific user",
                    "parameters": {
                        "param1": {
                            "type": "string",
                            "required": true,
                            "default": "",
                            "description": "Description of the first parameter."
                        },
                        "userId": {
                            "type": "string",
                            "required": true,
                            "default": "",
                            "description": "The userId parameter that is in the URI."
                        }
                    }
                }
            }
        }
    }
}
```

By default the parameters are added to the query string. But if the URI contains a named variable, it will substitute the value in the path.

TOP-LEVEL SERVICE CONFIG DETAILS
-------------------------------------------------

The *apiconfig.json* file contains the name of an API to show upon initiation.

```js
"lowercaseapi": {
        "name": "Lower Case API"
}
```

The high-level information about an API is set in the config JSON file.

### Example #1 - Explanation of each field in an example API config that uses basic key authentication:

```js
{
    "name": "Lower Case API",
    "protocol": "rest",
    "basePath": "http://api.lowercase.sample.com",
    "publicPath": "/v1",
    "auth": {
        "key": {
            "param": "key",
            "location": "query"
        }
    },
    "headers": {
        "Accept": "application/json",
        "Foo": "bar"
    },
    ...
```

Line:

(1). "name" key value is a string that holds the name
    of the API that is used in the Jade template output. Also true in *apiconfig.json*.

(2). "protocol" key value is either *rest* or *soap*

(3). "basePath" key value is the host path of
    the API calls

(4). "publicPath" key value is the full path prefix prepended
    to all method URIs. This value often includes the version
    in RESTful APIs.

    Ex: "/v1"

    In the Example #3 below, there is also "privatePath"
    which is used for endpoints behind protected resources.

(5). "auth" container holds the authorization information. If absent, API requires no authorization.

(6). The key value that describes the auth method. Valid values can be:
         "key" - simple API key in the URI
         "oauth" - OAuth 1.0/2.0
         "" - no authentication

(7). "param" key value is name of the parameter that
    is added to an API request when the "auth" key value from
    (6) is set to "key".

(8). "location" (optional) key value sets where the api key will go in the request. Defaults to "query".
    supported values: "query" and "header".

(9). "headers" object contains key value pairs of HTTP headers
    that will be sent for each request for API. These are
    static key/value pairs.

---

### Example #2 - Explanation of each field in an example API config that uses basic key authentication with signatures (signed call).

```js
{
    "name": "Lower Case API",
    "protocol": "rest",
    "basePath": "http://api.lowercase.sample.com",
    "publicPath": "/v1",
    "auth": {
        "key": {
            "param": "key",
            "signature": {
                "type": "signed_md5",
                "param": "sig",
                "digest": "hex",
                "location": "header"
            }
        }
    },
    ...
```

Line:

(1). "name" key value is a string that holds the name
    of the API that is used in the Jade template output. Also true in *apiconfig.json*.

(2). "protocol" key value is either *rest* or *soap*

(3). "basePath" key value is the host path of
    the API calls

(4). "publicPath" key value is the full path prefix prepended
    to all method URIs. This value often includes the version
    in RESTful APIs.

    Ex: "/v1"

    In the Example #3 below, there is also "privatePath"
    which is used for endpoints behind protected resources.

(5). "auth" container holds the authorization information. If absent, API requires no authorization.

(6). The key value that describes the auth method. Valid values can be:
         "key" - simple API key in the URI
         "oauth" - OAuth 1.0/2.0

(7). "param" key value is name of the parameter that
    is added to an API request when the "auth" key value from
    (6) is set to "key".

(8). "signature" is a JSON object that contains the details about
   the API call signing requirements. The signature routine coded
   in app.js is a hash of the string concatenation of API key, 
   API key secret and timestamp (epoch).

(9). "type" key value is either *signed_md5* or *signed_sha256*.
   More signature methods are available with crypto.js, but have
   not been included in the code as options.

(10). "param" key value is the name of the parameter that
    is added to an API request that holds the digital signature.

(11). "digest" key value is the digest algorithm that is used.
    Values can be *hex*, *base64* or *binary*.

(12). "location" (optional) key value sets where the signature will go in the request. Defaults to "header".


---


### Example #3 - Foursquare API config that uses 3-legged OAuth 2.0

```js
{
    "name": "Foursquare (OAuth 2.0 Auth Code)",
    "protocol": "rest",
    "basePath": "https://api.foursquare.com",
    "privatePath": "/v2",
    "auth": {
        "oauth": {
            "version": "2.0",
            "type": "authorization-code",
            "base_uri": "https://foursquare.com/",
            "authorize_uri": "oauth2/authenticate",
            "access_token_uri": "oauth2/access_token_uri",
            "token": {
                "param": "oauth_token",
                "location": "query"
            }
        }
    },
    ...
```

Line:

1. "name" key value is a string that holds the name
    of the API that is used in the Jade template output. Also true in *apiconfig.json*.

2. "protocol" key value is either *rest* or *soap*

3. "basePath" key value is the host path of
    the API calls

4. "privatePath" key value is the path prefix prepended
    to all method URIs for OAuth protected method resources.
    This value is most often the version in RESTful APIs.

    Ex: "/v1", "/1", etc.

5. "auth" container holds the authorization information. If absent, API requires no authorization.

6. "oauth" key value is a JSON object that contains the
    OAuth implementation details for this API.

7. "version" key value is the OAuth version. OAuth 1.0 and 2.0 supported.

8. "type" key value is the OAuth 2 authorization flow
    used for this API. Valid values are "authorization-code", 
    "client_credentials", and "implicit", named for each grant
    found here: "http://tools.ietf.org/html/rfc6749". 

9. "base_uri" key value is the base website URL used in
    the OAuth 2 dance. It is required.

10. "authorize_uri" key value is the url string used to 
    retrieve the authorization token in the 
    "authorization-code" OAuth 2 flow. This is not necessary 
    in any other OAuth 2 flow.

11. "access_token_uri" key value is the url string used to 
    retrieve the access (Bearer) token in any OAuth 2 flow.
    This is required in all OAuth 2 flows. 

12. "token" container instructs I/O Docs where to use the access/bearer token on requests. If the "location" is set 
    as the default token name when making calls with the 
    access token in the url query parameters. Not required if 
    "access_token" is used. 
    
13. "param" is the parameter name for access token. This is valid only if the location value is "query"

14. "location" (optional) key value that sets where the bearer token will go. Acceptable values are: "header" and "query". If set to header, I/O Docs will follow the "Authorization: Bearer XXX" pattern. If set to "query", the name of the key will be dictated by the "param" value on line 13.

Additional Note: All redirect URIs for the Foursquare API & your 
Foursqare app must be set through the Foursquare developer site. 
For the iodocs Foursquare API test these URIs are :
"http://localhost:3000/foursquare", "http://localhost:3000/oauth2Success/foursquare"

For the Rdio API test, beta access to their new API is necessary. 
The site for the beta API is: "http://www.rdio.com/developers/"



API-LEVEL CONFIG DETAILS
========================
For every API that is configured in *apiconfig.json* a JSON config file must exist.
You should look at the *./public/data/* directory for examples.  

### Example #1 - Explanation of each field in an example API-level configuration

```js
{
    "name": "Lower Case API",
    "protocol": "rest",
    "basePath": "http://api.lowercase.sample.com",
    "resources": {
        "User Resources": {
            "methods": {
                "showUsers": {
                    "name": "users/show",
                    "description": "Returns extended user information",
                    "httpMethod": "GET",
                    "path": "/users/show.json",
                    "parameters": {
                        "user_id": {
                            "title":"user_id",
                            "required":true,
                            "default":"",
                            "type":"string",
                            "description":"The ID of the user"
                        },
                        "cereal": {
                            "title": "cereal",
                            "required": true,
                            "default": "fruitscoops",
                            "type": "string",
                            "enum": ["fruitscoops","sugarbombs","frostedteeth"],
                            "description": "The type of cereal desired."
                        },
                        "skip_status": {
                            "title": "skip_status",
                            "required": false,
                            "default": "false",
                            "type":"boolean",
                            "description":"If true, status not included."
                            "location": "header"
                        },
                        "include_status": {
                            "title": "include_status",
                            "required": false,
                            "default": false,
                            "type": "boolean",
                            "description": "If true, status included."
                            "booleanValues": ["yes","no"]
                        },
                        "review": {
                            "title": "review",
                            "required": false,
                            "default": "",
                            "type": "textarea",
                            "description": "The user's review to submit."
                        }
                    }
                }
            }
        }
    }
```

Line:

(1). "name" key value is a string that holds the name
    of the API that is used in the Jade template output. Also true in *apiconfig.json*.

(2). "protocol" key value is either *rest* or *soap*

(3). "basePath" key value is the host path of
    the API calls

(4). "resources" JSON container. Methods are grouped into resources.

(5). The first resource.

(6). "methods" key value is an array of JSON objects (each one being a method)

(7). The first method.

(8). "name" key value is a string that is displayed via the view template. The name of the method.

(9). "description" key value is a short description of the method.

(10). "httpMethod" key value can be either GET, POST, DELETE or PUT (all caps)

(11). "path" key value is the path to the method that is appended to the *baseURL* and the public/private path.

(12). "parameters" key value is a JSON objects containing the parameters

(13). The first parameter.

(14). "title" key value is a string that contains the name of the parameter.

(15). "required" key value is either true or false.

(16). "default" key value is a string, containing a default value that will be automatically populated onto the form.

(17). "type" key value can be an arbitrary string that describes the variable type; however, the value is *boolean* or *enumerated* a drop-down (select) box will appear.

(18). "description" key value is a string, containing the description of the parameter.

(25). "enum" key value is an array of enumerated values that will render a drop-down (select box) on the form.

(32). "type" key value is *boolean* that will render a drop-down (select box) on the form for *true* and *false*.

(24). "location" (optional) key value determines where the parameter will go. Can be "query" or "header". Default to "query".

(43). "booleanValues" is an array of [true, false] alternatives that will instead populate the drop down box.

(49). "type" key value is *textarea* that will render a textarea box, a multi-line text input control.


### Example #2 - Request Bodies, Arrays, & Objects

```js
{
    "name": "Lower Case API",
    "protocol": "rest",
    "basePath": "http://api.lowercase.sample.com",
    "schemas": {
        "showUsers": {
            "properties": {
                "bodyParam": {
                    "title":"bodyParam",
                    "required":true,
                    "default":"",
                    "type":"string",
                    "description":"An example parameter in the body"
                },
                "arrayExample": {
                    "type": "array",
                    "items": {
                        "title":"arrayExample",
                        "required": true,
                        "default": "foobar",
                        "type":"string",
                        "description":"An array in the body."
                    }
                },
                "objectExample": {
                    "type": "object",
                    "properties": {
                        "element1": {
                            "title": "element1",
                            "required":false,
                            "type":"string",
                            "description": "An element in a JSON object.",
                            "default": "el1"
                        },
                        "element2": {
                            "title": "element2",
                            "required":false,
                            "type":"string",
                            "description": "Second element in a JSON object.",
                            "default": "el2"
                        },
                        "subObjectEx": {
                            "type": "object",
                            "properties": {
                                "element3": {
                                    "title": "element3",
                                    "required":false,
                                    "type":"string",
                                    "description": "An element within an object within an object.",
                                    "default": "el3"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "resources": {
        "User Resources": {
            "methods": {
                "showUsers": {
                    "name": "users/show",
                    "description": "Returns extended user information",
                    "httpMethod": "GET",
                    "path": "/users/show.json",
                    "request": {
                        "$ref": "showUsers"
                    },
                    "parameters": {
                        "user_id": {
                            "title":"user_id",
                            "required":true,
                            "default":"",
                            "type":"string",
                            "description":"The ID of the user"
                        }
                    }
                }
            }
        }
    }
```

Line:

(4). "schemas" JSON object. Contains the parameters that will go into the request body for all methods.

(5). The first method to contain a request body.

(6). "properties" JSON object containing the parameters that will go into the request body.

(7). The first request body parameter. The format is the same as in "resources"

(14). An array parameter. An array parameter can add as many values to the parameter as necessary. The default location for an array will always be "body".

(15). "type" key value set to *array*. Necessary for the array functionality to work.

(16). "items" JSON object that contains the parameter information. Format is consistent from resources parameters. 

(24). A JSON object parameter.

(25). "type" key value set to *object*. Necessary for the object functionality to work.

(26). "properties" JSON object containing the parameters that will go into the object.

(41). An object embedded within an object.

(66). "request" JSON object holds the reference to the request body parameters

(67). "$ref" key value is the reference to the same string in "schemas"


SUPPORT
=======
If you need any help with I/O Docs, you can reach out to us via the GitHub Issues page at:
<code>[http://github.com/mashery/iodocs/issues](http://github.com/mashery/iodocs/issues)</code>
