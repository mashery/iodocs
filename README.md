I/O Docs - Open Source in Node.js
=================================
Copyright 2011 Mashery, Inc.

[http://www.mashery.com](http://www.mashery.com)

[http://developer.mashery.com](http://developer.mashery.com)

SYNOPSIS
--------
I/O Docs is a live interactive documentation system for RESTful web APIs. By defining APIs at the resource, method and parameter
levels in a JSON schema, I/O Docs will generate a JavaScript client interface. API calls can be executed from this interface, which are then proxied through the I/O Docs server with payload data cleanly formatted (pretty-printed if JSON or XML).

You can find the latest version here: [https://github.com/mashery/iodocs](https://github.com/mashery/iodocs)

However, we recommend that you install I/O Docs with *npm*, the Node package manager. See instructions below.

BUILD/RUNTIME DEPENDENCIES
--------------------------
1. Node.js - server-side JS engine
2. npm - node package manager
3. Redis - key+value storage engine

Note: Node and some of the modules require compiler (like gcc). If you are on a Mac, you will need to install XCode. If you're on Linux, you'll need to install build-essentials, or something equivalent.

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
3. [connect-redis](https://github.com/visionmedia/connect-redis) - Redis session store
4. [querystring](https://github.com/visionmedia/node-querystring) - used to parse query string
5. [jade](http://jade-lang.com/) - the view engine

Note: hashlib is no longer a required module -- we're using the internal crypto module for signatures and digests.

RUNNING I/O DOCS
----------------
1. You will need to copy *config.json.sample* to *config.json*. The defaults will work, but feel free to change them.
2. node ./app.js
3. Point your browser to: [http://localhost:3000](http://localhost:3000)

QUICK API CONFIGURATION EXAMPLE
-------------------------------
Adding an API to the I/O Docs configuration is relatively simple.

First, append the new top-level service information to the `./public/data/apiconfig.json` file.

Example:
   
```js
"lowercaseapi": {
    "name": "Lower Case API",
    "protocol": "http",
    "baseURL": "api.lowercase.sample.com",
    "publicPath": "/v1",
    "auth": "key",
    "keyParam": "api_key_var_name"
}
```

Add the file `./public/data/lowercaseapi.json` to define the API.

Example:
   
```js
{
    "endpoints": [
        {
            "name": "Resource Group A",
            "methods": [
                {
                    "MethodName": "Method A1",
                    "Synopsis": "Grabs information from the A1 data set",
                    "HTTPMethod": "GET",
                    "URI": "/a1/grab",
                    "RequiresOAuth": "N",
                    "parameters": [
                        {
                            "Name": "param_1_name",
                            "Required": "Y",
                            "Default": "",
                            "Type": "string",
                            "Description": "Description of the first parameter."
                        }
                    ]
                }
            ]
        }
    ]
}
```

TOP-LEVEL SERVICE CONFIG DETAILS - apiconfig.json
-------------------------------------------------
The *apiconfig.json* file contains high-level information about an API.

### Example #1 - Explanation of each field in an example API config that uses basic key authentication:

```js
"lower": {
   "name": "My API",
   "protocol": "http",
   "baseURL": "api.lowercase.sample.com",
   "publicPath": "/v1",
   "auth": "key",
   "keyParam": "api_key_var_name"
}
```

Line:

1. Handle of the API. It is used to pull up the client 
   interface in the URL:

    Ex: http://127.0.0.1:3000/lower

2. "name" key value is a string that holds the name
    of the API that is used in the Jade template output.

3. "protocol" key value is either *http* or *https*

4. "baseURL" key value is the host name of
    the API calls (should not include protocol)

5. "publicPath" key value is the full path prefix prepended
    to all method URIs. This value often includes the version
    in RESTful APIs.

    Ex: "/v1"

    In the Example #3 below, there is also "privatePath"
    which is used for endpoints behind protected resources.

6. "auth" key value is the auth method. Valid values can be:

         "key" - simple API key in the URI
         "oauth1" - OAuth 1.0/1.0a
         "" - no authentication

7. "keyParam" key value is name of the query parameter that
    is added to an API request when the "auth" key value from
    (5) is set to "key"

8. Closing curly-bracket ;)


---

### Example #2 - Explanation of each field in an example API config that uses basic key authentication with signatures (signed call).

```js
"upper": {
   "name": "Upper API",
   "protocol": "http",
   "baseURL": "api.upper.sample.com",
   "publicPath": "/v3",
   "auth": "key",
   "keyParam": "api_key_var_name",
   "signature": {
      "type": "signed_md5",
      "sigParam": "sig",
      "digest": "hex"  
   }
}
```

Line:

1. Handle of the API. It is used to pull up the client 
   interface in the URL:

    Ex: http://127.0.0.1:3000/upper

2. "name" key value is a string that holds the name
    of the API that is used in the Jade template output.

3. "protocol" key value is either *http* or *https*

4. "baseURL" key value is the host name of
    the API calls (should not include protocol)

5. "publicPath" key value is the full path prefix prepended
    to all method URIs. This value often includes the version
    in RESTful APIs.

    Ex: "/v3"

    In the Example #3 below, there is also "privatePath"
    which is used for endpoints behind protected resources.

6. "auth" key value is the auth method. Valid values can be:

         "key" - simple API key in the URI
         "oauth1" - OAuth 1.0/1.0a
         "" - no authentication

7. "keyParam" key value is the name of the query parameter that
    is added to an API request when the "auth" key value from
    (5) is set to "key"

8. "signature" is a JSON object that contains the details about
   the API call signing requirements. The signature routine coded
   in app.js is a hash of the string concatenation of API key, 
   API key secret and timestamp (epoch).

9. "type" key value is either *signed_md5* or *signed_sha256*.
   More signature methods are available with crypto.js, but have
   not been included in the code as options.

10. "sigParam" key value is the name of the query parameter that
    is added to an API request that holds the digital signature.

11. "digest" key value is the digest algorithm that is used.
    Values can be *hex*, *base64* or *binary*.

12. Closing curly-bracket for the "signature" object

13. Closing curly bracket for main object.


---


### Example #3 - Twitter API config that uses 3-legged OAuth

```js
"twitter": {
    "name": "Twitter API",
    "protocol": "http",
    "baseURL": "api.twitter.com",
    "publicPath": "/1",
    "privatePath": "/1",
    "booleanTrueVal": "true",
    "booleanFalseVal": "false",
    "auth": "oauth",
    "oauth" : {
       "type": "three-legged",
       "requestURL": "https://api.twitter.com/oauth/request_token",
       "signinURL": "https://api.twitter.com/oauth/authorize?oauth_token="
       "accessURL": "https://api.twitter.com/oauth/access_token",
       "version": "1.0",
       "crypt": "HMAC-SHA1",
   }
   "keyParam": "",
}
```

Line:

1. Handle of the API. It is used to pull up the client
    interface in the URL:

    Ex: http://127.0.0.1:3000/twitter

2. "name" key value is a string that holds the name
    of the API that is used in the Jade template output.

3. "protocol" key value contains either *http* or *https*,
    but you're welcome to try other protocols.

4. "baseURL" key value is the base URL that accepts
    the API calls (should not include protocol)

5. "publicPath" key value is the path prefix prepended
    to all method URIs for non-protected method resources.
    This value often includes the version in RESTful APIs.

    Ex: "/v1", "/1", etc.

6. "privatePath" key value is the path prefix prepended
    to all method URIs for OAuth protected method resources.
    This value is most often the version in RESTful APIs.

    Ex: "/v1", "/1", etc.

7. "booleanTrueVal" key value is the default value for
    true Boolean values that are sent in API requests.
    Some APIs are designed to accept a wide variety
    of true derivatives, but some are very strict about
    this value.

    Ex: "true", "TRUE", "True", "t", "T", "1", etc.
    Default: "true"

8. "booleanFalseVal" key value is the default value for
    false Boolean values that are sent in API requests.
    Some APIs are designed to accept a wide variety
    of false derivatives, but some are very strict about
    this value.

    Ex: "false", "FALSE", "False", "f", "F", "0", etc.
    Default: "false"

9. "auth" key value is set to "oauth" when OAuth is the
    authentication mechanism. Field is required.

10. "oauth" key value is a JSON object that contains the
    OAuth implementation details for this API. Field is
    required when "auth" value is "oauth".

11. "type" key value is the OAuth is the authorization flow
     used for this API. Valid values are "three-legged" (normal
     authorization flow) and "two-legged" (no authorization flow).

12. "requestURL" key value is the Request Token URL used in
    the OAuth dance (used in *three-legged* scenario).

13. "signinURL" key value is the User Authorization URL used
    in the OAuth dance (where the user is redirected to provide
    their credentials -- used in *three-legged* scenario).

14. "accessURL" key value is the Access Token URL used in the
    OAuth dance (used in *three-legged* scenario).

15. "version" key value is the OAuth version. As of I/O Docs v1.1,
    "1.0" is the only supported version. Note: use "1.0" for both
    1.0 and 1.0A implementations.

16. "crypt" key value is the OAuth signature method. As of I/O Docs
    v1.1 "HMAC-SHA1" is the only supported signing method.

17. Closing curly bracket for "oauth" JSON object.

18. "keyParam" key value is blank when OAuth is the authentication
    method.

19. Closing curly bracket for main object.


API-LEVEL CONFIG DETAILS
========================
For every API that is configured in *apiconfig.json* a JSON config file must exist.
You should look at the *./public/data/* directory for examples.  

### Example #1 - Explanation of each field in an example API-level configuration

```js
{
   "name":"User Resources",
   "methods":[
      {
        "MethodName":"users/show",
         "Synopsis":"Returns extended user information",
         "HTTPMethod":"GET",
         "URI":"/users/show.json",
         "RequiresOAuth":"N",
         "parameters":[
             {
                "Name":"user_id",
                "Required":"Y",
                "Default":"",
                "Type":"string",
                "Description":"The ID of the user",
             },
             {
                "Name":"cereal",
                "Required":"Y",
                "Default":"fruitscoops",
                "Type":"enumerated",
                "EnumeratedList": [
                    "fruitscoops",
                    "sugarbombs",
                    "frostedteeth"
                   ],
                "EnumeratedDescription": {
                    "fruitscoops": "Fruit Scoops (packed with fruit goodness)",
                    "sugarbombs": "Sugar Bombs (filled with sugar)",
                    "frostedteeth": "Frosted Teeth (sugar coating)"
                   },
                "Description":"The type of cereal desired"
             },
             {
                "Name":"skip_status",
                "Required":"N",
                "Default":"",
                "Type":"boolean",
                "Description":"If true, status not included"
             }
        ]
    }]
}
```

Line:

3. "name" key holds the value of the Resource name. Methods are grouped into Resources.

4. "methods" key value is an array of JSON objects (each one being a method)

6. "MethodName" key value is a string that is displayed via the view template.

7. "Synopsis" key value is a short description of the method.

8. "HTTPMethod" key value can be either GET, POST, DELETE or PUT (all caps)

9. "URI" key value is the path to the method that is appended to the *baseURL* and the public/private path.

10. "RequiresOAuth" key value is either Y or N. If Y, the *privatePath* is used from the top-level config. If N, the *publicPath* is used from the top-level config.

11. "parameters" key value is an array of JSON objects (each one being a parameter)

13. "Name" key value is a string that contains the name of the parameter.

14. "Required" key value is either Y or N. If Y, the parameter will be output as bold.

15. "Default" key value is a string, containing a default value that will be automatically populated onto the form.

16. "Type" key value can be an arbitrary string that describes the variable type; however, the value is *boolean* or *enumerated* a drop-down (select) box will appear.

17. "Description" key value is a string, containing the description of the parameter.

23. "Type" key value is set to *enumerated* for this parameter.

24. "EnumeratedList" key value is an array of enumerated values that will render a drop-down (select box) on the form.

25. "EnumeratedDescription" key value is an object of enumerated values as keys, and their descriptions as values that will be displayed below the Description.

26. Each value in the list is a string.

27. "Type" key value is *boolean* that will render a drop-down (select box) on the form for *true* and *false*.

SUPPORT
=======
If you need any help with I/O Docs, you can reach out to us via the GitHub Issues page at:
<code>[http://github.com/mashery/iodocs/issues](http://github.com/mashery/iodocs/issues)</code>
