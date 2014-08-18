/*!
Alpaca Version 1.1.3

Copyright 2014 Gitana Software, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); 
you may not use this file except in compliance with the License. 

You may obtain a copy of the License at 
	http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
See the License for the specific language governing permissions and 
limitations under the License. 

For more information, please contact Gitana Software, Inc. at this
address:

  info@gitanasoftware.com
*/
/**
 * UMD wrapper for compatibility with browser, Node and AMD.
 *
 * Based on:
 *   https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory)
{
    var umdEnabled = true;
    if (root && typeof(root.umd) != "undefined") {
        umdEnabled = root.umd;
    }

    if (umdEnabled && typeof exports === 'object')
    {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        //module.exports = factory(require('b'));
        module.exports = factory();
    }
    else if (umdEnabled && typeof define === 'function' && define.amd)
    {
        // AMD. Register as an anonymous module.
        //define(['b'], factory);
        define('alpaca', ['jquery', 'jquery-tmpl', 'jquery-ui'], factory);
    }
    else
    {
        // Browser globals
        //root.returnExports = factory(root.b);
        root["Alpaca"] = factory();
    }

}(this, function ($, tmpl, jQueryUI, ace) {

    //use b in some fashion.

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    //return {};

    /*!
Alpaca Version 1.1.3

Copyright 2014 Gitana Software, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); 
you may not use this file except in compliance with the License. 

You may obtain a copy of the License at 
	http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
See the License for the specific language governing permissions and 
limitations under the License. 

For more information, please contact Gitana Software, Inc. at this
address:

  info@gitanasoftware.com
*/
/*
 Based on Base.js 1.1a (c) 2006-2010, Dean Edwards
 Updated to pass JSHint and converted into a module by Kenneth Powers
 License: http://www.opensource.org/licenses/mit-license.php

 GitHub: https://github.com/KenPowers/Base.js-Module
 */
/*global define:true module:true*/
/*jshint eqeqeq:true*/
(function (name, global, definition) {
//    if (typeof module !== 'undefined') {
//        module.exports = definition();
//    } else if (typeof define !== 'undefined' && typeof define.amd === 'object') {
//        define(definition);
//    } else {
        global[name] = definition();
//    }
})('Base', this, function () {
    // Base Object
    var Base = function () {};

    // Implementation
    Base.extend = function (_instance, _static) { // subclass
        var extend = Base.prototype.extend;
        // build the prototype
        Base._prototyping = true;
        var proto = new this();
        extend.call(proto, _instance);
        proto.base = function () {
            // call this method from any other method to invoke that method's ancestor
        };
        delete Base._prototyping;
        // create the wrapper for the constructor function
        //var constructor = proto.constructor.valueOf(); //-dean
        var constructor = proto.constructor;
        var klass = proto.constructor = function () {
            if (!Base._prototyping) {
                if (this._constructing || this.constructor === klass) { // instantiation
                    this._constructing = true;
                    constructor.apply(this, arguments);
                    delete this._constructing;
                } else if (arguments[0] !== null) { // casting
                    return (arguments[0].extend || extend).call(arguments[0], proto);
                }
            }
        };
        // build the class interface
        klass.ancestor = this;
        klass.extend = this.extend;
        klass.forEach = this.forEach;
        klass.implement = this.implement;
        klass.prototype = proto;
        klass.toString = this.toString;
        klass.valueOf = function (type) {
            return (type === 'object') ? klass : constructor.valueOf();
        };
        extend.call(klass, _static);
        // class initialization
        if (typeof klass.init === 'function') klass.init();
        return klass;
    };

    Base.prototype = {
        extend: function (source, value) {
            if (arguments.length > 1) { // extending with a name/value pair
                var ancestor = this[source];
                if (ancestor && (typeof value === 'function') && // overriding a method?
                    // the valueOf() comparison is to avoid circular references
                    (!ancestor.valueOf || ancestor.valueOf() !== value.valueOf()) && /\bbase\b/.test(value)) {
                    // get the underlying method
                    var method = value.valueOf();
                    // override
                    value = function () {
                        var previous = this.base || Base.prototype.base;
                        this.base = ancestor;
                        var returnValue = method.apply(this, arguments);
                        this.base = previous;
                        return returnValue;
                    };
                    // point to the underlying method
                    value.valueOf = function (type) {
                        return (type === 'object') ? value : method;
                    };
                    value.toString = Base.toString;
                }
                this[source] = value;
            } else if (source) { // extending with an object literal
                var extend = Base.prototype.extend;
                // if this object has a customized extend method then use it
                if (!Base._prototyping && typeof this !== 'function') {
                    extend = this.extend || extend;
                }
                var proto = {
                    toSource: null
                };
                // do the "toString" and other methods manually
                var hidden = ['constructor', 'toString', 'valueOf'];
                // if we are prototyping then include the constructor
                for (var i = Base._prototyping ? 0 : 1; i < hidden.length; i++) {
                    var h = hidden[i];
                    if (source[h] !== proto[h])
                        extend.call(this, h, source[h]);
                }
                // copy each of the source object's properties to this object
                for (var key in source) {
                    if (!proto[key]) extend.call(this, key, source[key]);
                }
            }
            return this;
        }
    };

    // initialize
    Base = Base.extend({
        constructor: function () {
            this.extend(arguments[0]);
        }
    }, {
        ancestor: Object,
        version: '1.1',
        forEach: function (object, block, context) {
            for (var key in object) {
                if (this.prototype[key] === undefined) {
                    block.call(context, object[key], key, object);
                }
            }
        },
        implement: function () {
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] === 'function') {
                    // if it's a function, call it
                    arguments[i](this.prototype);
                } else {
                    // add the interface using the extend method
                    this.prototype.extend(arguments[i]);
                }
            }
            return this;
        },
        toString: function () {
            return String(this.valueOf());
        }
    });

    // Return Base implementation
    return Base;
});/*
 json2.js
 2012-10-08

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());/*!
 * JSONSchema Validator - Validates JavaScript objects using JSON Schemas
 *    (http://www.json.com/json-schema-proposal/)
 *
 * Copyright (c) 2007 Kris Zyp SitePen (www.sitepen.com)
 * Licensed under the MIT (MIT-LICENSE.txt) license.
 To use the validator call the validate function with an instance object and an optional schema object.
 If a schema is provided, it will be used to validate. If the instance object refers to a schema (self-validating),
 that schema will be used to validate and the schema parameter is not necessary (if both exist,
 both validations will occur).
 The validate method will return an array of validation errors. If there are no errors, then an
 empty list will be returned. A validation error will have two properties:
 "property" which indicates which property had the error
 "message" which indicates what the error was
 */
(function($) {

    /** @namespace */
    Validator = {

        /**
         * Summary:
         * To use the validator call JSONSchema.validate with an instance object and an optional schema object.
         * If a schema is provided, it will be used to validate. If the instance object refers to a schema (self-validating),
         * that schema will be used to validate and the schema parameter is not necessary (if both exist,
         * both validations will occur).
         * The validate method will return an object with two properties:
         * valid: A boolean indicating if the instance is valid by the schema
         * errors: An array of validation errors. If there are no errors, then an
         * empty list will be returned. A validation error will have two properties:
         * property: which indicates which property had the error
         * message: which indicates what the error was
         *
         * @param {Any} instance
         * @param {Object} schema
         *
         * @returns {object} result validation result
         */
        validate: function (/*Any*/instance, /*Object*/schema) {
            return Validator._validate(instance, schema, {changing: false});//, coerce: false, existingOnly: false});
        },

        /**
         * Summary:
         * The checkPropertyChange method will check to see if an value can legally be in property with the given schema
         * This is slightly different than the validate method in that it will fail if the schema is readonly and it will
         * not check for self-validation, it is assumed that the passed in value is already internally valid.
         * The checkPropertyChange method will return the same object type as validate, see JSONSchema.validate for
         * information.
         *
         * @param {Any} value
         * @param {Object} schema
         * @param {String} property
         */
        checkPropertyChange : function(/*Any*/value, /*Object*/schema, /*String*/property) {
            return Validator._validate(value, schema, {changing: property || "property"});
        },

        /**
         * @internal
         * @param instance
         * @param schema
         * @param options
         */
        _validate : function(/*Any*/instance, /*Object*/schema, /*Object*/options) {

            if (!options) options = {};
            var _changing = options.changing;

            var errors = [];
            // validate a value against a property definition
            function checkProp(value, schema, path, i) {

                var l;
                path += path ? typeof i == 'number' ? '[' + i + ']' : typeof i == 'undefined' ? '' : '.' + i : i;
                function addError(message) {
                    errors.push({property:path,message:message});
                }

                if ((typeof schema != 'object' || schema instanceof Array) && (path || typeof schema != 'function') && !(schema && schema.type)) {
                    if (typeof schema == 'function') {
                        if (!(value instanceof schema)) {
                            addError("is not an instance of the class/constructor " + schema.name);
                        }
                    } else if (schema) {
                        addError("Invalid schema/property definition " + schema);
                    }
                    return null;
                }
                if (_changing && schema.readonly) {
                    addError("is a readonly field, it can not be changed");
                }
                if (schema['extends']) { // if it extends another schema, it must pass that schema as well
                    checkProp(value, schema['extends'], path, i);
                }
                // validate a value against a type definition
                function checkType(type, value) {
                    if (type) {
                        if (typeof type == 'string' && type != 'any' &&
                                (type == 'null' ? value !== null : typeof value != type) &&
                                !(value instanceof Array && type == 'array') &&
                                !(value instanceof Date && type == 'date') &&
                                !(type == 'integer' && value % 1 === 0)) {
                            return [
                                {property:path,message:(typeof value) + " value found, but a " + type + " is required"}
                            ];
                        }
                        if (type instanceof Array) {
                            var unionErrors = [];
                            for (var j = 0; j < type.length; j++) { // a union type
                                if (!(unionErrors = checkType(type[j], value)).length) {
                                    break;
                                }
                            }
                            if (unionErrors.length) {
                                return unionErrors;
                            }
                        } else if (typeof type == 'object') {
                            var priorErrors = errors;
                            errors = [];
                            checkProp(value, type, path);
                            var theseErrors = errors;
                            errors = priorErrors;
                            return theseErrors;
                        }
                    }
                    return [];
                }

                if (value === undefined) {
                    if (schema.required) {
                        addError("is missing and it is required");
                    }
                } else {
                    errors = errors.concat(checkType(schema.type, value));
                    if (schema.disallow && !checkType(schema.disallow, value).length) {
                        addError(" disallowed value was matched");
                    }
                    if (value !== null) {
                        if (value instanceof Array) {
                            if (schema.items) {
                                var itemsIsArray = schema.items instanceof Array;
                                var propDef = schema.items;
                                for (i = 0,l = value.length; i < l; i += 1) {
                                    if (itemsIsArray)
                                        propDef = schema.items[i];
                                    if (options.coerce)
                                        value[i] = options.coerce(value[i], propDef);
                                    errors.concat(checkProp(value[i], propDef, path, i));
                                }
                            }
                            if (schema.minItems && value.length < schema.minItems) {
                                addError("There must be a minimum of " + schema.minItems + " in the array");
                            }
                            if (schema.maxItems && value.length > schema.maxItems) {
                                addError("There must be a maximum of " + schema.maxItems + " in the array");
                            }
                        } else if (schema.properties || schema.additionalProperties) {
                            errors.concat(checkObj(value, schema.properties, path, schema.additionalProperties));
                        }
                        if (schema.pattern && typeof value == 'string' && !value.match(schema.pattern)) {
                            addError("does not match the regex pattern " + schema.pattern);
                        }
                        if (schema.maxLength && typeof value == 'string' && value.length > schema.maxLength) {
                            addError("may only be " + schema.maxLength + " characters long");
                        }
                        if (schema.minLength && typeof value == 'string' && value.length < schema.minLength) {
                            addError("must be at least " + schema.minLength + " characters long");
                        }
                        if (typeof schema.minimum !== undefined && typeof value == typeof schema.minimum &&
                                schema.minimum > value) {
                            addError("must have a minimum value of " + schema.minimum);
                        }
                        if (typeof schema.maximum !== undefined && typeof value == typeof schema.maximum &&
                                schema.maximum < value) {
                            addError("must have a maximum value of " + schema.maximum);
                        }
                        if (schema['enum']) {
                            var enumer = schema['enum'];
                            l = enumer.length;
                            var found;
                            for (var j = 0; j < l; j++) {
                                if (enumer[j] === value) {
                                    found = 1;
                                    break;
                                }
                            }
                            if (!found) {
                                addError("does not have a value in the enumeration " + enumer.join(", "));
                            }
                        }
                        if (typeof schema.maxDecimal == 'number' &&
                                (value.toString().match(new RegExp("\\.[0-9]{" + (schema.maxDecimal + 1) + ",}")))) {
                            addError("may only have " + schema.maxDecimal + " digits of decimal places");
                        }
                    }
                }
                return null;
            }

            // validate an object against a schema
            function checkObj(instance, objTypeDef, path, additionalProp) {

                if (typeof objTypeDef == 'object') {
                    if (typeof instance != 'object' || instance instanceof Array) {
                        errors.push({property:path,message:"an object is required"});
                    }

                    for (var i in objTypeDef) {
                        if (objTypeDef.hasOwnProperty(i)) {
                            var value = instance[i];
                            // skip _not_ specified properties
                            if (value === undefined && options.existingOnly) continue;
                            var propDef = objTypeDef[i];
                            // set default
                            if (value === undefined && propDef["default"]) {
                                value = instance[i] = propDef["default"];
                            }
                            if (options.coerce && i in instance) {
                                value = instance[i] = options.coerce(value, propDef);
                            }
                            checkProp(value, propDef, path, i);
                        }
                    }
                }
                for (i in instance) {
                    if (instance.hasOwnProperty(i) && !(i.charAt(0) == '_' && i.charAt(1) == '_') && objTypeDef && !objTypeDef[i] && additionalProp === false) {
                        if (options.filter) {
                            delete instance[i];
                            continue;
                        } else {
                            errors.push({property:path,message:(typeof value) + "The property " + i +
                                    " is not defined in the schema and the schema does not allow additional properties"});
                        }
                    }
                    var requires = objTypeDef && objTypeDef[i] && objTypeDef[i].requires;
                    if (requires && !(requires in instance)) {
                        errors.push({property:path,message:"the presence of the property " + i + " requires that " + requires + " also be present"});
                    }
                    value = instance[i];
                    if (additionalProp && (!(objTypeDef && typeof objTypeDef == 'object') || !(i in objTypeDef))) {
                        if (options.coerce) {
                            value = instance[i] = options.coerce(value, additionalProp);
                        }
                        checkProp(value, additionalProp, path, i);
                    }
                    if (!_changing && value && value.$schema) {
                        errors = errors.concat(checkProp(value, value.$schema, path, i));
                    }
                }
                return errors;
            }

            if (schema) {
                checkProp(instance, schema, '', _changing || '');
            }
            if (!_changing && instance && instance.$schema) {
                checkProp(instance, instance.$schema, '', '');
            }
            return {valid:!errors.length,errors:errors};
        },

        /**
         * summary:
         * This checks to ensure that the result is valid and will throw an appropriate error message if it is not
         * result: the result returned from checkPropertyChange or validate
         * @param result
         */
        mustBeValid : function(result) {
            if (!result.valid) {
                throw new TypeError(result.errors.map(
                        function(error) {
                            return "for property " + error.property + ': ' + error.message;
                        }).join(", \n"));
            }
        }
    };

    // setup primitive classes to be JSON Schema types
    String.type = "string";
    Boolean.type = "boolean";
    Number.type = "number";
    Integer = {type:"integer"};
    Object.type = "object";
    Array.type = "array";
    Date.type = "date";

    $.validator = window.Validator = Validator;

})(jQuery);
// Determine what is o.
/**
 * @ignore
 * @param o
 */
function hoozit(o) {
    if (o.constructor === String) {
        return "string";
        
    } else if (o.constructor === Boolean) {
        return "boolean";

    } else if (o.constructor === Number) {

        if (isNaN(o)) {
            return "nan";
        } else {
            return "number";
        }

    } else if (typeof o === "undefined") {
        return "undefined";

    // consider: typeof null === object
    } else if (o === null) {
        return "null";

    // consider: typeof [] === object
    } else if (o instanceof Array) {
        return "array";
    
    // consider: typeof new Date() === object
    } else if (o instanceof Date) {
        return "date";

    // consider: /./ instanceof Object;
    //           /./ instanceof RegExp;
    //          typeof /./ === "function"; // => false in IE and Opera,
    //                                          true in FF and Safari
    } else if (o instanceof RegExp) {
        return "regexp";

    } else if (typeof o === "object") {
        return "object";

    } else if (o instanceof Function) {
        return "function";
    } else {
        return undefined;
    }
}

// Call the o related callback with the given arguments.
/**
 * @ignore
 * @param o
 * @param callbacks
 * @param args
 */
function bindCallbacks(o, callbacks, args) {
    var prop = hoozit(o);
    if (prop) {
        if (hoozit(callbacks[prop]) === "function") {
            return callbacks[prop].apply(callbacks, args);
        } else {
            return callbacks[prop]; // or undefined
        }
    }
}
// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rath̩ <prathe@gmail.com>
/**
 * @ignore
 */
var equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions

    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return hoozit(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i;
                var len;

                // b could be an object literal here
                if ( ! (hoozit(b) === "array")) {
                    return false;
                }

                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if( ! innerEquiv(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            },

            "object": function (b, a) {
                var i;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);

                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

                    aProperties.push(i); // collect a's properties

                    if ( ! innerEquiv(a[i], b[i])) {
                        eq = false;
                    }
                }

                callers.pop(); // unstack, we are done

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();
    /**
     * @ignore
     */
    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();/*
 Masked Input plugin for jQuery
 Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
 Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
 Version: 1.3.1
 */
(function($) {
    function getPasteEvent() {
        var el = document.createElement('input'),
            name = 'onpaste';
        el.setAttribute(name, '');
        return (typeof el[name] === 'function')?'paste':'input';
    }

    var pasteEventName = getPasteEvent() + ".mask",
        ua = navigator.userAgent,
        iPhone = /iphone/i.test(ua),
        android=/android/i.test(ua),
        caretTimeoutId;

    $.mask = {
        //Predefined character definitions
        definitions: {
            '9': "[0-9]",
            'a': "[A-Za-z]",
            '*': "[A-Za-z0-9]"
        },
        dataName: "rawMaskFn",
        placeholder: '_'
    };

    $.fn.extend({
        //Helper Function for Caret positioning
        caret: function(begin, end) {
            var range;

            if (this.length === 0 || this.is(":hidden")) {
                return;
            }

            if (typeof begin == 'number') {
                end = (typeof end === 'number') ? end : begin;
                return this.each(function() {
                    if (this.setSelectionRange) {
                        this.setSelectionRange(begin, end);
                    } else if (this.createTextRange) {
                        range = this.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                });
            } else {
                if (this[0].setSelectionRange) {
                    begin = this[0].selectionStart;
                    end = this[0].selectionEnd;
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    begin = 0 - range.duplicate().moveStart('character', -100000);
                    end = begin + range.text.length;
                }
                return { begin: begin, end: end };
            }
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input,
                defs,
                tests,
                partialPosition,
                firstNonMaskPos,
                len;

            if (!mask && this.length > 0) {
                input = $(this[0]);
                return input.data($.mask.dataName)();
            }
            settings = $.extend({
                placeholder: $.mask.placeholder, // Load default placeholder
                completed: null
            }, settings);


            defs = $.mask.definitions;
            tests = [];
            partialPosition = len = mask.length;
            firstNonMaskPos = null;

            $.each(mask.split(""), function(i, c) {
                if (c == '?') {
                    len--;
                    partialPosition = i;
                } else if (defs[c]) {
                    tests.push(new RegExp(defs[c]));
                    if (firstNonMaskPos === null) {
                        firstNonMaskPos = tests.length - 1;
                    }
                } else {
                    tests.push(null);
                }
            });

            return this.trigger("unmask").each(function() {
                var input = $(this),
                    buffer = $.map(
                        mask.split(""),
                        function(c, i) {
                            if (c != '?') {
                                return defs[c] ? settings.placeholder : c;
                            }
                        }),
                    focusText = input.val();

                function seekNext(pos) {
                    while (++pos < len && !tests[pos]);
                    return pos;
                }

                function seekPrev(pos) {
                    while (--pos >= 0 && !tests[pos]);
                    return pos;
                }

                function shiftL(begin,end) {
                    var i,
                        j;

                    if (begin<0) {
                        return;
                    }

                    for (i = begin, j = seekNext(end); i < len; i++) {
                        if (tests[i]) {
                            if (j < len && tests[i].test(buffer[j])) {
                                buffer[i] = buffer[j];
                                buffer[j] = settings.placeholder;
                            } else {
                                break;
                            }

                            j = seekNext(j);
                        }
                    }
                    writeBuffer();
                    input.caret(Math.max(firstNonMaskPos, begin));
                }

                function shiftR(pos) {
                    var i,
                        c,
                        j,
                        t;

                    for (i = pos, c = settings.placeholder; i < len; i++) {
                        if (tests[i]) {
                            j = seekNext(i);
                            t = buffer[i];
                            buffer[i] = c;
                            if (j < len && tests[j].test(t)) {
                                c = t;
                            } else {
                                break;
                            }
                        }
                    }
                }

                function keydownEvent(e) {
                    var k = e.which,
                        pos,
                        begin,
                        end;

                    //backspace, delete, and escape get special treatment
                    if (k === 8 || k === 46 || (iPhone && k === 127)) {
                        pos = input.caret();
                        begin = pos.begin;
                        end = pos.end;

                        if (end - begin === 0) {
                            begin=k!==46?seekPrev(begin):(end=seekNext(begin-1));
                            end=k===46?seekNext(end):end;
                        }
                        clearBuffer(begin, end);
                        shiftL(begin, end - 1);

                        e.preventDefault();
                    } else if (k == 27) {//escape
                        input.val(focusText);
                        input.caret(0, checkVal());
                        e.preventDefault();
                    }
                }

                function keypressEvent(e) {
                    var k = e.which,
                        pos = input.caret(),
                        p,
                        c,
                        next;

                    if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
                        return;
                    } else if (k) {
                        if (pos.end - pos.begin !== 0){
                            clearBuffer(pos.begin, pos.end);
                            shiftL(pos.begin, pos.end-1);
                        }

                        p = seekNext(pos.begin - 1);
                        if (p < len) {
                            c = String.fromCharCode(k);
                            if (tests[p].test(c)) {
                                shiftR(p);

                                buffer[p] = c;
                                writeBuffer();
                                next = seekNext(p);

                                if(android){
                                    setTimeout($.proxy($.fn.caret,input,next),0);
                                }else{
                                    input.caret(next);
                                }

                                if (settings.completed && next >= len) {
                                    settings.completed.call(input);
                                }
                            }
                        }
                        e.preventDefault();
                    }
                }

                function clearBuffer(start, end) {
                    var i;
                    for (i = start; i < end && i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = settings.placeholder;
                        }
                    }
                }

                function writeBuffer() {
                    input.val(buffer.join(''));
                }

                function checkVal(allow) {
                    //try to place characters where they belong
                    var test = input.val(),
                        lastMatch = -1,
                        i,
                        c;

                    for (i = 0, pos = 0; i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = settings.placeholder;
                            while (pos++ < test.length) {
                                c = test.charAt(pos - 1);
                                if (tests[i].test(c)) {
                                    buffer[i] = c;
                                    lastMatch = i;
                                    break;
                                }
                            }
                            if (pos > test.length) {
                                break;
                            }
                        } else if (buffer[i] === test.charAt(pos) && i !== partialPosition) {
                            pos++;
                            lastMatch = i;
                        }
                    }
                    if (allow) {
                        writeBuffer();
                    } else if (lastMatch + 1 < partialPosition) {
                        input.val("");
                        clearBuffer(0, len);
                    } else {
                        writeBuffer();
                        input.val(input.val().substring(0, lastMatch + 1));
                    }
                    return (partialPosition ? i : firstNonMaskPos);
                }

                input.data($.mask.dataName,function(){
                    return $.map(buffer, function(c, i) {
                        return tests[i]&&c!=settings.placeholder ? c : null;
                    }).join('');
                });

                if (!input.attr("readonly"))
                    input
                        .one("unmask", function() {
                            input
                                .unbind(".mask")
                                .removeData($.mask.dataName);
                        })
                        .bind("focus.mask", function() {
                            clearTimeout(caretTimeoutId);
                            var pos,
                                moveCaret;

                            focusText = input.val();

                            // UZI: added this to allow for val('')
                            // see: https://github.com/digitalBush/jquery.maskedinput/issues/29
                            if (focusText === "") {
                                clearBuffer(0, len);
                                writeBuffer();
                                pos = 0;
                            }
                            else
                            {
                                pos = checkVal();
                            }
                            // END UZI

                            //pos = checkVal();

                            caretTimeoutId = setTimeout(function(){
                                writeBuffer();
                                if (pos == mask.length) {
                                    input.caret(0, pos);
                                } else {
                                    input.caret(pos);
                                }
                            }, 10);
                        })
                        .bind("blur.mask", function() {
                            checkVal();
                            if (input.val() != focusText)
                                input.change();
                        })
                        .bind("keydown.mask", keydownEvent)
                        .bind("keypress.mask", keypressEvent)
                        .bind(pasteEventName, function() {
                            setTimeout(function() {
                                var pos=checkVal(true);
                                input.caret(pos);
                                if (settings.completed && pos == input.val().length)
                                    settings.completed.call(input);
                            }, 0);
                        });
                checkVal(); //Perform initial check for existing values
            });
        }
    });


})(jQuery);/*jshint -W004 */ // duplicate variables
/*jshint -W083 */ // inline functions are used safely
/**
 * Alpaca forms engine for jQuery
 */
(function($) {

    var Alpaca;

    /**
     * @namespace Static method to build an Alpaca field instance bound to a DOM element.
     * @description <p>Usage:</p>
     * <p>
     * 1: Binds a control using the contents of $(el) or hands back a previously bound control<br/>
     * <code>
     *     <pre>
     *      Alpaca(el)
     *     </pre>
     * </code>
     * </p>
     * <p>
     * 2: Binds a control to $(el) using the given data (only for non-object types).<br/>
     * <code>
     *     <pre>
     *      Alpaca(el, data)
     *     </pre>
     * </code>
     * </p>
     * <p>
     * 3: Binds a control to $(el) using the given configuration object.<br/>
     * </p>
     * <code>
     *     <pre>
     * Alpaca(el,{
     *   "data" : {Any} field data (optional),
     *   "schema": {Object} field schema (optional),
     *   "options" : {Object} field options (optional),
     *   "view": {Object|String} field view (object or id reference) (optional),
     *   "render": {Function} callback function for replacing default rendering method (optional),
     *   "postRender": {Function} callback function for post-rendering  (optional),
     *   "error": {Function} callback function for error handling  (optional),
     *   "connector": {Alpaca.Connector} connector for retrieving or storing data, schema, options,
     *                view and templates. (optional),
     * });
     *    </pre>
     *</code>
     * @returns {Object} alpaca field instance
     */
    Alpaca = function() {
        var args = Alpaca.makeArray(arguments);
        if (args.length === 0) {
            // illegal
            return Alpaca.throwDefaultError("You must supply at least one argument which is the element against which to apply the Alpaca generated form");
        }

        // element is the first argument
        var el = args[0];

        // other arguments we may want to figure out
        var data = null;
        var schema = null;
        var options = null;
        var view = null;
        var callback = null;
        var renderedCallback = null;
        var errorCallback = null;
        var connector = null;
        var notTopLevel = false;
        var isDynamicCreation = false;
        var initialSettings = {};

        // if these options are provided, then data, schema, options and source are loaded via connector
        var dataSource = null;
        var schemaSource = null;
        var optionsSource = null;
        var viewSource = null;

        if (args.length == 1) {
            // hands back the field instance that is bound directly under the specified element
            // var field = Alpaca(el);
            var domElements = $(el).find(":first");

            var field = null;
            for (var i = 0; i < domElements.length; i++) {
                var domElement = domElements[i];
                var fieldId = $(domElement).attr("alpaca-field-id");
                if (fieldId) {
                    var _field = Alpaca.fieldInstances[fieldId];
                    if (_field) {
                        field = _field;
                    }
                }
            }

            if (field !== null) {
                return field;
            } else {
                // otherwise, grab the data inside the element and use that for the control
                var domData = $(el).html();
                $(el).html("");
                data = domData;
            }
        }

        if (args.length >= 2) {
            if (Alpaca.isObject(args[1])) {
                data = args[1].data;
                schema = args[1].schema;
                options = args[1].options;
                view = args[1].view;
                callback = args[1].render;
                renderedCallback = args[1].postRender;
                errorCallback = args[1].error;
                connector = args[1].connector;

                // sources
                dataSource = args[1].dataSource;
                schemaSource = args[1].schemaSource;
                optionsSource = args[1].optionsSource;
                viewSource = args[1].viewSource;

                // other
                if (args[1].ui) {
                    initialSettings["ui"] = args[1].ui;
                }
                if (args[1].type) {
                    initialSettings["type"] = args[1].type;
                }
                if (!Alpaca.isEmpty(args[1].notTopLevel)) {
                    notTopLevel = args[1].notTopLevel;
                }
                if (!Alpaca.isEmpty(args[1].isDynamicCreation)) {
                    isDynamicCreation = args[1].isDynamicCreation;
                }
            } else {
                // "data" is the second argument
                data = args[1];
                if (Alpaca.isFunction(data)) {
                    data = data();
                }
            }
        }

        // if no error callback is provided, we fall back to a browser alert
        if (Alpaca.isEmpty(errorCallback)) {
            errorCallback = Alpaca.defaultErrorCallback;
        }

        if (Alpaca.isEmpty(connector)) {
            var connectorClass = Alpaca.getConnectorClass("default");
            connector = new connectorClass("default");
        }

        // container can either be a dom id or a dom element
        if (el) {
            if (Alpaca.isString(el)) {
                el = $("#" + el);
            }
        }

        // For second or deeper level of fields, default loader should be the one to do loadAll
        // since schema, data, options and view should have already been loaded.
        // Unless we want to load individual fields (other than the templates) using the provided
        // loader, this should be good enough. The benefit is saving time on loader format checking.

        var loadAllConnector = connector;

        if (notTopLevel) {
            var loadAllConnectorClass = Alpaca.getConnectorClass("default");
            loadAllConnector = new loadAllConnectorClass("default");
        }

        // wrap rendered callback to allow for UI treatment (dom focus, etc)
        if (!options) {
            options = {};
        }
        if (Alpaca.isUndefined(options.focus)) {
            options.focus = false;
        }
        var _renderedCallback = function(control)
        {
            // auto-set the focus?
            if (options && options.focus)
            {
                window.setTimeout(function() {

                    if (options.focus === true)
                    {
                        // pick first element in form
                        if (control.children && control.children.length > 0) {
                            if (control.children[0].field && control.children[0].field) {
                                control.children[0].field.focus();
                            }
                        }
                    }
                    else
                    {
                        // pick a named control
                        var child = control.getControlByPath(options.focus);
                        if (child && child.field && child.field.length > 0) {
                            child.field.focus();
                        }
                    }
                }, 250);
            }

            if (renderedCallback)
            {
                renderedCallback(control);
            }
        };

        loadAllConnector.loadAll({
            "data": data,
            "schema": schema,
            "options": options,
            "view": view,
            "dataSource": dataSource,
            "schemaSource": schemaSource,
            "optionsSource": optionsSource,
            "viewSource": viewSource
        }, function(loadedData, loadedOptions, loadedSchema, loadedView) {

            // for cases where things could not be loaded via source loaders, fall back to what may have been passed
            // in directly as values

            loadedData = loadedData ? loadedData : data;
            loadedSchema = loadedSchema ? loadedSchema: schema;
            loadedOptions = loadedOptions ? loadedOptions : options;
            loadedView = loadedView ? loadedView : view;

            // some defaults for the case where data is null
            // if schema + options are not provided, we assume a text field

            if (Alpaca.isEmpty(loadedData))
            {
                if (Alpaca.isEmpty(loadedSchema) && (Alpaca.isEmpty(loadedOptions) || Alpaca.isEmpty(loadedOptions.type)))
                {
                    loadedData = "";

                    if (Alpaca.isEmpty(loadedOptions))
                    {
                        loadedOptions = "text";
                    }
                    else if (options && Alpaca.isObject(options))
                    {
                        loadedOptions.type = "text";
                    }
                }
            }

            // init alpaca
            return Alpaca.init(el, loadedData, loadedOptions, loadedSchema, loadedView, initialSettings, callback, _renderedCallback, connector, errorCallback, isDynamicCreation);

        }, function (loadError) {
            errorCallback(loadError);
            return null;
        });

        // hand back the field
        return $(el);
    };

    /**
     * @namespace Namespace for all Alpaca Field Class Implementations.
     */
    Alpaca.Fields = { };

    /**
     * @namespace Namespace for all Alpaca Connector Class Implementations.
     */
    Alpaca.Connectors = { };

    Alpaca.Extend = $.extend;

    Alpaca.Create = function()
    {
        var args = Array.prototype.slice.call(arguments);
        args.unshift({});

        return $.extend.apply(this, args);
    };

    // static methods and properties
    Alpaca.Extend(Alpaca,
    /** @lends Alpaca */
    {
        /**
         * Version number.
         */
        VERSION: "0.1.0",

        /**
         * Makes an array.
         *
         * @param {Any} nonArray A non-array variable.
         * @returns {Array} Array out of the non-array variable.
         */
        makeArray : function(nonArray) {
            return Array.prototype.slice.call(nonArray);
        },

        /**
         * Finds whether the type of a variable is function.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a function, false otherwise.
         */
        isFunction: function(obj) {
            return Object.prototype.toString.call(obj) === "[object Function]";
        },

        /**
         * Finds whether the type of a variable is string.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a string, false otherwise.
         */
        isString: function(obj) {
            return (typeof obj === "string");
        },

        /**
         * Finds whether the type of a variable is object.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is an object, false otherwise.
         */
        isObject: function(obj) {
            return !Alpaca.isUndefined(obj) && Object.prototype.toString.call(obj) === '[object Object]';
        },

        /**
         * Finds whether the type of a variable is a plain, non-prototyped object.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a plain object, false otherwise.
         */
        isPlainObject: function(obj) {
            return $.isPlainObject(obj);
        },

        /**
         * Finds whether the type of a variable is number.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a number, false otherwise.
         */
        isNumber: function(obj) {
            return (typeof obj === "number");
        },

        /**
         * Finds whether the type of a variable is array.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is an array, false otherwise.
         */
        isArray: function(obj) {
            return obj instanceof Array;
        },

        /**
         * Finds whether the type of a variable is boolean.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a boolean, false otherwise.
         */
        isBoolean: function(obj) {
            return (typeof obj === "boolean");
        },

        /**
         * Finds whether the type of a variable is undefined.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a undefined, false otherwise.
         */
        isUndefined: function(obj) {
            return (typeof obj === "undefined");
        },

        /**
         * Strips any excess whitespace characters from the given text.
         * Returns the trimmed string.
         *
         * @param str
         *
         * @return trimmed string
         */
        trim: function(text)
        {
            var trimmed = text;

            if (trimmed && Alpaca.isString(trimmed))
            {
                trimmed = trimmed.replace(/^\s+|\s+$/g, '');
            }

            return trimmed;
        },

        /**
         * Provides a safe conversion of an HTML textual string into a DOM object.
         *
         * @param x
         * @return {*}
         */
        safeDomParse: function(x)
        {
            if (x && Alpaca.isString(x))
            {
                // Correct for the fact that jQuery 9 is a bit sensitive with respect to string characters
                // http://stackoverflow.com/questions/14347611/jquery-1-9-client-side-template-syntax-error-unrecognized-expression
                //
                // ensure that html doesn't start with spaces, carriage returns or anything evil

                x = Alpaca.trim(x);

                var converted = null;
                try
                {
                    converted = $(x);
                }
                catch (e)
                {
                    // make another attempt to account for safety in some browsers
                    x = "<div>" + x + "</div>";

                    converted = $(x).children();
                }

                return converted;
            }

            return x;
        },

        /**
         * Finds whether a variable is empty.
         * @param {Any} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is empty, false otherwise.
         */
        isEmpty: function(obj) {
            return Alpaca.isUndefined(obj) || obj === null;
        },

        /**
         * Produces a copy of the given JS value.
         *
         * If the value is a simple array or a simple object, then a pure copy is produced.
         *
         * If it's a complex object or a function, then the reference is copied (i.e. not truly a copy).
         *
         * @param thing
         * @return {*}
         */
        copyOf: function(thing)
        {
            var copy = thing;

            if (Alpaca.isArray(thing))
            {
                copy = [];

                for (var i = 0; i < thing.length; i++)
                {
                    copy.push(Alpaca.copyOf(thing[i]));
                }
            }
            else if (Alpaca.isObject(thing))
            {
                if (thing instanceof Date)
                {
                    // date
                    return new Date(thing.getTime());
                }
                else if (thing instanceof RegExp)
                {
                    // regular expression
                    return new RegExp(thing);
                }
                else if (thing.nodeType && "cloneNode" in thing)
                {
                    // DOM node
                    copy = thing.cloneNode(true);
                }
                else if ($.isPlainObject(thing))
                {
                    copy = {};

                    for (var k in thing)
                    {
                        if (thing.hasOwnProperty(k))
                        {
                            copy[k] = Alpaca.copyOf(thing[k]);
                        }
                    }
                }
                else
                {
                    // otherwise, it's some other kind of object so we just do a referential copy
                    // in other words, not a copy
                }
            }

            return copy;
        },

        /**
         * Retained for legacy purposes.  Alias for copyOf().
         *
         * @param object
         * @returns {*}
         */
        cloneObject: function(object)
        {
            return Alpaca.copyOf(object);
        },

        /**
         * Splices a string.
         *
         * @param {String} source Source string to be spliced.
         * @param {Integer} splicePoint Splice location.
         * @param {String} splice String to be spliced in.
         * @returns {String} Spliced string
         */
        spliceIn: function(source, splicePoint, splice) {
            return source.substring(0, splicePoint) + splice + source.substring(splicePoint, source.length);
        },

        /**
         * Compacts an array.
         *
         * @param {Array} arr Source array to be compacted.
         * @returns {Array} Compacted array.
         */
        compactArray: function(arr) {
            var n = [], l = arr.length,i;
            for (i = 0; i < l; i++) {
                if (!lang.isNull(arr[i]) && !lang.isUndefined(arr[i])) {
                    n.push(arr[i]);
                }
            }
            return n;
        },

        /**
         * Removes accents from a string.
         *
         * @param {String} str Source string.
         * @returns {String} Cleaned string without accents.
         */
        removeAccents: function(str) {
            return str.replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o").replace(/[ùúûü]/g, "u").replace(/[ýÿ]/g, "y").replace(/[ñ]/g, "n").replace(/[ç]/g, "c").replace(/[œ]/g, "oe").replace(/[æ]/g, "ae");
        },

        /**
         * @private
         * @param el
         * @param arr
         * @param fn
         */
        indexOf: function(el, arr, fn) {
            var l = arr.length,i;

            if (!Alpaca.isFunction(fn)) {
                /**
                 * @ignore
                 * @param elt
                 * @param arrElt
                 */
                fn = function(elt, arrElt) {
                    return elt === arrElt;
                };
            }

            for (i = 0; i < l; i++) {
                if (fn.call({}, el, arr[i])) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * @private
         * Static counter for generating a unique ID.
         */
        uniqueIdCounter: 0,

        /**
         * Default Locale.
         */
        defaultLocale: "en_US",

        /**
         * Sets the default Locale.
         *
         * @param {String} locale New default locale.
         */
        setDefaultLocale: function(locale) {
            this.defaultLocale = locale;
        },

        /**
         * Field Type to Schema Type Mappings.
         */
        defaultSchemaFieldMapping: {},

        /**
         * Registers a field type to schema data type mapping.
         *
         * @param {String} schemaType Schema data type.
         * @param {String} fieldType Field type.
         */
        registerDefaultSchemaFieldMapping: function(schemaType, fieldType) {
            if (schemaType && fieldType) {
                this.defaultSchemaFieldMapping[schemaType] = fieldType;
            }
        },

        /**
         * Field Type to Schema Format Mappings.
         */
        defaultFormatFieldMapping: {},

        /**
         * Registers a field type to schema format mapping.
         *
         * @param {String} format Schema format.
         * @param {String} fieldType Field type.
         */
        registerDefaultFormatFieldMapping: function(format, fieldType) {
            if (format && fieldType) {
                this.defaultFormatFieldMapping[format] = fieldType;
            }
        },

        /**
         * Gets schema type of a variable.
         *
         * @param {Any} data The variable.
         * @returns {String} Schema type of the variable.
         */
        getSchemaType: function (data) {
            // map data types to default field types
            if (Alpaca.isEmpty(data)) {
                return "string";
            }
            if (Alpaca.isObject(data)) {
                return "object";
            }
            if (Alpaca.isString(data)) {
                return "string";
            }
            if (Alpaca.isNumber(data)) {
                return "number";
            }
            if (Alpaca.isArray(data)) {
                return "array";
            }
            if (Alpaca.isBoolean(data)) {
                return "boolean";
            }
            // Last check for data that carries functions -- GitanaConnector case.
            if (typeof data == 'object') {
                return "object";
            }
        },

        /**
         * @private
         *
         * Alpaca Views.
         */
        views: {},

        /**
         * @private
         *
         * View ID Prefix.
         */
        viewIdPrefix: "VIEW_",

        /**
         * Validates a view id.
         *
         * @param {String} id View id being validated.
         *
         * @returns {Boolean} True if the view id is valid, false otherwise.
         */
        isValidViewId : function (id) {
            return Alpaca.startsWith(id, this.viewIdPrefix);
        },

        /**
         * Generates a valid view id.
         *
         * @returns {String} A valid unique view id.
         */
        generateViewId : function () {
            return this.viewIdPrefix + this.generateId();
        },

        /**
         * Registers a view with the framework.
         *
         * @param viewObject
         */
        registerView: function(viewObject)
        {
            var id = viewObject.id;

            if (!id)
            {
                return Alpaca.throwDefaultError("Cannot register view with missing view id: " + id);
            }

            var existingView = this.views[id];
            if (existingView)
            {
                Alpaca.mergeObject(existingView, viewObject);
            }
            else
            {
                this.views[id] = viewObject;
            }

        },

        /**
         * Default view.
         */
        defaultView : "VIEW_WEB_EDIT",

        /**
         * Sets default view as the view with a given id.
         *
         * @param {String} Id of the view being set as default.
         */
        setDefaultView: function(viewId) {
            if (viewId && this.views.hasOwnProperty(viewId)) {
                this.defaultView = viewId;
            }
        },

        /**
         * Retrieves a normalized view by view id.
         *
         * @param viewId
         * @return {*}
         */
        getNormalizedView: function(viewId)
        {
            return this.normalizedViews[viewId];
        },

        /**
         * Resolves which view handles a given theme and type of operation.
         *
         * @param {String} ui
         * @param {String} type
         *
         * @returns {String} the view id
         */
        lookupNormalizedView: function(ui, type)
        {
            var theViewId = null;

            for (var viewId in this.normalizedViews)
            {
                var view = this.normalizedViews[viewId];

                if (view.ui == ui && view.type == type)
                {
                    theViewId = viewId;
                    break;
                }
            }

            return theViewId;
        },

        /**
         * Registers a template to a view.
         *
         * @param {String} templateId Template id.
         * @param {String|Object} template Either the text of the template or an object containing { "type": "<templateEngineIdentifier>", "template": "<markup>" }
         * @param [String] viewId the optional view id.  If none is provided, then all registrations are to the default view.
         */
        registerTemplate: function(templateId, template, viewId)
        {
            // if no view specified, fall back to the base view which is "VIEW_BASE"
            if (!viewId)
            {
                viewId = "VIEW_BASE";
            }

            if (!this.views[viewId])
            {
                this.views[viewId] = {};
                this.views[viewId].id = viewId;
            }

            if (!this.views[viewId].templates)
            {
                this.views[viewId].templates = {};
            }

            this.views[viewId].templates[templateId] = template;

        },

        /**
         * Registers list of templates to a view.
         *
         * @param {Array} templates Templates being registered
         * @param {String} viewId Id of the view that the templates being registered to.
         */
        registerTemplates: function(templates, viewId) {
            for (var templateId in templates) {
                this.registerTemplate(templateId, templates[templateId], viewId);
            }
        },

        /**
         * Registers a message to a view.
         *
         * @param {String} messageId Id of the message being registered.
         * @param {String} message Message to be registered
         * @param {String} viewId Id of the view that the message being registered to.
         */
        registerMessage: function(messageId, message, viewId)
        {
            // if no view specified, fall back to the base view which is "VIEW_BASE"
            if (!viewId)
            {
                viewId = "VIEW_BASE";
            }

            if (!this.views[viewId])
            {
                this.views[viewId] = {};
                this.views[viewId].id = viewId;
            }

            if (!this.views[viewId].messages)
            {
                this.views[viewId].messages = {};
            }

            this.views[viewId].messages[messageId] = message;
        },

        /**
         * Registers messages with a view.
         *
         * @param {Array} messages Messages to be registered.
         * @param {String} viewId Id of the view that the messages being registered to.
         */
        registerMessages: function(messages, viewId) {
            for (var messageId in messages) {
                if (messages.hasOwnProperty(messageId)) {
                    this.registerMessage(messageId, messages[messageId], viewId);
                }
            }
        },






        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // STATIC HELPER METHODS (CALLED FROM WITHIN TEMPLATES)
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * @private
         * Default Mappings for Field Level Templates.
         */
        fieldTemplatePostfix: {
            "controlFieldMessageContainer" : "-controlfield-message-container",
            "controlFieldLabel" : "-controlfield-label",
            "controlFieldContainer":"-controlfield-container",
            "controlFieldHelper":"-controlfield-helper",
            /*
             "controlFieldOuterEl":"-controlfield",
             */
            "fieldSetLegend" : "-fieldset-legend",
            "fieldSetItemsContainer":"-fieldset-items-container",
            "fieldSetHelper":"-fieldset-helper",
            "fieldSetOuterEl":"-fieldset",
            "formButtonsContainer":"-form-buttons-container",
            "formFieldsContainer":"-form-fields-container",
            "fieldSetLocation":"-fieldset-location",
            "fieldSetAlex":"-fieldset-alex"
        },

        /**
         * @private
         * Processes field level template.
         *
         * @param {String} object Object that the template is applied to.
         * @param {String} name Template id.
         * @param {Boolean} wrap True if we want the template as a wrapper, false otherwise.
         *
         * @returns {Object} Object rendered by field level template.
         */
        fieldTemplate: function(object, name, wrap) {

            var _this = this;

            var field = object.data;
            var view = object.data.view;

            var html = "";

            if (!name)
                name = "controlFieldLabel";

            // determine which compiled template to use for this template name
            var templateDescriptor = this.getTemplateDescriptor(view, name, field);
            if (wrap) {

                // for wrapping, we get the html source and hand it back
                // first we apply any attr and classes we need

                // get the html source
                var template = templateDescriptor.template.value;
                if ($('.alpaca' + this.fieldTemplatePostfix[name], Alpaca.safeDomParse(template)).length === 0) {
                    if (this.fieldTemplatePostfix[name]) {
                        template = Alpaca.safeDomParse(template).addClass("alpaca" + this.fieldTemplatePostfix[name]);
                    }
                }
                html = Alpaca.safeDomParse(template).outerHTML(true);
            }
            else
            {
                // for non-wrapped, we execute the template straight away

                var label = view.tmpl(templateDescriptor, object.data);
                if (label) {
                    if (this.fieldTemplatePostfix[name]) {
                        if ($('.alpaca' + this.fieldTemplatePostfix[name], label).length === 0) {
                            label.addClass("alpaca" + this.fieldTemplatePostfix[name]);
                        }
                        if (!label.attr("id")) {
                            label.attr("id", object.data.id + this.fieldTemplatePostfix[name]);
                        }
                    }
                    html = label.outerHTML(true);
                } else {
                    html = "";
                }
            }

            return html;
        },


        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // END OF STATIC HELPER METHODS
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////



        /**
         * Default date format.
         */
        defaultDateFormat: "mm/dd/yy",

        /**
         * Regular expressions for fields.
         */
        regexps:
        {
            "email": /^[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+(?:\.[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,6}$/i,
            "url": /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\:[0-9]{1,5})?(([0-9]{1,5})?\/.*)?$/i,
            "password": /^[0-9a-zA-Z\x20-\x7E]*$/,
            "date": /^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.]\d\d$/,
            "integer": /^([\+\-]?([1-9]\d*)|0)$/,
            "number":/^([\+\-]?((([0-9]+(\.)?)|([0-9]*\.[0-9]+))([eE][+-]?[0-9]+)?))$/,
            "phone":/^(\D?(\d{3})\D?\D?(\d{3})\D?(\d{4}))?$/,
            "ipv4":/^(?:1\d?\d?|2(?:[0-4]\d?|[6789]|5[0-5]?)?|[3-9]\d?|0)(?:\.(?:1\d?\d?|2(?:[0-4]\d?|[6789]|5[0-5]?)?|[3-9]\d?|0)){3}$/,
            "zipcode-five": /^(\d{5})?$/,
            "zipcode-nine": /^(\d{5}(-\d{4})?)?$/
        },

        /**
         * Map of instantiated fields.
         */
        fieldInstances: {},

        /**
         * Maps of field types to field class implementations.
         */
        fieldClassRegistry: {},

        /**
         * Registers an implementation class for a type of field.
         *
         * @param {String} type Field type.
         * @param {Alpaca.Field} fieldClass Field class.
         */
        registerFieldClass: function(type, fieldClass) {
            this.fieldClassRegistry[type] = fieldClass;
        },

        /**
         * Returns the implementation class for a type of field.
         *
         * @param {String} type Field type.
         *
         * @returns {Alpaca.Field} Field class mapped to field type.
         */
        getFieldClass: function(type) {
            return this.fieldClassRegistry[type];
        },

        /**
         * Gets the field type id for a given field implementation class.
         *
         * @param {Alpaca.Field} fieldClass Field class.
         *
         * @returns {String} Field type of the field class.
         */
        getFieldClassType: function(fieldClass) {
            for (var type in this.fieldClassRegistry) {
                if (this.fieldClassRegistry.hasOwnProperty(type)) {
                    if (this.fieldClassRegistry[type] == fieldClass) {
                        return type;
                    }
                }
            }
            return null;
        },

        /**
         * Maps of connector types to connector class implementations.
         */
        connectorClassRegistry: {},

        /**
         * Registers an implementation class for a connector type.
         *
         * @param {String} type cConnect type
         * @param {Alpaca.Connector} connectorClass Connector class.
         */
        registerConnectorClass: function(type, connectorClass) {
            this.connectorClassRegistry[type] = connectorClass;
        },

        /**
         * Returns the implementation class for a connector type.
         *
         * @param {String} type Connect type.
         * @returns {Alpaca.Connector} Connector class mapped to connect type.
         */
        getConnectorClass: function(type) {
            return this.connectorClassRegistry[type];
        },

        /**
         * Replaces each substring of this string that matches the given regular expression with the given replacement.
         *
         * @param {String} text Source string being replaced.
         * @param {String} replace Regular expression for replacing.
         * @param {String} with_this Replacement.
         *
         * @returns {String} Replaced string.
         */
        replaceAll: function(text, replace, with_this) {
            return text.replace(new RegExp(replace, 'g'), with_this);
        },

        /**
         * Creates an element with a given tag name, dom/style attributes and class names.
         *
         * @param {String} tag Tag name.
         * @param {Array} domAttributes DOM attributes.
         * @param {Array} styleAttributes Style attributes.
         * @param {Array} classNames Class names.
         *
         * @returns {Object} New element with the tag name and all other provided attributes.
         */
        element: function(tag, domAttributes, styleAttributes, classNames) {
            var el = $("<" + tag + "/>");

            if (domAttributes) {
                el.attr(domAttributes);
            }
            if (styleAttributes) {
                el.css(styleAttributes);
            }
            if (classNames) {
                for (var className in classNames) {
                    el.addClass(className);
                }
            }
        },

        /**
         * Replaces a template with list of replacements.
         *
         * @param {String} template Template being processed.
         * @param {String} substitutions List of substitutions.
         *
         * @returns {String} Replaced template.
         */
        elementFromTemplate: function(template, substitutions) {
            var html = template;
            if (substitutions) {
                for (var x in substitutions) {
                    html = Alpaca.replaceAll(html, "${" + x + "}", substitutions[x]);
                }
            }
            return $(html);
        },

        /**
         * Generates a unique alpaca id.
         *
         * @returns {String} The unique alpaca id.
         */
        generateId: function() {
            Alpaca.uniqueIdCounter++;
            return "alpaca" + Alpaca.uniqueIdCounter;
        },

        /**
         * @private
         * Helper function to provide YAHOO later like capabilities.
         */
        later: function(when, o, fn, data, periodic) {
            when = when || 0;
            o = o || {};
            var m = fn, d = $.makeArray(data), f, r;

            if (typeof fn === "string") {
                m = o[fn];
            }

            if (!m) {
                // Throw an error about the method
                throw {
                    name: 'TypeError',
                    message: "The function is undefined."
                };
            }

            /**
             * @ignore
             */
            f = function() {
                m.apply(o, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        /**
         * Finds if an string ends with a given suffix.
         *
         * @param {String} text The string being evaluated.
         * @param {String} suffix Suffix.
         * @returns {Boolean} True if the string ends with the given suffix, false otherwise.
         */
        endsWith : function(text, suffix) {
            return text.indexOf(suffix, text.length - suffix.length) !== -1;
        },

        /**
         * Finds if an string starts with a given prefix.
         *
         * @param {String} text The string being evaluated.
         * @param {String} prefix Prefix
         * @returns {Boolean} True if the string starts with the given prefix, false otherwise.
         */
        startsWith : function(text, prefix) {
            //return (text.match("^" + prefix) == prefix);
            return text.substr(0, prefix.length) === prefix;
        },

        /**
         * Finds if a variable is a URI.
         *
         * @param {Object} obj The variable being evaluated.
         * @returns {Boolean} True if the variable is a URI, false otherwise.
         */
        isUri : function(obj) {
            return Alpaca.isString(obj) && (Alpaca.startsWith(obj, "http://") ||
                    Alpaca.startsWith(obj, "https://") ||
                    Alpaca.startsWith(obj, "/") ||
                    Alpaca.startsWith(obj, "./") ||
                    Alpaca.startsWith(obj, "../"));
        },

        /**
         * Picks a sub-element from an object using a keys array.
         *
         * @param {Object} object Object to be traversed
         * @param {String|Array} keys Either an array of tokens or a dot-delimited string (i.e. "data.user.firstname")
         * @param {String} subprop Optional subproperty to traverse (i.e.. "data.properties.user.properties.firstname")
         *
         * @returns {Object} Sub element mapped to the given key path
         */
        traverseObject : function(object, keys, subprop) {
            if (Alpaca.isString(keys)) {
                keys = keys.split(".");
            }

            var element = null;
            var current = object;

            var key = null;
            do {
                key = keys.shift();
                if (subprop && key == subprop) {
                    key = keys.shift();
                }
                if (!Alpaca.isEmpty(current[key])) {
                    current = current[key];
                    if (keys.length === 0) {
                        element = current;
                    }
                } else {
                    keys = [];
                }
            } while (keys.length > 0);

            return element;
        },

        /**
         * Helper function that executes the given function upon each element in the array
         * The element of the array becomes the "this" variable in the function
         *
         * @param {Array|Object} data Either an array or an object
         * @param {Function} func Function to be executed.
         */
        each : function(data, func) {
            if (Alpaca.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    func.apply(data[i]);
                }
            } else if (Alpaca.isObject(data)) {
                for (var key in data) {
                    func.apply(data[key]);
                }
            }
        },

        /**
         * Merges json obj2 into obj1 using a recursive approach.
         *
         * @param {Object} obj1 Destination object.
         * @param {Object} obj2 Source object.
         * @param {Function} validKeyFunction Function used to determine whether to include a given key or not.
         *
         * @returns {Object} Merged object.
         */
        merge : function(obj1, obj2, validKeyFunction) {
            if (!obj1) {
                obj1 = {};
            }
            for (var key in obj2) {
                var valid = true;

                if (validKeyFunction) {
                    valid = validKeyFunction(key);
                }

                if (valid) {
                    if (Alpaca.isEmpty(obj2[key])) {
                        obj1[key] = obj2[key];
                    } else {
                        if (Alpaca.isObject(obj2[key])) {
                            if (!obj1[key]) {
                                obj1[key] = {};
                            }
                            obj1[key] = Alpaca.merge(obj1[key], obj2[key]);
                        } else {
                            obj1[key] = obj2[key];
                        }
                    }
                }
            }

            return obj1;
        },

        /**
         * Merges json "source" into "target" using a recursive approach. The merge will include empty values
         * of obj2 properties.
         *
         * @param {Object} target Target object.
         * @param {Object} source Source object.
         *
         * @returns {Object} Merged object
         */
        mergeObject : function(target, source) {

            if (!target) {
                target = {};
            }

            if (!source) {
                source = {};
            }

            this.mergeObject2(source, target);

            return target;
        },

        mergeObject2: function(source, target)
        {
            var isArray = Alpaca.isArray;
            var isObject = Alpaca.isObject;
            var isUndefined = Alpaca.isUndefined;
            var copyOf = Alpaca.copyOf;

            var _merge = function(source, target)
            {
                if (isArray(source))
                {
                    if (isArray(target))
                    {
                        // merge array elements
                        $.each(source, function(index) {
                            target.push(copyOf(source[index]));
                        });
                    }
                    else
                    {
                        // something is already in the target that isn't an ARRAY
                        // skip
                    }
                }
                else if (isObject(source))
                {
                    if (isObject(target))
                    {
                        // merge object properties
                        $.each(source, function(key) {

                            if (isUndefined(target[key])) {
                                target[key] = copyOf(source[key]);
                            } else {
                                target[key] = _merge(source[key], target[key]);
                            }

                        });
                    }
                    else
                    {
                        // something is already in the target that isn't an OBJECT
                        // skip
                    }

                }
                else
                {
                    // otherwise, it's a scalar, always overwrite
                    target = copyOf(source);
                }

                return target;
            };

            _merge(source, target);

            return target;
        },

        /**
         * Substitutes a string with a list of tokens.
         *
         * @param text Source string.
         * @param args List of tokens.
         *
         * @returns Substituted string.
         */
        substituteTokens : function(text, args) {

            if (!Alpaca.isEmpty(text)) {
                for (var i = 0; i < args.length; i++) {
                    var token = "{" + i + "}";

                    var x = text.indexOf(token);
                    if (x > -1) {
                        var nt = text.substring(0, x) + args[i] + text.substring(x + 3);
                        text = nt;
                        //text = Alpaca.replaceAll(text, token, args[i]);
                    }
                }
            }
            return text;
        },

        /**
         * Compares two objects.
         *
         * @param {Object} obj1 First object.
         * @param {Object} obj2 Second object.
         *
         * @returns {Boolean} True if two objects are same, false otherwise.
         */
        compareObject : function(obj1, obj2) {
            return equiv(obj1, obj2);
        },

        /**
         * Compares content of two arrays.
         *
         * @param {Array} arr_1 First array.
         * @param {Array} arr_2 Second array.
         * @returns {Boolean} True if two arrays have same content, false otherwise.
         */
        compareArrayContent : function(arr_1, arr_2) {
            var equal = arr_1 && arr_2 && (arr_1.length == arr_2.length);
            if (equal) {
                $.each(arr_1, function(foo, val) {
                    if (!equal)
                        return false;
                    if ($.inArray(val, arr_2) == -1) {
                        equal = false;
                    } else {
                        equal = true;
                    }
                });
            }
            return equal;
        },

        /**
         * Finds whether a variable has empty value or not.
         *
         * @param {Any} val Variable to be evaluated.
         * @returns {Boolean} True if the variable has empty value, false otherwise.
         */
        isValEmpty : function(val) {
            var empty = false;
            if (Alpaca.isEmpty(val)) {
                empty = true;
            } else {
                if (Alpaca.isString(val) && val === "") {
                    empty = true;
                }
                if (Alpaca.isObject(val) && $.isEmptyObject(val)) {
                    empty = true;
                }
                if (Alpaca.isArray(val) && val.length === 0) {
                    empty = true;
                }
                if (Alpaca.isNumber(val) && isNaN(val)) {
                    empty = true;
                }
            }
            return empty;
        },

        /**
         * @private
         *
         * Initial function for setting up field instance and executing callbacks if needed.
         *
         * @param {Object} el Container element.
         * @param {Object} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Object} initialSettings any additional settings provided to the top-level Alpaca object
         * @param {Function} callback Render callback.
         * @param {Function} renderedCallback Post-render callback.
         * @param {Alpaca.connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         * @param {Boolean} isDynamicCreation whether this alpaca field is being dynamically created (after first render)
         *
         * @returns {Alpaca.Field} New field instance.
         */
        init: function(el, data, options, schema, view, initialSettings, callback, renderedCallback, connector, errorCallback, isDynamicCreation) {

            var self = this;

            ///////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // COMPILATION
            //
            ///////////////////////////////////////////////////////////////////////////////////////////////////

            // if they provided an inline view object, we assign an id and store onto views map
            // so that it gets compiled along with the rest
            if (Alpaca.isObject(view)) {
                var viewId = view.id;
                if (!viewId) {
                    view.id = this.generateViewId();
                }
                var parentId = view.parent;
                if (!parentId) {
                    view.parent = "VIEW_WEB_EDIT"; // assume
                }
                this.registerView(view);
                view = view.id;
            }

            // compile all of the views and templates
            this.compile(function(report) {

                if (report.errors && report.errors.length > 0)
                {
                    for (var i = 0; i < report.errors.length; i++)
                    {
                        var viewId = report.errors[i].viewId;
                        var templateId = report.errors[i].templateId;
                        var err = report.errors[i].err;

                        Alpaca.logError("The template: " + templateId + " for view: " + viewId + " failed to compile");
                        Alpaca.logError(JSON.stringify(err));
                    }

                    return Alpaca.throwErrorWithCallback("View compilation failed, cannot initialize Alpaca.  Please check the error logs.", errorCallback);
                }

                self._init(el, data, options, schema, view, initialSettings, callback, renderedCallback, connector, errorCallback, isDynamicCreation);
            }, errorCallback);
        },

        _init: function(el, data, options, schema, view, initialSettings, callback, renderedCallback, connector, errorCallback, isDynamicCreation)
        {
            ///////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // VIEW RESOLUTION
            //
            ///////////////////////////////////////////////////////////////////////////////////////////////////


            // make some intelligent guesses about what view id we might default to in case they want to use
            // auto-view selection.  We detect jquery-ui, bootstrap and jquerymobile.
            var fallbackUI = null;
            var fallbackType = null;
            var fallbackViewId = null;

            // if jQuery Mobile is present, fall back to VIEW_MOBILE_EDIT or VIEW_MOBILE_CREATE
            if ($.mobile) {
                fallbackUI = "mobile";
                if (data) {
                    fallbackType = "edit";
                    fallbackViewId = "VIEW_MOBILE_EDIT";
                }
                else {
                    fallbackType = "create";
                    fallbackViewId = "VIEW_MOBILE_CREATE";
                }
            }

            // if Twitter Bootstrap is present, fall back to VIEW_BOOTSTRAP_EDIT or VIEW_BOOTSTRAP_CREATE
            var bootstrapDetected = (typeof $().modal == 'function');
            if (bootstrapDetected) {
                fallbackUI = "bootstrap";
                if (data) {
                    fallbackType = "edit";
                    fallbackViewId = "VIEW_BOOTSTRAP_EDIT";
                } else {
                    fallbackType = "create";
                    fallbackViewId = "VIEW_BOOTSTRAP_CREATE";
                }
            }

            // if no view provided, but they provided "ui" and optionally "type", then we try to auto-select the view
            if (!view)
            {
                var ui = initialSettings.ui;
                var type = initialSettings.type;

                if (!ui)
                {
                    if (!fallbackUI) {
                        fallbackUI = Alpaca.defaultUI;
                    }
                    if (fallbackUI) {
                        ui = fallbackUI;
                    }
                }

                if (ui) {
                    if (!type) {
                        type = fallbackType ? fallbackType : "edit";
                    }

                    Alpaca.logDebug("No view provided but found request for UI: " + ui + " and type: " + type);

                    // see if we can auto-select a view
                    view = this.lookupNormalizedView(ui, type);
                    if (view) {
                        Alpaca.logDebug("Found view: " + view);
                    } else {
                        Alpaca.logDebug("No view found for UI: " + ui + " and type: " + type);
                    }
                }
            }

            // if still no view, then default fallback to our detected view or the default
            if (!view)
            {
                Alpaca.logDebug("A view was not specified.");
                if (fallbackViewId)
                {
                    Alpaca.logDebug("Falling back to detected view: " + fallbackViewId);
                    view = fallbackViewId;
                }
                else
                {
                    Alpaca.logDebug("Falling back to default view: " + this.defaultView);
                    view = this.defaultView;
                }
            }

            // debugging: if the view isn't available, we want to report it right away
            if (Alpaca.isString(view))
            {
                if (!this.normalizedViews[view])
                {
                    return Alpaca.throwErrorWithCallback("The desired view: " + view + " could not be loaded.  Please make sure it is loaded and not misspelled.", errorCallback);
                }
            }


            ///////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // FIELD INSTANTIATION
            //
            ///////////////////////////////////////////////////////////////////////////////////////////////////

            // TEST - swap code
            // swap el -> placeholder
            //var tempHolder = $("<div></div>");
            //$(el).before(tempHolder);
            //$(el).remove();

            var field = Alpaca.createFieldInstance(el, data, options, schema, view, connector, errorCallback);
            if (field)
            {
                // hide field while rendering
                $(el).addClass("alpaca-field-rendering");
                $(el).addClass("alpaca-hidden");

                field.isDynamicCreation = isDynamicCreation;
                Alpaca.fieldInstances[field.getId()] = field;

                // mechanism for looking up field instances by id
                field.allFieldInstances = function()
                {
                    return Alpaca.fieldInstances;
                };

                // allow callbacks defined through view
                if (Alpaca.isEmpty(callback)) {
                    callback = field.view.render;
                }
                if (Alpaca.isEmpty(renderedCallback)) {
                    renderedCallback = field.view.postRender;
                }

                if (Alpaca.collectTiming)
                {
                    var counters = Alpaca.Counters("render");
                    var t1 = new Date().getTime();
                }

                var fin = function()
                {
                    // if this is the top-level alpaca field, then we call for validation state to be recalculated across
                    // all child fields
                    if (!field.parent)
                    {
                        // final call to update validation state
                        field.refreshValidationState(true);

                        // force hideInitValidationError to false for field and all children
                        if (field.view.type != 'view')
                        {
                            Alpaca.fieldApplyChildren(field, function(field) {

                                // set to false after first validation (even if in CREATE mode, we only force init validation error false on first render)
                                field.hideInitValidationError = false;

                            });
                        }
                    }

                    // TEST - swap code
                    // swap placeholder -> el
                    //$(tempHolder).before(el);
                    //$(tempHolder).remove();

                    // reveal field after rendering
                    $(el).removeClass("alpaca-field-rendering");
                    $(el).removeClass("alpaca-hidden");

                    if (Alpaca.collectTiming)
                    {
                        var t2 = new Date().getTime();
                        counters.increment(field.getFieldType(), (t2-t1));
                    }

                    renderedCallback(field);
                };

                if (!Alpaca.isEmpty(callback)) {
                    callback(field, function() {
                        fin();
                    });
                } else {
                    field.render(function() {
                        fin();
                    });
                }

                field.callback = callback;
                field.renderedCallback = renderedCallback;
            }

            // NOTE: this can be null if an error was thrown
            return field;
        },

        /**
         * @private
         *
         * Internal method for constructing a field instance.
         *
         * @param {Object} el The dom element to act as the container of the constructed field.
         * @param {Object} data The data to be bound into the field.
         * @param {Object} options The configuration for the field.
         * @param {Object} schema The schema for the field.
         * @param {Object|String} view The view for the field.
         * @param {Alpaca.connector} connector The field connector to be bound into the field.
         * @param {Function} errorCallback Error callback.
         *
         * @returns {Alpaca.Field} New field instance.
         */
        createFieldInstance : function(el, data, options, schema, view, connector, errorCallback) {
            // make sure options and schema are not empty
            if (Alpaca.isValEmpty(options)) options = {};
            if (Alpaca.isValEmpty(schema)) schema = {};
            // options can be a string that identifies the kind of field to construct (i.e. "text")
            if (options && Alpaca.isString(options)) {
                var fieldType = options;
                options = {};
                options.type = fieldType;
            }
            if (!options.type) {
                // if nothing passed in, we can try to make a guess based on the type of data
                if (!schema.type) {
                    schema.type = Alpaca.getSchemaType(data);
                }
                if (schema && schema["enum"]) {
                    if (schema["enum"].length > 3) {
                        options.type = "select";
                    } else {
                        options.type = "radio";
                    }
                } else {
                    options.type = Alpaca.defaultSchemaFieldMapping[schema.type];
                }
                // check if it has format defined
                if (schema.format && Alpaca.defaultFormatFieldMapping[schema.format]) {
                    options.type = Alpaca.defaultFormatFieldMapping[schema.format];
                }
            }
            // find the field class registered for this field type
            var fieldClass = Alpaca.getFieldClass(options.type);
            if (!fieldClass) {
                errorCallback({
                    "message":"Unable to find field class for type: " + options.type,
                    "reason": "FIELD_INSTANTIATION_ERROR"
                });
                return null;
            }
            // if we have data, bind it in
            return new fieldClass(el, data, options, schema, view, connector, errorCallback);
        },

        /**
         * Provides a backwards-compatible version of the former jQuery 1.8.3 parseJSON function (this was changed
         * for jQuery 1.9.0 and introduces all kinds of issues).
         *
         * @param text
         */
        parseJSON: function(text)
        {
            if (!text) {
                return null;
            }

            return $.parseJSON(text);
        },

        /**
         * Compiles all of the views, normalizing them for use by Alpaca.
         * Also compiles any templates that the views may reference.
         *
         * @param cb the callback that gets fired once compilation has ended
         */
        compile: function(cb, errorCallback)
        {
            var self = this;

            // var t1 = new Date().getTime();

            var report = {
                "errors": [],
                "count": 0,
                "successCount": 0
            };

            var finalCallback = function(normalizedViews)
            {
                // var t2 = new Date().getTime();
                // console.log("Compilation Exited with " + report.errors.length + " errors in: " + (t2-t1)+ " ms");

                if (report.errors.length === 0)
                {
                    // success!

                    // copy our views into the normalized set
                    for (var k in normalizedViews)
                    {
                        self.normalizedViews[k] = normalizedViews[k];
                    }
                }

                cb(report);
            };



            ////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // VIEW TEMPLATE COMPILATION
            //
            ////////////////////////////////////////////////////////////////////////////////////////////////

            // for all of the views (the original ones, not the compiled ones), walk through them and find any
            // and all templates that need to be compiled
            // compile each and store in a "compiledTemplates" object

            var viewCompileCallback = function(normalizedViews, err, view, compiledTemplateId, cacheKey, totalCalls)
            {
                var viewId = view.id;

                report.count++;
                if (err)
                {
                    report.errors.push({
                        "view": viewId,
                        "template": compiledTemplateId,
                        "err": err
                    });
                }
                else
                {
                    report.successCount++;

                    // mark onto the view that the template was compiled for this view
                    // this maps [compiledTemplateId] -> [cacheKey]
                    view.compiledTemplates[compiledTemplateId] = cacheKey;
                }

                if (report.count == totalCalls)
                {
                    //var t2 = new Date().getTime();
                    //console.log("Compilation took: " + (t2-t1) + " ms");
                    finalCallback(normalizedViews);
                }
            };

            var compileViewTemplate = function(normalizedViews, view, compiledTemplateId, template, totalCalls)
            {
                var viewId = view.id;

                var mightBeUrl = (template && template.indexOf("/") > -1);
                if (mightBeUrl)
                {

                }
                else
                {
                    // support for jQuery selectors
                    if (template && ((template.indexOf("#") === 0) || (template.indexOf(".") === 0)))
                    {
                        var x = $(template);

                        type = $(x).attr("type");
                        template = $(x).html();
                    }
                }

                var type = null;
                if (Alpaca.isObject(template)) {
                    type = template.type;
                    template = template.template;
                }

                // if type isn't resolved, assume jquery tmpl()
                if (!type)
                {
                    type = "text/x-jquery-tmpl";
                }

                // look up the template processor
                var engine = Alpaca.TemplateEngineRegistry.find(type);
                if (!engine)
                {
                    Alpaca.logError("Cannot find template engine for type: " + type);
                    var err = new Error("Cannot find template engine for type: " + type);
                    viewCompileCallback(normalizedViews, err, view, compiledTemplateId, cacheKey, totalCalls);
                }

                // the desired new cache key
                var cacheKey = viewId + "_" + compiledTemplateId;
                if (engine.isCached(cacheKey))
                {
                    // already compiled, so skip
                    viewCompileCallback(normalizedViews, null, view, compiledTemplateId, cacheKey, totalCalls);
                }
                else
                {
                    // check if "template" is actually a reference to another template
                    // if so, we can reuse the previously compiled fellow

                    var previouslyCompiledTemplateCacheKey = view.compiledTemplates["view-" + template];
                    if (previouslyCompiledTemplateCacheKey)
                    {
                        // this entry is pointing to a previously compiled template
                        // fetch html and compile again
                        template = Alpaca.TemplateCache[previouslyCompiledTemplateCacheKey];
                    }

                    // compile the template
                    engine.compile(cacheKey, template, function(err, data) {
                        viewCompileCallback(normalizedViews, err, view, compiledTemplateId, cacheKey, totalCalls);
                    });

                }
            };

            var compileTemplates = function(normalizedViews)
            {
                // walk through all normalized views that we're interested in and compile the templates within
                var functionArray = [];
                for (var viewId in normalizedViews)
                {
                    var view = normalizedViews[viewId];
                    view.compiledTemplates = {};

                    // view templates
                    if (view.templates)
                    {
                        for (var templateId in view.templates)
                        {
                            var template = view.templates[templateId];

                            functionArray.push(function(normalizedViews, view, compiledTemplateId, template) {
                                return function(totalCalls) {
                                    compileViewTemplate(normalizedViews, view, compiledTemplateId, template, totalCalls);
                                };
                            }(normalizedViews, view, "view-" + templateId, template));
                        }
                    }

                    // field level templates
                    if (view.fields)
                    {
                        for (var path in view.fields)
                        {
                            if (view.fields[path].templates)
                            {
                                for (var templateId in view.fields[path].templates)
                                {
                                    var template = view.fields[path].templates[templateId];

                                    functionArray.push(function(normalizedViews, view, compiledTemplateId, template) {
                                        return function(totalCalls) {
                                            compileViewTemplate(normalizedViews, view, compiledTemplateId, template, totalCalls);
                                        };
                                    }(normalizedViews, view, "field-" + path + "-" + templateId, template));
                                }
                            }
                        }
                    }

                    // layout template
                    if (view.layout && view.layout.template)
                    {
                        var template = view.layout.template;

                        functionArray.push(function(normalizedViews, view, compiledTemplateId, template) {
                            return function(totalCalls) {
                                compileViewTemplate(normalizedViews, view, compiledTemplateId, template, totalCalls);
                            };
                        }(normalizedViews, view, "layoutTemplate", template));
                    }

                    // global template
                    if (view.globalTemplate)
                    {
                        var template = view.globalTemplate;

                        functionArray.push(function(normalizedViews, view, compiledTemplateId, template) {
                            return function(totalCalls) {
                                compileViewTemplate(normalizedViews, view, compiledTemplateId, template, totalCalls);
                            };
                        }(normalizedViews, view, "globalTemplate", template));
                    }
                }

                // now invoke all of the functions
                // this tells each template to compile
                var totalCalls = functionArray.length;
                for (var i = 0; i < functionArray.length; i++)
                {
                    functionArray[i](totalCalls);
                }
            };

            var normalizeViews = function()
            {
                // the views that we're going to normalized
                var normalizedViews = {};
                var normalizedViewCount = 0;

                // some initial self-assurance to make sure we have the normalizedViews map set up
                if (!Alpaca.normalizedViews) {
                    Alpaca.normalizedViews = {};
                }
                self.normalizedViews = Alpaca.normalizedViews;

                // walk through all of our views
                for (var viewId in self.views)
                {
                    // if the view is already normalized on the Alpaca global, we do not bother
                    if (!Alpaca.normalizedViews[viewId])
                    {
                        var normalizedView = new Alpaca.NormalizedView(viewId);
                        if (normalizedView.normalize())
                        {
                            normalizedViews[viewId] = normalizedView;
                            normalizedViewCount++;
                        }
                        else
                        {
                            return Alpaca.throwErrorWithCallback("View normalization failed, cannot initialize Alpaca.  Please check the error logs.", errorCallback);
                        }
                    }
                }

                if (normalizedViewCount > 0)
                {
                    compileTemplates(normalizedViews);
                }
                else
                {
                    finalCallback(normalizedViews);
                }
            };

            normalizeViews();
        },

        /**
         * Looks up the proper template to be used to handle a requested template id for a view and a field.
         * Performs an override lookup to find the proper template.
         *
         * Hands back a descriptor of everything that is known about the resolved template.
         *
         * @param view
         * @param templateId
         * @param field
         * @return {Object}
         */
        getTemplateDescriptor: function(view, templateId, field)
        {
            var descriptor = {};

            //////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // FIGURE OUT WHERE THE TEMPLATE IS IN THE VIEW CONFIGURATION (RESPECTING FIELD OVERRIDES)
            //
            //////////////////////////////////////////////////////////////////////////////////////////////////

            var _template;
            var _templateType;

            // first consider template level
            if (view.templates && view.templates[templateId])
            {
                _template = view.templates[templateId];
                _templateType = "view";
            }

            // now allow for field overrides
            if (field && field.path)
            {
                var path = field.path;

                if (view && view.fields && view.fields[path] && view.fields[path].templates && view.fields[path].templates[templateId])
                {
                    _template = view.fields[path].templates[templateId];
                    _templateType = "field";
                }
            }

            // finally there are some hardcoded values
            if (templateId == "globalTemplate") {
                _template = "globalTemplate";
                _templateType = "global";
            }

            if (templateId == "layoutTemplate") {
                _template = "layoutTemplate";
                _templateType = "layout";
            }

            descriptor.template = {};
            descriptor.template.id = templateId;
            descriptor.template.type = _templateType;
            descriptor.template.value = _template;


            //////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // ENGINE PROPERTIES
            //
            //////////////////////////////////////////////////////////////////////////////////////////////////

            var type = null;
            var template = _template;
            if (Alpaca.isObject(template)) {
                type = template.type;
                template = template.template;
            }

            // if type isn't resolved, assume jquery tmpl()
            if (!type)
            {
                type = "text/x-jquery-tmpl";
            }

            var engine = Alpaca.TemplateEngineRegistry.find(type);
            if (!engine)
            {
                return Alpaca.throwDefaultError("Cannot find template engine for type: " + type);
            }

            descriptor.engine = {};
            descriptor.engine.type = type;
            descriptor.engine.id = engine.id;



            //////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // NOW DETERMINE THE COMPILED TEMPLATE ID FOR THIS TEMPLATE
            //
            //////////////////////////////////////////////////////////////////////////////////////////////////

            var compiledTemplateId = null;
            if (_templateType == "view")
            {
                compiledTemplateId = "view-" + templateId;
            }
            else if (_templateType == "field")
            {
                compiledTemplateId = "field-" + field.path + "-" + templateId;
            }
            else if (_templateType == "layout")
            {
                compiledTemplateId = "layoutTemplate";
            }
            else if (_templateType == "global")
            {
                compiledTemplateId = "globalTemplate";
            }

            descriptor.compiledTemplateId = compiledTemplateId;


            // look up the cacheKey for this compiled template id
            // verify it is in cache
            var cacheKey = view.compiledTemplates[compiledTemplateId];
            if (!cacheKey || !engine.isCached(cacheKey))
            {
                // well, it isn't actually a compiled template
                // thus, we cannot in the end produce a descriptor for it
                return null;
            }

            descriptor.cache = {};
            descriptor.cache.key = cacheKey;

            return descriptor;
        },

        /**
         * Executes a template and returns a DOM element.
         *
         * @param templateDescriptor
         * @param model
         */
        tmpl: function(templateDescriptor, model)
        {
            var html = Alpaca.tmplHtml(templateDescriptor, model);

            return Alpaca.safeDomParse(html);
        },

        /**
         * Executes a template and returns HTML.
         *
         * @param templateDescriptor
         * @param model
         */
        tmplHtml: function(templateDescriptor, model)
        {
            if (!model)
            {
                model = {};
            }

            var engineType = templateDescriptor.engine.type;
            var compiledTemplateId = templateDescriptor.compiledTemplateId;

            var engine = Alpaca.TemplateEngineRegistry.find(engineType);
            if (!engine)
            {
                return Alpaca.throwDefaultError("Cannot find template engine for type: " + engineType);
            }

            // execute the template
            var cacheKey = templateDescriptor.cache.key;
            var html = engine.execute(cacheKey, model, function(err) {
                return Alpaca.throwDefaultError("The compiled template: " + compiledTemplateId + " failed to execute: " + JSON.stringify(err));
            });

            return html;
        }
    });


    ///////////////////////////////////////////////////////////////////////////////////////////
    //
    // LOGGER
    //
    ///////////////////////////////////////////////////////////////////////////////////////////

    Alpaca.DEBUG = 0;
    Alpaca.INFO = 1;
    Alpaca.WARN = 2;
    Alpaca.ERROR = 3;

    // by default, logging only shows warnings and above
    // to debug, set Alpaca.logLevel = Alpaca.DEBUG
    Alpaca.logLevel = Alpaca.WARN;

    Alpaca.logDebug = function(obj) {
        Alpaca.log(Alpaca.DEBUG, obj);
    };
    Alpaca.logInfo = function(obj) {
        Alpaca.log(Alpaca.INFO, obj);
    };
    Alpaca.logWarn = function(obj) {
        Alpaca.log(Alpaca.WARN, obj);
    };
    Alpaca.logError = function(obj) {
        Alpaca.log(Alpaca.ERROR, obj);
    };

    Alpaca.LOG_METHOD_MAP = {
        0: 'debug',
        1: 'info',
        2: 'warn',
        3: 'error'
    };

    Alpaca.log = function(level, obj) {

        if (Alpaca.logLevel <= level)
        {
            var method = Alpaca.LOG_METHOD_MAP[level];

            if (typeof console !== 'undefined' && console[method])
            {
                if ("debug" == method) {
                    console.debug(obj);
                }
                else if ("info" == method) {
                    console.info(obj);
                }
                else if ("warn" == method) {
                    console.warn(obj);
                }
                else if ("error" == method) {
                    console.error(obj);
                }
                else {
                    console.log(obj);
                }
            }
        }
    };

    Alpaca.checked = function(el, value)
    {
        return Alpaca.attrProp(el, "checked", value);
    };

    Alpaca.attrProp = function(el, name, value)
    {
        if (!(typeof(value) === "undefined"))
        {
            // jQuery 1.6+
            if ($(el).prop)
            {
                $(el).prop(name, value);
            }
            else
            {
                if (value) {
                    $(el).attr(name, value);
                } else {
                    $(el).removeAttr(name);
                }
            }
        }

        // now return the correct value

        // jQuery 1.6+
        if ($(el).prop) {
            return $(el).prop(name);
        }

        return $(el).attr(name);
    };

    Alpaca.loadRefSchemaOptions = function(topField, referenceId, callback)
    {
        if (!referenceId)
        {
            callback();
        }
        else if (referenceId == "#")
        {
            // this is the uri of the current schema document
            callback(topField.schema, topField.options);
        }
        else if (referenceId.indexOf("#/") == 0)
        {
            // this is a property path relative to the root of the current schema
            var defId = referenceId.substring(2);

            // split into tokens
            var tokens = defId.split("/");

            var defSchema = topField.schema;
            for (var i = 0; i < tokens.length; i++)
            {
                var token = tokens[i];

                // schema
                if (defSchema[token])
                {
                    defSchema = defSchema[token];
                }
                else if (defSchema.properties && defSchema.properties[token])
                {
                    defSchema = defSchema.properties[token];
                }
                else if (defSchema.definitions && defSchema.definitions[token])
                {
                    defSchema = defSchema.definitions[token];
                }
                else
                {
                    defSchema = null;
                    break;
                }
            }

            var defOptions = topField.options;
            for (var i = 0; i < tokens.length; i++)
            {
                var token = tokens[i];

                // options
                if (defOptions[token])
                {
                    defOptions = defOptions[token];
                }
                else if (defOptions.fields && defOptions.fields[token])
                {
                    defOptions = defOptions.fields[token];
                }
                else if (defOptions.definitions && defOptions.definitions[token])
                {
                    defOptions = defOptions.definitions[token];
                }
                else
                {
                    defOptions = null;
                    break;
                }
            }

            callback(defSchema, defOptions);
        }
        else if (referenceId.indexOf("#") == 0)
        {
            // this is the ID of a node in the current schema document

            // walk the current document schema until we find the referenced node (using id property)
            var resolution = Alpaca.resolveReference(topField.schema, topField.options, referenceId);
            if (resolution)
            {
                callback(resolution.schema, resolution.options);
            }
            else
            {
                // nothing
                callback();
            }
        }
        else
        {
            // the reference is considered to be a URI with or without a "#" in it to point to a specific location in
            // the target schema

            var referenceParts = Alpaca.pathParts(referenceId);

            topField.connector.loadReferenceSchema(referenceParts.path, function(schema) {
                topField.connector.loadReferenceOptions(referenceParts.path, function(options) {

                    if (referenceParts.id)
                    {
                        var resolution = Alpaca.resolveReference(schema, options, referenceParts.id);
                        if (resolution)
                        {
                            schema = resolution.schema;
                            options = resolution.options;
                        }
                    }

                    callback(schema, options);

                }, function() {
                    callback(schema);
                });
            }, function() {
                callback();
            });
        }
    };

    Alpaca.DEFAULT_ERROR_CALLBACK = function(error)
    {
        if (error && error.message)
        {
            // log to debug
            Alpaca.logError(error.message);

            // error out
            throw new Error("Alpaca caught an error with the default error handler: " + error.message);

        }
    };

    /**
     * Default error callback handler for Alpaca.
     *
     * This error handler will be used if an "error" argument isn't passed in to the constructor for an Alpaca field.
     *
     * @param error
     */
    Alpaca.defaultErrorCallback = Alpaca.DEFAULT_ERROR_CALLBACK;

    /**
     * Utility method that throws a general error and dispatches to the default error handler.
     *
     * @param message
     */
    Alpaca.throwDefaultError = function(message)
    {
        if (message && Alpaca.isObject(message))
        {
            message = JSON.stringify(message);
        }

        var err = {
            "message": message
        };

        Alpaca.defaultErrorCallback(err);
    };

    /**
     * Utility method that throws an error back to the given callback handler.
     *
     * @param message
     * @param errorCallback
     */
    Alpaca.throwErrorWithCallback = function(message, errorCallback)
    {
        if (message && Alpaca.isObject(message))
        {
            message = JSON.stringify(message);
        }

        var err = {
            "message": message
        };

        if (errorCallback)
        {
            errorCallback(err);
        }
        else
        {
            Alpaca.defaultErrorCallback(err);
        }
    };


    /**
     * Given a base field, walks the schema, options and data forward until it
     * discovers the given reference.
     *
     * @param schema
     * @param options
     * @param referenceId
     */
    Alpaca.resolveReference = function(schema, options, referenceId)
    {
        if (schema.id == referenceId)
        {
            var result = {};
            if (schema) {
                result.schema = schema;
            }
            if (options) {
                result.options = options;
            }

            return result;
        }
        else
        {
            if (schema && schema.properties)
            {
                for (var propertyId in schema.properties)
                {
                    var subSchema = schema.properties[propertyId];
                    var subOptions = null;
                    if (options && options.fields && options.fields[propertyId])
                    {
                        subOptions = options.fields[propertyId];
                    }

                    var x = Alpaca.resolveReference(subSchema, subOptions, referenceId);
                    if (x)
                    {
                        return x;
                    }
                }
            }
        }

        return null;
    };

    $.alpaca = window.Alpaca = Alpaca;

    /**
     * jQuery friendly method for binding a field to a DOM element.
     * @ignore
     */
    $.fn.alpaca = function() {
        var args = Alpaca.makeArray(arguments);

        // append this into the front of args
        var newArgs = [].concat(this, args);

        // hand back the field instance
        return Alpaca.apply(this, newArgs);
    };

    /**
     * @ignore
     * @param nocloning
     */
    $.fn.outerHTML = function(nocloning) {
        if (nocloning) {
            return $("<div></div>").append(this).html();
        } else {
            return $("<div></div>").append(this.clone()).html();
        }
    };

    /**
     * @ignore
     * @param to
     */
    $.fn.swapWith = function(to) {
        return this.each(function() {
            var copy_to = $(to).clone();
            var copy_from = $(this).clone();
            $(to).replaceWith(copy_from);
            $(this).replaceWith(copy_to);
        });
    };

    $.fn.attrProp = function(name, value) {
        return Alpaca.attrProp($(this), name, value);
    };

    /**
     * When dom elements are removed, we fire the special "destroyed" event to allow for late cleanup of any Alpaca code
     * that might be in-memory and linked to the dom element.
     *
     * @type {Object}
     */
    $.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler();
            }
        }
    };


    Alpaca.CountersMap = {};
    Alpaca.Counters = function(name)
    {
        if (Alpaca.Counters[name])
        {
            return Alpaca.Counters[name];
        }

        // create new counters

        var types = {};
        var all = {
            count: 0,
            total: 0,
            avg: 0,
            touches: 0
        };

        var counters = {

            increment: function(type, amount)
            {
                if (!types[type]) {
                    types[type] = {
                        count: 0,
                        total: 0,
                        avg: 0,
                        touches: 0
                    };
                }

                types[type].count++;
                types[type].total += amount;
                types[type].avg = types[type].total / types[type].count;
                types[type].touches++;

                all.count++;
                all.total += amount;
                all.avg = all.total / all.count;
                all.touches++;
            },

            read: function(type) {
                return types[type];
            },

            each: function(f) {
                for (var type in types)
                {
                    f(type, types[type]);
                }
            },

            all: function() {
                return all;
            }
        };

        Alpaca.Counters[name] = counters;

        return counters;
    };

    Alpaca.collectTiming = false;

    Alpaca.pathParts = function(resource)
    {
        if (typeof(resource) != "string")
        {
            return resource;
        }

        // convert string to object
        var resourcePath = resource;
        var resourceId = null;
        var i = resourcePath.indexOf("#");
        if (i > -1)
        {
            resourceId = resourcePath.substring(i + 1);
            resourcePath = resourcePath.substring(0, i);
        }

        if (Alpaca.endsWith(resourcePath, "/")) {
            resourcePath = resourcePath.substring(0, resourcePath.length - 1);
        }

        var parts = {};
        parts.path = resourcePath;

        if (resourceId)
        {
            parts.id = resourceId;
        }

        return parts;
    };

    /**
     * Resolves a field by its property id.
     *
     * @param containerField
     * @param propertyId
     * @returns {null}
     */
    Alpaca.resolveField = function(containerField, propertyIdOrReferenceId)
    {
        var resolvedField = null;

        if (typeof(propertyIdOrReferenceId) == "string")
        {
            if (propertyIdOrReferenceId.indexOf("#/") == 0 && propertyId.length > 2)
            {
                // TODO: path based lookup?
            }
            else if (propertyIdOrReferenceId == "#" || propertyIdOrReferenceId == "#/")
            {
                resolvedField = containerField;
            }
            else if (propertyIdOrReferenceId.indexOf("#") == 0)
            {
                // reference id lookup

                // find the top field
                var topField = containerField;
                while (topField.parent)
                {
                    topField = topField.parent;
                }

                var referenceId = propertyIdOrReferenceId.substring(1);

                resolvedField = Alpaca.resolveFieldByReference(topField, referenceId);

            }
            else
            {
                // property lookup
                resolvedField = containerField.childrenByPropertyId[propertyIdOrReferenceId];
            }
        }

        return resolvedField;
    };

    /**
     * Resolves a field based on its "reference id" relative to a top level field.  This walks down the field tree and
     * looks for matching schema.id references to find the matching field.
     *
     * @param field
     * @param referenceId
     */
    Alpaca.resolveFieldByReference = function(field, referenceId)
    {
        if (field.schema && field.schema.id == referenceId)
        {
            return field;
        }
        else
        {
            if (field.children && field.children.length > 0)
            {
                for (var i = 0; i < field.children.length; i++)
                {
                    var child = field.children[i];

                    var resolved = Alpaca.resolveFieldByReference(child, referenceId);
                    if (resolved)
                    {
                        return resolved;
                    }
                }
            }
        }

        return null;
    };

    /**
     * Determines whether any of the elements of the first argument are equal to the elements of the second argument.
     *
     * @param first either a scalar value or a container (object or array) of values
     * @param second either a scalar value or a container (object or array) of values
     * @returns whether at least one match is found
     */
    Alpaca.anyEquality = function(first, second)
    {
        // copy values from first into a values lookup map
        var values = {};
        if (typeof(first) == "object" || typeof(first) == "array")
        {
            for (var k in first)
            {
                values[first[k]] = true;
            }
        }
        else
        {
            values[first] = true;
        }

        var result = false;

        // check values from second against the lookup map
        if (typeof(second) == "object" || typeof(second) == "array")
        {
            for (var k in second)
            {
                var v = second[k];

                if (values[v])
                {
                    result = true;
                    break;
                }
            }
        }
        else
        {
            result = values[second];
        }

        return result;
    };

    Alpaca.series = function(funcs, callback)
    {
        async.series(funcs, function() {
            callback();
        });
    };

    Alpaca.parallel = function(funcs, callback)
    {
        async.parallel(funcs, function() {
            callback();
        });
    };

    Alpaca.nextTick = function(f)
    {
        async.nextTick(function() {
            f();
        });
    };

    /**
     * Compiles the validation context for the chain of fields from the top-most down to the given field.
     * Each validation context entry is a field in the chain which describes the following:
     *
     *    {
     *       "field": the field instance,
     *       "before": the before value (boolean)
     *       "after": the after value (boolean)
     *       "validated": (optional) if the field validated (switches state from invalid to valid)
     *       "invalidated": (optional) if the field invalidated (switches state from valid to invalid)
     *    }
     *
     * This hands back an array of entries with the child field first and continuing up the parent chain.
     * The last entry in the array is the top most parent field.
     *
     * @param field
     * @returns {Array}
     */
    Alpaca.compileValidationContext = function(field)
    {
        // walk up the parent tree until we find the top-most control
        // this serves as our starting point for downward validation
        var chain = [];
        var parent = field;
        do
        {
            if (!parent.isValidationParticipant())
            {
                parent = null;
            }

            if (parent)
            {
                chain.push(parent);
            }

            if (parent)
            {
                parent = parent.parent;
            }
        }
        while (parent);

        // reverse so top most parent is first
        chain.reverse();

        // compilation context
        var context = [];

        // internal method that sets validation for a single field
        var f = function(chain, context)
        {
            if (!chain || chain.length == 0)
            {
                return;
            }

            var current = chain[0];

            var entry = {};
            entry.id = current.getId();
            entry.field = current;
            entry.path = current.path;

            // BEFORE field validation status
            var beforeStatus = current.isValid();
            if (current.isContainer())
            {
                beforeStatus = current.isValid(true);
            }

            entry.before = beforeStatus;

            // step down into chain
            if (chain.length > 1)
            {
                // copy array
                var childChain = chain.slice(0);
                childChain.shift();
                f(childChain, context);
            }

            var previouslyValidated = current._previouslyValidated;

            // now run the validation for just this one field
            current.validate();

            // apply custom validation (if exists) for just this one field
            current._validateCustomValidator(function() {

                // AFTER field validation state
                var afterStatus = current.isValid();
                if (current.isContainer())
                {
                    afterStatus = current.isValid(true);
                }

                entry.after = afterStatus;

                // if this field's validation status flipped, fire triggers
                entry.validated = false;
                entry.invalidated = false;
                if (!beforeStatus && afterStatus)
                {
                    entry.validated = true;
                }
                else if (beforeStatus && !afterStatus)
                {
                    entry.invalidated = true;
                }
                // special case for fields that have not yet been validated
                else if (!previouslyValidated && !afterStatus)
                {
                    entry.invalidated = true;
                }

                entry.container = current.isContainer();;
                entry.valid = entry.after;

                context.push(entry);
            });
        };

        f(chain, context);

        return context;
    };

    Alpaca.updateValidationStateForContext = function(context)
    {
        // walk through each and flip any DOM UI based on entry state
        for (var i = 0; i < context.length; i++)
        {
            var entry = context[i];
            var field = entry.field;

            // clear out previous validation UI markers
            field.getStyleInjection("removeError", field.getEl());
            field.getEl().removeClass("alpaca-field-invalid alpaca-field-invalid-hidden alpaca-field-valid");

            var showMessages = false;

            // valid?
            if (entry.valid)
            {
                field.getEl().addClass("alpaca-field-valid");
            }
            else
            {
                // we don't markup invalidation state for readonly fields
                if (!field.options.readonly)
                {
                    if (!field.hideInitValidationError)
                    {
                        field.getStyleInjection("error", field.getEl());
                        field.getEl().addClass("alpaca-field-invalid");

                        showMessages = true;
                    }
                    else
                    {
                        field.getEl().addClass("alpaca-field-invalid-hidden");
                    }
                }
                else
                {
                    // this field is invalid and is also read-only, so we're not supposed to inform the end-user
                    // within the UI (since there is nothing we can do about it)
                    // here, we log a message to debug to inform the developer
                    Alpaca.logWarn("The field (id=" + field.getId() + ", title=" + field.getTitle() + ", path=" + field.path + ") is invalid and also read-only");
                }
            }

            // TRIGGERS
            if (entry.validated)
            {
                Alpaca.later(25, this, function() {
                    field.trigger("validated");
                });
            }
            else if (entry.invalidated)
            {
                Alpaca.later(25, this, function() {
                    field.trigger("invalidated");
                });
            }

            // Allow for the message to change
            if (field.options.showMessages)
            {
                if (!field.initializing)
                {
                    // we don't markup invalidation state for readonly fields
                    if (!field.options.readonly)
                    {
                        // messages
                        var messages = [];
                        for (var messageId in field.validation)
                        {
                            if (!field.validation[messageId]["status"])
                            {
                                messages.push(field.validation[messageId]["message"]);
                            }
                        }

                        field.displayMessage(messages, field.valid);
                    }
                }
            }

            if (showMessages)
            {
                field.showHiddenMessages();
            }
        }
    };

    /**
     * Runs the given function over the field and all of its children recursively.
     *
     * @param field
     * @param fn
     */
    Alpaca.fieldApplyChildren = function(field, fn)
    {
        var f = function(field, fn)
        {
            // if the field has children, go depth first
            if (field.children && field.children.length > 0)
            {
                for (var i = 0; i < field.children.length; i++)
                {
                    fn(field.children[i]);
                }
            }
        };

        f(field, fn);
    };










    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // ASYNC
    //
    // Here we provide a reduced version of the wonderful async library.  This is entirely inline and
    // will have no bearing on any external dependencies on async.
    //
    // https://github.com/caolan/async
    // Copyright (c) 2010 Caolan McMahon
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    /*global setImmediate: false, setTimeout: false, console: false */
    (function () {

        var async = {};

        // global on the server, window in the browser
        var root, previous_async;

        root = this;
        if (root != null) {
            previous_async = root.async;
        }

        async.noConflict = function () {
            root.async = previous_async;
            return async;
        };

        function only_once(fn) {
            var called = false;
            return function() {
                if (called) throw new Error("Callback was already called.");
                called = true;
                fn.apply(root, arguments);
            }
        }

        //// cross-browser compatiblity functions ////

        var _each = function (arr, iterator) {
            if (arr.forEach) {
                return arr.forEach(iterator);
            }
            for (var i = 0; i < arr.length; i += 1) {
                iterator(arr[i], i, arr);
            }
        };

        var _map = function (arr, iterator) {
            if (arr.map) {
                return arr.map(iterator);
            }
            var results = [];
            _each(arr, function (x, i, a) {
                results.push(iterator(x, i, a));
            });
            return results;
        };

        var _reduce = function (arr, iterator, memo) {
            if (arr.reduce) {
                return arr.reduce(iterator, memo);
            }
            _each(arr, function (x, i, a) {
                memo = iterator(memo, x, i, a);
            });
            return memo;
        };

        var _keys = function (obj) {
            if (Object.keys) {
                return Object.keys(obj);
            }
            var keys = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };

        //// exported async module functions ////

        //// nextTick implementation with browser-compatible fallback ////
        if (typeof process === 'undefined' || !(process.nextTick)) {
            if (typeof setImmediate === 'function') {
                async.nextTick = function (fn) {
                    // not a direct alias for IE10 compatibility
                    setImmediate(fn);
                };
                async.setImmediate = async.nextTick;
            }
            else {
                async.nextTick = function (fn) {
                    setTimeout(fn, 0);
                };
                async.setImmediate = async.nextTick;
            }
        }
        else {
            async.nextTick = process.nextTick;
            if (typeof setImmediate !== 'undefined') {
                async.setImmediate = function (fn) {
                    // not a direct alias for IE10 compatibility
                    setImmediate(fn);
                };
            }
            else {
                async.setImmediate = async.nextTick;
            }
        }

        async.each = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            _each(arr, function (x) {
                iterator(x, only_once(function (err) {
                    if (err) {
                        callback(err);
                        callback = function () {};
                    }
                    else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback(null);
                        }
                    }
                }));
            });
        };
        async.forEach = async.each;

        async.eachSeries = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            var iterate = function () {
                iterator(arr[completed], function (err) {
                    if (err) {
                        callback(err);
                        callback = function () {};
                    }
                    else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback(null);
                        }
                        else {
                            iterate();
                        }
                    }
                });
            };
            iterate();
        };
        async.forEachSeries = async.eachSeries;

        async.eachLimit = function (arr, limit, iterator, callback) {
            var fn = _eachLimit(limit);
            fn.apply(null, [arr, iterator, callback]);
        };
        async.forEachLimit = async.eachLimit;

        var _eachLimit = function (limit) {

            return function (arr, iterator, callback) {
                callback = callback || function () {};
                if (!arr.length || limit <= 0) {
                    return callback();
                }
                var completed = 0;
                var started = 0;
                var running = 0;

                (function replenish () {
                    if (completed >= arr.length) {
                        return callback();
                    }

                    while (running < limit && started < arr.length) {
                        started += 1;
                        running += 1;
                        iterator(arr[started - 1], function (err) {
                            if (err) {
                                callback(err);
                                callback = function () {};
                            }
                            else {
                                completed += 1;
                                running -= 1;
                                if (completed >= arr.length) {
                                    callback();
                                }
                                else {
                                    replenish();
                                }
                            }
                        });
                    }
                })();
            };
        };


        var doParallel = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args));
            };
        };
        var doParallelLimit = function(limit, fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args));
            };
        };
        var doSeries = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args));
            };
        };


        var _asyncMap = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        };
        async.map = doParallel(_asyncMap);
        async.mapSeries = doSeries(_asyncMap);
        async.mapLimit = function (arr, limit, iterator, callback) {
            return _mapLimit(limit)(arr, iterator, callback);
        };

        var _mapLimit = function(limit) {
            return doParallelLimit(limit, _asyncMap);
        };

        // reduce only has a series version, as doing reduce in parallel won't
        // work in many situations.
        async.reduce = function (arr, memo, iterator, callback) {
            async.eachSeries(arr, function (x, callback) {
                iterator(memo, x, function (err, v) {
                    memo = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, memo);
            });
        };
        // inject alias
        async.inject = async.reduce;
        // foldl alias
        async.foldl = async.reduce;

        async.reduceRight = function (arr, memo, iterator, callback) {
            var reversed = _map(arr, function (x) {
                return x;
            }).reverse();
            async.reduce(reversed, memo, iterator, callback);
        };
        // foldr alias
        async.foldr = async.reduceRight;

        var _filter = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.filter = doParallel(_filter);
        async.filterSeries = doSeries(_filter);
        // select alias
        async.select = async.filter;
        async.selectSeries = async.filterSeries;

        var _reject = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (!v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.reject = doParallel(_reject);
        async.rejectSeries = doSeries(_reject);

        var _detect = function (eachfn, arr, iterator, main_callback) {
            eachfn(arr, function (x, callback) {
                iterator(x, function (result) {
                    if (result) {
                        main_callback(x);
                        main_callback = function () {};
                    }
                    else {
                        callback();
                    }
                });
            }, function (err) {
                main_callback();
            });
        };
        async.detect = doParallel(_detect);
        async.detectSeries = doSeries(_detect);

        async.some = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (v) {
                        main_callback(true);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(false);
            });
        };
        // any alias
        async.any = async.some;

        async.every = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (!v) {
                        main_callback(false);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(true);
            });
        };
        // all alias
        async.all = async.every;

        async.sortBy = function (arr, iterator, callback) {
            async.map(arr, function (x, callback) {
                iterator(x, function (err, criteria) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, {value: x, criteria: criteria});
                    }
                });
            }, function (err, results) {
                if (err) {
                    return callback(err);
                }
                else {
                    var fn = function (left, right) {
                        var a = left.criteria, b = right.criteria;
                        return a < b ? -1 : a > b ? 1 : 0;
                    };
                    callback(null, _map(results.sort(fn), function (x) {
                        return x.value;
                    }));
                }
            });
        };

        async.auto = function (tasks, callback) {
            callback = callback || function () {};
            var keys = _keys(tasks);
            if (!keys.length) {
                return callback(null);
            }

            var results = {};

            var listeners = [];
            var addListener = function (fn) {
                listeners.unshift(fn);
            };
            var removeListener = function (fn) {
                for (var i = 0; i < listeners.length; i += 1) {
                    if (listeners[i] === fn) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            };
            var taskComplete = function () {
                _each(listeners.slice(0), function (fn) {
                    fn();
                });
            };

            addListener(function () {
                if (_keys(results).length === keys.length) {
                    callback(null, results);
                    callback = function () {};
                }
            });

            _each(keys, function (k) {
                var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
                var taskCallback = function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    if (err) {
                        var safeResults = {};
                        _each(_keys(results), function(rkey) {
                            safeResults[rkey] = results[rkey];
                        });
                        safeResults[k] = args;
                        callback(err, safeResults);
                        // stop subsequent errors hitting callback multiple times
                        callback = function () {};
                    }
                    else {
                        results[k] = args;
                        async.setImmediate(taskComplete);
                    }
                };
                var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                var ready = function () {
                    return _reduce(requires, function (a, x) {
                        return (a && results.hasOwnProperty(x));
                    }, true) && !results.hasOwnProperty(k);
                };
                if (ready()) {
                    task[task.length - 1](taskCallback, results);
                }
                else {
                    var listener = function () {
                        if (ready()) {
                            removeListener(listener);
                            task[task.length - 1](taskCallback, results);
                        }
                    };
                    addListener(listener);
                }
            });
        };

        async.waterfall = function (tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor !== Array) {
                var err = new Error('First argument to waterfall must be an array of functions');
                return callback(err);
            }
            if (!tasks.length) {
                return callback();
            }
            var wrapIterator = function (iterator) {
                return function (err) {
                    if (err) {
                        callback.apply(null, arguments);
                        callback = function () {};
                    }
                    else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.push(wrapIterator(next));
                        }
                        else {
                            args.push(callback);
                        }
                        async.setImmediate(function () {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(async.iterator(tasks))();
        };

        var _parallel = function(eachfn, tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor === Array) {
                eachfn.map(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                eachfn.each(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };

        async.parallel = function (tasks, callback) {
            _parallel({ map: async.map, each: async.each }, tasks, callback);
        };

        async.parallelLimit = function(tasks, limit, callback) {
            _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
        };

        async.series = function (tasks, callback) {
            callback = callback || function () {};
            if (tasks.constructor === Array) {
                async.mapSeries(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                async.eachSeries(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };

        async.iterator = function (tasks) {
            var makeCallback = function (index) {
                var fn = function () {
                    if (tasks.length) {
                        tasks[index].apply(null, arguments);
                    }
                    return fn.next();
                };
                fn.next = function () {
                    return (index < tasks.length - 1) ? makeCallback(index + 1): null;
                };
                return fn;
            };
            return makeCallback(0);
        };

        async.apply = function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return fn.apply(
                    null, args.concat(Array.prototype.slice.call(arguments))
                );
            };
        };

        var _concat = function (eachfn, arr, fn, callback) {
            var r = [];
            eachfn(arr, function (x, cb) {
                fn(x, function (err, y) {
                    r = r.concat(y || []);
                    cb(err);
                });
            }, function (err) {
                callback(err, r);
            });
        };
        async.concat = doParallel(_concat);
        async.concatSeries = doSeries(_concat);

        async.whilst = function (test, iterator, callback) {
            if (test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.whilst(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };

        async.doWhilst = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (test()) {
                    async.doWhilst(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };

        async.until = function (test, iterator, callback) {
            if (!test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.until(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };

        async.doUntil = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (!test()) {
                    async.doUntil(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };

        async.queue = function (worker, concurrency) {
            if (concurrency === undefined) {
                concurrency = 1;
            }
            function _insert(q, data, pos, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    var item = {
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    };

                    if (pos) {
                        q.tasks.unshift(item);
                    } else {
                        q.tasks.push(item);
                    }

                    if (q.saturated && q.tasks.length === concurrency) {
                        q.saturated();
                    }
                    async.setImmediate(q.process);
                });
            }

            var workers = 0;
            var q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                push: function (data, callback) {
                    _insert(q, data, false, callback);
                },
                unshift: function (data, callback) {
                    _insert(q, data, true, callback);
                },
                process: function () {
                    if (workers < q.concurrency && q.tasks.length) {
                        var task = q.tasks.shift();
                        if (q.empty && q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var next = function () {
                            workers -= 1;
                            if (task.callback) {
                                task.callback.apply(task, arguments);
                            }
                            if (q.drain && q.tasks.length + workers === 0) {
                                q.drain();
                            }
                            q.process();
                        };
                        var cb = only_once(next);
                        worker(task.data, cb);
                    }
                },
                length: function () {
                    return q.tasks.length;
                },
                running: function () {
                    return workers;
                }
            };
            return q;
        };

        async.cargo = function (worker, payload) {
            var working     = false,
                tasks       = [];

            var cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                push: function (data, callback) {
                    if(data.constructor !== Array) {
                        data = [data];
                    }
                    _each(data, function(task) {
                        tasks.push({
                            data: task,
                            callback: typeof callback === 'function' ? callback : null
                        });
                        if (cargo.saturated && tasks.length === payload) {
                            cargo.saturated();
                        }
                    });
                    async.setImmediate(cargo.process);
                },
                process: function process() {
                    if (working) return;
                    if (tasks.length === 0) {
                        if(cargo.drain) cargo.drain();
                        return;
                    }

                    var ts = typeof payload === 'number'
                        ? tasks.splice(0, payload)
                        : tasks.splice(0);

                    var ds = _map(ts, function (task) {
                        return task.data;
                    });

                    if(cargo.empty) cargo.empty();
                    working = true;
                    worker(ds, function () {
                        working = false;

                        var args = arguments;
                        _each(ts, function (data) {
                            if (data.callback) {
                                data.callback.apply(null, args);
                            }
                        });

                        process();
                    });
                },
                length: function () {
                    return tasks.length;
                },
                running: function () {
                    return working;
                }
            };
            return cargo;
        };

        var _console_fn = function (name) {
            return function (fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                fn.apply(null, args.concat([function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (typeof console !== 'undefined') {
                        if (err) {
                            if (console.error) {
                                console.error(err);
                            }
                        }
                        else if (console[name]) {
                            _each(args, function (x) {
                                console[name](x);
                            });
                        }
                    }
                }]));
            };
        };
        async.log = _console_fn('log');
        async.dir = _console_fn('dir');
        /*async.info = _console_fn('info');
         async.warn = _console_fn('warn');
         async.error = _console_fn('error');*/

        async.memoize = function (fn, hasher) {
            var memo = {};
            var queues = {};
            hasher = hasher || function (x) {
                return x;
            };
            var memoized = function () {
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                var key = hasher.apply(null, args);
                if (key in memo) {
                    callback.apply(null, memo[key]);
                }
                else if (key in queues) {
                    queues[key].push(callback);
                }
                else {
                    queues[key] = [callback];
                    fn.apply(null, args.concat([function () {
                        memo[key] = arguments;
                        var q = queues[key];
                        delete queues[key];
                        for (var i = 0, l = q.length; i < l; i++) {
                            q[i].apply(null, arguments);
                        }
                    }]));
                }
            };
            memoized.memo = memo;
            memoized.unmemoized = fn;
            return memoized;
        };

        async.unmemoize = function (fn) {
            return function () {
                return (fn.unmemoized || fn).apply(null, arguments);
            };
        };

        async.times = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.map(counter, iterator, callback);
        };

        async.timesSeries = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.mapSeries(counter, iterator, callback);
        };

        async.compose = function (/* functions... */) {
            var fns = Array.prototype.reverse.call(arguments);
            return function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                async.reduce(fns, args, function (newargs, fn, cb) {
                        fn.apply(that, newargs.concat([function () {
                            var err = arguments[0];
                            var nextargs = Array.prototype.slice.call(arguments, 1);
                            cb(err, nextargs);
                        }]))
                    },
                    function (err, results) {
                        callback.apply(that, [err].concat(results));
                    });
            };
        };

        var _applyEach = function (eachfn, fns /*args...*/) {
            var go = function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                return eachfn(fns, function (fn, cb) {
                        fn.apply(that, args.concat([cb]));
                    },
                    callback);
            };
            if (arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return go.apply(this, args);
            }
            else {
                return go;
            }
        };
        async.applyEach = doParallel(_applyEach);
        async.applyEachSeries = doSeries(_applyEach);

        async.forever = function (fn, callback) {
            function next(err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    }
                    throw err;
                }
                fn(next);
            }
            next();
        };

        /*
        // AMD / RequireJS
        if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return async;
            });
        }
        // Node.js
        else if (typeof module !== 'undefined' && module.exports) {
            module.exports = async;
        }
        // included directly via <script> tag
        else {
            root.async = async;
        }
        */

        root.async = async;

    }());

})(jQuery);
(function()
{
    Alpaca.TemplateEngineRegistry = function() {

        var registry = {};

        return {

            register: function(id, engine)
            {
                registry[id] = engine;
            },

            find: function(idOrType)
            {
                var engine = null;

                if (registry[idOrType])
                {
                    engine = registry[idOrType];
                }
                else
                {
                    // inspect by type
                    for (var id in registry)
                    {
                        var supportedMimetypes = registry[id].supportedMimetypes();
                        for (var i = 0; i < supportedMimetypes.length; i++)
                        {
                            if (idOrType.toLowerCase() == supportedMimetypes[i].toLowerCase())
                            {
                                engine = registry[id];
                                break;
                            }
                        }
                    }
                }

                return engine;
            },

            ids: function()
            {
                var ids = [];

                for (var id in registry)
                {
                    ids.push(id);
                }

                return ids;
            }
        };
    }();

})();
(function($)
{
    // template cache
    if (typeof(Alpaca.TemplateCache) == "undefined") {
        Alpaca.TemplateCache = {};
    }

    Alpaca.AbstractTemplateEngine = Base.extend(
    {
        constructor: function(id)
        {
            this.base();

            this.id = id;

            this.cleanMarkup = function(html)
            {
                // convert to a dom briefly
                var dom = Alpaca.safeDomParse(html);

                // if if starts with a script tag, then we strip that out
                if ($(dom).length == 1)
                {
                    if ($(dom)[0].nodeName.toLowerCase() == "script")
                    {
                        html = $(dom).html();
                    }
                }

                return html;
            };
        },

        /**
         * Compiles the given template (or URI or dom selector)
         *
         * @param cacheKey
         * @param template
         * @param callback
         */
        compile: function(cacheKey, template, callback)
        {
            var self = this;

            // the value being compiled can be
            //   HTML
            //   URL (http, ./ or /)
            //   dom selector (#abc, .classname)
            //   dom element

            // here we try to determine what type of value it is
            var type = "html";
            if (Alpaca.isString(template))
            {
                if (template.indexOf("./") === 0 || template.indexOf("/") === 0 || template.indexOf("../") === 0)
                {
                    type = "uri";
                }
                else if (template.indexOf("#") === 0 || template.indexOf(".") === 0 || template.indexOf("[") === 0)
                {
                    type = "selector";
                }
            }
            else
            {
                // it's a dom element, we flow through
            }

            // now extract html and compile
            if (type == "selector")
            {
                self._compile(cacheKey, template, callback);
            }
            else if (type == "uri")
            {
                var fileExtension = self.fileExtension();

                var url = template;
                if (url.indexOf("." + fileExtension) === -1) {
                    url += "." + fileExtension;
                }

                // load the template via ajax
                $.ajax({
                    "url": url,
                    "dataType": "html",
                    "success": function(html)
                    {
                        // cleanup html
                        html = self.cleanMarkup(html);

                        self._compile(cacheKey, html, callback);
                    },
                    "failure": function(http)
                    {
                        callback(http, null);
                    }
                });
            }
            else if (type == "html")
            {
                var html = template;
                if (html instanceof jQuery) {
                    html = Alpaca.safeDomParse(template).outerHTML();
                }

                self._compile(cacheKey, html, callback);
            }
            else
            {
                callback(new Error("Template engine cannot determine how to handle type: " + type));
            }
        },

        _compile: function(cacheKey, html, callback)
        {
            // for null templates, set to empty string
            if (Alpaca.isEmpty(html)) {
                html = "";
            }

            // trim the html
            html = Alpaca.trim(html);

            if (html.toLowerCase().indexOf("<script") === 0)
            {
                // already has script tag
            }
            else
            {
                // apply script tag
                html = "<script type='" + this.supportedMimetypes()[0] + "'>" + html + "</script>";
            }

            Alpaca.logDebug("Compiling template: " + this.id + ", cacheKey: " + cacheKey + ", template: " + html);

            this.doCompile(cacheKey, html, callback);
        },

        /**
         * @extension_point
         *
         * @param cacheKey
         * @param html
         * @param callback
         */
        doCompile: function(cacheKey, html, callback)
        {

        },

        /**
         * @extension_point
         *
         * @param cacheKey
         * @param model
         * @param callback
         */
        execute: function(cacheKey, model, callback)
        {
            Alpaca.logDebug("Executing template for cache key: " + cacheKey);

            var dom = this.doExecute(cacheKey, model, callback);

            // if wrapped in script tag, strip away
            var strip_script = function(dom)
            {
                // if if starts with a script tag, then we strip that out
                if ($(dom).length == 1)
                {
                    if ($(dom)[0].nodeName.toLowerCase() == "script")
                    {
                        return $(dom).html();

                    }
                }

                return html;
            };

            dom = strip_script(dom);

            return dom;
        },

        /**
         * @extension_point
         *
         * @param cacheKey
         * @param model
         * @param callback
         */
        doExecute: function(cacheKey, model, callback)
        {

        },

        /**
         * Hands back the expected file extension for templates loaded via URI.
         *
         * @return {String}
         */
        fileExtension: function() {
            return "html";
        },

        /**
         * Hands back the list of associated script tag types for templates loaded from the DOM.
         *
         * @return {Array}
         */
        supportedMimetypes: function()
        {
            return [];
        },

        /**
         * Determines whether an existing template is already in cache.
         *
         * @param cacheKey
         */
        isCached: function(cacheKey)
        {

        }

    });

})(jQuery);(function($)
{
    Alpaca.JQueryTemplateEngine = Alpaca.AbstractTemplateEngine.extend(
    {
        fileExtension: function() {
            return "html";
        },

        supportedMimetypes: function()
        {
            return [
                "text/x-jquery-template",
                "text/x-jquery-tmpl"
            ];
        },

        doCompile: function(cacheKey, html, callback)
        {
            try
            {
                $.template(cacheKey, html);
            }
            catch (e)
            {
                callback(e);
                return;
            }

            Alpaca.TemplateCache[cacheKey] = html;

            callback();
        },

        doExecute: function(cacheKey, model, callback)
        {
            var self = this;

            // render template
            var html = null;
            try
            {
                var dom = $.tmpl(cacheKey, model);

                // convert to string
                var _html = dom.outerHTML();

                // strip out the _tmplitem attribute if it is sticking around anywhere
                var i = -1;
                do
                {
                    i = _html.indexOf("_tmplitem=");
                    if (i > -1)
                    {
                        var j = _html.indexOf(" ", i);
                        if (j == -1)
                        {
                            j = _html.indexOf(">", i);
                        }
                        if (j == -1)
                        {
                            // make sure we don't wander off into an infinite loop
                            callback({
                                "message": "Should have found closing whitespace or '>' for _tmplitem attribute"
                            });
                            return;
                        }

                        _html = _html.substring(0, i) + _html.substring(j);
                    }
                }
                while (i > -1);

                // convert back to dom safely (IE bug resistant)
                dom = Alpaca.safeDomParse(_html);

                html = dom;
            }
            catch (e)
            {
                callback({
                    "message": e.message
                });

                return null;
            }

            return html;
        },

        isCached: function(cacheKey)
        {
            return (Alpaca.TemplateCache[cacheKey] ? true : false);
        }

    });

    // auto register
    Alpaca.TemplateEngineRegistry.register("tmpl", new Alpaca.JQueryTemplateEngine("tmpl"));

})(jQuery);(function($)
{
    Alpaca.EJSTemplateEngine = Alpaca.AbstractTemplateEngine.extend(
    {
        fileExtension: function() {
            return "ejs";
        },

        supportedMimetypes: function()
        {
            return [
                "text/x-ejs-template",
                "text/x-ejs-tmpl"
            ];
        },

        doCompile: function(cacheKey, html, callback)
        {
            var ejs = null;
            try
            {
                ejs = new EJS({
                    name: cacheKey,
                    text: html
                });
            }
            catch (e)
            {
                callback(e);
                return;
            }

            Alpaca.TemplateCache[cacheKey] = ejs;

            callback();
        },

        doExecute: function(cacheKey, model, callback)
        {
            var ejs = Alpaca.TemplateCache[cacheKey];

            // render template
            var html = null;
            try
            {
                html = ejs.render(model);
            }
            catch (e)
            {
                callback(e);
                return null;
            }

            return html;
        },

        isCached: function(cacheKey)
        {
            return (Alpaca.TemplateCache[cacheKey] ? true : false);
        }

    });

    // auto register
    Alpaca.TemplateEngineRegistry.register("ejs", new Alpaca.EJSTemplateEngine("ejs"));

})(jQuery);(function($)
{
    Alpaca.HandlebarsTemplateEngine = Alpaca.AbstractTemplateEngine.extend(
    {
        fileExtension: function() {
            return "html";
        },

        supportedMimetypes: function()
        {
            return [
                "text/x-handlebars-template",
                "text/x-handlebars-tmpl"
            ];
        },

        doCompile: function(cacheKey, html, callback)
        {
            var template = null;
            try
            {
                template = Handlebars.compile(html);
            }
            catch (e)
            {
                callback(e);
                return;
            }

            Alpaca.TemplateCache[cacheKey] = template;

            callback();
        },

        doExecute: function(cacheKey, model, callback)
        {
            var template = Alpaca.TemplateCache[cacheKey];

            // render template
            var html = null;
            try
            {
                html = template(model);
            }
            catch (e)
            {
                callback(e);
                return null;
            }

            return html;
        },

        isCached: function(cacheKey)
        {
            return (Alpaca.TemplateCache[cacheKey] ? true : false);
        }

    });

    // auto register
    Alpaca.TemplateEngineRegistry.register("handlebars", new Alpaca.HandlebarsTemplateEngine("handlebars"));

})(jQuery);/**
 * Defines the base class implementation for views.  All views in Alpaca ultimately extend this form.
 * This provides the ideal place for any global overrides of view templates, message bundles or other settings.
 */
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.styleInjections = {};

    Alpaca.registerView({
        "id": "VIEW_BASE",
        "title": "Abstract base view",
        "description": "Foundation view which provides an abstract view from which all other views extend.",
        "messages": {
            "countries": {
                "afg":"Afghanistan",
                "ala":"Aland Islands",
                "alb":"Albania",
                "dza":"Algeria",
                "asm":"American Samoa",
                "and":"Andorra",
                "ago":"Angola",
                "aia":"Anguilla",
                "ata":"Antarctica",
                "atg":"Antigua and Barbuda",
                "arg":"Argentina",
                "arm":"Armenia",
                "abw":"Aruba",
                "aus":"Australia",
                "aut":"Austria",
                "aze":"Azerbaijan",
                "bhs":"Bahamas",
                "bhr":"Bahrain",
                "bgd":"Bangladesh",
                "brb":"Barbados",
                "blr":"Belarus",
                "bel":"Belgium",
                "blz":"Belize",
                "ben":"Benin",
                "bmu":"Bermuda",
                "btn":"Bhutan",
                "bol":"Bolivia",
                "bih":"Bosnia and Herzegovina",
                "bwa":"Botswana",
                "bvt":"Bouvet Island",
                "bra":"Brazil",
                "iot":"British Indian Ocean Territory",
                "brn":"Brunei Darussalam",
                "bgr":"Bulgaria",
                "bfa":"Burkina Faso",
                "bdi":"Burundi",
                "khm":"Cambodia",
                "cmr":"Cameroon",
                "can":"Canada",
                "cpv":"Cape Verde",
                "cym":"Cayman Islands",
                "caf":"Central African Republic",
                "tcd":"Chad",
                "chl":"Chile",
                "chn":"China",
                "cxr":"Christmas Island",
                "cck":"Cocos (Keeling), Islands",
                "col":"Colombia",
                "com":"Comoros",
                "cog":"Congo",
                "cod":"Congo, the Democratic Republic of the",
                "cok":"Cook Islands",
                "cri":"Costa Rica",
                "hrv":"Croatia",
                "cub":"Cuba",
                "cyp":"Cyprus",
                "cze":"Czech Republic",
                "civ":"Cote d'Ivoire",
                "dnk":"Denmark",
                "dji":"Djibouti",
                "dma":"Dominica",
                "dom":"Dominican Republic",
                "ecu":"Ecuador",
                "egy":"Egypt",
                "slv":"El Salvador",
                "gnq":"Equatorial Guinea",
                "eri":"Eritrea",
                "est":"Estonia",
                "eth":"Ethiopia",
                "flk":"Falkland Islands (Malvinas),",
                "fro":"Faroe Islands",
                "fji":"Fiji",
                "fin":"Finland",
                "fra":"France",
                "guf":"French Guiana",
                "pyf":"French Polynesia",
                "atf":"French Southern Territories",
                "gab":"Gabon",
                "gmb":"Gambia",
                "geo":"Georgia",
                "deu":"Germany",
                "gha":"Ghana",
                "gib":"Gibraltar",
                "grc":"Greece",
                "grl":"Greenland",
                "grd":"Grenada",
                "glp":"Guadeloupe",
                "gum":"Guam",
                "gtm":"Guatemala",
                "ggy":"Guernsey",
                "gin":"Guinea",
                "gnb":"Guinea-Bissau",
                "guy":"Guyana",
                "hti":"Haiti",
                "hmd":"Heard Island and McDonald Islands",
                "vat":"Holy See (Vatican City State),",
                "hnd":"Honduras",
                "hkg":"Hong Kong",
                "hun":"Hungary",
                "isl":"Iceland",
                "ind":"India",
                "idn":"Indonesia",
                "irn":"Iran, Islamic Republic of",
                "irq":"Iraq",
                "irl":"Ireland",
                "imn":"Isle of Man",
                "isr":"Israel",
                "ita":"Italy",
                "jam":"Jamaica",
                "jpn":"Japan",
                "jey":"Jersey",
                "jor":"Jordan",
                "kaz":"Kazakhstan",
                "ken":"Kenya",
                "kir":"Kiribati",
                "prk":"Korea, Democratic People's Republic of",
                "kor":"Korea, Republic of",
                "kwt":"Kuwait",
                "kgz":"Kyrgyzstan",
                "lao":"Lao People's Democratic Republic",
                "lva":"Latvia",
                "lbn":"Lebanon",
                "lso":"Lesotho",
                "lbr":"Liberia",
                "lby":"Libyan Arab Jamahiriya",
                "lie":"Liechtenstein",
                "ltu":"Lithuania",
                "lux":"Luxembourg",
                "mac":"Macao",
                "mkd":"Macedonia, the former Yugoslav Republic of",
                "mdg":"Madagascar",
                "mwi":"Malawi",
                "mys":"Malaysia",
                "mdv":"Maldives",
                "mli":"Mali",
                "mlt":"Malta",
                "mhl":"Marshall Islands",
                "mtq":"Martinique",
                "mrt":"Mauritania",
                "mus":"Mauritius",
                "myt":"Mayotte",
                "mex":"Mexico",
                "fsm":"Micronesia, Federated States of",
                "mda":"Moldova, Republic of",
                "mco":"Monaco",
                "mng":"Mongolia",
                "mne":"Montenegro",
                "msr":"Montserrat",
                "mar":"Morocco",
                "moz":"Mozambique",
                "mmr":"Myanmar",
                "nam":"Namibia",
                "nru":"Nauru",
                "npl":"Nepal",
                "nld":"Netherlands",
                "ant":"Netherlands Antilles",
                "ncl":"New Caledonia",
                "nzl":"New Zealand",
                "nic":"Nicaragua",
                "ner":"Niger",
                "nga":"Nigeria",
                "niu":"Niue",
                "nfk":"Norfolk Island",
                "mnp":"Northern Mariana Islands",
                "nor":"Norway",
                "omn":"Oman",
                "pak":"Pakistan",
                "plw":"Palau",
                "pse":"Palestinian Territory, Occupied",
                "pan":"Panama",
                "png":"Papua New Guinea",
                "pry":"Paraguay",
                "per":"Peru",
                "phl":"Philippines",
                "pcn":"Pitcairn",
                "pol":"Poland",
                "prt":"Portugal",
                "pri":"Puerto Rico",
                "qat":"Qatar",
                "rou":"Romania",
                "rus":"Russian Federation",
                "rwa":"Rwanda",
                "reu":"Reunion",
                "blm":"Saint Barthelemy",
                "shn":"Saint Helena",
                "kna":"Saint Kitts and Nevis",
                "lca":"Saint Lucia",
                "maf":"Saint Martin (French part)",
                "spm":"Saint Pierre and Miquelon",
                "vct":"Saint Vincent and the Grenadines",
                "wsm":"Samoa",
                "smr":"San Marino",
                "stp":"Sao Tome and Principe",
                "sau":"Saudi Arabia",
                "sen":"Senegal",
                "srb":"Serbia",
                "syc":"Seychelles",
                "sle":"Sierra Leone",
                "sgp":"Singapore",
                "svk":"Slovakia",
                "svn":"Slovenia",
                "slb":"Solomon Islands",
                "som":"Somalia",
                "zaf":"South Africa",
                "sgs":"South Georgia and the South Sandwich Islands",
                "esp":"Spain",
                "lka":"Sri Lanka",
                "sdn":"Sudan",
                "sur":"Suriname",
                "sjm":"Svalbard and Jan Mayen",
                "swz":"Swaziland",
                "swe":"Sweden",
                "che":"Switzerland",
                "syr":"Syrian Arab Republic",
                "twn":"Taiwan, Province of China",
                "tjk":"Tajikistan",
                "tza":"Tanzania, United Republic of",
                "tha":"Thailand",
                "tls":"Timor-Leste",
                "tgo":"Togo",
                "tkl":"Tokelau",
                "ton":"Tonga",
                "tto":"Trinidad and Tobago",
                "tun":"Tunisia",
                "tur":"Turkey",
                "tkm":"Turkmenistan",
                "tca":"Turks and Caicos Islands",
                "tuv":"Tuvalu",
                "uga":"Uganda",
                "ukr":"Ukraine",
                "are":"United Arab Emirates",
                "gbr":"United Kingdom",
                "usa":"United States",
                "umi":"United States Minor Outlying Islands",
                "ury":"Uruguay",
                "uzb":"Uzbekistan",
                "vut":"Vanuatu",
                "ven":"Venezuela",
                "vnm":"Viet Nam",
                "vgb":"Virgin Islands, British",
                "vir":"Virgin Islands, U.S.",
                "wlf":"Wallis and Futuna",
                "esh":"Western Sahara",
                "yem":"Yemen",
                "zmb":"Zambia",
                "zwe":"Zimbabwe"
            },
            "empty": "",
            "required": "This field is required",
            "valid": "",
            "invalid": "This field is invalid",
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "timeUnits": { SECOND: "seconds", MINUTE: "minutes", HOUR: "hours", DAY: "days", MONTH: "months", YEAR: "years" }
        }
    });

    /*
    Alpaca.EmptyViewTemplates = {
        'controlFieldOuterEl': '{{html this.html}}',
        'controlFieldMessage': '${message}',
        'controlFieldLabel': '{{if options.label}}${options.label}{{/if}}',
        'controlFieldHelper': '{{if options.helper}}${options.helper}{{/if}}',
        'controlFieldContainer': '{{html this.html}}',
        'controlField': '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
        'fieldSetOuterEl': '{{html this.html}}',
        'fieldSetMessage': '${message}',
        'fieldSetLegend': '{{if options.label}}${options.label}{{/if}}',
        'fieldSetHelper': '{{if options.helper}}${options.helper}{{/if}}',
        'fieldSetItemsContainer': '{{html this.html}}',
        'fieldSet': '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{wrap(null, {})Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        'fieldSetItemContainer': '',
        'formFieldsContainer': '{{html this.html}}',
        'formButtonsContainer': '{{if options.buttons}}{{each(k,v) options.buttons}}<button data-key="${k}" class="alpaca-form-button alpaca-form-button-${k}" {{each(k1,v1) v}}${k1}="${v1}"{{/each}}>${v.value}</button>{{/each}}{{/if}}',
        'form': '<form>{{html Alpaca.fieldTemplate(this,"formFieldsContainer")}}{{html Alpaca.fieldTemplate(this,"formButtonsContainer")}}</form>',
        'wizardStep': '',
        'wizardNavBar': '',
        'wizardPreButton': '<button>Back</button>',
        'wizardNextButton': '<button>Next</button>',
        'wizardDoneButton': '<button>Done</button>',
        'wizardStatusBar': '<ol id="${id}">{{each(i,v) titles}}<li id="stepDesc${i}"><div><strong><span>${v.title}</span>${v.description}</strong></div></li>{{/each}}</ol>',
        'arrayToolbar': '',
        'arrayItemToolbar': ''
    };
    */
    Alpaca.EmptyViewTemplates = {};

})(jQuery);(function($) {

    var Alpaca = $.alpaca;

    Alpaca.styleInjections = {};

    var displayTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {
        "controlField": '<div class="alpaca-data-container">{{if options.label}}<div class="alpaca-data-label">${options.label}</div>{{/if}}<div class="alpaca-data">&nbsp;${data}</div></div>',
        "fieldSetOuterEl": '<div class="ui-widget ui-widget-content">{{html this.html}}</div>',
        "fieldSetLegend": '{{if options.label}}<div class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</div>{{/if}}',
        "fieldSetItemsContainer": '<div>{{html this.html}}</div>',
        "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        "controlFieldContainer": '<div>{{html this.html}}</div>'
    });

    var editTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {
        // Templates for control fields
        "controlFieldOuterEl": '<span>{{html this.html}}</span>',
        "controlFieldMessage": '<div><span class="ui-icon ui-icon-alert"></span><span class="alpaca-controlfield-message-text">${message}</span></div>',
        "controlFieldLabel": '{{if options.label}}<div class="{{if options.labelClass}}${options.labelClass}{{/if}}"><div>${options.label}</div></div>{{/if}}',
        "controlFieldHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"><span class="ui-icon ui-icon-info"></span><span class="alpaca-controlfield-helper-text">${options.helper}</span></div>{{/if}}',
        "controlFieldContainer": '<div>{{html this.html}}</div>',
        "controlField": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
        // Templates for container fields
        "fieldSetOuterEl": '<fieldset>{{html this.html}}</fieldset>',
        "fieldSetMessage": '<div><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span><span>${message}</span></div>',
        "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
        "fieldSetItemsContainer": '<div>{{html this.html}}</div>',
        "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        "fieldSetItemContainer": '<div></div>',
        // Templates for form
        "formFieldsContainer": '<div>{{html this.html}}</div>',
        "formButtonsContainer": '<div>{{if options.buttons}}{{each(k,v) options.buttons}}<button data-key="${k}" class="alpaca-form-button alpaca-form-button-${k}" {{each(k1,v1) v}}${k1}="${v1}"{{/each}}>${v.value}</button>{{/each}}{{/if}}</div>',
        "form": '<form>{{html Alpaca.fieldTemplate(this,"formFieldsContainer")}}{{html Alpaca.fieldTemplate(this,"formButtonsContainer")}}</form>',
        // Templates for wizard
        "wizardStep" : '<div class="alpaca-clear"></div>',
        "wizardNavBar" : '<div></div>',
        "wizardPreButton" : '<button>Back</button>',
        "wizardNextButton" : '<button>Next</button>',
        "wizardDoneButton" : '<button>Done</button>',
        "wizardStatusBar" : '<ol id="${id}">{{each(i,v) titles}}<li id="stepDesc${i}"><div><strong><span>${v.title}</span>${v.description}</strong></div></li>{{/each}}</ol>'
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_DISPLAY",
        "parent": "VIEW_BASE",
        "title": "Default Web Display View",
        "description":"Default web edit view which goes though field hierarchy.",
        "type": "view",
        "platform":"web",
        "displayReadonly":true,
        "templates": displayTemplates
    });

    Alpaca.registerView({
        "id":"VIEW_WEB_EDIT",
        "parent": "VIEW_BASE",
        "title":"Default Web Edit View",
        "description":"Default web edit view which goes though field hierarchy.",
        "type":"edit",
        "platform": "web",
        "displayReadonly":true,
        "templates": editTemplates
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_CREATE",
        "parent": 'VIEW_WEB_EDIT',
        "title": "Default Web Create View",
        "description":"Default web create view which doesn't bind initial data.",
        "type": "create",
        "displayReadonly":false
    });

})(jQuery);(function($) {

    var Alpaca = $.alpaca;

    var displayTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {

        // Templates for control fields
        "controlFieldOuterEl": '<span class="alpaca-view-web-list">{{html this.html}}</span>',
        "controlFieldMessage": '<div><span class="ui-icon ui-icon-alert"></span><span class="alpaca-controlfield-message-text">${message}</span></div>',
        "controlFieldLabel": '{{if options.label}}<label for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</label>{{/if}}',
        "controlFieldHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"><span class="ui-icon ui-icon-info"></span><span class="alpaca-controlfield-helper-text">${options.helper}</span></div>{{/if}}',
        "controlFieldContainer": '<div>{{html this.html}}</div>',
        "controlField": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
        // Templates for container fields
        "fieldSetOuterEl": '<h1>bang</h1><fieldset class="alpaca-view-web-list">{html this.html}}</fieldset>',
        "fieldSetMessage": '<div><span class="ui-icon ui-icon-alert alpaca-fieldset-message-list-view"></span><span>${message}</span></div>',
        "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
        "fieldSetItemsContainer": '<ol>{{html this.html}}</ol>',
        "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        "fieldSetItemContainer": '<li style="list-style:none;"></li>',

        "itemLabel" : '{{if options.itemLabel}}<label for="${id}" class="alpaca-controlfield-label alpaca-controlfield-label-list-view"><span class="alpaca-controlfield-item-label-list-view">${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span></span>{{/if}}</label>{{/if}}'
    });

    var editTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {

        // Templates for control fields
        "controlFieldOuterEl": '<span class="alpaca-view-web-list">{{html this.html}}</span>',
        "controlFieldMessage": '<div><span class="ui-icon ui-icon-alert"></span><span class="alpaca-controlfield-message-text">${message}</span></div>',
        "controlFieldLabel": '{{if options.label}}<label for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</label>{{/if}}',
        "controlFieldHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"><span class="ui-icon ui-icon-info"></span><span class="alpaca-controlfield-helper-text">${options.helper}</span></div>{{/if}}',
        "controlFieldContainer": '<div>{{html this.html}}</div>',
        "controlField": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
        // Templates for container fields
        "fieldSetLocation": '{{if options.location}}<div class="alpaca-field-location">${options.location}</div>{{/if}}',
        "fieldSetOuterEl": '<fieldset class="alpaca-view-web-list">{{html this.html}}</fieldset>',
        "fieldSetMessage": '<div><span class="ui-icon ui-icon-alert alpaca-fieldset-message-list-view"></span><span>${message}</span></div>',
        "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
        "fieldSetItemsContainer": '<ol>{{html this.html}}</ol>',
        "fieldSet": '<h1>fieldset woot woot</h1>{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetAlex")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        "fieldSetItemContainer": '<li style="list-style:none;"><h1>neil</h1></li>',

        "itemLabel" : '{{if options.itemLabel}}<label for="${id}" class="alpaca-controlfield-label alpaca-controlfield-label-list-view"><span class="alpaca-controlfield-item-label-list-view">${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span></span>{{/if}}</label>{{/if}}'
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_DISPLAY_LIST",
        "parent": 'VIEW_WEB_DISPLAY',
        "title": "Web Display View List Style",
        "description": "Web display view based on list styles.",
        "legendStyle": "link",
        "templates": displayTemplates,
        "styles": {
        },
        "fields": {
            "/": {
                "templates": {
                    // Templates for container fields
                    "fieldSetItemsContainer": '<ol class="alpaca-fieldset-itemscontainer-list-view-top">{{html this.html}}</ol>',
                    "fieldSetItemContainer": '<li class="alpaca-fieldset-itemcontainer-list-view-top"></li>'
                }
            }
        }
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT_LIST",
        "parent": 'VIEW_WEB_EDIT',
        "title": "Web Edit View List Style",
        "description": "Web edit view based on list styles.",
        "legendStyle": "link",
        "templates": editTemplates,
        "styles": {
        },
        "fields": {
            "/": {
                "templates": {
                    // Templates for container fields
                    "fieldSetItemsContainer": '${options.label}<ol class="alpaca-fieldset-itemscontainer-list-view-top">{{html this.html}}</ol>',
                    "fieldSetItemContainer": '<li class="alpaca-fieldset-itemcontainer-list-view-top"></li>',
                    "fieldSetLocation": '{{if options.location}}<div class="alpaca-field-location">${options.location}</div>{{/if}}',
                    "fieldSetAlex": '<h1>alex</h1>'
                }
            }
        }
    });



    Alpaca.registerView({
        "id": "VIEW_WEB_CREATE_LIST",
        "parent": 'VIEW_WEB_CREATE',
        "title": "Web Create View List Style",
        "description": "Web create view based on list styles.",
        "legendStyle": "link",
        "templates": editTemplates,
        "styles": {
        },
        "fields": {
            "/": {
                "templates": {
                    // Templates for container fields
                    "fieldSetItemsContainer": '<ol class="alpaca-fieldset-itemscontainer-list-view-top">{{html this.html}}</ol>',
                    "fieldSetItemContainer": '<li class="alpaca-fieldset-itemcontainer-list-view-top"></li>'
                }
            }
        }
    });

})(jQuery);/**
 * jQuery UI Theme ("jquery-ui")
 *
 * Defines the Alpaca theme for jQuery UI.
 *
 * The style injector:
 *
 *    jquery-ui
 *
 * The views are:
 *
 *    VIEW_JQUERYUI_DISPLAY
 *    VIEW_JQUERYUI_EDIT
 *    VIEW_JQUERYUI_CREATE
 *
 * This theme can be selected by specifying the following view:
 *
 *    {
 *       "ui": "jquery-ui",
 *       "type": null | "create" | "edit" | "display"
 *    }
 *
 */
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.styleInjections["jquery-ui"] = {
        "field" : function(targetDiv) {
            targetDiv.addClass('ui-widget');
        },
        // "required" : function(targetDiv) {
        //     $('<span class="ui-icon ui-icon-star"></span>').prependTo(targetDiv);
        // },
        // "error" : function(targetDiv) {
        //     targetDiv.addClass('ui-state-error');
        // },
        "errorMessage" : function(targetDiv) {
            targetDiv.addClass('ui-state-error-text');
        },
        "removeError" : function(targetDiv) {
            targetDiv.removeClass('ui-state-error');
        },
        "container" : function(targetDiv) {
            targetDiv.addClass('ui-widget-content');
        },
        "wizardStatusBar" : function(targetDiv) {
            targetDiv.addClass('ui-widget-header ui-corner-all');
        },
        "wizardCurrentStep" : function(targetDiv) {
            targetDiv.addClass('ui-state-highlight ui-corner-all');
        },
        "wizardUnCurrentStep" : function(targetDiv) {
            targetDiv.removeClass('ui-state-highlight ui-corner-all');
        },
        "containerExpandedIcon" : "ui-icon-circle-arrow-s",
        "containerCollapsedIcon" : "ui-icon-circle-arrow-e",
        "commonIcon" : "ui-icon",
        "addIcon" : "ui-icon-circle-plus",
        "removeIcon" : "ui-icon-circle-minus",
        "upIcon" : "ui-icon-circle-arrow-n",
        "downIcon" : "ui-icon-circle-arrow-s",
        "wizardPreIcon" : "ui-icon-triangle-1-w",
        "wizardNextIcon" : "ui-icon-triangle-1-e",
        "wizardDoneIcon" : "ui-icon-triangle-1-e",
        "buttonBeautifier"  : function(button, iconClass, withText) {
            button.addClass("ui-button ui-widget ui-state-default ui-corner-all");
            if (withText) {
                button.addClass("ui-button-text-icon-primary");
            } else {
                button.addClass("ui-button-icon-only");
            }
            var buttonText = button.html();
            button.attr("title", buttonText);
            button.empty().append('<span class="ui-button-icon-primary ui-icon alpaca-fieldset-legend-button ' + iconClass + '"></span><span class="ui-button-text">' + buttonText + '</span>');
            button.hover(function() {
                if (!button.hasClass("alpaca-fieldset-array-item-toolbar-disabled")) {
                    $(this).addClass("ui-state-hover");
                }
            }, function() {
                if (!button.hasClass("alpaca-fieldset-array-item-toolbar-disabled")) {
                    $(this).removeClass("ui-state-hover");
                }
            });
        }
    };

    Alpaca.registerView({
        "id": "VIEW_JQUERYUI_DISPLAY",
        "parent": "VIEW_WEB_DISPLAY",
        "title": "Web Display View for jQuery UI",
        "description": "Web Display View for jQuery UI",
        "style": "jquery-ui",
        "ui": "jquery-ui"
    });

    Alpaca.registerView({
        "id": "VIEW_JQUERYUI_EDIT",
        "parent": "VIEW_WEB_EDIT",
        "title": "Web Edit View for jQuery UI",
        "description":"Web Edit View for jQuery UI",
        "style": "jquery-ui",
        "ui": "jquery-ui"
    });

    Alpaca.registerView({
        "id": "VIEW_JQUERYUI_CREATE",
        "parent": 'VIEW_WEB_CREATE',
        "title": "Web Create View for jQuery UI",
        "description": "Web Create View for jQuery UI",
        "style": "jquery-ui",
        "ui": "jquery-ui"
    });

    Alpaca.registerView({
        "id": "VIEW_JQUERYUI_EDIT_LIST",
        "parent": 'VIEW_WEB_EDIT_LIST',
        "title": "JQuery UI Edit View List Style",
        "description": "JQuery UI edit view based on list styles.",
        "style": "jquery-ui",
        "ui": "jquery-ui"
    });

    Alpaca.registerView({
        "id": "VIEW_JQUERYUI_CREATE_LIST",
        "parent": 'VIEW_WEB_CREATE_LIST',
        "title": "JQuery UI Create View List Style",
        "description": "JQuery UI create view based on list styles.",
        "style": "jquery-ui",
        "ui": "jquery-ui"
    });


})(jQuery);/**
 * jQuery Mobile Theme ("mobile")
 *
 * Defines the Alpaca theme for jQuery Mobile.
 *
 * The style injector:
 *
 *    mobile
 *
 * The views are:
 *
 *    VIEW_MOBILE_DISPLAY
 *    VIEW_MOBILE_EDIT
 *    VIEW_MOBILE_CREATE
 *
 * This theme can also be selected by specifying the following view:
 *
 *    {
 *       "ui": "mobile",
 *       "type": null | "create" | "edit" | "display"
 *    }
 *
 */(function($) {

    var Alpaca = $.alpaca;

    var displayTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {

        // Templates for control fields
        controlField: '<ul data-role="listview"><li>{{if options.label}}<h4>${options.label}</h4>{{/if}}<p><strong>${data}</strong></p></li></ul>',
        // Templates for container fields
        fieldSetOuterEl: '<fieldset data-role="collapsible" id="${id}" data-collapsed="{{if options.collapsed}}true{{else}}false{{/if}}">{{html this.html}}</fieldset>',
        fieldSetMessage: '<div>* ${message}</div>',
        fieldSetLegend: '{{if options.label}}<legend for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        fieldSetHelper: '{{if options.helper}}<h3 class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</h3>{{/if}}',
        fieldSetItemsContainer: '<div data-role="controlgroup">{{html this.html}}</div>',
        fieldSet: '{{wrap(null, {}) Alpaca.fieldTemplate(this, "fieldSetOuterEl", true)}}{{html Alpaca.fieldTemplate(this, "fieldSetLegend")}}{{html Alpaca.fieldTemplate(this, "fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this, "fieldSetItemsContainer", true)}}{{wrap(null, {}) Alpaca.fieldTemplate(this, "fieldSetAlex", true)}}{{/wrap}}{{/wrap}}',
        fieldSetItemContainer: '<div></div>'
    });

    var editTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {

        // Templates for control fields
        controlFieldOuterEl: '<div data-role="fieldcontain">{{html this.html}}</div>',
        controlFieldMessage: '<div>* ${message}</div>',
        controlFieldLabel: '{{if options.label}}<label for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</label>{{/if}}',
        controlFieldHelper: '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
        controlFieldContainer: '<div data-replace="true">{{html this.html}}</div>',
        controlField: '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{/wrap}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}',
        // Templates for container fields
        fieldSetOuterEl: '<fieldset id="${id}" data-collapsed="{{if options.collapsed}}true{{else}}false{{/if}}">{{html this.html}}</fieldset>',
        fieldSetMessage: '<div>* ${message}</div>',
        fieldSetLegend: '{{if options.label}}<legend for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        fieldSetHelper: '{{if options.helper}}<h3 class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</h3>{{/if}}',
        fieldSetItemsContainer: '<div data-role="controlgroup">{{html this.html}}</div>',
        fieldSet: '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        fieldSetItemContainer: '<div></div>',
        // Templates for form
        formFieldsContainer: '<div data-role="content">{{html this.html}}</div>',
        //formButtonsContainer: '<fieldset class="ui-grid-a">{{html this.html}}</fieldset>',
        //"formButtonsContainer": '<div>{{if options.buttons}}{{each(k,v) options.buttons}}<input data-key="${k}" class="alpaca-form-button alpaca-form-button-${k}" {{each(k1,v1) v}}${k1}="${v1}"{{/each}}/>{{/each}}{{/if}}</div>',
        form: '<form>{{html Alpaca.fieldTemplate(this,"formFieldsContainer")}}{{html Alpaca.fieldTemplate(this,"formButtonsContainer")}}</form>',
        // Controls
        //controlFieldRadio: '<fieldset data-role="controlgroup" id="${id}">{{if options.label}}<legend for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}{{each selectOptions}}<input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${formName}" id="${id}-${$index}" value="${value}" {{if value == data}}checked="checked"{{/if}}/><label for="${id}-${$index}">${text}</label>{{/each}}</fieldset>',
        controlFieldRadio: '<fieldset data-role="controlgroup" class="alpaca-radio-fieldset" id="${id}">{{each selectOptions}}<input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${name}" id="${id}-${$index}" value="${value}" {{if value == data}}checked="checked"{{/if}}/><label for="${id}-${$index}">${text}</label>{{/each}}</fieldset>',
        controlFieldCheckbox: '<fieldset data-role="controlgroup" class="alpaca-radio-fieldset" id="${id}-0"><input type="checkbox" id="${id}-1" name="${id}-1" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each options.data}}data-${fieldId}="${value}"{{/each}}/>{{if options.rightLabel}}<label for="${id}-1">${options.rightLabel}</label>{{else}}{{if options.label}}<label for="${id}-1">${options.label}?</label>{{/if}}{{/if}}</fieldset>',
        arrayItemToolbar: '<div class="alpaca-fieldset-array-item-toolbar" data-role="controlgroup" data-type="horizontal" data-mini="true"><span class="alpaca-fieldset-array-item-toolbar-add" data-role="button" data-icon="add" data-iconpos="notext">Add</span><span class="alpaca-fieldset-array-item-toolbar-remove" data-role="button" data-icon="delete" data-iconpos="notext">Delete</span><span class="alpaca-fieldset-array-item-toolbar-up" data-role="button" data-icon="arrow-u" data-iconpos="notext">Up</span><span class="alpaca-fieldset-array-item-toolbar-down" data-role="button" data-icon="arrow-d" data-iconpos="notext">Down</span></div>',
        arrayToolbar: '<div class="alpaca-fieldset-array-toolbar" data-role="controlgroup"  data-mini="true"><span class="alpaca-fieldset-array-toolbar-icon alpaca-fieldset-array-toolbar-add" data-role="button" data-icon="add" data-inline="true" title="Add">Add</span></div>'
    });


    Alpaca.styleInjections["jquery-mobile"] = {
        "array" : function(containerElem) {
            if (containerElem) {
                if (containerElem.find('[data-role="fieldcontain"]').fieldcontain) {
                    containerElem.find('[data-role="fieldcontain"]').fieldcontain();
                    containerElem.find('[data-role="fieldcontain"]').find("[type='radio'], [type='checkbox']").checkboxradio();
                    containerElem.find('[data-role="fieldcontain"]').find("button, [data-role='button'], [type='button'], [type='submit'], [type='reset'], [type='image']").not(".ui-nojs").button();
                    containerElem.find('[data-role="fieldcontain"]').find("input, textarea").not("[type='radio'], [type='checkbox'], button, [type='button'], [type='submit'], [type='reset'], [type='image']").textinput();
                    containerElem.find('[data-role="fieldcontain"]').find("input, select").filter("[data-role='slider'], [data-type='range']").slider();
                    containerElem.find('[data-role="fieldcontain"]').find("select:not([data-role='slider'])").selectmenu();
                    containerElem.find('[data-role="button"]').buttonMarkup();
                    containerElem.find('[data-role="controlgroup"]').controlgroup();
                }

            }
        }
    };

    Alpaca.registerView({
        "id": "VIEW_MOBILE_DISPLAY",
        "parent": "VIEW_WEB_DISPLAY",
        "title": "Mobile DISPLAY View",
        "description": "Mobile display view using JQuery Mobile Library",
        "type": "view",
        "platform":"mobile",
        "style":"jquery-mobile",
        "ui":"mobile",
        "legendStyle": "link",
        "toolbarStyle": "link",
        "buttonType": "link",
        "templates": displayTemplates,
        "messages": {
            required: "Required Field",
            invalid: "Invalid Field"
        },
        "render": function(field, renderedCallback) {

            var self = this;

            field.render(field.view, function(field) {

                refreshPageForField(field.getEl());

                if (renderedCallback) {
                    renderedCallback.call(self, field);
                }
            });

        }
    });

    Alpaca.registerView({
        "id": "VIEW_MOBILE_EDIT",
        "parent": "VIEW_WEB_EDIT",
        "title": "Mobile Edit View",
        "description": "Mobile edit view using JQuery Mobile Library",
        "type": "edit",
        "platform":"mobile",
        "style":"jquery-mobile",
        "ui":"mobile",
        "legendStyle": "link",
        "toolbarStyle": "link",
        "buttonType": "link",
        "toolbarSticky": true,
        "templates": editTemplates,
        "messages": {
            required: "Required Field",
            invalid: "Invalid Field"
        },
        "render": function(field, renderedCallback) {

            var self = this;

            field.render(function(field) {

                refreshPageForField(field.getEl());

                if (renderedCallback) {
                    renderedCallback.call(self, field);
                }
            });

        }
    });

    var refreshPageForField = function(fieldEl)
    {
        // find the data-role="page" and refresh it
        var el = fieldEl;
        while (!Alpaca.isEmpty(el) && el.attr("data-role") !== "page")
        {
            el = el.parent();
        }
        if (!Alpaca.isEmpty(el)) {
            $(el).trigger('pagecreate');
        }
    };

    Alpaca.registerView({
        "id": "VIEW_MOBILE_CREATE",
        "parent": 'VIEW_MOBILE_EDIT',
        "title": "Default Mobile Create View",
        "description":"Default mobile create view which doesn't bind initial data.",
        "type": "create",
        "displayReadonly":false
    });

})(jQuery);/**
 * Twitter Bootstrap Theme ("bootstrap")
 *
 * Defines the Alpaca theme for Twitter Bootstrap v3.
 *
 * The style injector:
 *
 *    bootstrap
 *
 * The views are:
 *
 *    VIEW_BOOTSTRAP_DISPLAY
 *    VIEW_BOOTSTRAP_EDIT
 *    VIEW_BOOTSTRAP_CREATE
 *
 * This theme can also be selected by specifying the following view:
 *
 *    {
 *       "ui": "bootstrap",
 *       "type": null | "create" | "edit" | "display"
 *    }
 *
 */
(function($) {

    var Alpaca = $.alpaca;

    var editTemplates = Alpaca.Create(Alpaca.EmptyViewTemplates, {
        // Templates for control fields
        "controlFieldOuterEl": '<div class="form-group">{{html this.html}}</div>',
        "controlFieldMessage": '<span class="glyphicon glyphicon-exclamation-sign"></span><span class="help-block alpaca-controlfield-message-text">${message}</span>',
        "controlFieldLabel": '{{if options.label}}<label class="{{if options.labelClass}}${options.labelClass}{{/if}} control-label" for="${id}">${options.label}</label>{{/if}}',
        "controlFieldHelper": '<p class="{{if options.helperClass}}${options.helperClass}{{/if}}">{{if options.helper}}<i class="glyphicon glyphicon-info-sign alpaca-helper-icon"></i>${options.helper}</p>{{/if}}',
        "controlFieldContainer": '<div>{{html this.html}}</div>',
        "controlField": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
        // Templates for container fields
        "fieldSetOuterEl": '<fieldset>{{html this.html}}</fieldset>',
        "fieldSetMessage": '<span class="glyphicon glyphicon-exclamation-sign"></span><span class="help-block alpaca-controlfield-message-text">${message}</span>',
        "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
        "fieldSetHelper": '{{if options.helper}}<p class="{{if options.helperClass}}${options.helperClass}{{/if}}"><i class="glyphicon glyphicon-info-sign alpaca-helper-icon"></i>${options.helper}</p>{{/if}}',
        "fieldSetItemsContainer": '<div>{{html this.html}}</div>',
        "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
        "fieldSetItemContainer": '<div></div>',
        // Templates for form
        "formFieldsContainer": '<div>{{html this.html}}</div>',
        "formButtonsContainer": '<div>{{if options.buttons}}{{each(k,v) options.buttons}}<button data-key="${k}" class="alpaca-form-button alpaca-form-button-${k} btn btn-default" {{each(k1,v1) v}}${k1}="${v1}"{{/each}}>${v.value}</button>{{/each}}{{/if}}</div>',
        "form": '<form role="form">{{html Alpaca.fieldTemplate(this,"formFieldsContainer")}}{{html Alpaca.fieldTemplate(this,"formButtonsContainer")}}</form>',
        // Templates for wizard
        "wizardStep" : '<div class="alpaca-clear"></div>',
        "wizardNavBar" : '<div></div>',
        "wizardPreButton" : '<button>Back</button>',
        "wizardNextButton" : '<button>Next</button>',
        "wizardDoneButton" : '<button>Done</button>',
        "wizardStatusBar" : '<ol id="${id}">{{each(i,v) titles}}<li id="stepDesc${i}"><div><strong><span>${v.title}</span>${v.description}</strong></div></li>{{/each}}</ol>',

        "controlFieldCheckbox": '<div class="checkbox" id="${id}">{{if options.rightLabel}}<label for="${id}_checkbox">{{/if}}<input id="${id}_checkbox" type="checkbox" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>{{if options.rightLabel}}${options.rightLabel}</label>{{/if}}</div>',
        "controlFieldCheckboxMultiple": '<div id="${id}">{{each(i,o) checkboxOptions}}<div class="checkbox"><label for="${id}_checkbox_${i}"><input type="checkbox" id="${id}_checkbox_${i}" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} data-checkbox-value="${o.value}" data-checkbox-index="${i}"/>${o.text}</label></div>{{/each}}</div>',

        "controlFieldRadio": '{{if !required && !removeDefaultNone}}<div class="radio"><input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${name}" id="${id}_radio_nonevalue" value=""/><label for="${id}_radio_nonevalue">None</label></div>{{/if}}{{each selectOptions}}<div class="radio"><input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${name}" value="${value}" id="${id}_radio_${$index}" {{if value == data}}checked="checked"{{/if}}/><label for="${id}_radio_${$index}">${text}</label></div>{{/each}}',

        "itemLabel": '{{if options.itemLabel}}<div class="alpaca-controlfield-label"><div>${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span>{{/if}}</div></div>{{/if}}',
        "arrayToolbar": '<div class="alpaca-fieldset-array-toolbar btn-group"><button class="alpaca-fieldset-array-toolbar-icon alpaca-fieldset-array-toolbar-add btn btn-default">${addItemLabel}</button></span>',
        "arrayItemToolbar": '<div class="alpaca-fieldset-array-item-toolbar btn-group btn-group-sm">{{each(k,v) buttons}}<button class="alpaca-fieldset-array-item-toolbar-icon alpaca-fieldset-array-item-toolbar-${v.feature} btn btn-default btn-sm">${v.label}</button>{{/each}}</div>'


    });

    var displayTemplates = Alpaca.Create(editTemplates, {
        "fieldSetOuterEl": '<fieldset disabled>{{html this.html}}</fieldset>'
    });

    Alpaca.styleInjections["bootstrap"] = {

        /*
        // error messages
        "addErrorMessage": function(targetDiv, message) {

            // if bootstrap has the tooltip, we can pretty up the message
            if ($.fn.tooltip)
            {
                targetDiv.tooltip({
                    "html": message
                }).click();
            }
        },

        "buttonBeautifier"  : function(button, iconClass, withText) {
            var buttonText = button.html();
            button.attr("title", buttonText);
            var addedButtonText = withText ? buttonText : "";
            button.empty().append('<b class="alpaca-fieldset-legend-button ' + iconClass + '"></b><span>' + addedButtonText + '</span>');
        },
        */

        "field" : function(targetDiv) {

            // the item container gets the "form-group"
            //targetDiv.parent().addClass('form-group');

            // all controls get the "form-control" class injected
            $(targetDiv).find("input").addClass("form-control");
            $(targetDiv).find("textarea").addClass("form-control");
            $(targetDiv).find("select").addClass("form-control");
            // except for the following
            $(targetDiv).find("input[type=checkbox]").removeClass("form-control");
            $(targetDiv).find("input[type=file]").removeClass("form-control");
            $(targetDiv).find("input[type=radio]").removeClass("form-control");

            // any checkbox inputs get the "checkbox" class on their container

            // any checkbox inputs get the "checkbox" class on their checkbox
            // TODO: remove, this is now done by the template itself
            //$(targetDiv).find("input[type=checkbox]").parent().parent().addClass("checkbox");
            // any radio inputs get the "radio" class on their radio
            $(targetDiv).find("input[type=radio]").parent().parent().addClass("radio");

            // if form has "form-inline" class, then radio and checkbox labels get inline classes
            if ($(targetDiv).parents("form").hasClass("form-inline"))
            {
                // checkboxes
                $(targetDiv).find("input[type=checkbox]").parent().addClass("checkbox-inline");

                // radios
                $(targetDiv).find("input[type=radio]").parent().addClass("radio-inline");
            }

            // TODO: form-horizontal?
        },

        // icons
        "commonIcon" : "",
        "addIcon" : "glyphicon glyphicon-plus-sign",
        "removeIcon" : "glyphicon glyphicon-minus-sign",
        "upIcon" : "glyphicon glyphicon-chevron-up",
        "downIcon" : "glyphicon glyphicon-chevron-down",
        "containerExpandedIcon" : "glyphicon glyphicon-circle-arrow-down",
        "containerCollapsedIcon" : "glyphicon glyphicon-circle-arrow-right",
        "wizardPreIcon" : "glyphicon glyphicon-chevron-left",
        "wizardNextIcon" : "glyphicon glyphicon-chevron-right",
        "wizardDoneIcon" : "glyphicon glyphicon-ok",


        // required fields get star icon
        "required" : function(targetDiv)
        {
            $('<span class="glyphicon glyphicon-star"></span>&nbsp;').prependTo(targetDiv);
        },

        // error fields get the "has-error" class
        "error" : function(targetDiv) {
            targetDiv.addClass('has-error');

            /*
            $(targetDiv).popover({
                "html": true,
                "trigger": "manual",
                "content": "error message"
            });
            $(targetDiv).on("shown.bs.popover", function() {
                debugger;
                $(this).css({
                    "border": "1px red solid",
                    "color": "red"
                });
            });
            $(targetDiv).popover("show");
            */
        },
        "removeError" : function(targetDiv) {
            targetDiv.removeClass('has-error');

            /*
            $(targetDiv).popover("hide");
            */

            /*
            $(targetDiv).on("hidden.bs.popover", function() {
                $(targetDiv).popover("destroy");
            });
            */
        },

        // The Wizard still relies on jQuery UI
        "wizardStatusBar" : function(targetDiv) {
            targetDiv.addClass('ui-widget-header ui-corner-all');
        },
        "wizardCurrentStep" : function(targetDiv) {
            targetDiv.addClass('ui-state-highlight ui-corner-all');
        },
        "wizardUnCurrentStep" : function(targetDiv) {
            targetDiv.removeClass('ui-state-highlight ui-corner-all');
        },

        "buttonBeautifier"  : function(button, iconClass, withText) {
            var buttonText = button.html();
            button.attr("title", buttonText);
            button.empty().append('<b class="alpaca-fieldset-legend-button ' + iconClass + '"></b>');
            var addedButtonText = withText ? buttonText : null;
            if (addedButtonText)
            {
                button.append('<span class="alpaca-fieldset-legend-button-text">' + addedButtonText + '</span>');
            }
        }
    };

    var renderFunction = function(field, renderedCallback)
    {
        var self = this;

        field.render(function(field) {

            if (renderedCallback) {
                renderedCallback.call(self, field);
            }
        });
    };

    Alpaca.registerView({
        "id": "VIEW_BOOTSTRAP_DISPLAY",
        "parent": "VIEW_WEB_DISPLAY",
        "title": "Display View for Bootstrap",
        "description": "Display View for Bootstrap",
        "style": "bootstrap",
        "ui": "bootstrap",
        "templates": displayTemplates,
        "render": renderFunction,
        "type": "view"
    });

    Alpaca.registerView({
        "id": "VIEW_BOOTSTRAP_EDIT",
        "parent": 'VIEW_WEB_EDIT',
        "title": "Edit View for Bootstrap",
        "description": "Edit View for Bootstrap",
        "style": "bootstrap",
        "ui": "bootstrap",
        "templates": editTemplates,
        "render": renderFunction,
        "type": "edit"
    });

    Alpaca.registerView({
        "id": "VIEW_BOOTSTRAP_CREATE",
        "parent": 'VIEW_WEB_CREATE',
        "title": "Create View for Bootstrap",
        "description":"Create View for Bootstrap",
        "style": "bootstrap",
        "ui": "bootstrap",
        "templates": editTemplates,
        "render": renderFunction,
        "type": "create"
    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT_TABLE",
        "parent": 'VIEW_WEB_EDIT',
        "title": "Web Edit View Table Style",
        "description": "Web edit view based on table styles.",
        "type": "edit",
        "displayReadonly": true,
        "collapsible": false,
        "legendStyle": "link",
        "templates": {

            // Templates for control fields
            "controlFieldOuterEl": null,
            "controlFieldLabel": '<td>{{if options.label}}<label for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</label>{{/if}}</td>',
            "controlFieldContainer": '<td data-control="append">{{html this.html}}</td>',
            "controlFieldMessage": '<div><span class="ui-icon ui-icon-alert"></span><span class="alpaca-controlfield-message-text">${message}</span></div>',
            "controlFieldHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"><span class="ui-icon ui-icon-info"></span><span class="alpaca-controlfield-helper-text">${options.helper}</span></div>{{/if}}',
            "controlField":
                '{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}' +
                '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}' +
                    '{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}' +
                '{{/wrap}}',

            // Templates for container fields
            "fieldSetOuterEl": '<fieldset class="alpaca-view-web-edit-table">{{html this.html}}</fieldset>',
            "fieldSetMessage": '<div><span class="ui-icon ui-icon-alert alpaca-fieldset-message-table-view"></span><span>${message}</span></div>',
            "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
            "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
            "fieldSetItemsContainer": '<table><tbody>{{html this.html}}</tbody></table>',
            "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
            "fieldSetItemContainer": '<tr></tr>',

            "itemLabel" : '{{if options.itemLabel}}<label for="${id}" class="alpaca-controlfield-label alpaca-controlfield-label-list-view"><span class="alpaca-controlfield-item-label-list-view">${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span></span>{{/if}}</label>{{/if}}'
        },
        "styles": {
        },
        "fields": {
            "/": {
                "templates": {
                    // Templates for container fields
                    "fieldSetItemsContainer": '<table class="alpaca-fieldset-itemscontainer-list-view-top">{{html this.html}}</table>',
                    "fieldSetItemContainer": '<tr class="alpaca-fieldset-itemscontainer-list-view-top"></tr>'
                }
            }
        }

    });

    Alpaca.registerView({
        "id": "VIEW_WEB_CREATE_TABLE",
        "parent": 'VIEW_WEB_EDIT_TABLE',
        "title": "Default Web Create View Table Stle",
        "description":"Default web create view (Table Style) which doesn't bind initial data.",
        "type": "create",
        "displayReadonly":false
    });

})(jQuery);(function($) {

    var Alpaca = $.alpaca;

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT_YAML",
        "parent": 'VIEW_WEB_EDIT',
        "title": "Web Edit View List Style",
        "description": "Web edit list styled to look like a YAML editor.",
        "type": "edit",
        "displayReadonly": true,
        "collapsible": true,
        "legendStyle": "link",
        "templates": {
            // Templates for control fields
            "controlFieldOuterEl": '<span class="alpaca-view-web-edit-yaml" title="${options.helper}">{{html this.html}}</span>',
            "controlFieldMessage": '<div><span class="ui-icon ui-icon-alert"></span><span class="alpaca-controlfield-message-text">${message}</span></div>',
            "controlFieldLabel": '{{if options.label}}<label for="${id}" class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}:</label>{{/if}}',
            "controlFieldHelper": '<span style="display:none" />',
            "controlFieldContainer": '<div>{{html this.html}}</div>',
            "controlField": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{/wrap}}{{/wrap}}',
            // Templates for container fields
            "fieldSetOuterEl": '<fieldset class="alpaca-view-web-edit-yaml">{{html this.html}}</fieldset>',
            "fieldSetMessage": '<div><span class="ui-icon ui-icon-alert alpaca-fieldset-message-list-view"></span><span>${message}</span></div>',
            "fieldSetLegend": '{{if options.label}}<legend class="{{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</legend>{{/if}}',
            "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}">${options.helper}</div>{{/if}}',
            "fieldSetItemsContainer": '<ol>{{html this.html}}</ol>',
            "fieldSet": '{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetOuterEl",true)}}{{html Alpaca.fieldTemplate(this,"fieldSetLegend")}}{{html Alpaca.fieldTemplate(this,"fieldSetHelper")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"fieldSetItemsContainer",true)}}{{/wrap}}{{/wrap}}',
            "fieldSetItemContainer": '<li style="list-style:none;"></li>',

            "itemLabel" : '{{if options.itemLabel}}<label for="${id}" class="alpaca-controlfield-label alpaca-controlfield-label-list-view"><span class="alpaca-controlfield-item-label-list-view">${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span></span>{{/if}}</label>{{/if}}'

        },
        "styles": {
        },
        "fields": {
            "/": {
                "templates": {
                    // Templates for container fields
                    "fieldSetItemsContainer": '<ol class="alpaca-fieldset-itemscontainer-list-view-top">{{html this.html}}</ol>',
                    "fieldSetItemContainer": '<li class="alpaca-fieldset-itemcontainer-list-view-top"></li>'
                }
            }
        }
    });
})(jQuery);
/*jshint -W014 */ // bad line breaking
(function($) {
    
    var Alpaca = $.alpaca;
    
    Alpaca.registerView({
        "id":"VIEW_WEB_EDIT_INLINE",
        "parent":"VIEW_WEB_EDIT",
        "title":"Default Web Edit with fields inlining capabilities",
        "description":"Edit template with form fields inlining capabilities, via options.inline level to display some forms parts inline. Useful to display for example an ArrayField containing ObjectField items in a compact manner.",
        "type":"edit",
        "platform":"web",
        "style":"jquery-ui",
        "displayReadonly":true,
        "templates": {
            "fieldSetOuterEl": '<fieldset class="{{if options.inline}}alpaca-inline{{/if}}">{{html this.html}}</fieldset>',
            "fieldSetItemContainer": '<div class="alpaca-inline-item-container"></div>',            
            "arrayItemToolbar": '<div class="alpaca-fieldset-array-item-toolbar" data-role="controlgroup" data-type="horizontal" data-mini="true">'
                +'<span class="alpaca-fieldset-array-item-toolbar-add" data-role="button" data-icon="add" data-iconpos="notext">Add</span>'
                +'<span class="alpaca-fieldset-array-item-toolbar-remove" data-role="button" data-icon="delete" data-iconpos="notext">Delete</span>'
                +'<span class="alpaca-fieldset-array-item-toolbar-up" data-role="button" data-icon="arrow-u" data-iconpos="notext">Up</span>'
                +'<span class="alpaca-fieldset-array-item-toolbar-down" data-role="button" data-icon="arrow-d" data-iconpos="notext">Down</span></div>'
        }
    });
})(jQuery);/*jshint -W014 */ // bad line breaking
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT",
        "templates": {
            "twoColumnLayout":'<div class="alpaca-layout-two-column-mask">'
                    + '{{if options.label}}<h3>${options.label}</h3>{{/if}}'
                    + '{{if options.helper}}<h4>${options.helper}</h4>{{/if}}'
                    + '<div class="alpaca-layout-two-column-left alpaca-layout-region"  id="leftcolumn"></div>'
                    + '<div class="alpaca-layout-two-column-right alpaca-layout-region" id="rightcolumn"></div>'
                    + '</div>'
        }
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT_LAYOUT_TWO_COLUMN",
        "parent": "VIEW_WEB_EDIT",
        "title": "Web Edit View with Two-Column Layout",
        "description": "Web edit default view with two-column layout.",
        "layout" : {
            "template" : "twoColumnLayout"
        }
    });

    Alpaca.registerView({
        "id": "VIEW_WEB_EDIT_LIST_LAYOUT_TWO_COLUMN",
        "parent": "VIEW_WEB_EDIT_LIST",
        "title": "Web List Edit View with Two-Column Layout",
        "description": "Web edit list view with two-column layout.",
        "layout" : {
            "template" : "twoColumnLayout"
        }
    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.NormalizedView = Base.extend(
    /**
     * @lends Alpaca.NormalizedView.prototype
     */
    {
        /**
         * Once all of the Alpaca views are registered with the framework, each is normalized so that parent-chain
         * references and overrides are normalized into a single, fast lookup object.
         *
         * @constructs
         *
         * @class Normalized view.
         *
         * @param {String} the view id
         */
        constructor: function(viewId) {
            this.id = viewId;
        },

        /**
         * Normalization occurs once per view upon startup of Alpaca.
         */
        normalize: function()
        {
            // load the view object
            var viewObject  = Alpaca.views[this.id];
            if (!viewObject)
            {
                Alpaca.logError("View compilation failed - view not found: " + this.id);
                return false;
            }

            // collect the inheritance chain
            var chain = [];
            var current = viewObject;
            while (current) {
                chain.push(current);

                var parentId = current.parent;
                if (parentId) {
                    var parent = Alpaca.views[current.parent];
                    if (!parent) {
                        Alpaca.logError("View compilation failed - cannot find parent view: " + parentId + " for view: " + current.id);
                        return false;
                    }
                    current = parent;
                }
                else
                {
                    current = null;
                }
            }

            // reverse the chain
            chain = chain.reverse();

            var setScalar = function(target, source, propertyId)
            {
                var value = source[propertyId];

                var currentValue = target[propertyId];
                if (!Alpaca.isUndefined(currentValue) && !Alpaca.isUndefined(value))
                {
                    Alpaca.logDebug("View property: " + propertyId + " already has value: " + currentValue + " and overwriting to: " + value);
                }

                if (!Alpaca.isUndefined(value)) {
                    target[propertyId] = value;
                }
            };

            var setFunction = function(target, source, propertyId)
            {
                var value = source[propertyId];

                var currentValue = target[propertyId];
                if (!Alpaca.isUndefined(currentValue) && !Alpaca.isUndefined(value))
                {
                    Alpaca.logDebug("View property: " + propertyId + " already has function, overwriting");
                }

                if (!Alpaca.isUndefined(value)) {
                    target[propertyId] = value;
                }
            };

            var mergeMap = function(target, source, propertyId)
            {
                var sourceMap = source[propertyId];
                if (sourceMap)
                {
                    if (!target[propertyId])
                    {
                        target[propertyId] = {};
                    }

                    Alpaca.mergeObject2(sourceMap, target[propertyId]);
                }
            };

            // walk forward and apply
            for (var i = 0; i < chain.length; i++)
            {
                var element = chain[i];

                // scalar properties
                setScalar(this, element, "type");
                setScalar(this, element, "displayReadonly");
                setScalar(this, element, "platform");
                setScalar(this, element, "device");
                setScalar(this, element, "style");
                setScalar(this, element, "ui");
                setScalar(this, element, "collapsible");
                setScalar(this, element, "legendStyle");
                setScalar(this, element, "toolbarStyle");
                setScalar(this, element, "buttonStyle");
                setScalar(this, element, "toolbarSticky");
                setScalar(this, element, "globalTemplate");

                // functions
                setFunction(this, element, "render");
                setFunction(this, element, "postRender");

                // maps (merge)
                mergeMap(this, element, "styles");
                mergeMap(this, element, "templates");
                mergeMap(this, element, "messages");
                mergeMap(this, element, "wizard");
                mergeMap(this, element, "fields");
                mergeMap(this, element, "layout");

                // compiled templates
                mergeMap(this, element, "compiledTemplates");
            }

            Alpaca.logDebug("View compilation complete for view: " + this.id);
            Alpaca.logDebug("Final view: ");
            Alpaca.logDebug(JSON.stringify(this, null, "   "));

            return true;
        }
    });
})(jQuery);/*jshint -W004 */ // duplicate variables
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.RuntimeView = Base.extend(
    /**
     * @lends Alpaca.RuntimeView.prototype
     */
    {
        /**
         * Runtime implementation of a view as applied to a field.
         *
         * This provides accessors into the nested behaviors of views and also takes into account field-level attributes
         * of the currently rendering dom element.
         *
         * @constructs
         *
         * @class Class for managing view components such as layout, template, message etc.
         *
         * @param {String} the view id
         * @param {Object} field the field control
         */
        constructor: function(viewId, field) {
            this.field = field;
            this.setView(viewId);
        },

        /**
         * Sets the view that this runtime view adapters should consult during render.
         *
         * @param {String} the view id
         */
        setView: function (viewId)
        {
            // TODO: should field classes ever really be instantiated directly?
            // TODO: this is left in to support Alpaca docs generation (need to clean this up)s
            // if a view is not set at this point it probably means they instantiated a field directly
            // in which case, we'll just pick the default view
            if (!viewId)
            {
                this.id = "VIEW_WEB_EDIT";
                return;
            }

            // the normalized view
            var normalizedView = Alpaca.getNormalizedView(viewId);
            if (!normalizedView)
            {
                // this should never be the case
                throw new Error("Runtime view for view id: " + viewId + " could not find a normalized view");
            }

            // copy compiled properties into this object
            for (var k in normalizedView)
            {
                if (normalizedView.hasOwnProperty(k)) {
                    this[k] = normalizedView[k];
                }
            }
        },

        /**
         * Gets view wizard settings.
         *
         * @returns {Object} View wizard settings.
         */
        getWizard : function () {
            return this.getViewParam("wizard");
        },

        /**
         * Gets the global layout template.
         *
         * @returns {Object|String} Global layout template setting of the view.
         */
        getGlobalTemplateDescriptor : function ()
        {
            return this.getTemplateDescriptor("globalTemplate");
        },

        /**
         * Gets layout template and bindings.
         *
         * @returns {Object} Layout template and bindings setting of the view.
         */
        getLayout: function ()
        {
            var templateDescriptor = this.getTemplateDescriptor("layoutTemplate");

            return {
                "templateDescriptor" : templateDescriptor,
                "bindings" : this.getViewParam(["layout","bindings"], true)
            };
        },

        /**
         * Gets style injection lists.
         *
         * @returns {Object} styles style injection list settings of the view.
         */
        getStyles : function () {

            return this.styles;
        },

        /**
         * Hands back the compiled template id for a given template.
         *
         * @param templateId
         */
        getTemplateDescriptor: function(templateId)
        {
            return Alpaca.getTemplateDescriptor(this, templateId);
        },

        /**
         * Gets message for the given id.
         *
         * @param {String} messageId Message id.
         *
         * @returns {String} Message mapped to the given id.
         */
        getMessage : function (messageId) {
            var messageForLocale = this.getViewParam(["messages",Alpaca.defaultLocale,messageId]);
            return Alpaca.isEmpty(messageForLocale) ? this.getViewParam(["messages",messageId]): messageForLocale;
        },

        /**
         * Retrieves view parameter based on configuration Id or Id array.
         *
         * @param {String|Array} configId Configuration id or array.
         *
         * @returns {Any} View parameter mapped to configuration Id or Id array.
         */
        getViewParam: function (configId, topLevelOnly) {

            // Try the fields
            var fieldPath = this.field.path;
            if (this.fields && this.fields[fieldPath]) {
                var configVal = this._getConfigVal(this.fields[fieldPath], configId);
                if (!Alpaca.isEmpty(configVal)) {
                    return configVal;
                }
            }

            // array related field path
            if (fieldPath && fieldPath.indexOf('[') != -1 && fieldPath.indexOf(']') != -1) {
                fieldPath = fieldPath.replace(/\[\d+\]/g,"[*]");
                if (this.fields && this.fields[fieldPath]) {
                    var configVal = this._getConfigVal(this.fields[fieldPath], configId);
                    if (!Alpaca.isEmpty(configVal)) {
                        return configVal;
                    }
                }
            }

            if (!Alpaca.isEmpty(topLevelOnly) && topLevelOnly && this.field.path != "/") {
                return null;
            }

            return this._getConfigVal(this, configId);
        },

        /**
         * Internal method for getting configuration.
         *
         * @private
         *
         * @param {Any} configVal configuration value.
         * @param {String} configId configuration id.
         *
         * @returns {Any} configuration mapping to the given id
         */
        _getConfigVal : function (configVal, configId) {
            if (Alpaca.isArray(configId)) {
                for (var i = 0; i < configId.length && !Alpaca.isEmpty(configVal); i++) {
                    configVal = configVal[configId[i]];
                }
            } else {
                if (!Alpaca.isEmpty(configVal)) {
                    configVal = configVal[configId];
                }
            }
            return configVal;
        },

        /**
         * Loads an injected style.
         *
         * @param id
         */
        getInjectedStyle: function(id)
        {
            var injectedStyle = null;

            var injections = {};
            if (this.style)
            {
                var _injections = Alpaca.styleInjections[this.style];
                if (_injections) {
                    Alpaca.mergeObject(_injections, injections);
                }
            }

            return injectedStyle[id];
        },

        /**
         * Executes a template.
         *
         * @param view
         * @param templateDescriptor
         * @param model
         */
        tmpl: function(templateDescriptor, model)
        {
            return Alpaca.tmpl(templateDescriptor, model);
        }

    });
})(jQuery);(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Field = Base.extend(
    /**
     * @lends Alpaca.Field.prototype
     */
    {
        /**
         * @constructs
         *
         * @class Abstract class that served as base for all Alpaca field classes that provide actual implementation.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {String} viewId view id
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, viewId, connector, errorCallback) {

            var self = this;

            // mark that we are initializing
            this.initializing = true;

            // container
            this.container = container;

            // parent
            this.parent = null;

            // config
            this.data = data;
            this.options = options;
            this.schema = schema;
            this.connector = connector;
            this.errorCallback = function(err)
            {
                if (errorCallback)
                {
                    errorCallback(err);
                }
                else
                {
                    Alpaca.defaultErrorCallback.call(self, err);
                }
            };

            // check if this field rendering is single-level or not
            this.singleLevelRendering = false;

            // set a runtime view
            this.view = new Alpaca.RuntimeView(viewId, this);

            // things we can draw off the options
            var noOptions = false;
            if (!this.options) {
                this.options = {};
                noOptions = true;
            }
            this.id = this.options.id;
            this.type = this.options.type;

            // setup defaults
            if (!this.id) {
                this.id = Alpaca.generateId();
            }
            var noSchema = false;
            if (!this.schema) {
                this.schema = {};
                noSchema = true;
            }
            if (!this.options.label && this.schema.title !== null) {
                this.options.label = this.schema.title;
            }

            if (!this.options.helper && this.schema.description !== null) {
                this.options.helper = this.schema.description;
            }

            if (Alpaca.isEmpty(this.options.readonly) && !Alpaca.isEmpty(this.schema.readonly)) {
                this.options.readonly = this.schema.readonly;
            }

            // if data is empty, then we check whether we can fall back to a default value
            if (Alpaca.isValEmpty(this.data) && !Alpaca.isEmpty(this.schema["default"])) {
                this.data = this.schema["default"];
                this.showingDefaultData = true;
            }

            // default path
            this.path = "/";

            // validation status
            this.validation = {};

            // events
            this._events = {};

            // helper function to determine if we're in a display-only mode
            this.isDisplayOnly = function()
            {
                return (self.view.type == "view");
            };

            // schema id cleanup
            if (this.schema && this.schema.id && this.schema.id.indexOf("#") == 0)
            {
                this.schema.id = this.schema.id.substring(1);
            }

            // has this field been previously validated?
            this._previouslyValidated = false;
        },

        /**
         * Returns default field template id. It would be "fieldSet" for container fields and
         * "controlField" for none-container fields.
         *
         * @returns {String} Default field template id.
         */
        getDefaultFieldTemplateId : function () {
            return "controlField";
        },

        /**
         * Sets up default rendition template from view.
         */
        setDefaultTemplateDescriptor: function() {

            var viewTemplateDescriptor = this.view.getTemplateDescriptor(this.getDefaultFieldTemplateId());
            var globalTemplateDescriptor = this.view.getGlobalTemplateDescriptor();
            var layout = this.view.getLayout();

            // we only allow the global or layout template to be applied to the top-most field
            var trip = false;
            if (!this.parent)
            {
                if (globalTemplateDescriptor) {
                    this.setTemplateDescriptor(globalTemplateDescriptor);
                    this.singleLevelRendering = true;
                    trip = true;
                }
                else if (layout && layout.templateDescriptor) {
                    this.setTemplateDescriptor(layout.templateDescriptor);
                    trip = true;
                }
            }

            if (!trip && viewTemplateDescriptor)
            {
                this.setTemplateDescriptor(viewTemplateDescriptor);
            }
        },

        /**
         * This method will be called right after the field instance is created. It will initialize
         * the field to get it ready for rendition.
         */
        setup: function() {

            if (!this.initializing) {
                this.data = this.getValue();
            }

            this.setDefaultTemplateDescriptor();

            // JSON SCHEMA
            if (Alpaca.isUndefined(this.schema.required)) {
                this.schema.required = false;
            }

            // VALIDATION
            if (Alpaca.isUndefined(this.options.validate)) {
                this.options.validate = true;
            }

            // OPTIONS
            if (Alpaca.isUndefined(this.options.disabled)) {
                this.options.disabled = false;
            }

            // MESSAGES
            if (Alpaca.isUndefined(this.options.showMessages)) {
                this.options.showMessages = true;
            }
        },

        /**
         * Registers an event listener.
         *
         * @param name
         * @param fn
         * @returns {*}
         */
        on: function(name, fn)
        {
            Alpaca.logDebug("Adding listener for event: " + name);
            this._events[name] = fn;
            return this;
        },

        /**
         * Triggers an event and propagates the event up the parent chain.
         *
         * @param name
         * @param event
         */
        triggerWithPropagation: function(name, event)
        {
            this.trigger.call(this, name, event);

            if (this.parent)
            {
                this.parent.triggerWithPropagation.call(this.parent, name, event);
            }
        },

        /**
         * Triggers an event
         *
         * @param name
         * @param event
         *
         * Remainder of arguments will be passed to the event handler.
         *
         * @returns {null}
         */
        trigger: function(name, event)
        {
            // NOTE: this == control

            var handler = this._events[name];

            var ret = null;
            if (typeof(handler) == "function")
            {
                Alpaca.logDebug("Firing event: " + name);
                try
                {
                    ret = handler.call(this, event);
                }
                catch (e)
                {
                    Alpaca.logDebug("The event handler caught an exception: " + name);
                }
            }

            return ret;
        },


        /**
         * Binds the data into the field.  Called at the very end of construction.
         */
        bindData: function()
        {
            if (!Alpaca.isEmpty(this.data)) {
                this.setValue(this.data);
            }
        },

        /**
         * This is the entry point method into the field.  It is called by Alpaca for each field being rendered.
         *
         * Renders this field into the container and creates a DOM element which is bound into the container.
         *
         * @param {Object|String} view View to be used for rendering field (optional).
         * @param {Function} callback Post-Render callback (optional).
         */
        render: function(view, callback)
        {
            if (view && (Alpaca.isString(view) || Alpaca.isObject(view))) {
                this.view.setView(view);
            } else {
                if (Alpaca.isEmpty(callback) && Alpaca.isFunction(view)) {
                    callback = view;
                }
            }
            // last try to see if we can populate the label from propertyId
            if (this.options.label === null && this.propertyId) {
                this.options.label = this.propertyId;
            }

            // make a copy of name field
            if (this.options.name) {
                this.name = this.options.name;
            }

            // set default name value if it is not provided through options.
            if (!this.name)
            {
                // has path?
                if (this.parent && this.parent.name && this.path) {
                    var lastSegment = this.path.substring(this.path.lastIndexOf('/')+1);
                    if (lastSegment.indexOf("[") != -1 && lastSegment.indexOf("]") != -1) {
                        lastSegment = lastSegment.substring(lastSegment.indexOf("[") + 1, lastSegment.indexOf("]"));
                    }
                    if (lastSegment) {
                        this.name = this.parent.name + "_" + lastSegment;
                        this.nameCalculated = true;
                    }
                } else {
                    if (this.path) {
                       this.name = this.path.replace(/\//g,"").replace(/\[/g,"_").replace(/\]/g,"");
                       this.nameCalculated = true;
                    }
                }
            }

            this.setup();

            this._render(callback);
        },

        /**
         * Internal method for processing the render.
         *
         * @private
         * @param {Function} callback Post-render callback.
         */
        _render: function(callback) {
            var _this = this;

            // remove the previous outerEl if it exists
            if (this.getEl()) {
                this.getEl().remove();
            }

            // check if it needs to be wrapped in a form
            if (this.options.renderForm) {
                if (!this.options.form) {
                    this.options.form = {};
                }
                this.options.form.viewType = /*this.viewType*/this.view.type;
                var form = this.form;
                if (!form) {
                    form = new Alpaca.Form(this.container, this.options.form, this.view.id, this.connector, this.errorCallback);
                }
                form.render(function(form) {
                    // load the appropriate template and render it
                    _this._processRender(form.formFieldsContainer, function() {
                        // bind our field dom element into the container
                        _this.getEl().appendTo(form.formFieldsContainer);
                        // bind the top field to the form
                        form.topControl = _this;
                        if (_this.view.type && _this.view.type != 'view') {
                            form.initEvents();
                        }
                        _this.form = form;
                        // allow any post-rendering facilities to kick in
                        _this.postRender(function() {

                            // callback
                            if (callback && Alpaca.isFunction(callback)) {
                                callback(_this);
                            }

                        });
                    });
                });
            } else {
                // load the appropriate template and render it
                this._processRender(this.container, function() {
                    // bind our field dom element into the container
                    _this.getEl().appendTo(_this.container);
                    // allow any post-rendering facilities to kick in
                    _this.postRender(function() {

                        // callback
                        if (callback && Alpaca.isFunction(callback)) {
                            callback(_this);
                        }

                    });
                });
            }
        },

        /**
         * NOTE: this is no longer needed since all templates are compiled and cached on init.
         *
         * Responsible for fetching any templates needed so as to render the
         * current mode for this field.
         *
         * Once completed, the onSuccess method is called.
         *
         * @private
         *
         * @param {Object} parentEl Field container.
         * @param {Function} onSuccess onSuccess callback.
         */
        _processRender: function(parentEl, onSuccess) {
            var _this = this;

            var templateDescriptor = this.getTemplateDescriptor();

            // the data we'll render
            var theData = this.data;
            // if we're in display-only mode, and theData is an object, convert to string
            if (this.isDisplayOnly() && typeof(theData) == "object") {
                theData = JSON.stringify(theData);
            }

            // render field template
            if (Alpaca.collectTiming)
            {
                var t1 = new Date().getTime();
            }

            var renderedDomElement = _this.view.tmpl(templateDescriptor, {
                "id": this.getId(),
                "options": this.options,
                "schema": this.schema,
                "data": theData,
                "view": this.view,
                "path": this.path,
                "name": this.name
            });

            if (Alpaca.collectTiming)
            {
                var t2 = new Date().getTime();

                var counters = Alpaca.Counters("tmpl");
                counters.increment(this.type, (t2-t1));
            }

            // TODO: Alpaca currently assumes that everything under parentEl is the control itself
            // the workaround for TABLE view is unaccommodating toward this
            // a click on the label behaves like a click on the cell
            // this needs more work
            renderedDomElement.appendTo(parentEl);

            // if we got back multiple dom elements, then look for the dom element where "data-control" has a value of
            //   "append" = place the control into this dom element
            var newEl = renderedDomElement;
            if (renderedDomElement.size() > 1) {
                renderedDomElement.each(function(k,v) {
                    if ($(this).attr("data-control") == "append") {
                        newEl = $(this);
                    }
                });
            }
            //this.setEl(renderedDomElement);
            this.setEl(newEl);


            ///
            // in the case of a control field, the renderedDomElement is the control field rendered using the template
            // 'templateDescriptor' which is the controlField template from the view
            //
            // this renderedDomElement services as a container for the control field itself which we can now render INTO
            // the renderedDomElement if we want.
            //
            // however, if we're in DISPLAY_ONLY mode (i.e. view.type == "view") then the controlField will have already
            // rendered a simple textual representation of the data
            //
            // therefore, if we're in DISPLAY_ONLY mode, we do not want to render the field control (which would be something
            // like an INPUT field).  therefore, if we're rendering a control (like a text field), then we should stop now
            // otherwise, if we are a ContainerField, then we do want to continue so that any children can process
            //
            // in addition, if we're in singleLevelRendering (in which case the top most global template has taken care
            // of rendering everything), then we do not want to render the field.
            if (!this.singleLevelRendering) {

                if (!this.isDisplayOnly() || (!this.isControlField))
                {
                    this.renderField(function() {
                        if (onSuccess) {
                            onSuccess(this);
                        }
                    });
                }
                else
                {
                    if (onSuccess) {
                        onSuccess(this);
                    }
                }

            } else {
                if (onSuccess) {
                    onSuccess(this);
                }
            }
        },

        /**
         * Renders DOM elements for this field.
         *
         * @param onSuccess {Function} onSuccess callback.
         */
        renderField: function(onSuccess) {
        },

        /**
         * Applies style injection function for the provided item key.
         *
         * @param key item key for style injection
         * @param targetDiv target DIV of style injection
         */
        getStyleInjection: function(key,targetDiv, arg1, arg2) {
            if (this.view.style && Alpaca.styleInjections[this.view.style] && Alpaca.styleInjections[this.view.style][key]) {
                Alpaca.styleInjections[this.view.style][key].call(this,targetDiv, arg1, arg2);
            }
        },

        /**
         * This method will be called after the field rendition is complete. It is served as a way to make final
         * modifications to the dom elements that were produced.
         */
        postRender: function(callback) {

            // try to avoid adding unnecessary injections for display view.
            if (this.view.type != 'view') {

                // add classes
                this.getStyleInjection('field',this.getEl());

                this.getEl().addClass("alpaca-field");

                // for edit or create mode
                // injects Ids
                if (this.getEl().attr("id") === null) {
                    this.getEl().attr("id", this.getId() + "-field-outer");
                }
                if (Alpaca.isEmpty(this.getEl().attr("alpaca-field-id"))) {
                    this.getEl().attr("alpaca-field-id", this.getId());
                }
                // optional
                if (this.schema.required) {
                    this.getEl().addClass("alpaca-field-required");
                } else {
                    this.getEl().addClass("alpaca-field-optional");
                }

                // readonly
                if (this.options.readonly) {
                    this.getEl().addClass("alpaca-field-readonly");
                    $(':input', this.getEl()).attr('readonly', 'readonly');
                    $('select', this.getEl()).attr('disabled', 'disabled');
                    $(':radio', this.getEl()).attr('disabled', 'disabled');
                    $(':checkbox', this.getEl()).attr('disabled', 'disabled');
                }

                // allow single or multiple field classes to be specified via the "fieldClass"
                // or "fieldClasses" options
                var applyFieldClass = function(el, thing)
                {
                    if (thing) {

                        var i = 0;
                        var tokens = null;

                        if (Alpaca.isArray(thing)) {
                            for (i = 0; i < thing.length; i++) {
                                el.addClass(thing[i]);
                            }
                        }
                        else {
                            if (thing.indexOf(",") > -1) {
                                tokens = thing.split(",");
                                for (i = 0; i < tokens.length; i++) {
                                    el.addClass(tokens[i]);
                                }
                            } else if (thing.indexOf(" ") > -1) {
                                tokens = thing.split(" ");
                                for (i = 0; i < tokens.length; i++) {
                                    el.addClass(tokens[i]);
                                }
                            }
                            else {
                                el.addClass(thing);
                            }
                        }
                    }
                };
                applyFieldClass(this.getEl(), this.options["fieldClass"]);

                // Support for custom styles provided by custom view
                var customStyles = this.view.getStyles();

                if (customStyles) {
                    for (var styleClass in customStyles) {
                        $(styleClass, this.container).css(customStyles[styleClass]);
                    }
                }

                // // add required field style
                // if (this.labelDiv && this.schema.required) {
                //     console.log(this.labelDiv);
                //     this.getStyleInjection('required',this.labelDiv);
                // }

                // after render
                if (this.options.disabled) {
                    this.disable();
                }

                // we bind data if we're in "edit" mode
                // typically, we don't bind data if we're in "create" or any other mode
                if (this.view.type && this.view.type == 'edit') {
                    this.bindData();
                }
                else if (this.showingDefaultData)
                {
                    // if this control is showing default data, then we render the control anyway
                    this.bindData();
                }

                // some logging to be useful
                if (this.view.type == "create")
                {
                    Alpaca.logDebug("Skipping data binding for field: " + this.id + " since view mode is 'create'");
                }

                // initialize dom-level events
                if (this.view.type && this.view.type != 'view') {
                    this.initEvents();
                }
            }

            // hidden
            if (this.options.hidden) {
                this.getEl().hide();
            }

            // finished initializing
            this.initializing = false;

            var defaultHideInitValidationError = (this.view.type == 'create');
            this.hideInitValidationError = Alpaca.isValEmpty(this.options.hideInitValidationError) ? defaultHideInitValidationError : this.options.hideInitValidationError;

            // for create view, hide all readonly fields
            if (!this.view.displayReadonly) {
                $('.alpaca-field-readonly', this.getEl()).hide();
            }

            // field level post render
            if (this.options.postRender)
            {
                this.options.postRender.call(this, function() {

                    callback();

                });
            }
            else
            {
                callback();
            }

        },

        /**
         * Retrieves the rendered DOM element.
         *
         * @returns {Object} The rendered DOM element.
         */
        getEl: function() {
            return this.outerEl;
        },

        /**
         * Sets the outer element of the DOM element to be rendered by this field.
         *
         * @param outerEl New outer element for this field.
         */
        setEl: function(outerEl) {
            this.outerEl = outerEl;
        },

        /**
         * Returns the id of the field.
         *
         * @returns Field id.
         */
        getId: function() {
            return this.id;
        },

        /*        getType: function() {
         return this.type;
         },*/

        /**
         * Returns this field's parent.
         *
         * @returns {Alpaca.Field} Field parent.
         */
        getParent: function() {
            return this.parent;
        },

        /**
         * Finds if this field is top level.
         *
         * @returns {Boolean} True if this field is the top level one, false otherwise.
         */
        isTopLevel: function() {
            return Alpaca.isEmpty(this.parent);
        },

        /**
         * Returns the value of this field.
         *
         * @returns {Any} value Field value.
         */
        getValue: function() {
            return this.data;
        },

        /**
         * Sets the value of the field.
         *
         * @param {Any} value Value to be set.
         */
        setValue: function(value) {
            this.data = value;
            this.triggerUpdate();
        },

        /**
         * Resets value to default.
         */
        setDefault: function() {
        },

        /**
         * Returns the field template descriptor.
         *
         * @returns {Object} template descriptor
         */
        getTemplateDescriptor: function() {
            return this.templateDescriptor;
        },

        /**
         * Sets the field template descriptor.
         *
         * @param {Object} template descriptor
         */
        setTemplateDescriptor: function(templateDescriptor) {
            this.templateDescriptor = templateDescriptor;
        },

        /**
         * Renders a validation state message below the field.
         *
         * @param {String} messages Validation state messages.
         * @param {Boolean} beforeStatus Previous validation status.
         */
        displayMessage: function(messages, beforeStatus) {

            var _this = this;

            // remove the message element if it exists
            _this.getEl().children(".alpaca-controlfield-message-element").remove();

            // add message and generate it
            if (messages && messages.length > 0) {
                $.each(messages, function(index, message) {
                    if (message.length > 0) {
                        var messageTemplateDescriptor = _this.view.getTemplateDescriptor("controlFieldMessage");
                        if (messageTemplateDescriptor) {
                            _this.messageElement = _this.view.tmpl(messageTemplateDescriptor, {
                                "message": message
                            });
                            _this.getStyleInjection('errorMessage',_this.messageElement);
                            if (_this.hideInitValidationError) {
                                _this.messageElement.addClass("alpaca-controlfield-message-hidden");
                            } else {
                                _this.messageElement.addClass("alpaca-controlfield-message");
                            }
                            _this.messageElement.addClass("alpaca-controlfield-message-element");
                            _this.messageElement.attr("id", _this.getId() + '-field-message-' + index);
                            // check to see if we have a message container rendered
                            if ($('.alpaca-controlfield-message-container', _this.getEl()).length) {
                                _this.messageElement.appendTo($('.alpaca-controlfield-message-container', _this.getEl()));
                            } else {
                                _this.messageElement.appendTo(_this.getEl());
                            }
                        }

                        _this.getStyleInjection('addErrorMessage', _this.getEl(), message);
                    }
                });
            }
        },

        /**
         * Forces the validation for a field to be refreshed or redrawn to the screen.
         *
         * If told to check children, then all children of the container field will be refreshed as well.
         *
         * @param {Boolean} children whether to refresh children
         */
        refreshValidationState: function(children)
        {
            if (children)
            {
                var f = function(field, contexts)
                {
                    // if the field has children, go depth first
                    if (field.children && field.children.length > 0)
                    {
                        for (var i = 0; i < field.children.length; i++)
                        {
                            if (field.children[i].isValidationParticipant())
                            {
                                f(field.children[i], contexts);
                            }
                        }
                    }

                    if (typeof(contexts) == "object")
                    {
                        // compile the validation context for this field
                        var context = Alpaca.compileValidationContext(field);
                        contexts.push(context);
                    }

                    return contexts;
                };

                // run once to cause everything to flip to correct state
                //f(this);

                // run again to collect contexts (nothing flips)
                var contexts = f(this, []);

                // merge
                var mergedMap = {};
                var mergedContext = [];
                for (var i = 0; i < contexts.length; i++)
                {
                    var context = contexts[i];

                    // NOTE: context is already in order [child, parent, ...]

                    var mIndex = mergedContext.length;

                    // walk forward
                    for (var j = 0; j < context.length; j++)
                    {
                        var entry = context[j];

                        var existing = mergedMap[entry.id];
                        if (!existing)
                        {
                            // just add to end
                            var newEntry = {};
                            newEntry.id = entry.id;
                            newEntry.path = entry.path;
                            newEntry.container = entry.container;
                            newEntry.field = entry.field;
                            newEntry.validated = entry.validated;
                            newEntry.invalidated = entry.invalidated;
                            newEntry.valid = entry.valid;
                            mergedContext.splice(mIndex, 0, newEntry);

                            // mark in map
                            mergedMap[newEntry.id] = newEntry;
                        }
                        else
                        {
                            if (entry.validated && !existing.invalidated)
                            {
                                existing.validated = true;
                                existing.invalidated = false;
                                existing.valid = entry.valid;
                            }

                            if (entry.invalidated)
                            {
                                existing.invalidated = true;
                                existing.validated = false;
                                existing.valid = entry.valid;
                            }
                        }
                    }
                }

                // now reverse it so that context is normalized with child fields first
                mergedContext.reverse();

                // update validation state
                Alpaca.updateValidationStateForContext(mergedContext);
            }
            else
            {
                // just ourselves

                // compile the validation context for the field
                var context = Alpaca.compileValidationContext(this);

                // update the UI for these context items
                Alpaca.updateValidationStateForContext(context);
            }
        },

        showHiddenMessages: function() {
            var hiddenDiv = $('.alpaca-field-invalid-hidden', this.outerEl);
            hiddenDiv.removeClass('alpaca-field-invalid-hidden');
            this.getStyleInjection('error',hiddenDiv);
            hiddenDiv.addClass('alpaca-field-invalid');
            $('.alpaca-controlfield-message-hidden', this.outerEl).removeClass('alpaca-controlfield-message-hidden').addClass('alpaca-controlfield-message');
        },

        /**
         * Validates this field and returns whether it is in a valid state.
         *
         * @param [Boolean] validateChildren whether to child controls.
         *
         * @returns {Boolean} True if value of this field is valid, false otherwise.
         */
        validate: function(validateChildren)
        {
            // skip out if we haven't yet bound any data into this control
            // the control can still be considered to be initializing
            var status = true;

            if (!this.initializing && this.options.validate)
            {
                // if validateChildren, then walk recursively down into child elements
                if (this.children && validateChildren)
                {
                    for (var i = 0; i < this.children.length; i++)
                    {
                        var child = this.children[i];
                        if (child.isValidationParticipant())
                        {
                            child.validate(validateChildren);
                        }
                    }
                }

                // evaluate ourselves
                status = this.handleValidate();

                // support for some debugging
                if (!status && Alpaca.logLevel == Alpaca.DEBUG)
                {
                    // messages
                    var messages = [];
                    for (var messageId in this.validation)
                    {
                        if (!this.validation[messageId]["status"])
                        {
                            messages.push(this.validation[messageId]["message"]);
                        }
                    }

                    Alpaca.logDebug("Validation failure for field (id=" + this.getId() + ", path=" + this.path + "), messages: " + JSON.stringify(messages));
                }
            }

            this._previouslyValidated = true;

            return status;
        },

        /**
         * Performs validation.
         */
        handleValidate: function() {
            var valInfo = this.validation;

            var status = this._validateOptional();
            valInfo["notOptional"] = {
                "message": status ? "" : this.view.getMessage("notOptional"),
                "status": status
            };

            status = this._validateDisallow();
            valInfo["disallowValue"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("disallowValue"), [this.schema["disallow"].join(',')]),
                "status": status
            };

            return valInfo["notOptional"]["status"] && valInfo["disallowValue"]["status"];
        },

        /**
         * Validates using user provided validator.
         */
        _validateCustomValidator: function(callback) {

            var _this = this;

            if (this.options.validator && Alpaca.isFunction(this.options.validator))
            {
                this.options.validator(this, function(valInfo) {

                    // always store in "custom"
                    _this.validation["custom"] = valInfo;

                    callback();
                });
            }
            else
            {
                callback();
            }
        },

        /**
         * Validates against required property.
         *
         * @returns {Boolean} False if this field value is empty but required, true otherwise.
         */
        _validateOptional: function() {
            if (this.schema.required && this.isEmpty()) {
                return false;
            }
            return true;
        },

        /**
         * Checks whether the field value is allowed or not.
         *
         * @returns {Boolean} True if the field value is allowed, false otherwise.
         */
        _validateDisallow: function() {
            if (!Alpaca.isValEmpty(this.schema.disallow)) {
                var val = this.getValue();
                var disallow = this.schema.disallow;
                if (Alpaca.isArray(disallow)) {
                    var isAllowed = true;
                    $.each(disallow, function(index, value) {
                        if ((Alpaca.isObject(val) || Alpaca.isArray(val)) && Alpaca.isString(value)) {
                            value = Alpaca.parseJSON(value);
                        }
                        if (Alpaca.compareObject(val, value)) {
                            isAllowed = false;
                        }
                    });
                    return isAllowed;
                } else {
                    if ((Alpaca.isObject(val) || Alpaca.isArray(val)) && Alpaca.isString(disallow)) {
                        disallow = Alpaca.parseJSON(disallow);
                    }
                    return !Alpaca.compareObject(val, disallow);
                }
            }

            return true;
        },

        /**
         * Triggers any event handlers that listens to the update event of this field.
         */
        triggerUpdate: function() {
            this.getEl().trigger("fieldupdate");
        },

        /**
         * Disables the field.
         */
        disable: function() {
            // OVERRIDE
        },

        /**
         * Enables the field.
         */
        enable: function() {
            // OVERRIDE
        },

        /**
         * Focuses on the field.
         */
        focus: function() {
            // OVERRIDE
        },

        /**
         * Purges any event listeners and remove this field from the DOM.
         */
        destroy: function() {

            // clean up Alpaca.fieldInstances static reference (used for convenience access to previous rendered fields)
            if (Alpaca && Alpaca.fieldInstances) {
                if (Alpaca.fieldInstances[this.getId()]) {
                    delete Alpaca.fieldInstances[this.getId()];
                }
            }

            // clean up DOM
            this.getEl().remove();
        },

        /**
         * Shows the field.
         */
        show: function() {
            if (this.options && this.options.hidden)
            {
                // if the hidden option is on, we're always hidden
                return;
            }
            else
            {
                // show the field
                this.getEl().css({
                    "display": ""
                });

                this.onShow();
            }
        },

        onShow: function()
        {

        },

        /**
         * Hides the field.
         */
        hide: function()
        {
            this.getEl().css({
                "display": "none"
            });

            this.onHide();
        },

        onHide: function()
        {

        },

        isValidationParticipant: function()
        {
            return this.isShown();
        },

        isShown: function() {
            return this.isVisible();
        },

        isVisible: function() {
            return !this.isHidden();
        },

        isHidden: function() {
            return "none" == this.getEl().css("display");
        },

        /**
         * Prints the field.
         */
        print: function() {
            if (this.container.printArea) {
                this.container.printArea();
            }
        },

        /**
         * Triggered when the field is being revealed as the result of a dependency or conditional calculation
         * that has determined that the field should be shown.
         */
        onDependentReveal: function()
        {

        },

        /**
         * Triggered when the field is being concealed as the result of a dependency or conditional calculation
         * that has determined that the field should be hidden.
         */
        onDependentConceal: function()
        {

        },

        /**
         * Reloads the field.
         */
        reload: function() {
            this.initializing = true;

            if (!Alpaca.isEmpty(this.callback)) {
                this.callback(this, this.renderedCallback);
            } else {
                this.render(this.renderedCallback);
            }
        },

        /**
         * Clears the field and resets the field to its original value.
         */
        clear: function() {
            var newValue = null;

            if (this.data) {
                newValue = this.data;
            }

            this.setValue(newValue);
        },

        /**
         * Finds if the value of this field is empty.
         *
         * @return {Boolean} True if the field value is empty, false otherwise.
         */
        isEmpty: function() {
            return Alpaca.isValEmpty(this.getValue());
        },

        /**
         * Finds if this field is valid.
         *
         * @return {Boolean} True if the field is valid, false otherwise.
         */
        isValid: function(checkChildren) {

            if (checkChildren && this.children)
            {
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    if (child.isValidationParticipant())
                    {
                        if (!child.isValid(checkChildren)) {
                            return false;
                        }
                    }
                }
            }

            if ($.isEmptyObject(this.validation)) {
                return true;
            } else {
                for (var key in this.validation) {
                    if (!this.validation[key].status) {
                        return false;
                    }
                }
                return true;
            }
        },

        /**
         * Initializes event handling.
         */
        initEvents: function() {
            var _this = this;

            if (this.field)
            {
                // trigger control level handlers for things that happen to input element
                this.field.change(function(e) {
                    _this.onChange.call(_this, e);
                    _this.trigger("change", e);
                });

                this.field.focus(function(e) {
                    _this.onFocus.call(_this, e);
                    _this.trigger("focus", e);
                });

                this.field.blur(function(e) {
                    _this.onBlur.call(_this, e);
                    _this.trigger("blur", e);
                });
                this.field.mouseover(function(e) {
                    _this.onMouseOver.call(_this, e);
                    _this.trigger("mouseover", e);
                });
                this.field.mouseout(function(e) {
                    _this.onMouseOut.call(_this, e);
                    _this.trigger("mouseout", e);
                });

                // register general event handlers through options
                $.each(this.options, function(key, func) {
                    if (Alpaca.startsWith(key,'onField') && Alpaca.isFunction(func)) {
                        var event = key.substring(7).toLowerCase();
                        _this.field.on(event, function(e) {
                            func.call(_this,e);
                        });
                    }
                });
            }
        },

        /**
         * Callback for when the field receives focus.
         *
         * Default behavior is for the entire field to highlight.
         *
         * @param e dom event
         */
        onFocus: function(e) {
            this.getEl().removeClass("alpaca-field-empty");
            this.getEl().addClass("alpaca-field-focused");
        },

        /**
         * Callback for when the field loses focus (blurs).
         *
         * Default behavior is for the entire field to un-highlight.
         *
         * @param e dom event
         */
        onBlur: function(e) {
            this.getEl().removeClass("alpaca-field-focused");

            // update the UI validation state
            this.refreshValidationState();
        },

        /**
         * Callback for when the field's value changes.
         *
         * Default behavior is to update the control's value and notify.
         *
         * @param e Event.
         */
        onChange: function(e) {
            // store back into data element
            this.data = this.getValue();
            this.triggerUpdate();
        },

        /**
         * Callback for when the mouse moves over a field.
         *
         * @param e
         */
        onMouseOver: function(e) {

        },

        /**
         * Callback for when the mouse moves out of the field.
         *
         * @param e
         */
        onMouseOut: function(e) {

        },

        /**
         * Finds a field control by its path.
         *
         * @param {String} path Field control path.
         * @returns {Alpaca.Field} Field control mapped to the path.
         */
        getControlByPath: function(path) {
            var parentControl = this;
            if (path) {
                var pathArray = path.split('/');
                for (var i = 0; i < pathArray.length; i++) {
                    if (!Alpaca.isValEmpty(pathArray[i])) {
                        if (parentControl && parentControl.childrenByPropertyId) {
                            //check to see if we need to add the properties field
                            if (parentControl.childrenByPropertyId[pathArray[i]]) {
                                parentControl = parentControl.childrenByPropertyId[pathArray[i]];
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
                return parentControl;
            }
        },

        // Utility Functions for Form Builder
        /**
         * Returns field type.
         *
         * @returns {String} Field type.
         */
        getFieldType: function() {

        },

        /**
         * Returns schema data type.
         *
         * @returns {String} Schema data type.
         */
        getType: function() {

        },//__BUILDER_HELPERS

        /**
         * Finds if this field is a container of other fields.
         *
         * @returns {Boolean} True if it is a container, false otherwise.
         */
        isContainer: function() {
            return false;
        },

        /**
         * Returns field title.
         *
         * @returns {String} Field title.
         */
        getTitle: function() {

        },

        /**
         * Returns field description.
         *
         * @returns {String} Field description.
         */
        getDescription: function() {

        },

        /**
         * Returns JSON schema of the schema properties that are managed by this class.
         *
         * @private
         * @returns {Object} JSON schema of the schema properties that are managed by this class.
         */
        getSchemaOfSchema: function() {
            var schemaOfSchema = {
                "title": this.getTitle(),
                "description": this.getDescription(),
                "type": "object",
                "properties": {
                    "title": {
                        "title": "Title",
                        "description": "Short description of the property.",
                        "type": "string"
                    },
                    "description": {
                        "title": "Description",
                        "description": "Detailed description of the property.",
                        "type": "string"
                    },
                    "readonly": {
                        "title": "Readonly",
                        "description": "Property will be readonly if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "required": {
                        "title": "Required",
                        "description": "Property value must be set if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "default": {
                        "title": "Default",
                        "description": "Default value of the property.",
                        "type": "any"
                    },
                    "type": {
                        "title": "Type",
                        "description": "Data type of the property.",
                        "type": "string",
                        "readonly": true
                    },
                    "format": {
                        "title": "Format",
                        "description": "Data format of the property.",
                        "type": "string"
                    },
                    "disallow": {
                        "title": "Disallowed Values",
                        "description": "List of disallowed values for the property.",
                        "type": "array"
                    },
                    "dependencies": {
                        "title": "Dependencies",
                        "description": "List of property dependencies.",
                        "type": "array"
                    }
                }
            };
            if (this.getType && !Alpaca.isValEmpty(this.getType())) {
                schemaOfSchema.properties.type['default'] = this.getType();
                schemaOfSchema.properties.type['enum'] = [this.getType()];
            }
            return schemaOfSchema;
        },

        /**
         * Returns Alpaca options for the schema properties that managed by this class.
         *
         * @private
         * @returns {Object} Alpaca options for the schema properties that are managed by this class.
         */
        getOptionsForSchema: function() {
            return {
                "fields": {
                    "title": {
                        "helper": "Field short description",
                        "type": "text"
                    },
                    "description": {
                        "helper": "Field detailed description",
                        "type": "textarea"
                    },
                    "readonly": {
                        "helper": "Field will be read only if checked",
                        "rightLabel": "This field is read-only",
                        "type": "checkbox"
                    },
                    "required": {
                        "helper": "Field value must be set if checked",
                        "rightLabel": "This field is required",
                        "type": "checkbox"
                    },
                    "default": {
                        "helper": "Field default value",
                        "type": "textarea"
                    },
                    "type": {
                        "helper": "Field data type",
                        "type": "text"
                    },
                    "format": {
                        "type": "select",
                        "dataSource": function(field, callback) {
                            for (var key in Alpaca.defaultFormatFieldMapping) {
                                field.selectOptions.push({
                                    "value": key,
                                    "text": key
                                });
                            }
                            if (callback) {
                                callback();
                            }
                        }
                    },
                    "disallow": {
                        "helper": "Disallowed values for the field",
                        "itemLabel":"Value",
                        "type": "array"
                    },
                    "dependencies": {
                        "helper": "Field Dependencies",
                        "multiple":true,
                        "size":3,
                        "type": "select",
                        "dataSource": function (field, callback) {
                            if (field.parent && field.parent.schemaParent && field.parent.schemaParent.parent) {
                                for (var key in field.parent.schemaParent.parent.childrenByPropertyId) {
                                    if (key != field.parent.schemaParent.propertyId) {
                                        field.selectOptions.push({
                                            "value": key,
                                            "text": key
                                        });
                                    }
                                }
                            }
                            if (callback) {
                                callback();
                            }
                        }
                    }
                }
            };
        },

        /**
         * Returns JSON schema of the Alpaca options that are managed by this class.
         *
         * @private
         * @returns {Object} JSON schema of the Alpaca options that are managed by this class.
         */
        getSchemaOfOptions: function() {
            var schemaOfOptions = {
                "title": "Options for " + this.getTitle(),
                "description": this.getDescription() + " (Options)",
                "type": "object",
                "properties": {
                    "renderForm": {},
                    "form":{},
                    "id": {
                        "title": "Field Id",
                        "description": "Unique field id. Auto-generated if not provided.",
                        "type": "string"
                    },
                    "type": {
                        "title": "Field Type",
                        "description": "Field type.",
                        "type": "string",
                        "default": this.getFieldType(),
                        "readonly": true
                    },
                    "validate": {
                        "title": "Validation",
                        "description": "Field validation is required if true.",
                        "type": "boolean",
                        "default": true
                    },
                    "showMessages": {
                        "title": "Show Messages",
                        "description": "Display validation messages if true.",
                        "type": "boolean",
                        "default": true
                    },
                    "disabled": {
                        "title": "Disabled",
                        "description": "Field will be disabled if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "readonly": {
                        "title": "Readonly",
                        "description": "Field will be readonly if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "hidden": {
                        "title": "Hidden",
                        "description": "Field will be hidden if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "label": {
                        "title": "Label",
                        "description": "Field label.",
                        "type": "string"
                    },
                    "helper": {
                        "title": "Helper",
                        "description": "Field help message.",
                        "type": "string"
                    },
                    "fieldClass": {
                        "title": "CSS class",
                        "description": "Specifies one or more CSS classes that should be applied to the dom element for this field once it is rendered.  Supports a single value, comma-delimited values, space-delimited values or values passed in as an array.",
                        "type": "string"
                    },
                    "hideInitValidationError" : {
                        "title": "Hide Initial Validation Errors",
                        "description" : "Hide initial validation errors if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "focus": {
                        "title": "Focus",
                        "description": "If true, the initial focus for the form will be set to the first child element (usually the first field in the form).  If a field name or path is provided, then the specified child field will receive focus.  For example, you might set focus to 'name' (selecting the 'name' field) or you might set it to 'client/name' which picks the 'name' field on the 'client' object.",
                        "type": "checkbox",
                        "default": true
                    },
                    "optionLabels": {
                        "title": "Enumerated Value Labels",
                        "description": "An array of string labels for items in the enum array",
                        "type": "array"
                    }
                }
            };
            if (this.isTopLevel()) {
                schemaOfOptions.properties.renderForm = {
                    "title": "Render Form",
                    "description": "Render a FORM tag as the container for the rest of fields if true.",
                    "type": "boolean",
                    "default": false
                };

                schemaOfOptions.properties.form = {
                    "title": "Form",
                    "description": "Options for rendering the FORM tag.",
                    "type": "object",
                    "dependencies" : "renderForm",
                    "properties": {
                        "attributes": {
                            "title": "Form Attributes",
                            "description": "List of attributes for the FORM tag.",
                            "type": "object",
                            "properties": {
                                "id": {
                                    "title": "Id",
                                    "description": "Unique form id. Auto-generated if not provided.",
                                    "type": "string"
                                },
                                "action": {
                                    "title": "Action",
                                    "description": "Form submission endpoint",
                                    "type": "string"
                                },
                                "method": {
                                    "title": "Method",
                                    "description": "Form submission method",
                                    "enum":["post","get"],
                                    "type": "string"
                                },
				"rubyrails": {
				    "title": "Ruby On Rails",
				    "description": "Ruby on Rails Name Standard",
				    "enum": ["true", "false"],
				    "type": "string"
				},
                                "name": {
                                    "title": "Name",
                                    "description": "Form name",
                                    "type": "string"
                                },
                                "focus": {
                                    "title": "Focus",
                                    "description": "Focus Setting",
                                    "type": "any"
                                }
                            }
                        },
                        "buttons": {
                            "title": "Form Buttons",
                            "description": "Configuration for form-bound buttons",
                            "type": "object",
                            "properties": {
                                "submit": {
                                    "type": "object",
                                    "title": "Submit Button",
                                    "required": false
                                },
                                "reset": {
                                    "type": "object",
                                    "title": "Reset button",
                                    "required": false
                                }
                            }
                        },
                        "toggleSubmitValidState": {
                            "title": "Toggle Submit Valid State",
                            "description": "Toggle the validity state of the Submit button",
                            "type": "boolean",
                            "default": true
                        }
                    }
                };

            } else {
                delete schemaOfOptions.properties.renderForm;
                delete schemaOfOptions.properties.form;
            }

            return schemaOfOptions;
        },

        /**
         * Returns Alpaca options for the Alpaca options that are managed by this class.
         *
         * @private
         * @returns {Object} Alpaca options for the Alpaca options that are managed by this class.
         */
        getOptionsForOptions: function() {
            var optionsForOptions = {
                "type": "object",
                "fields": {
                    "id": {
                        "type": "text",
                        "readonly": true
                    },
                    "type": {
                        "type": "text"
                    },
                    "validate": {
                        "rightLabel": "Enforce validation",
                        "type": "checkbox"
                    },
                    "showMessages": {
                        "rightLabel":"Show validation messages",
                        "type": "checkbox"
                    },
                    "disabled": {
                        "rightLabel":"Disable this field",
                        "type": "checkbox"
                    },
                    "hidden": {
                        "type": "checkbox",
                        "rightLabel": "Hide this field"
                    },
                    "label": {
                        "type": "text"
                    },
                    "helper": {
                        "type": "textarea"
                    },
                    "fieldClass": {
                        "type": "text"
                    },
                    "hideInitValidationError": {
                        "rightLabel": "Hide initial validation errors",
                        "type": "checkbox"
                    },
                    "focus": {
                        "type": "checkbox",
                        "rightLabel": "Auto-focus first child field"
                    },
                    "optionLabels": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                }
            };
            if (this.isTopLevel()) {
                optionsForOptions.fields.renderForm = {
                    "type": "checkbox",
                    "rightLabel": "Yes"
                };
                optionsForOptions.fields.form = {
                    "type": "object",
                    "dependencies" : {
                        "renderForm" : true
                    },
                    "fields": {
                        "attributes": {
                            "type": "object",
                            "fields": {
                                "id": {
                                    "type": "text",
                                    "readonly": true
                                },
                                "action": {
                                    "type": "text"
                                },
                                "method": {
                                    "type": "select"
                                },
                                "name": {
                                    "type": "text"
                                }
                            }
                        }
                    }
                };
            }

            return optionsForOptions;
        }//__END_OF_BUILDER_HELPERS
    });

    // Registers additional messages
    Alpaca.registerMessages({
        "disallowValue": "{0} are disallowed values.",
        "notOptional": "This field is not optional."
    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.ControlField = Alpaca.Field.extend(
    /**
     * @lends Alpaca.ControlField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Field
         *
         * @class Abstract base class for Alpaca non-container Fields.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);

            // tag to flag that this is a control field
            // used by Field base class to determine whether to traverse into this during a display-only rendering
            this.isControlField = true;
        },

        /**
         * @see Alpaca.Field#setDefault
         */
        setDefault: function() {
            var defaultData = Alpaca.isEmpty(this.schema['default']) ? "" : this.schema['default'];
            this.setValue(defaultData);
        },

        /**
         * @see Alpaca.Field#renderField
         */
        renderField: function(onSuccess) {
            if (onSuccess) {
                onSuccess();
            }
        },

        /**
         * Injects Field Element into its container.
         *
         * @param {Object} element Field element to be injected.
         */
        injectField: function(element) {
            // find out the field container
            var containerElem = $('.alpaca-controlfield-container', this.outerEl);
            if (containerElem.length) {
                this.fieldContainer = containerElem;
            } else {
                this.fieldContainer = this.outerEl;
            }
            // now figure out where exactly we want to insert it
            var parentNode = $('.alpaca-field-container-field', this.fieldContainer);
            if (parentNode.length > 0) {
                if (parentNode.attr('data-replace') == 'true') {
                    parentNode.replaceWith(element);
                } else {
                    element.appendTo(parentNode);
                }
            } else {
                if (this.fieldContainer.attr('data-replace') == 'true') {
                    this.fieldContainer.replaceWith(element);
                } else {
                    element.prependTo(this.fieldContainer);
                }
            }
        },

        /**
         * @see Alpaca.Field#postRender
         */
        postRender: function(callback)
        {
            var self = this;

            var labelDiv = $('.alpaca-controlfield-label', this.outerEl);
            if (labelDiv.length) {
                this.labelDiv = labelDiv;
            }

            var helperDiv = $('.alpaca-controlfield-helper', this.outerEl);
            if (helperDiv.length) {
                this.helperDiv = helperDiv;
            }

            this.base(function() {

                // add additional classes
                self.outerEl.addClass('alpaca-controlfield');

                callback();

            });
        },

        /**
         * Validate against enum property.
         *
         * @returns {Boolean} True if the element value is part of the enum list, false otherwise.
         */
        _validateEnum: function() {
            if (this.schema["enum"]) {
                var val = this.data;
                /*this.getValue();*/
                if (!this.schema.required && Alpaca.isValEmpty(val)) {
                    return true;
                }
                if ($.inArray(val, this.schema["enum"]) > -1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },

        /**
         * @see Alpaca.Field#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateEnum();
            valInfo["invalidValueOfEnum"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("invalidValueOfEnum"), [this.schema["enum"].join(',')]),
                "status": status
            };

            return baseStatus && valInfo["invalidValueOfEnum"]["status"];
        },

        /**
         * @see Alpaca.Field#initEvents
         */
        initEvents: function() {
            this.base();

            var _this = this;

            if (this.field)
            {
                this.field.keypress(function(e) {
                    _this.onKeyPress.call(_this, e);
                    _this.trigger("keypress", e);
                });

                this.field.keyup(function(e) {
                    _this.onKeyUp.call(_this, e);
                    _this.trigger("keyup", e);
                });

                this.field.keydown(function(e) {
                    _this.onKeyDown.call(_this, e);
                    _this.trigger("keydown", e);
                });

                this.field.click(function(e) {
                    _this.onClick.call(_this, e);
                    _this.trigger("click", e);
                });
            }

        },

        /**
         * Callback for when a key press event is received for the field control.
         *
         * @param {Object} e keypress event
         */
        onKeyPress: function(e) {

            var self = this;

            // if the field is currently invalid, then we provide early feedback to the user as to when they enter
            // if the field was valid, we don't render invalidation feedback until they blur the field

            // was the control valid previously?
            var wasValid = this.isValid();
            if (!wasValid)
            {
                //
                // we use a timeout because at this exact moment, the value of the control is still the old value
                // jQuery raises the keypress event ahead of the input receiving the new data which would incorporate
                // the key that was pressed
                //
                // this timeout provides the browser with enough time to plug the value into the input control
                // which the validation logic uses to determine whether the control is now in a valid state
                //
                window.setTimeout(function() {
                    self.refreshValidationState();
                }, 50);
            }

        },

        /**
         * Callback for when a key down event is received for the field control.
         *
         * @param {Object} e keydown event
         */
        onKeyDown: function(e) {

        },

        /**
         * Callback for when a key up event is received for the field control.
         *
         * @param {Object} e keyup event
         */
        onKeyUp: function(e) {

        },

        /**
         * Handler for click event.
         *
         * @param {Object} e Click event.
         */
        onClick: function(e) {
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Field#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "enum": {
                        "title": "Enumerated Values",
                        "description": "List of specific values for this property",
                        "type": "array"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Field#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "enum": {
                        "itemLabel":"Value",
                        "type": "array"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Field#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "name": {
                        "title": "Field Name",
                        "description": "Field Name.",
                        "type": "string"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Field#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "name": {
                        "type": "text"
                    }
                }
            });
        }//__END_OF_BUILDER_HELPERS
    });

    // Registers additional messages
    Alpaca.registerMessages({
        "invalidValueOfEnum": "This field should have one of the values in {0}."
    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.ContainerField = Alpaca.Field.extend(

        /**
         * @lends Alpaca.ContainerField.prototype
         */
        {
            /**
             * @constructs
             * @augments Alpaca.Field
             *
             * @class Abstract container field for parenting of child fields.
             *
             * Custom field implementation should extend this if they intend to be containers of sub-controls -
             * examples include tree controls, list controls and more.
             *
             * @param {Object} container Field container.
             * @param {Any} data Field data.
             * @param {Object} options Field options.
             * @param {Object} schema Field schema.
             * @param {Object|String} view Field view.
             * @param {Alpaca.Connector} connector Field connector.
             * @param {Function} errorCallback Error callback.
             */
            constructor: function(container, data, options, schema, view, connector, errorCallback) {
                this.base(container, data, options, schema, view, connector, errorCallback);
            },

            /**
             * @see Alpaca.Field#setup
             */
            setup: function() {
                this.base();

                var collapsible = true;

                if (!Alpaca.isEmpty(this.view.collapsible)) {
                    collapsible = this.view.collapsible;
                }

                if (!Alpaca.isEmpty(this.options.collapsible)) {
                    collapsible = this.options.collapsible;
                }

                this.options.collapsible = collapsible;

                var legendStyle = "button";

                if (!Alpaca.isEmpty(this.view.legendStyle)) {
                    legendStyle = this.view.legendStyle;
                }

                if (!Alpaca.isEmpty(this.options.legendStyle)) {
                    legendStyle = this.options.legendStyle;
                }

                this.options.legendStyle = legendStyle;

                //Lazy loading
                this.lazyLoading = false;
                if (!Alpaca.isEmpty(this.options.lazyLoading)) {
                    this.lazyLoading = this.options.lazyLoading;
                    if (this.lazyLoading) {
                        this.options.collapsed = true;
                    }
                    //delete this.options.lazyLoading;
                }
                // holders of references to children
                this.children = [];
                this.childrenById = [];
                this.childrenByPropertyId = [];
                // style icons
                this.expandedIcon = "";
                this.collapsedIcon = "";
                this.commonIcon = "";
                this.addIcon = "";
                this.removeIcon = "";
                this.upIcon = "";
                this.downIcon = "";
                if (this.view.style && Alpaca.styleInjections[this.view.style]) {
                    if (Alpaca.styleInjections[this.view.style]["commonIcon"]) {
                        this.commonIcon = Alpaca.styleInjections[this.view.style]["commonIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["containerExpandedIcon"]) {
                        this.expandedIcon = Alpaca.styleInjections[this.view.style]["containerExpandedIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["containerCollapsedIcon"]) {
                        this.collapsedIcon = Alpaca.styleInjections[this.view.style]["containerCollapsedIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["buttonBeautifier"]) {
                        this.buttonBeautifier = Alpaca.styleInjections[this.view.style]["buttonBeautifier"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["addIcon"]) {
                        this.addIcon = Alpaca.styleInjections[this.view.style]["addIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["removeIcon"]) {
                        this.removeIcon = Alpaca.styleInjections[this.view.style]["removeIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["upIcon"]) {
                        this.upIcon = Alpaca.styleInjections[this.view.style]["upIcon"];
                    }
                    if (Alpaca.styleInjections[this.view.style]["downIcon"]) {
                        this.downIcon = Alpaca.styleInjections[this.view.style]["downIcon"];
                    }
                }
            },

            /**
             * @see Alpaca.Field#getDefaultFieldTemplateId
             */
            getDefaultFieldTemplateId : function () {
                return "fieldSet";
            },

            /**
             * @see Alpaca.Field#setDefaultTemplateDescriptor
             */
            setDefaultTemplateDescriptor: function() {
                this.base();
            },

            /**
             * Helper method to add child field.
             *
             * @param {Alpaca.Control} child Child field to be added.
             * @param {Integer} index Index of the new child.
             */
            addChild: function(child, index) {
                if (!Alpaca.isEmpty(index)) {
                    this.children.splice(index, 0, child);
                } else {
                    this.children.push(child);
                }
                this.childrenById[child.getId()] = child;
                if (child.propertyId) {
                    this.childrenByPropertyId[child.propertyId] = child;
                }
                child.parent = this;
            },

            /**
             * @see Alpaca.Field#initEvents
             */
            initEvents: function() {
                var _this = this;

                // if collapsible
                if (this.labelDiv) {
                    if (this.options.collapsible) {

                        this.labelDiv.addClass("legend-expanded");
                        this.fieldSetDiv.addClass("fieldset-expanded");

                        var initIcon = this.expandedIcon;

                        if (!Alpaca.isEmpty(this.options.collapsed) && this.options.collapsed) {
                            initIcon = this.collapsedIcon;
                            this.labelDiv.nextAll(".alpaca-fieldset-helper").slideToggle(500);
                            this.labelDiv.nextAll(".alpaca-fieldset-items-container").slideToggle(500);
                            this.labelDiv.nextAll(".alpaca-fieldset-array-toolbar").slideToggle(500);
                            this.fieldSetDiv.toggleClass("fieldset-expanded");
                            this.fieldSetDiv.toggleClass("fieldset-collapsed");
                            this.labelDiv.toggleClass("legend-expanded");
                            this.labelDiv.toggleClass("legend-collapsed");
                        }

                        if (this.options.legendStyle == 'link') {
                            $('<span class="' + this.commonIcon + " " + initIcon + ' alpaca-fieldset-legend-link"></span>').prependTo(this.labelDiv);
                            this.labelDiv.click(function() {
                                _this.fieldSetDiv.toggleClass("fieldset-collapsed");
                                _this.fieldSetDiv.toggleClass("fieldset-expanded");
                                $(this).toggleClass("legend-collapsed");
                                $(this).toggleClass("legend-expanded");
                                $('.alpaca-fieldset-legend-link', this).toggleClass(_this.collapsedIcon).toggleClass(_this.expandedIcon);
                                $(this).nextAll(".alpaca-fieldset-helper").slideToggle(500);
                                $(this).nextAll(".alpaca-fieldset-items-container").slideToggle(500);
                                $(this).nextAll(".alpaca-fieldset-array-toolbar").slideToggle(500);
                            });
                        }

                        if (this.options.legendStyle == 'button') {
                            if (this.buttonBeautifier) {
                                this.buttonBeautifier.call(this, this.labelDiv, initIcon, true);
                            }

                            this.labelDiv.click(function() {
                                _this.fieldSetDiv.toggleClass("fieldset-collapsed");
                                _this.fieldSetDiv.toggleClass("fieldset-expanded");
                                $(this).toggleClass("legend-collapsed");
                                $(this).toggleClass("legend-expanded");
                                $('.alpaca-fieldset-legend-button', this).toggleClass(_this.collapsedIcon).toggleClass(_this.expandedIcon);
                                $(this).nextAll(".alpaca-fieldset-helper").slideToggle(500);
                                $(this).nextAll(".alpaca-fieldset-items-container").slideToggle(500);
                                $(this).nextAll(".alpaca-fieldset-array-toolbar").slideToggle(500);
                            });
                        }
                    }
                }
            },

            /**
             * Clears the field and resets the field to its original value.
             *
             * @param stopUpdateTrigger If false, triggers the update event of this event.
             */
            clear: function(stopUpdateTrigger) {
                // clear all the kiddies
                Alpaca.each(this.children, function() {
                    this.clear(false);
                });

                // trigger update all at once
                if (!stopUpdateTrigger) {
                    this.triggerUpdate();
                }
            },

            /**
             * @see Alpaca.Field#setDefault
             */
            setDefault: function() {
                if (Alpaca.isEmpty(this.schema['default'])) {
                    Alpaca.each(this.children, function() {
                        this.setDefault();
                    });
                } else {
                    this.setValue(this.schema['default']);
                }
            },

            /**
             * @see Alpaca.Field#destroy
             */
            destroy: function() {

                // if this container is DOM-wrapped with a form, then release the form
                if (this.form) {
                    this.form.destroy(true); // pass in true so that we don't call back recursively
                    delete this.form;
                }

                // destroy any child controls
                Alpaca.each(this.children, function() {
                    this.destroy();
                });

                // call up to base method
                this.base();
            },

            /**
             * Renders child item container.
             *
             * @param {Integer} insertAfterId Insertion point for the container.
             * @param {Alpaca.Control} parent Parent field.
             * @param {String} propertyId Child item property ID.
             */
            renderItemContainer: function(insertAfterId, parent, propertyId) {
                var _this = this;

                var itemContainerTemplateDescriptor = this.view.getTemplateDescriptor("fieldSetItemContainer");
                if (itemContainerTemplateDescriptor) {
                    var containerElem = _this.view.tmpl(itemContainerTemplateDescriptor, {});
                    if (containerElem.attr('data-replace') == 'true') {
                        return this.fieldContainer;
                    } else {
                        if (insertAfterId) {
                            $('#' + insertAfterId + '-item-container', this.outerEl).after(containerElem);
                        } else {

                            var appendToContainer = this.fieldContainer;

                            var bindings = this.view.getLayout().bindings;
                            if (bindings) {
                                var binding = bindings[propertyId];
                                if (binding && $('#' + binding, appendToContainer).length > 0) {
                                    appendToContainer = $('#' + binding, appendToContainer);
                                }
                            }
                            containerElem.appendTo(appendToContainer);
                        }
                    }
                    return containerElem;
                } else {
                    return this.fieldContainer;
                }
            },

            /**
             * @see Alpaca.Field#renderField
             */
            renderField: function(onSuccess) {

                var _this = this;

                this.getStyleInjection("container", this.outerEl);

                var labelDiv = $('.alpaca-fieldset-legend', this.outerEl);

                if (labelDiv.length) {
                    this.labelDiv = labelDiv;
                } else {
                    this.outerEl.addClass('alpaca-fieldset-no-legend');
                }

                var fieldSetDiv = $('.alpaca-fieldset', this.outerEl);

                if (fieldSetDiv.length) {
                    this.fieldSetDiv = fieldSetDiv;
                } else {
                    this.fieldSetDiv = this.outerEl;
                }

                var fieldContainer = $('.alpaca-fieldset-items-container', this.outerEl);
                if (fieldContainer.length) {
                    this.fieldContainer = fieldContainer;
                } else {
                    this.fieldContainer = this.outerEl;
                }

                var asyncHandler = false;

                if (!this.singleLevelRendering && !this.lazyLoading) {
                    asyncHandler = true;
                    this.renderItems(function() {
                        if (onSuccess) {
                            onSuccess();
                        }
                    });
                }

                if (this.lazyLoading) {
                    if (this.labelDiv) {
                        asyncHandler = true;
                        $(this.labelDiv).click(function() {
                            if (_this.lazyLoading) {
                                _this.renderItems(function() {
                                    _this.lazyLoading = false;
                                    if (onSuccess) {
                                        onSuccess();
                                    }
                                });
                            }
                        });
                    }
                }

                if (!asyncHandler)
                {
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            },

            /**
             * Propagates signal down to all children.
             * @override
             */
            onDependentReveal: function()
            {
                for (var i = 0; i < this.children.length; i++)
                {
                    this.children[i].onDependentReveal();
                }
            },

            /**
             * Propagates signal down to all children.
             * @override
             */
            onDependentConceal: function()
            {
                for (var i = 0; i < this.children.length; i++)
                {
                    this.children[i].onDependentConceal();
                }
            },

            /**
             * Renders all child items of this field.
             *
             * @param onSuccess onSuccess callback.
             */
            renderItems: function(onSuccess) {
            },//__BUILDER_HELPERS

            /**
             * @see Alpaca.Field#isContainer
             */
            isContainer: function() {
                return true;
            },

            /**
             * @private
             * @see Alpaca.Field#getSchemaOfOptions
             */
            getSchemaOfOptions: function() {
                return Alpaca.merge(this.base(), {
                    "properties": {
                        "lazyLoading": {
                            "title": "Lazy Loading",
                            "description": "Child fields will only be rendered when the fieldset is expanded if this option is set true.",
                            "type": "boolean",
                            "default": false
                        },
                        "collapsible": {
                            "title": "Collapsible",
                            "description": "Field set is collapsible if true.",
                            "type": "boolean",
                            "default": true
                        },
                        "collapsed": {
                            "title": "Collapsed",
                            "description": "Field set is initially collapsed if true.",
                            "type": "boolean",
                            "default": false
                        },
                        "legendStyle": {
                            "title": "Legend Style",
                            "description": "Field set legend style.",
                            "type": "string",
                            "enum":["button","link"],
                            "default": "button"
                        }
                    }
                });
            },

            /**
             * @private
             * @see Alpaca.Field#getOptionsForOptions
             */
            getOptionsForOptions: function() {
                return Alpaca.merge(this.base(), {
                    "fields": {
                        "lazyLoading": {
                            "rightLabel": "Lazy loading child fields ?",
                            "helper": "Lazy loading will be enabled if checked.",
                            "type": "checkbox"
                        },
                        "collapsible": {
                            "rightLabel": "Field set collapsible ?",
                            "helper": "Field set is collapsible if checked.",
                            "type": "checkbox"
                        },
                        "collapsed": {
                            "rightLabel": "Field set initially collapsed ?",
                            "description": "Field set is initially collapsed if checked.",
                            "type": "checkbox"
                        },
                        "legendStyle": {
                            "type":"select"
                        }
                    }
                });
            }//__END_OF_BUILDER_HELPERS
        });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Connector = Base.extend(
    /**
     * @lends Alpaca.Connector.prototype
     */
    {
        /**
         * @constructs
         * @class Connects Alpaca to remote data stores.

         * @param {String} id Connector ID.
         */
        constructor: function(id)
        {
            this.id = id;

            // helper function to determine if a resource is a uri
            this.isUri = function(resource)
            {
                return !Alpaca.isEmpty(resource) && Alpaca.isUri(resource);
            };

            var ONE_HOUR = 3600000;
            this.cache = new ajaxCache('URL', true, ONE_HOUR);
        },

        /**
         * Makes initial connections to data source.
         *
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        connect: function (onSuccess, onError)
        {
            if (onSuccess && Alpaca.isFunction(onSuccess))
            {
                onSuccess();
            }
        },

        /**
         * Loads a template (HTML or Text).
         *
         * If the source is a URI, then it is loaded.
         * If it is not a URI, then the source is simply handed back.
         *
         * @param {Object|String} source Source to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadTemplate : function (source, onSuccess, onError)
        {
            if (!Alpaca.isEmpty(source))
            {
                if (Alpaca.isUri(source))
                {
                    this.loadUri(source, false, function(loadedData) {

                        if (onSuccess && Alpaca.isFunction(onSuccess))
                        {
                            onSuccess(loadedData);
                        }

                    }, function (loadError) {

                        if (onError && Alpaca.isFunction(onError))
                        {
                            onError(loadError);
                        }
                    });
                }
                else
                {
                    onSuccess(source);
                }
            }
            else
            {
                onError({
                    "message":"Empty data source.",
                    "reason": "TEMPLATE_LOADING_ERROR"
                });
            }
        },

        /**
         * Loads JSON data.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback
         * @param {Function} onError onError callback
         */
        loadData: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        /**
         * Loads JSON schema.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadSchema: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        /**
         * Loads JSON options.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadOptions: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        /**
         * Loads JSON view.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadView: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        /**
         * Loads schema, form, view and data in a single call.
         *
         * @param {Object} resources resources
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadAll: function (resources, onSuccess, onError)
        {
            var dataSource = resources.dataSource;
            var schemaSource = resources.schemaSource;
            var optionsSource = resources.optionsSource;
            var viewSource = resources.viewSource;

            // we allow "schema" to contain a URI as well (backwards-compatibility)
            if (!schemaSource)
            {
                schemaSource = resources.schema;
            }

            // we allow "options" to contain a URI as well (backwards-compatibility)
            if (!optionsSource)
            {
                optionsSource = resources.options;
            }

            // we allow "view" to contain a URI as well (backwards-compatibility)
            if (!viewSource)
            {
                viewSource = resources.view;
            }

            var loaded = {};

            var loadCounter = 0;
            var invocationCount = 0;

            var successCallback = function()
            {
                if (loadCounter === invocationCount)
                {
                    if (onSuccess && Alpaca.isFunction(onSuccess))
                    {
                        onSuccess(loaded.data, loaded.options, loaded.schema, loaded.view);
                    }
                }
            };

            var errorCallback = function (loadError)
            {
                if (onError && Alpaca.isFunction(onError))
                {
                    onError(loadError);
                }
            };

            // count out the total # of invokes we're going to fire off
            if (dataSource)
            {
                invocationCount++;
            }
            if (schemaSource)
            {
                invocationCount++;
            }
            if (optionsSource)
            {
                invocationCount++;
            }
            if (viewSource)
            {
                invocationCount++;
            }
            if (invocationCount === 0)
            {
                // nothing to invoke, so just hand back
                successCallback();
                return;
            }

            // fire off all of the invokes
            if (dataSource)
            {
                this.loadData(dataSource, function(data) {
                    loaded.data = data;
                    loadCounter++;
                    successCallback();
                }, errorCallback);
            }
            if (schemaSource)
            {
                this.loadSchema(schemaSource, function(schema) {
                    loaded.schema = schema;
                    loadCounter++;
                    successCallback();
                }, errorCallback);
            }
            if (optionsSource)
            {
                this.loadOptions(optionsSource, function(options) {
                    loaded.options = options;
                    loadCounter++;
                    successCallback();
                }, errorCallback);
            }
            if (viewSource)
            {
                this.loadView(viewSource, function(view) {
                    loaded.view = view;
                    loadCounter++;
                    successCallback();
                }, errorCallback);
            }
        },

        /**
         * Loads a JSON through Ajax call.
         *
         * @param {String} uri location of the json document
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadJson : function(uri, onSuccess, onError) {
            this.loadUri(uri, true, onSuccess, onError);
        } ,

        /**
         * Loads a general document through Ajax call.
         *
         * This uses jQuery to perform the Ajax call.  If you need to customize connectivity to your own remote server,
         * this would be the appropriate place to do so.
         *
         * @param {String} uri uri to be loaded
         * @param {Boolean} isJson Whether the document is a JSON or not.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadUri : function(uri, isJson, onSuccess, onError) {

            var self = this;

            var ajaxConfigs = {
                "url": uri,
                "type": "get",
                "success": function(jsonDocument) {

                    self.cache.put(uri, jsonDocument);

                    if (onSuccess && Alpaca.isFunction(onSuccess)) {
                        onSuccess(jsonDocument);
                    }
                },
                "error": function(jqXHR, textStatus, errorThrown) {
                    if (onError && Alpaca.isFunction(onError)) {
                        onError({
                            "message":"Unable to load data from uri : " + uri,
                            "stage": "DATA_LOADING_ERROR",
                            "details": {
                                "jqXHR" : jqXHR,
                                "textStatus" : textStatus,
                                "errorThrown" : errorThrown
                            }
                        });
                    }
                }
            };

            if (isJson) {
                ajaxConfigs.dataType = "json";
            } else {
                ajaxConfigs.dataType = "text";
            }

            var cachedDocument = self.cache.get(uri);

            if (cachedDocument !== false && onSuccess && Alpaca.isFunction(onSuccess)) {
                onSuccess(cachedDocument);
            } else {
                $.ajax(ajaxConfigs);
            }
        },

        /**
         * Loads referenced JSON schema.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadReferenceSchema: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        /**
         * Loads referenced JSON options.
         *
         * @param {Object|String} resource Resource to be loaded.
         * @param {Function} onSuccess onSuccess callback.
         * @param {Function} onError onError callback.
         */
        loadReferenceOptions: function (resource, successCallback, errorCallback)
        {
            return this._handleLoadJsonResource(resource, successCallback, errorCallback);
        },

        _handleLoadJsonResource: function (resource, successCallback, errorCallback)
        {
            if (this.isUri(resource))
            {
                this.loadJson(resource, function(loadedResource) {
                    successCallback(loadedResource);
                }, errorCallback);
            }
            else
            {
                successCallback(resource);
            }
        }

    });

    Alpaca.registerConnectorClass("default", Alpaca.Connector);








    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // AJAX CACHE
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////


    /*!
     * ajax-cache JavaScript Library v0.2.1
     * http://code.google.com/p/ajax-cache/
     *
     * Includes few JSON methods (open source)
     * http://www.json.org/js.html
     *
     * Date: 2010-08-03
     */
    function ajaxCache(type, on, lifetime) {
        if (on) {
            this.on = true;
        } else
            this.on = false;

        // set default cache lifetime
        if (lifetime != null) {
            this.defaultLifetime = lifetime;
        }

        // set type
        this.type = type;

        // set cache functions according to type
        switch (this.type) {
            case 'URL':
                this.put = this.put_url;
                break;
            case 'GET':
                this.put = this.put_GET;
                break;
        }

    };

    ajaxCache.prototype.on = false;
    ajaxCache.prototype.type;
    ajaxCache.prototype.defaultLifetime = 1800000; // 1800000=30min, 300000=5min, 30000=30sec
    ajaxCache.prototype.items = Object();

    /**
     * Caches the request and its response. Type: url
     *
     * @param url - url of ajax response
     * @param response - ajax response
     * @param lifetime - (optional) sets cache lifetime in miliseconds
     * @return true on success
     */
    ajaxCache.prototype.put_url = function(url, response, lifetime) {
        if (lifetime == null) lifetime = this.defaultLifetime;
        var key = this.make_key(url);
        this.items[key] = Object();
        this.items[key].key = key;
        this.items[key].url = url;
        this.items[key].response = response;
        this.items[key].expire = (new Date().getTime()) + lifetime;
        return true;
    }

    /**
     * Caches the request and its response. Type: GET
     *
     * @param url - url of ajax response
     * @param data - data params (query)
     * @param response - ajax response
     * @param lifetime - (optional) sets cache lifetime in miliseconds
     * @return true on success
     */
    ajaxCache.prototype.put_GET = function(url, data, response, lifetime) {
        if (lifetime == null)
            lifetime = this.defaultLifetime;
        var key = this.make_key(url, [ data ]);
        this.items[key] = Object();
        this.items[key].key = key;
        this.items[key].url = url;
        this.items[key].data = data;
        this.items[key].response = response;
        this.items[key].expire = (new Date().getTime()) + lifetime;
        return true;
    }

    /**
     * Get cached ajax response
     *
     * @param url - url of ajax response
     * @param params - Array of additional parameters, to make key
     * @return ajax response or false if such does not exist or is expired
     */
    ajaxCache.prototype.get = function(url, params) {
        var key = this.make_key(url, params);

        // if cache does not exist
        if (this.items[key] == null)
            return false;

        // if cache expired
        if (this.items[key].expire < (new Date().getTime()))
            return false;

        // everything is passed - lets return the response
        return this.items[key].response;
    }

    /**
     * Make unique key for each request depending on url and additional parameters
     *
     * @param url - url of ajax response
     * @param params - Array of additional parameters, to make key
     * @return unique key
     */
    ajaxCache.prototype.make_key = function(url, params) {
        var key = url;
        switch (this.type) {
            case 'URL':
                break;
            case 'GET':
                key += this.stringify(params[0]);
                break;
        }

        return key;
    }

    /**
     * Flush cache
     *
     * @return true on success
     */
    ajaxCache.prototype.flush = function() {
        // flush all cache
        cache.items = Object();
        return true;
    }

    /*
     * Methods to stringify JavaScript/JSON objects.
     *
     * Taken from: http://www.json.org/js.html to be more exact, this file:
     * http://www.json.org/json2.js copied on 2010-07-19
     *
     * Taken methods: stringify, quote and str
     *
     * Methods are slightly modified to best fit ajax-cache functionality
     *
     */
    ajaxCache.prototype.stringify = function(value, replacer, space) {

        // The stringify method takes a value and an optional replacer, and an
        // optional
        // space parameter, and returns a JSON text. The replacer can be a function
        // that can replace values, or an array of strings that will select the
        // keys.
        // A default replacer method can be provided. Use of the space parameter can
        // produce text that is more easily readable.

        var i;
        gap = '';
        indent = '';

        // If the space parameter is a number, make an indent string containing that
        // many spaces.

        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' ';
            }

            // If the space parameter is a string, it will be used as the indent
            // string.

        } else if (typeof space === 'string') {
            indent = space;
        }

        // If there is a replacer, it must be a function or an array.
        // Otherwise, throw an error.

        rep = replacer;
        if (replacer
            && typeof replacer !== 'function'
            && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.

        return this.str('', {
            '' : value
        });
    }

    ajaxCache.prototype.quote = function(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable,
            function(a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a
                    .charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
    }

    ajaxCache.prototype.str = function(key, holder) {

        // Produce a string from holder[key].

        var i, // The loop counter.
            k, // The member key.
            v, // The member value.
            length, mind = gap, partial, value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object'
            && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return this.quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an
            // array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is
                // 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object
                // value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a
                    // placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = this.str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and
                    // wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap
                        + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be
                // stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = this.str(k, value);
                            if (v) {
                                partial.push(this.quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = this.str(k, value);
                            if (v) {
                                partial.push(this.quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap
                    + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial
                    .join(',') + '}';
                gap = mind;
                return v;
        }
    }

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Form = Base.extend(
    /**
     * @lends Alpaca.Form.prototype
     */
    {
        /**
         * @constructs
         *
         * @class This class is for managing HTML form control.
         *
         * @param {Object} container Field container.
         * @param {Object} options Field options.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, options, viewId, connector, errorCallback) {
            var _this = this;

            // container
            this.container = container;

            // parent
            this.parent = null;

            this.connector = connector;
            this.errorCallback = errorCallback;

            // options
            this.options = options;

            if (this.options.attributes) {
                this.attributes = this.options.attributes;
            } else {
                this.attributes = {};
            }

            if (this.options.buttons) {
                if (this.options.buttons.submit) {
                    if (!this.options.buttons.submit.type) {
                        this.options.buttons.submit.type = 'submit';
                    }
                    if (!this.options.buttons.submit.name) {
                        this.options.buttons.submit.name = 'submit';
                    }
                    if (!this.options.buttons.submit.value) {
                        this.options.buttons.submit.value = 'Submit';
                    }
                }
                if (this.options.buttons.reset) {
                    if (!this.options.buttons.reset.type) {
                        this.options.buttons.reset.type = 'reset';
                    }
                    if (!this.options.buttons.reset.name) {
                        this.options.buttons.reset.name = 'reset';
                    }
                    if (!this.options.buttons.reset.value) {
                        this.options.buttons.reset.value = 'Reset';
                    }
                }
            }

            if (this.attributes.id) {
                this.id = this.attributes.id;
            } else {
                this.id = Alpaca.generateId();
                this.attributes.id = this.id;
            }

            // if we have a submit button specified, and toggleSubmitValidState isn't defined, set to true by default
            // don't allow the form to submit unless valid
            if (this.options.buttons && this.options.buttons.submit && Alpaca.isUndefined(this.options.toggleSubmitValidState))
            {
                this.options.toggleSubmitValidState = true;
            }

            this.viewType = options.viewType;

            // set a runtime view
            this.view = new Alpaca.RuntimeView(viewId, this);
        },

        /**
         * Renders this form into the container.
         *
         * @param {Function} onSuccess onSuccess callback.
         */
        render: function(onSuccess) {
            var _this = this;

            this.templateDescriptor = this.view.getTemplateDescriptor("form");

            // remove the previous outerEl if it exists
            if (this.outerEl) {
                this.outerEl.remove();
            }

            // load the appropriate template and render it
            this.processRender(this.container, function() {
                // bind our field dom element into the container
                _this.outerEl.appendTo(_this.container);

                // add default class
                _this.outerEl.addClass("alpaca-form");

                // execute callback
                if (onSuccess)
                    onSuccess(_this);
            });
        },

        /**
         * Determines whether the top control is entirely valid.
         *
         * @return {*}
         */
        isFormValid: function()
        {
            // re-compute validation for the full control set
            this.topControl.validate(true);

            var valid = this.topControl.isValid(true);
            this.refreshValidationState(true);

            return valid;
        },

        validate: function(children)
        {
            return this.topControl.validate(children);
        },

        enableSubmitButton: function()
        {
            $(".alpaca-form-button-submit").attrProp("disabled", false);

            if ($.mobile) {
                try { $(".alpaca-form-button-submit").button('refresh'); } catch (e) { }
            }
        },

        disableSubmitButton: function()
        {
            $(".alpaca-form-button-submit").attrProp("disabled", true);

            if ($.mobile) {
                try { $(".alpaca-form-button-submit").button('refresh'); } catch (e) { }
            }
        },

        adjustSubmitButtonState: function()
        {
            this.disableSubmitButton();

            var x = this.isFormValid();
            if (this.isFormValid())
            {
                this.enableSubmitButton();
            }
        },

        /**
         * Responsible for fetching any templates needed so as to render the
         * current mode for this field.
         *
         * Once completed, the onSuccess method is called.
         *
         * @param {Object} parentEl Field container.
         * @param {Function} onSuccess onSuccess callback.
         */
        processRender: function(parentEl, onSuccess) {
            var _this = this;

            // lookup the template we should use to render
            var templateDescriptor = this.getTemplateDescriptor();

            var context = {
                id: this.getId(),
                options: this.options,
                view: this.view
            };
            var renderedDomElement = _this.view.tmpl(templateDescriptor, context, {});
            renderedDomElement.appendTo(parentEl);

            this.outerEl = renderedDomElement;

            if (Alpaca.isEmpty(this.outerEl.attr("id"))) {
                this.outerEl.attr("id", this.getId() + "-form-outer");
            }
            if (Alpaca.isEmpty(this.outerEl.attr("alpaca-field-id"))) {
                this.outerEl.attr("alpaca-field-id", this.getId());
            }

            // get container for forms
            if ($('.alpaca-form-fields-container', this.outerEl)) {
                this.formFieldsContainer = $('.alpaca-form-fields-container', this.outerEl);
            } else {
                this.formFieldsContainer = this.outerEl;
            }

            // the form field
            this.field = $('form', this.container);
            if (this.field)
            {
                // add all provided attributes
                this.field.attr(this.attributes);
            }

            // populate the buttons as well
            this.buttons = {};
            $.each($('.alpaca-form-button', this.container),function(k,v) {

                // TODO: this is technically wrong since we only want to trap for left-mousedown...
                $(v).mousedown(function() {
                    var _this = $(this);
                    _this.attr("button-pushed","true");
                    setTimeout(function() {
                        if (_this.attr("button-pushed") && _this.attr("button-pushed") == "true" ) {
                            _this.click();
                        }
                    }, 150);
                });
                $(v).click(function() {
                    $(this).removeAttr("button-pushed");
                });
                _this.buttons[$(v).attr('data-key')] = $(v);
            });

            onSuccess();
        },

        /**
         * Retrieve the form container.
         *
         * @returns {Object} Form container.
         */
        getEl: function() {
            return this.outerEl;
        },

        /**
         * Returns the id of the form.
         *
         * @returns {String} Form id
         */
        getId: function() {
            return this.id;
        },

        /**
         * Returns form type.
         *
         * @returns {String} Form type.
         */
        getType: function() {
            return this.type;
        },

        /**
         * Returns this form's parent.
         *
         * @returns {Object} Form parent.
         */
        getParent: function() {
            return this.parent;
        },

        /**
         * Returns the value of the JSON rendered by this form.
         *
         * @returns {Any} Value of the JSON rendered by this form.
         */
        getValue: function() {
            return this.topControl.getValue();
        },

        /**
         * Sets the value of the JSON to be rendered by this form.
         *
         * @param {Any} value Value to be set.
         */
        setValue: function(value) {
            this.topControl.setValue(value);
        },

        /**
         * Initializes events handling (Form Submission) for this form.
         */
        initEvents: function() {
            var _this = this;
            if (this.field) {
                var v = this.getValue();
                $(this.field).submit(v, function(e) {

                    return _this.onSubmit(e, _this);
                });
            }

            // listen for fieldupdates and determine whether the form is valid.
            // if so, enable the submit button...
            // otherwise, disable it
            if (this.options.toggleSubmitValidState)
            {
                $(_this.topControl.getEl()).bind("fieldupdate", function() {
                    _this.adjustSubmitButtonState();
                });

                this.adjustSubmitButtonState();
            }
        },

        /**
         * Handles form submit events.
         *
         * @param {Object} e Submit event.
         * @param {Object} form the form
         */
        onSubmit: function(e, form) {
            if (this.submitHandler) {
                e.stopPropagation();

                var v = this.submitHandler(e, form);
                if (Alpaca.isUndefined(v)) {
                    v = false;
                }

                return v;

            }
        },

        /**
         * Registers a custom submit handler.
         *
         * @param {Object} func Submit handler to be registered.
         */
        registerSubmitHandler: function (func) {
            if (Alpaca.isFunction(func)) {
                this.submitHandler = func;
            }
        },

        /**
         * Displays validation information of all fields of this form.
         *
         * @param {Boolean} children whether to render validation state for child fields
         *
         * @returns {Object} Form validation state.
         */
        refreshValidationState: function(children) {
            this.topControl.refreshValidationState(children);
        },

        /**
         * Disables this form.
         */
        disable: function() {
            this.topControl.disable();
        },

        /**
         * Enables this form.
         */
        enable: function() {
            this.topControl.enable();
        },

        /**
         * Focuses on this form.
         */
        focus: function() {
            this.topControl.focus();
        },

        /**
         * Purge any event listeners and remove the form from the DOM.
         *
         * @param [Boolean] skipParent when true, the form cleans up without traversing through parent child controls
         */
        destroy: function(skipParent) {

            this.getEl().remove();

            // we allow form.destroy() which tells parent control to destroy
            // if skipParent == true, then we do not call up (invoked from container)
            if (!skipParent && this.parent)
            {
                this.parent.destroy();
            }
        },

        /**
         * Shows the form.
         */
        show: function() {
            this.getEl().css({
                "display": ""
            });
        },

        /**
         * Hides the form.
         */
        hide: function() {
            this.getEl().css({
                "display": "none"
            });
        },

        /**
         * Clears the form and resets values of its fields.
         *
         * @param stopUpdateTrigger If false, triggers the update event of this event.
         */
        clear: function(stopUpdateTrigger) {
            this.topControl.clear(stopUpdateTrigger);
        },

        /**
         * Checks if form is empty.
         *
         * @returns {Boolean} True if the form is empty, false otherwise.
         */
        isEmpty: function() {
            return this.topControl.isEmpty();
        },

        /**
         * Returns the form template.
         *
         * @returns {Object|String} template Form template.
         */
        getTemplateDescriptor: function() {
            return this.templateDescriptor;
        },

        /**
         * Sets the form template.
         *
         * @param {String} templateDescriptor Template to be set
         */
        setTemplateDescriptor: function(templateDescriptor) {
            this.templateDescriptor = templateDescriptor;
        }

    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.TextField = Alpaca.ControlField.extend(
    /**
     * @lends Alpaca.Fields.TextField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ControlField
         *
         * @class Basic control for general text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Field#setup
         */
        setup: function() {
            this.base();
            
            if (!this.options.size) {
                this.options.size = 20;
            }

            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldText");
        },

        /**
         * @see Alpaca.Field#destroy
         */
        destroy: function() {

            this.base();

            // clean up typeahead
            if ( this.field && this.field.typeahead && this.options.typeahead) {
                $(this.field).typeahead('destroy');
            }
        },

        /**
         * @see Alpaca.ControlField#renderField
         */
        renderField: function(onSuccess) {

            var _this = this;

            if (this.controlFieldTemplateDescriptor) {

                this.field = _this.view.tmpl(this.controlFieldTemplateDescriptor, {
                    "id": this.getId(),
                    "name": this.name,
                    "options": this.options
                });
                this.injectField(this.field);
            }

            if (onSuccess) {
                onSuccess();
            }
        },
        
        /**
         * @see Alpaca.ControlField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.field)
                {
                    // mask it
                    if ( self.field && self.field.mask && self.options.maskString)
                    {
                        self.field.mask(self.options.maskString);
                    }

                    // typeahead?
                    if ( self.field && self.field.typeahead && self.options.typeahead)
                    {
                        var tConfig = self.options.typeahead.config;
                        if (!tConfig) {
                            tConfig = {};
                        }

                        var tDatasets = self.options.typeahead.datasets;
                        if (!tDatasets) {
                            tDatasets = {};
                        }

                        if (!tDatasets.name) {
                            tDatasets.name = self.getId();
                        }

                        var tEvents = self.options.typeahead.events;
                        if (!tEvents) {
                            tEvents = {};
                        }

                        // support for each datasets (local, prefetch, remote)
                        if (tDatasets.type == "local" || tDatasets.type == "remote" || tDatasets.type == "prefetch")
                        {
                            var bloodHoundConfig = {
                                datumTokenizer: function(d) {
                                    return Bloodhound.tokenizers.whitespace(d.value);
                                },
                                queryTokenizer: Bloodhound.tokenizers.whitespace
                            };

                            if (tDatasets.type == "local" )
                            {
                                var local = [];

                                for (var i = 0; i < tDatasets.source.length; i++)
                                {
                                    var localElement = tDatasets.source[i];
                                    if (typeof(localElement) == "string")
                                    {
                                        localElement = {
                                            "value": localElement
                                        };
                                    }

                                    local.push(localElement);
                                }

                                bloodHoundConfig.local = local;
                            }

                            if (tDatasets.type == "prefetch")
                            {
                                bloodHoundConfig.prefetch = {
                                    url: tDatasets.source
                                };

                                if (tDatasets.filter)
                                {
                                    bloodHoundConfig.prefetch.filter = tDatasets.filter;
                                }
                            }

                            if (tDatasets.type == "remote")
                            {
                                bloodHoundConfig.remote = {
                                    url: tDatasets.source
                                };

                                if (tDatasets.filter)
                                {
                                    bloodHoundConfig.remote.filter = tDatasets.filter;
                                }

                                if (tDatasets.replace)
                                {
                                    bloodHoundConfig.remote.replace = tDatasets.replace;
                                }
                            }

                            var engine = new Bloodhound(bloodHoundConfig);
                            engine.initialize();
                            tDatasets.source = engine.ttAdapter();
                        }


                        // compile templates
                        if (tDatasets.templates)
                        {
                            for (var k in tDatasets.templates)
                            {
                                var template = tDatasets.templates[k];
                                if (typeof(template) == "string")
                                {
                                    tDatasets.templates[k] = Handlebars.compile(template);
                                }
                            }
                        }

                        // process typeahead
                        $(self.field).typeahead(tConfig, tDatasets);

                        // listen for "autocompleted" event and set the value of the field
                        $(self.field).on("typeahead:autocompleted", function(event, datum) {
                            self.setValue(datum.value);
                        });

                        // listen for "selected" event and set the value of the field
                        $(self.field).on("typeahead:selected", function(event, datum) {
                            self.setValue(datum.value);
                        });

                        // custom events
                        if (tEvents)
                        {
                            if (tEvents.autocompleted) {
                                $(self.field).on("typeahead:autocompleted", function(event, datum) {
                                    tEvents.autocompleted(event, datum);
                                });
                            }
                            if (tEvents.selected) {
                                $(self.field).on("typeahead:selected", function(event, datum) {
                                    tEvents.selected(event, datum);
                                });
                            }
                        }

                        // when the input value changes, change the query in typeahead
                        // this is to keep the typeahead control sync'd with the actual dom value
                        // only do this if the query doesn't already match
                        var fi = $(self.field);
                        $(self.field).change(function() {

                            var value = $(this).val();

                            var newValue = $(fi).typeahead('val');
                            if (newValue != value)
                            {
                                $(fi).typeahead('val', newValue);
                            }

                        });
                    }

                    if (self.fieldContainer) {
                        self.fieldContainer.addClass('alpaca-controlfield-text');
                    }
                }

                callback();
            });

        },

        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function() {
            var value = null;
            if (this.field) {
                value = this.field.val();
            } else {
                value = this.base();
            }

            return value;
        },
        
        /**
         * @see Alpaca.Field#setValue
         */
        setValue: function(value) {

            if (this.field)
            {
                if (Alpaca.isEmpty(value))
                {
                    this.field.val("");

                    // if using typeahead, set using typeahead control
                    if ( this.field && this.field.typeahead && this.options.typeahead)
                    {
                        $(this.field).typeahead('val', '');
                    }
                }
                else
                {
                    this.field.val(value);

                    // if using typeahead, set using typeahead control
                    if ( this.field && this.field.typeahead && this.options.typeahead)
                    {
                        $(this.field).typeahead('val', value);
                    }
                }
            }

            // be sure to call into base method
            this.base(value);
        },
        
        /**
         * @see Alpaca.ControlField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();
            
            var valInfo = this.validation;
			
			var status =  this._validatePattern();
            valInfo["invalidPattern"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("invalidPattern"), [this.schema.pattern]),
                "status": status
            };
 
            status = this._validateMaxLength();
			valInfo["stringTooLong"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("stringTooLong"), [this.schema.maxLength]),
                "status": status
            };

            status = this._validateMinLength();
			valInfo["stringTooShort"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("stringTooShort"), [this.schema.minLength]),
                "status": status
            };

            return baseStatus && valInfo["invalidPattern"]["status"] && valInfo["stringTooLong"]["status"] && valInfo["stringTooShort"]["status"];
        },
        
        /**
         * Validates against the schema pattern property.
         *
         * @returns {Boolean} True if it matches the pattern, false otherwise.
         */
        _validatePattern: function() {
            if (this.schema.pattern) {
                var val = this.getValue();
                if (val === "" && this.options.allowOptionalEmpty && !this.schema.required) {
                    return true;
                }
                if (Alpaca.isEmpty(val)) {
                    val = "";
                }
                if (!val.match(this.schema.pattern)) {
                    return false;
                }
            }
            
            return true;
        },
        
        /**
         * Validates against the schema minLength property.
         *
         * @returns {Boolean} True if its size is greater than minLength, false otherwise.
         */
        _validateMinLength: function() {
			if (!Alpaca.isEmpty(this.schema.minLength)) {
				var val = this.getValue();
                if (val === "" && this.options.allowOptionalEmpty && !this.schema.required) {
                    return true;
                }
                if (Alpaca.isEmpty(val)) {
                    val = "";
                }
                if (val.length < this.schema.minLength) {
                    return false;
                }
			}
			return true;
		},
        
        /**
         * Validates against the schema maxLength property.
         *
         * @returns {Boolean} True if its size is less than maxLength , false otherwise.
         */
        _validateMaxLength: function() {
			if (!Alpaca.isEmpty(this.schema.maxLength)) {
				var val = this.getValue();
                if (val === "" && this.options.allowOptionalEmpty && !this.schema.required) {
                    return true;
                }
                if (Alpaca.isEmpty(val)) {
                    val = "";
                }
                if (val.length > this.schema.maxLength) {
                    return false;
                }
			}
            return true;
        },
        
        /**
         * @see Alpaca.Field#disable
         */
        disable: function() {
            if (this.field)
            {
                this.field.disabled = true;
            }
        },
        
        /**
         * @see Alpaca.Field#enable
         */
        enable: function() {
            if (this.field)
            {
                this.field.disabled = false;
            }
        },
        
        /**
         * @see Alpaca.Field#focus
         */
        focus: function() {
            if (this.field)
            {
                this.field.focus();
            }
        },//__BUILDER_HELPERS
        
        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {                
                    "minLength": {
                        "title": "Minimal Length",
                        "description": "Minimal length of the property value.",
                        "type": "number"
                    },
                    "maxLength": {
                        "title": "Maximum Length",
                        "description": "Maximum length of the property value.",
                        "type": "number"
                    },
                    "pattern": {
                        "title": "Pattern",
                        "description": "Regular expression for the property value.",
                        "type": "string"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "default": {
                        "helper": "Field default value",
                        "type": "text"
                    },
                    "minLength": {
                        "type": "integer"
                    },
                    "maxLength": {
                        "type": "integer"
                    },
                    "pattern": {
                        "type": "text"
                    }
                }
            });
        },
		
        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {                
                    "size": {
                        "title": "Field Size",
                        "description": "Field size.",
                        "type": "number",
						"default":20
                    },
                    "maskString": {
                        "title": "Mask Expression",
                        "description": "Expression for the field mask. Field masking will be enabled if not empty.",
                        "type": "string"
                    },
                    "placeholder": {
                        "title": "Field Placeholder",
                        "description": "Field placeholder.",
                        "type": "string"
                    },
                    "typeahead": {
                        "title": "Type Ahead",
                        "description": "Provides configuration for the $.typeahead plugin if it is available.  For full configuration options, see: https://github.com/twitter/typeahead.js"
                    },
                    "allowOptionalEmpty": {
                        "title": "Allow Optional Empty",
                        "description": "Allows this non-required field to validate when the value is empty"
                    }
                }
            });
        },    
		
        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {                
                    "size": {
                        "type": "integer"
                    },
                    "maskString": {
                        "helper": "a - an alpha character;9 - a numeric character;* - an alphanumeric character",
                        "type": "text"
                    },
                    "typeahead": {
                        "type": "object"
                    },
                    "allowOptionalEmpty": {
                        "type": "checkbox"
                    }
                }
            });
        },    

        /**
         * @see Alpaca.Field#getTitle
         */
        getTitle: function() {
            return "Single-Line Text";
        },
        
        /**
         * @see Alpaca.Field#getDescription
         */
        getDescription: function() {
            return "Text field for single-line text.";
        },
        
        /**
         * @see Alpaca.Field#getType
         */
        getType: function() {
            return "string";
        },
		
        /**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "text";
        }//__END_OF_BUILDER_HELPERS
        
    });

    Alpaca.registerTemplate("controlFieldText", '<input type="text" id="${id}" {{if options.placeholder}}placeholder="${options.placeholder}"{{/if}} {{if options.size}}size="${options.size}"{{/if}} {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerMessages({
        "invalidPattern": "This field should have pattern {0}",
        "stringTooShort": "This field should contain at least {0} numbers or characters",
        "stringTooLong": "This field should contain at most {0} numbers or characters"
    });
    Alpaca.registerFieldClass("text", Alpaca.Fields.TextField);
    Alpaca.registerDefaultSchemaFieldMapping("string", "text");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.TextAreaField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.TextAreaField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Textarea control for chunk of text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();

            if (!this.options.rows) {
                this.options.rows = 5;
            }

            if (!this.options.cols) {
                this.options.cols = 40;
            }

            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldTextarea");
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-textarea');
                }

                callback();
            });
        },

        /**
         * @see Alpaca.ControlField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status =  this._validateWordCount();
            valInfo["wordLimitExceeded"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("wordLimitExceeded"), [this.options.wordlimit]),
                "status": status
            };

            return baseStatus && valInfo["wordLimitExceeded"]["status"];
        },

        /**
         * Validate for word limit.
         *
         * @returns {Boolean} True if the number of words is equal to or less than the word limit.
         */
        _validateWordCount: function() {

            if (this.options.wordlimit && this.options.wordlimit > -1)
            {
                var val = this.data;

                if (val)
                {
                    var wordcount = val.split(" ").length;
                    if (wordcount > this.options.wordlimit)
                    {
                        return false;
                    }
                }
            }

            return true;
        },


        /**
         *@see Alpaca.Fields.TextField#setValue
         */
        setValue: function(value) {
            $(this.field).val(value);

            // be sure to call into base method
            this.base(value);
        },

        /**
         * @see Alpaca.Fields.TextField#getValue
         */
        getValue: function() {
            return $(this.field).val();
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "rows": {
                        "title": "Rows",
                        "description": "Number of rows",
                        "type": "number",
                        "default": 5
                    },
                    "cols": {
                        "title": "Columns",
                        "description": "Number of columns",
                        "type": "number",
                        "default": 40
                    },
                    "wordlimit": {
                        "title": "Word Limit",
                        "description": "Limits the number of words allowed in the text area.",
                        "type": "number",
                        "default": -1
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "rows": {
                        "type": "integer"
                    },
                    "cols": {
                        "type": "integer"
                    },
                    "wordlimit": {
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Multi-Line Text";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Textarea field for multiple line text.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "textarea";
        }//__END_OF_BUILDER_HELPERS

    });

    Alpaca.registerMessages({
        "wordLimitExceeded": "The maximum word limit of {0} has been exceeded."
    });

    Alpaca.registerTemplate("controlFieldTextarea", '<textarea id="${id}" {{if options.placeholder}}placeholder="${options.placeholder}"{{/if}} {{if options.rows}}rows="${options.rows}"{{/if}} {{if options.cols}}cols="${options.cols}"{{/if}} {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each options.data}}data-${fieldId}="${value}"{{/each}}/>');
    Alpaca.registerFieldClass("textarea", Alpaca.Fields.TextAreaField);

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.CheckBoxField = Alpaca.ControlField.extend(
        /**
         * @lends Alpaca.Fields.CheckBoxField.prototype
         */
        {
            /**
             * @constructs
             * @augments Alpaca.ControlField
             *
             * @class Checkbox control for JSON schema boolean type.
             *
             * @param {Object} container Field container.
             * @param {Any} data Field data.
             * @param {Object} options Field options.
             * @param {Object} schema Field schema.
             * @param {Object|String} view Field view.
             * @param {Alpaca.Connector} connector Field connector.
             * @param {Function} errorCallback Error callback.
             */
            constructor: function(container, data, options, schema, view, connector, errorCallback) {
                this.base(container, data, options, schema, view, connector, errorCallback);
            },

            /**
             * @see Alpaca.Field#setup
             */
            setup: function() {

                var _this = this;

                _this.base();

                if (!this.options.rightLabel) {
                    this.options.rightLabel = "";
                }

                if (typeof(_this.options.multiple) == "undefined")
                {
                    if (_this.schema.type == "array")
                    {
                        _this.options.multiple = true;
                    }
                    else if (typeof(_this.schema["enum"]) != "undefined")
                    {
                        _this.options.multiple = true;
                    }
                }

                _this.checkboxOptions = [];
                if (_this.options.multiple)
                {
                    $.each(_this.getEnum(), function(index, value) {

                        var text = value;

                        if (_this.options.optionLabels)
                        {
                            if (!Alpaca.isEmpty(_this.options.optionLabels[index]))
                            {
                                text = _this.options.optionLabels[index];
                            }
                            else if (!Alpaca.isEmpty(_this.options.optionLabels[value]))
                            {
                                text = _this.options.optionLabels[value];
                            }
                        }

                        _this.checkboxOptions.push({
                            "value": value,
                            "text": text
                        });
                    });
                }
            },

            /**
             * Gets schema enum property.
             *
             * @returns {Array|String} Field schema enum property.
             */
            getEnum: function()
            {
                var array = [];

                if (this.schema && this.schema["enum"])
                {
                    array = this.schema["enum"];
                }

                return array;
            },

            /**
             * Handler for the event that the checkbox is clicked.
             *
             * @param e Event.
             */
            onClick: function(e) {
                this.refreshValidationState();
            },

            /**
             * @see Alpaca.ControlField#renderField
             */
            renderField: function(onSuccess) {

                var _this = this;

                var controlFieldTemplateDescriptor = null;

                // either use the single template or the multiple template
                if (this.options.multiple) {
                    controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldCheckboxMultiple");
                } else {
                    controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldCheckbox");
                }

                if (controlFieldTemplateDescriptor)
                {
                    this.field = _this.view.tmpl(controlFieldTemplateDescriptor, {
                        "id": this.getId(),
                        "name": this.name,
                        "options": this.options,
                        "checkboxOptions": _this.checkboxOptions
                    });
                    this.injectField(this.field);
                    //this.field = $('input[id="' + this.getId() + '"]', this.field);

                    // do this little trick so that if we have a default value, it gets set during first render
                    // this causes the checked state of the control to update
                    if (this.data && typeof(this.data) != "undefined")
                    {
                        this.setValue(this.data);
                    }
                }

                if (onSuccess) {
                    onSuccess();
                }
            },

            /**
             * @see Alpaca.ControlField#postRender
             */
            postRender: function(callback) {

                var self = this;

                this.base(function() {

                    if (self.fieldContainer) {
                        self.fieldContainer.addClass('alpaca-controlfield-checkbox');
                    }

                    // whenever the state of one of our input:checkbox controls is changed (either via a click or programmatically),
                    // we signal to the top-level field to fire up a change
                    //
                    // this allows the dependency system to recalculate and such
                    //
                    $(self.field).find("input:checkbox").change(function(evt) {
                        $(self.field).trigger("change");
                    });

                    callback();
                });
            },

            /**
             * @see Alpaca.Field#getValue
             */
            getValue: function() {

                var self = this;

                var value = null;

                if (!self.options.multiple)
                {
                    // single scalar value
                    var input = $(self.field).find("input");
                    if (input.length > 0)
                    {
                        value = Alpaca.checked($(input[0]));
                    }
                }
                else
                {
                    // multiple values
                    var values = [];
                    for (var i = 0; i < self.checkboxOptions.length; i++)
                    {
                        var input = $(self.field).find("input[data-checkbox-index='" + i + "']");
                        if (Alpaca.checked(input))
                        {
                            var v = $(input).attr("data-checkbox-value");
                            values.push(v);
                        }
                    }

                    // determine how we're going to hand this value back

                    // if type == "array", we just hand back the array
                    // if type == "string", we build a comma-delimited list
                    if (self.schema.type == "array")
                    {
                        value = values;
                    }
                    else if (self.schema.type == "string")
                    {
                        value = values.join(",");
                    }
                }

                return value;
            },

            /**
             * @see Alpaca.Field#setValue
             */
            setValue: function(value)
            {
                var self = this;

                // value can be a boolean, string ("true"), string ("a,b,c") or an array of values

                var applyScalarValue = function(value)
                {
                    if (Alpaca.isString(value)) {
                        value = (value === "true");
                    }

                    var input = $(self.field).find("input");
                    if (input.length > 0)
                    {
                        Alpaca.checked($(input[0]), value);
                    }
                };

                var applyMultiValue = function(values)
                {
                    // allow for comma-delimited strings
                    if (typeof(values) == "string")
                    {
                        values = values.split(",");
                    }

                    // trim things to remove any excess white space
                    for (var i = 0; i < values.length; i++)
                    {
                        values[i] = Alpaca.trim(values[i]);
                    }

                    // walk through values and assign into appropriate inputs
                    for (var i = 0; i < values.length; i++)
                    {
                        var input = $(self.field).find("input[data-checkbox-value='" + values[i] + "']");
                        if (input.length > 0)
                        {
                            Alpaca.checked($(input[0]), value);
                        }
                    }
                };

                var applied = false;

                if (!self.options.multiple)
                {
                    // single value mode

                    // boolean
                    if (typeof(value) == "boolean")
                    {
                        applyScalarValue(value);
                        applied = true;
                    }
                    else if (typeof(value) == "string")
                    {
                        applyScalarValue(value);
                        applied = true;
                    }
                }
                else
                {
                    // multiple value mode

                    if (typeof(value) == "string")
                    {
                        applyMultiValue(value);
                        applied = true;
                    }
                    else if (Alpaca.isArray(value))
                    {
                        applyMultiValue(value);
                        applied = true;
                    }
                }

                if (!applied)
                {
                    Alpaca.logError("CheckboxField cannot set value for schema.type=" + self.schema.type + " and value=" + value);
                }

                // be sure to call into base method
                this.base(value);
            },

            /**
             * Validate against enum property in the case that the checkbox field is in multiple mode.
             *
             * @returns {Boolean} True if the element value is part of the enum list, false otherwise.
             */
            _validateEnum: function()
            {
                var self = this;

                if (!self.options.multiple)
                {
                    return true;
                }

                var val = self.getValue();
                if (!self.schema.required && Alpaca.isValEmpty(val))
                {
                    return true;
                }

                // if val is a string, convert to array
                if (typeof(val) == "string")
                {
                    val = val.split(",");
                }

                return Alpaca.anyEquality(val, self.schema["enum"]);
            },

            /**
             * @see Alpaca.Field#disable
             */
            disable: function() {

                $(this.field).find("input").each(function() {
                    $(this).disabled = true;
                });

            },

            /**
             * @see Alpaca.Field#enable
             */
            enable: function() {

                $(this.field).find("input").each(function() {
                    $(this).disabled = false;
                });

            },//__BUILDER_HELPERS

            /**
             * @private
             * @see Alpaca.ControlField#getSchemaOfOptions
             */
            getSchemaOfOptions: function() {
                return Alpaca.merge(this.base(), {
                    "properties": {
                        "rightLabel": {
                            "title": "Option Label",
                            "description": "Optional right-hand side label for single checkbox field.",
                            "type": "string"
                        },
                        "multiple": {
                            "title": "Multiple",
                            "description": "Whether to render multiple checkboxes for multi-valued type (such as an array or a comma-delimited string)",
                            "type": "boolean"
                        }
                    }
                });
            },

            /**
             * @private
             * @see Alpaca.ControlField#getOptionsForOptions
             */
            getOptionsForOptions: function() {
                return Alpaca.merge(this.base(), {
                    "fields": {
                        "rightLabel": {
                            "type": "text"
                        },
                        "multiple": {
                            "type": "checkbox"
                        }
                    }
                });
            },

            /**
             * @see Alpaca.Field#getTitle
             */
            getTitle: function() {
                return "Checkbox Field";
            },

            /**
             * @see Alpaca.Field#getDescription
             */
            getDescription: function() {
                return "Checkbox Field for boolean (true/false), string ('true', 'false' or comma-delimited string of values) or data array.";
            },

            /**
             * @see Alpaca.Field#getType
             */
            getType: function() {
                return "boolean";
            },

            /**
             * @see Alpaca.Field#getFieldType
             */
            getFieldType: function() {
                return "checkbox";
            }//__END_OF_BUILDER_HELPERS

        });

    Alpaca.registerTemplate("controlFieldCheckbox", '<span id="${id}">{{if options.rightLabel}}<label class="alpaca-controlfield-label" for="${id}_checkbox">{{/if}}<input id="${id}_checkbox" type="checkbox" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>{{if options.rightLabel}}${options.rightLabel}</label>{{/if}}</span>');
    Alpaca.registerTemplate("controlFieldCheckboxMultiple", '<span id="${id}">{{each(i,o) checkboxOptions}}<span><label class="alpaca-controlfield-label" for="${id}_checkbox_${i}"><input type="checkbox" id="${id}_checkbox_${i}" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} data-checkbox-value="${o.value}" data-checkbox-index="${i}" />${text}</label></span>{{/each}}</span>');

    Alpaca.registerFieldClass("checkbox", Alpaca.Fields.CheckBoxField);
    Alpaca.registerDefaultSchemaFieldMapping("boolean", "checkbox");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.FileField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.FileField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class File control with nice custom styles.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();            
            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldFile");
        },
                
        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(value) {
            // be sure to call into base method
            // We won't be able to actually set the value for file input field so we use the mask input
            var tmp = this.field;
            this.field = $('.alpaca-filefield-control',this.fieldContainer);
            this.base(value);

            // switch it back to actual file input
            this.field = tmp;
        },

        onChange: function(e)
        {
            this.base(e);

            if (this.options.selectionHandler)
            {
                this.processSelectionHandler(e.target.files);
            }
        },

        processSelectionHandler: function(files)
        {
            if (files && files.length > 0)
            {
                // if the browser supports HTML5 FileReader, we can pull in the stream for preview
                if (typeof(FileReader) !== "undefined")
                {
                    // clear out previous loaded data
                    var loadedData = [];
                    var loadCount = 0;

                    var fileReader = new FileReader();
                    fileReader.onload = (function() {
                        var field = this;
                        return function(event)
                        {
                            var dataUri = event.target.result;

                            loadedData.push(dataUri);
                            loadCount++;

                            if (loadCount === files.length)
                            {
                                field.options.selectionHandler.call(field, files, loadedData);
                            }
                        }
                    }).call(this);

                    for (var i = 0; i < files.length; i++)
                    {
                        fileReader.readAsDataURL(files[i]);
                    }
                }
            }
        },

        
        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                // apply additional css
                if (self.fieldContainer) {
                    self.fieldContainer.addClass("alpaca-controlfield-file");
                }

                callback();
            });

            // listen for change events on the field
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "selectionHandler": {
                        "title": "Selection Handler",
                        "description": "Function that should be called when files are selected.  Requires HTML5.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "selectionHandler": {
                        "type": "checkbox"
                    }
                }
            });
        },

		/**
         * @see Alpaca.Fields.TextField#getTitle
		 */
		getTitle: function() {
			return "File Field";
		},
		
		/**
         * @see Alpaca.Fields.TextField#getDescription
		 */
		getDescription: function() {
			return "Field for uploading files.";
		},

		/**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "file";
        }//__END_OF_BUILDER_HELPERS
    });
    
    Alpaca.registerTemplate("controlFieldFile", '<input type="file" id="${id}" {{if options.size}}size="${options.size}"{{/if}} {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerFieldClass("file", Alpaca.Fields.FileField);
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.ListField = Alpaca.ControlField.extend(
    /**
     * @lends Alpaca.Fields.ListField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ControlField
         *
         * @class Abstract class for list-type controls.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Field#setup
         */
        setup: function() {
            var _this = this;
            _this.base();
            _this.selectOptions = [];
            if (_this.getEnum()) {
                $.each(_this.getEnum(), function(index, value) {
                    var text = value;
                    if (_this.options.optionLabels) {
                        if (!Alpaca.isEmpty(_this.options.optionLabels[index])) {
                            text = _this.options.optionLabels[index];
                        } else if (!Alpaca.isEmpty(_this.options.optionLabels[value])) {
                            text = _this.options.optionLabels[value];
                        }
                    }
                    _this.selectOptions.push({
                        "value": value,
                        "text": text
                    });
                });
            }
        },

        /**
         * Gets schema enum property.
         *
         * @returns {Array|String} Field schema enum property.
         */
        getEnum: function() {
            if (this.schema && this.schema["enum"]) {
                return this.schema["enum"];
            }
        },

        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function(val) {
            var _this = this;
            if (Alpaca.isArray(val)) {
                $.each(val, function(index, itemVal) {
                    $.each(_this.selectOptions, function(index2, selectOption) {
                        if (selectOption.value == itemVal) {
                            val[index] = selectOption.value;
                        }
                    });
                });
            } else {
                $.each(this.selectOptions, function(index, selectOption) {
                    if (selectOption.value == val) {
                        val = selectOption.value;
                    }
                });
            }
            return val;
        },

        /**
         * @see Alpaca.ControlField#renderField
         */
        renderField: function(onSuccess) {
            var _this = this;
            if (this.options.dataSource) {
                if (Alpaca.isFunction(this.options.dataSource)) {
                    this.options.dataSource(this, function(values) {

                        if (Alpaca.isArray(values))
                        {
                            for (var i = 0; i < values.length; i++)
                            {
                                if (typeof(values[i]) == "string")
                                {
                                    _this.selectOptions.push({
                                        "text": values[i],
                                        "value": values[i]
                                    });
                                }
                                else if (Alpaca.isObject(values[i]))
                                {
                                    _this.selectOptions.push(values[i]);
                                }
                            }
                        }
                        else if (Alpaca.isObject(values))
                        {
                            for (var k in values)
                            {
                                _this.selectOptions.push({
                                    "text": k,
                                    "value": values[k]
                                });
                            }
                        }

                        _this._renderField(onSuccess);
                    });
                } else {
                    if (Alpaca.isUri(this.options.dataSource)) {
                        $.ajax({
                            url: this.options.dataSource,
                            type: "get",
                            dataType: "json",
                            success: function(jsonDocument) {
                                var ds = jsonDocument;
                                if (_this.options.dsTransformer && Alpaca.isFunction(_this.options.dsTransformer)) {
                                    ds = _this.options.dsTransformer(ds);
                                }
                                if (ds)
                                {
                                    if (Alpaca.isObject(ds))
                                    {
                                        // for objects, we walk through one key at a time
                                        // the insertion order is the order of the keys from the map
                                        // to preserve order, consider using an array as below
                                        $.each(ds, function(key, value) {
                                            _this.selectOptions.push({
                                                "value": key,
                                                "text": value
                                            });
                                        });
                                    }
                                    else if (Alpaca.isArray(ds))
                                    {
                                        // for arrays, we walk through one index at a time
                                        // the insertion order is dictated by the order of the indices into the array
                                        // this preserves order
                                        $.each(ds, function(index, value) {
                                            _this.selectOptions.push({
                                                "value": value.value,
                                                "text": value.text
                                            });
                                        });
                                    }
                                }

                                _this._renderField(onSuccess);
                            },
                            "error": function(jqXHR, textStatus, errorThrown) {
                                _this.errorCallback({
                                    "message":"Unable to load data from uri : " + _this.options.dataSource,
                                    "stage": "DATASOURCE_LOADING_ERROR",
                                    "details": {
                                        "jqXHR" : jqXHR,
                                        "textStatus" : textStatus,
                                        "errorThrown" : errorThrown
                                    }
                                });
                            }
                        });
                    } else {
                        var ds = this.options.dataSource;
                        if (_this.options.dsTransformer && Alpaca.isFunction(_this.options.dsTransformer)) {
                            ds = _this.options.dsTransformer(ds);
                        }
                        if (ds) {
                            if (Alpaca.isArray(ds)) {
                                $.each(ds, function(index, value) {
                                    _this.selectOptions.push({
                                        "value": value,
                                        "text": value
                                    });
                                });
                            }
                            if (Alpaca.isObject(ds)) {
                                for (var index in ds) {
                                    _this.selectOptions.push({
                                        "value": index,
                                        "text": ds[index]
                                    });
                                }
                            }
                            _this._renderField(onSuccess);
                        }
                    }
                }
            } else {
                this._renderField(onSuccess);
            }
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "enum": {
                        "title": "Enumeration",
                        "description": "List of field value options",
                        "type": "array",
                        "required": true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "optionLabels": {
                        "title": "Option Labels",
                        "description": "Labels for options. It can either be a map object or an array field that maps labels to items defined by enum schema property one by one.",
                        "type": "array"
                    },
                    "dataSource": {
                        "title": "Option Datasource",
                        "description": "Datasource for generating list of options.  This can be a string or a function.  If a string, it is considered to be a URI to a service that produces a object containing key/value pairs or an array of elements of structure {'text': '', 'value': ''}.  This can also be a function that is called to produce the same list.",
                        "type": "string"
                    },
                    "removeDefaultNone": {
                        "title": "Remove Default None",
                        "description": "If true, the default 'None' option will not be shown.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "optionLabels": {
                        "itemLabel":"Label",
                        "type": "array"
                    },
                    "dataSource": {
                        "type": "text"
                    },
                    "removeDefaultNone": {
                        "type": "checkbox",
                        "rightLabel": "Remove Default None"
                    }
                }
            });
        }//__END_OF_BUILDER_HELPERS
    });
})(jQuery);
(function($){

    var Alpaca = $.alpaca;

    Alpaca.Fields.RadioField = Alpaca.Fields.ListField.extend(
    /**
     * @lends Alpaca.Fields.RadioField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.ListField
         *
         * @class Radio group control for list type.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.ListField#setup
         */
        setup: function(){
            this.base();
            
            if (this.options.name) {
				this.name = this.options.name;
			}
			else if (!this.name) {
				this.name = this.getId()+"-name";
			}

            // empty select first to false by default
            if (Alpaca.isUndefined(this.options.emptySelectFirst))
            {
                this.options.emptySelectFirst = false;
            }
        },

        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function(){
            var val = this.base($('input:radio[name='+this.name+']:checked',this.field).val());
            $.each(this.selectOptions,function() {
                if (String(this['value']) ==  val) {
                    val = this['value'];
                }
            });
            return val;
        },
        
        /**
         * @see Alpaca.Field#setValue
         */
        setValue: function(val){
            if (val != this.getValue()) {
                $.each($('input:radio[name='+this.name+']',this.field),function() {
                    if ($(this).val() == val) {
                        $(this).attr('checked','checked');
                    } else {
                        $(this).removeAttr('checked');
                    }
                });

                if (this.options.emptySelectFirst) {
                    if ($("input:radio:checked",this.field).length === 0) {
                        $("input:radio:first",this.field).attr("checked","checked");
                    }
                }

                this.base(val);
            }
        },
        
        /**
         * @private
         */
        _renderField: function(onSuccess){

            var _this = this;

            var controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldRadio");
            if (controlFieldTemplateDescriptor) {
                this.field = _this.view.tmpl(controlFieldTemplateDescriptor, {
                    "id": this.getId(),
                    "options": this.options,
                    "selectOptions": this.selectOptions,
                    "required":this.schema.required,
					"name": this.name,
                    "data": this.data,
                    "removeDefaultNone": this.options.removeDefaultNone
                });

                // if emptySelectFirst and nothing currently checked, then pick first item in the value list
                // set data and visually select it
                if (this.options.emptySelectFirst && this.selectOptions && this.selectOptions.length > 0) {

                    this.data = this.selectOptions[0].value;

                    if ($("input:radio:checked",this.field).length === 0) {
                        $("input:radio:first",this.field).attr("checked","checked");
                    }
                }

                // stack radio selectors vertically
                if (this.options.vertical)
                {
                    $(".alpaca-controlfield-radio-item", this.field).css("display", "block");
                }

                this.injectField(this.field);
            }
            
            if (onSuccess) {
                onSuccess();
            }
        },
        
        /**
         * @see Alpaca.ControlField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-radio');
                }

                callback();
            });
        },
        
        /**
         * @see Alpaca.ControlField#onClick
         */
        onClick: function(e){
            this.base(e);
            
            var _this = this;
            
            Alpaca.later(25, this, function(){
                var v = _this.getValue();
                _this.setValue(v);
                _this.refreshValidationState();
            });
        },//__BUILDER_HELPERS
		
        /**
         * @private
         * @see Alpaca.Fields.ListField#getSchemaOfOptions
         */
		getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(),{
				"properties": {
					"name": {
						"title": "Field name",
						"description": "Field name.",
						"type": "string"
					},
                    "emptySelectFirst": {
                        "title": "Empty Select First",
                        "description": "If the data is empty, then automatically select the first item in the list.",
                        "type": "boolean",
                        "default": false
                    },
                    "vertical": {
                        "title": "Position the radio selector items vertically",
                        "description": "When true, the radio selector items will be stacked vertically and not horizontally",
                        "type": "boolean",
                        "default": false
                    }
				}
			});
        },

		/**
         * @see Alpaca.Field#getTitle
		 */
		getTitle: function() {
			return "Radio Group Field";
		},
		
		/**
         * @see Alpaca.Field#getDescription
		 */
		getDescription: function() {
			return "Radio Group Field with list of options.";
		},

		/**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "radio";
        }//__END_OF_BUILDER_HELPERS
        
    });
    
    Alpaca.registerTemplate("controlFieldRadio", '<div id="${id}" class="alpaca-controlfield-radio">{{if !required && !removeDefaultNone}}<span class="alpaca-controlfield-radio-item"><input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${name}" id="${id}_radio_nonevalue" value=""/><label class="alpaca-controlfield-radio-label" for="${id}_radio_nonevalue">None</label></span>{{/if}}{{each selectOptions}}<span class="alpaca-controlfield-radio-item"><input type="radio" {{if options.readonly}}readonly="readonly"{{/if}} name="${name}" value="${value}" id="${id}_radio_${$index}" {{if value == data}}checked="checked"{{/if}}/><label class="alpaca-controlfield-radio-label" for="${id}_radio_${$index}">${text}</label></span>{{/each}}</div>');

    Alpaca.registerFieldClass("radio", Alpaca.Fields.RadioField);
    
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.SelectField = Alpaca.Fields.ListField.extend(
    /**
     * @lends Alpaca.Fields.SelectField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.ListField
         *
         * @class Dropdown list control for list type.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.ListField#setup
         */
        setup: function(){
            this.base();

            // empty select first to false by default
            if (Alpaca.isUndefined(this.options.emptySelectFirst))
            {
                this.options.emptySelectFirst = false;
            }
        },

        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function()
        {
            if (this.field) {
                var val = this.field.val();
                if (!val)
                {
                    val = this.data;
                }

                return this.base(val);
            }
        },

        /**
         * @see Alpaca.Field#setValue
         */
        setValue: function(val) {
            if (Alpaca.isArray(val)) {
                if (!Alpaca.compareArrayContent(val, this.getValue())) {
                    if (!Alpaca.isEmpty(val) && this.field) {
                        this.field.val(val);
                    }
                    this.base(val);
                }
            } else {
                if (val != this.getValue()) {
                    if (!Alpaca.isEmpty(val) && this.field) {
                        this.field.val(val);
                    }
                    this.base(val);
                }
            }
        },

        /**
         * @see Alpaca.ListField#getEnum
         */
        getEnum: function() {
            if (this.schema) {
                if (this.schema["enum"]) {
                    return this.schema["enum"];
                } else if (this.schema["type"] && this.schema["type"] == "array" && this.schema["items"] && this.schema["items"]["enum"]) {
                    return this.schema["items"]["enum"];
                }
            }
        },

        /**
         * @private
         */
        _renderField: function(onSuccess) {

            var _this = this;

            if (this.schema["type"] && this.schema["type"] == "array") {
                this.options.multiple = true;
            }

            var controlFieldTemplateDescriptor;
            if (this.options.multiple && Alpaca.isArray(this.data)) {
                controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldSelectMultiple");
            } else {
                controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldSelect");
            }

            if (controlFieldTemplateDescriptor) {
                this.field = _this.view.tmpl(controlFieldTemplateDescriptor, {
                    "id": this.getId(),
                    "options": this.options,
                    "required": this.schema.required,
                    "selectOptions": this.selectOptions,
                    "name": this.name,
                    "data": this.data,
                    "removeDefaultNone": this.options.removeDefaultNone
                });

                // if emptySelectFirst and nothing currently checked, then pick first item in the value list
                // set data and visually select it
                if (Alpaca.isUndefined(this.data) && this.options.emptySelectFirst && this.selectOptions && this.selectOptions.length > 0) {

                    this.data = this.selectOptions[0].value;

                    //$("select",this.field).val("0");
                }

                this.injectField(this.field);

                // do this little trick so that if we have a default value, it gets set during first render
                // this causes the state of the control
                if (this.data) {
                    this.setValue(this.data);
                }
            }

            if (onSuccess) {
                onSuccess();
            }
        },

        /**
         * @see Alpaca.ControlField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-select');
                }

                callback();
            })
        },

        /**
         * Validate against enum property.
         *
         * @returns {Boolean} True if the element value is part of the enum list, false otherwise.
         */
        _validateEnum: function() {
            if (this.schema["enum"]) {
                var val = this.data;
                if (!this.schema.required && Alpaca.isValEmpty(val)) {
                    return true;
                }
                if (this.options.multiple) {
                    var isValid = true;
                    var _this = this;
                    if (!val) {
                        val = [];
                    }
                    $.each(val, function(i,v) {
                        if ($.inArray(v, _this.schema["enum"]) <= -1) {
                            isValid = false;
                            return false;
                        }
                    });
                    return isValid;
                } else {
                    return ($.inArray(val, this.schema["enum"]) > -1);
                }
            } else {
                return true;
            }
        },

        /**
         * @see Alpaca.Field#onChange
         */
        onChange: function(e) {
            this.base(e);

            var _this = this;

            Alpaca.later(25, this, function() {
                var v = _this.getValue();
                _this.setValue(v);
                _this.refreshValidationState();
            });
        },

        /**
         * Validates if number of items has been less than minItems.
         * @returns {Boolean} true if number of items has been less than minItems
         */
        _validateMinItems: function() {
            if (this.schema.items && this.schema.items.minItems) {
                if ($(":selected",this.field).length < this.schema.items.minItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Validates if number of items has been over maxItems.
         * @returns {Boolean} true if number of items has been over maxItems
         */
        _validateMaxItems: function() {
            if (this.schema.items && this.schema.items.maxItems) {
                if ($(":selected",this.field).length > this.schema.items.maxItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * @see Alpaca.ContainerField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateMaxItems();
            valInfo["tooManyItems"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("tooManyItems"), [this.schema.items.maxItems]),
                "status": status
            };

            status = this._validateMinItems();
            valInfo["notEnoughItems"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("notEnoughItems"), [this.schema.items.minItems]),
                "status": status
            };

            return baseStatus && valInfo["tooManyItems"]["status"] && valInfo["notEnoughItems"]["status"];
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.ListField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "multiple": {
                        "title": "Mulitple Selection",
                        "description": "Allow multiple selection if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "size": {
                        "title": "Displayed Options",
                        "description": "Number of options to be shown.",
                        "type": "number"
                    },
                    "emptySelectFirst": {
                        "title": "Empty Select First",
                        "description": "If the data is empty, then automatically select the first item in the list.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.ListField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "multiple": {
                        "rightLabel": "Allow multiple selection ?",
                        "helper": "Allow multiple selection if checked",
                        "type": "checkbox"
                    },
                    "size": {
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Field#getTitle
         */
        getTitle: function() {
            return "Dropdown Select";
        },

        /**
         * @see Alpaca.Field#getDescription
         */
        getDescription: function() {
            return "Dropdown select field.";
        },

        /**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "select";
        }//__END_OF_BUILDER_HELPERS

    });

    Alpaca.registerTemplate("controlFieldSelect", '<select id="${id}" {{if options.readonly}}readonly="readonly"{{/if}} {{if options.multiple}}multiple{{/if}} {{if options.size}}size="${options.size}"{{/if}} {{if name}}name="${name}"{{/if}}>{{if !required && !removeDefaultNone}}<option value="">None</option>{{/if}}{{each(i,value) selectOptions}}<option value="${value}" {{if value == data}}selected="selected"{{/if}}>${text}</option>{{/each}}</select>');
    Alpaca.registerTemplate("controlFieldSelectMultiple", '<select id="${id}" {{if options.readonly}}readonly="readonly"{{/if}} {{if options.multiple}}multiple="multiple"{{/if}} {{if options.size}}size="${options.size}"{{/if}} {{if name}}name="${name}"{{/if}}>{{if !required && !removeDefaultNone}}<option value="">None</option>{{/if}}{{each(i,value) selectOptions}}<option value="${value}" {{each(j,val) data}}{{if value == val}}selected="selected"{{/if}}{{/each}}>${text}</option>{{/each}}</select>');
    Alpaca.registerFieldClass("select", Alpaca.Fields.SelectField);

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.NumberField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.NumberField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for JSON schema number type.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#getValue
         */
        getValue: function() {
            var textValue = this.field.val();
            if (Alpaca.isValEmpty(textValue)) {
                return -1;
            } else {
                return parseFloat(textValue);
            }
        },
        
        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-number');
                }

                callback();
            });
        },
				
        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();
            
            var valInfo = this.validation;
			
			var status = this._validateNumber();
            valInfo["stringNotANumber"] = {
                "message": status ? "" : this.view.getMessage("stringNotANumber"),
                "status": status
            };

            status = this._validateDivisibleBy();
			valInfo["stringDivisibleBy"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("stringDivisibleBy"), [this.schema.divisibleBy]),
                "status": status
            };

            status = this._validateMaximum();
			valInfo["stringValueTooLarge"] = {
                "message": "",
                "status": status
            };
            if (!status) {
                if (this.schema.exclusiveMaximum) {
                    valInfo["stringValueTooLarge"]["message"] = Alpaca.substituteTokens(this.view.getMessage("stringValueTooLargeExclusive"), [this.schema.maximum]);
                } else {
                    valInfo["stringValueTooLarge"]["message"] = Alpaca.substituteTokens(this.view.getMessage("stringValueTooLarge"), [this.schema.maximum]);
                }
            }
			
			status = this._validateMinimum();
            valInfo["stringValueTooSmall"] = {
                "message": "",
                "status": status
            };
            if (!status) {
                if (this.schema.exclusiveMinimum) {
                    valInfo["stringValueTooSmall"]["message"] = Alpaca.substituteTokens(this.view.getMessage("stringValueTooSmallExclusive"), [this.schema.minimum]);
                } else {
                    valInfo["stringValueTooSmall"]["message"] = Alpaca.substituteTokens(this.view.getMessage("stringValueTooSmall"), [this.schema.minimum]);
                }
            }

            status = this._validateMultipleOf();
            valInfo["stringValueNotMultipleOf"] = {
                "message": "",
                "status": status
            };
            if (!status)
            {
                valInfo["stringValueNotMultipleOf"]["message"] = Alpaca.substituteTokens(this.view.getMessage("stringValueNotMultipleOf"), [this.schema.multipleOf]);
            }

            // hand back a true/false
            return baseStatus && valInfo["stringNotANumber"]["status"] && valInfo["stringDivisibleBy"]["status"] && valInfo["stringValueTooLarge"]["status"] && valInfo["stringValueTooSmall"]["status"] && valInfo["stringValueNotMultipleOf"]["status"];
        },
        
        /**
         * Validates if it is a float number.
         * @returns {Boolean} true if it is a float number
         */
        _validateNumber: function() {
            var textValue = this.field.val();
            // allow null
            if (Alpaca.isValEmpty(textValue)) {
                return true;
            }
            var floatValue = this.getValue();
            
            // quick check to see if what they entered was a number
            if (isNaN(floatValue)) {
                return false;
            }
            
            // check if valid number format
            if (!textValue.match(Alpaca.regexps.number)) {
                return false;
            }
            
            return true;
        },
        
        /**
         * Validates divisibleBy constraint.
         * @returns {Boolean} true if it passes the divisibleBy constraint.
         */
        _validateDivisibleBy: function() {
            var floatValue = this.getValue();
            if (!Alpaca.isEmpty(this.schema.divisibleBy)) {

                // mod
                if (floatValue % this.schema.divisibleBy !== 0)
                {
                    return false;
                }
            }
            return true;
        },
        
        /**
         * Validates maximum constraint.
         * @returns {Boolean} true if it passes the maximum constraint.
         */
        _validateMaximum: function() {
            var floatValue = this.getValue();
            
            if (!Alpaca.isEmpty(this.schema.maximum)) {
                if (floatValue > this.schema.maximum) {
                    return false;
                }
                
                if (!Alpaca.isEmpty(this.schema.exclusiveMaximum)) {
                    if (floatValue == this.schema.maximum && this.schema.exclusiveMaximum) {
                        return false;
                    }
                }
            }
            
            return true;
        },
        
        /**
         * Validates maximum constraint.
         * @returns {Boolean} true if it passes the minimum constraint.
         */
        _validateMinimum: function() {
            var floatValue = this.getValue();

            if (!Alpaca.isEmpty(this.schema.minimum)) {
                if (floatValue < this.schema.minimum) {
                    return false;
                }
                
                if (!Alpaca.isEmpty(this.schema.exclusiveMinimum)) {
                    if (floatValue == this.schema.minimum && this.schema.exclusiveMinimum) {
                        return false;
                    }
                }
            }
            
            return true;
        },

        /**
         * Validates multipleOf constraint.
         * @returns {Boolean} true if it passes the multipleOf constraint.
         */
        _validateMultipleOf: function() {
            var floatValue = this.getValue();

            if (!Alpaca.isEmpty(this.schema.multipleOf)) {
                if (floatValue && this.schema.multipleOf !== 0)
                {
                    return false;
                }
            }

            return true;
        },

        //__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
				"properties": {
                    "multipleOf": {
                        "title": "Multiple Of",
                        "description": "Property value must be a multiple of the multipleOf schema property such that division by this value yields an interger (mod zero).",
                        "type": "number"
                    },
					"minimum": {
						"title": "Minimum",
						"description": "Minimum value of the property.",
						"type": "number"
					},
					"maximum": {
						"title": "Maximum",
						"description": "Maximum value of the property.",
						"type": "number"
					},
					"exclusiveMinimum": {
						"title": "Exclusive Minimum",
						"description": "Property value can not equal the number defined by the minimum schema property.",
						"type": "boolean",
						"default": false
					},
					"exclusiveMaximum": {
						"title": "Exclusive Maximum",
						"description": "Property value can not equal the number defined by the maximum schema property.",
						"type": "boolean",
						"default": false
					}
				}
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsSchema
         */
        getOptionsForSchema: function() {
			return Alpaca.merge(this.base(), {
				"fields": {
                    "multipleOf": {
                        "title": "Multiple Of",
                        "description": "The value must be a integral multiple of the property",
                        "type": "number"
                    },
					"minimum": {
						"title": "Minimum",
						"description": "Minimum value of the property",
						"type": "number"
					},
					"maximum": {
						"title": "Maximum",
						"description": "Maximum value of the property",
						"type": "number"
					},
					"exclusiveMinimum": {
						"rightLabel": "Exclusive minimum ?",
						"helper": "Field value must be greater than but not equal to this number if checked",
						"type": "checkbox"
					},
					"exclusiveMaximum": {
						"rightLabel": "Exclusive Maximum ?",
						"helper": "Field value must be less than but not equal to this number if checked",
						"type": "checkbox"
					}
				}
			});
		},

		/**
         * @see Alpaca.Fields.TextField#getTitle
		 */
		getTitle: function() {
			return "Number Field";
		},
		
		/**
         * @see Alpaca.Fields.TextField#getDescription
		 */
		getDescription: function() {
			return "Field for float numbers.";
		},

		/**
         * @see Alpaca.Fields.TextField#getType
         */
        getType: function() {
            return "number";
        },

		/**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "number";
        }//__END_OF_BUILDER_HELPERS
    });
    
    // Additional Registrations
    Alpaca.registerMessages({
        "stringValueTooSmall": "The minimum value for this field is {0}",
        "stringValueTooLarge": "The maximum value for this field is {0}",
        "stringValueTooSmallExclusive": "Value of this field must be greater than {0}",
        "stringValueTooLargeExclusive": "Value of this field must be less than {0}",
        "stringDivisibleBy": "The value must be divisible by {0}",
        "stringNotANumber": "This value is not a number.",
        "stringValueNotMultipleOf": "This value is nu"
    });
    Alpaca.registerFieldClass("number", Alpaca.Fields.NumberField);
    Alpaca.registerDefaultSchemaFieldMapping("number", "number");
})(jQuery);
/*jshint -W083 */ // inline functions are used safely
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.ArrayField = Alpaca.ContainerField.extend(
    /**
     * @lends Alpaca.Fields.ArrayField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ContainerField
         *
         * @class Default control for the treatment of a JSON array.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.ContainerField#setup
         */
        setup: function()
        {
            this.base();

            this.options.toolbarStyle = Alpaca.isEmpty(this.view.toolbarStyle) ? "button" : this.view.toolbarStyle;

            // determine whether we are using "ruby on rails" compatibility mode
            this.options.rubyrails = false;
            if (this.parent && this.parent.options && this.parent.options.form && this.parent.options.form.attributes)
            {
                if (!Alpaca.isEmpty(this.parent.options.form.attributes.rubyrails))
                {
	  	            this.options.rubyrails = true;
	            }
            }

            if (!this.options.items)
            {
                this.options.items = {};
            }

            var toolbarSticky = false;

            if (!Alpaca.isEmpty(this.view.toolbarSticky)) {
                toolbarSticky = this.view.toolbarSticky;
            }

            if (!Alpaca.isEmpty(this.options.toolbarSticky)) {
                toolbarSticky = this.options.toolbarSticky;
            }

            if (Alpaca.isEmpty(this.options.items.showMoveUpItemButton)) {
                this.options.items.showMoveUpItemButton = true;
            }

            if (Alpaca.isEmpty(this.options.items.showMoveDownItemButton)) {
                this.options.items.showMoveDownItemButton = true;
            }

            this.options.toolbarSticky = toolbarSticky;

            // Enable forceRevalidation option so that any change in children will trigger parent's revalidation.
            if (this.schema.items && this.schema.uniqueItems) {
                Alpaca.mergeObject(this.options, {
                    "forceRevalidation" : true
                });
            }

            if (Alpaca.isEmpty(this.data))
            {
                return;
            }
            if (!Alpaca.isArray(this.data))
            {
                if (!Alpaca.isString(this.data))
                {
                    return;
                }
                else
                {
                    try {
                        this.data = Alpaca.parseJSON(this.data);
                        if (!Alpaca.isArray(this.data)) {
                            Alpaca.logWarn("ArrayField parsed data but it was not an array: " + JSON.stringify(this.data));
                            return;
                        }
                    } catch (e) {
                        this.data = [this.data];
                    }
                }
            }
        },

        /**
         * Picks apart the array and set onto child fields.
         * @see Alpaca.ContainerField#setup
         */
        setValue: function(data) {

            var _this = this;

            if (!data || !Alpaca.isArray(data))
            {
                return;
            }

            // set fields
            for (var i = 0; i < this.children.length; i++)
            {
                var childField = this.children[i];
                if (data.length > i)
                {
                    childField.setValue(data[i]);
                }
                else
                {
                    this.removeItem(childField.id); //remove child items if there are more children than in data
                }
            }

            // if the number of items in the data is greater than the number of existing child elements
            // then we need to add the new fields

            if (i < data.length)
            {
                _this.resolveItemSchemaOptions(function(schema, options) {

                    // waterfall functions
                    var funcs = [];

                    while (i < data.length)
                    {
                        var f = (function(i, data)
                        {
                            return function(callback)
                            {
                                _this.addItem(i, schema, options, data[i], null, false, function() {

                                    // by the time we get here, we may have constructed a very large child chain of
                                    // sub-dependencies and so we use nextTick() instead of a straight callback so as to
                                    // avoid blowing out the stack size
                                    Alpaca.nextTick(function() {
                                        callback();
                                    });

                                });
                            };
                        })(i, data[i]);

                        funcs.push(f);

                        i++;
                    };

                    Alpaca.series(funcs, function() {
                        // TODO: anything once finished?
                    });
                });
            }
        },

        /**
         * @see Alpaca.ContainerField#getValue
         */
        getValue: function() {

            // if we're empty and we're also not required, then we hand back undefined
            if (this.children.length === 0 && !this.schema.required)
            {
                return;
            }

            // otherwise, construct an array and had it back
            var o = [];
            for (var i = 0; i < this.children.length; i++)
            {
                var v = this.children[i].getValue();

                if (typeof(v) !== "undefined")
                {
                    o.push(v);
                }
            }
            return o;
        },

        /**
         * Returns number of children.
         */
        getSize: function() {
            return this.children.length;
        },

        /**
         * Recursive function for Update child field path and name.
         */
        updateChildrenPathAndName: function(parent) {
            var _this = this;
            if (parent.children) {
                $.each(parent.children, function(i, v) {
                    if (parent.prePath && Alpaca.startsWith(v.path,parent.prePath)) {
                        v.prePath = v.path;
                        v.path = v.path.replace(parent.prePath,parent.path);
                    }
                    // re-calculate name
                    if (parent.preName && Alpaca.startsWith(v.name, parent.preName)) {
                        v.preName = v.name;
                        v.name = v.name.replace(parent.preName, parent.name);
                        if (v.field) {
                            $(v.field).attr('name', v.name);
                        }
                    }
                    _this.updateChildrenPathAndName(v);
                });
            }
        },

        /**
         * Update field path and name when an array item is removed, inserted or switched.
         */
        updatePathAndName: function()
        {
            var _this = this;
            if (this.children)
            {
                $.each(this.children,function(i,v) {
                    var idx = v.path.lastIndexOf('/');
                    var lastSegment = v.path.substring(idx+1);
                    if (lastSegment.indexOf("[") != -1 && lastSegment.indexOf("]") != -1) {
                        lastSegment = lastSegment.substring(lastSegment.indexOf("[") + 1, lastSegment.indexOf("]"));
                    }
                    if (lastSegment != i) {
                        v.prePath = v.path;
                        v.path = v.path.substring(0, idx) + "/[" + i + "]";

                    }
                    // re-calculate name
                    if (v.nameCalculated)
                    {
                        v.preName = v.name;

                        if (v.parent && v.parent.name && v.path)
                        {
                            v.name = v.parent.name + "_" + i;
                        }
                        else
                        {
                            if (v.path)
                            {
                                v.name = v.path.replace(/\//g, "").replace(/\[/g, "_").replace(/\]/g, "");
                            }
                        }

			            if (this.parent.options.rubyrails )
                        {
                            $(v.field).attr('name', v.parent.name);
			            }
                        else
                        {
                            $(v.field).attr('name', v.name);
 			            }
                    }

                    if (!v.prePath)
                    {
                        v.prePath = v.path;
                    }
                    _this.updateChildrenPathAndName(v);
                });
            }
        },

        /**
         * Moves child up or down
         * @param {String} fromId Id of the child to be moved.
         * @param {Boolean} isUp true if the moving is upwards
         */
        moveItem: function(fromId, isUp) {
            var _this = this;
            if (this.childrenById[fromId]) {
                // do the loop
                $.each(this.children, function(index, val) {
                    if (val.getId() == fromId) {
                        var toIndex;
                        if (isUp === true) {
                            toIndex = index - 1;
                            if (toIndex < 0) {
                                toIndex = _this.children.length - 1;
                            }
                        } else {
                            toIndex = index + 1;
                            if (toIndex >= _this.children.length) {
                                toIndex = 0;
                            }
                        }
                        if (_this.children[toIndex]) {
                            var toId = _this.children[toIndex].getId();
                            var fromContainer = $('#' + fromId + '-item-container');
                            var toContainer = $('#' + toId + '-item-container');
                            _this.reRenderItem(_this.children[index], toContainer);
                            _this.reRenderItem(_this.children[toIndex], fromContainer);
                            var tmp = _this.children[index];
                            _this.children[index] = _this.children[toIndex];
                            _this.children[toIndex] = tmp;
                            _this.updatePathAndName();
                            return false;
                        }
                    }
                });
            }
        },

        /**
         * Removes child
         * @param {String} id Id of the child to be removed
         */
        removeItem: function(id) {
            if (this._validateEqualMinItems()) {
                this.children = $.grep(this.children, function(val, index) {
                    return (val.getId() != id);
                });
                delete this.childrenById[id];
                $('#' + id + "-item-container", this.outerEl).remove();
                this.refreshValidationState();
                this.updateToolbarItemsStatus();
                this.updatePathAndName();

                // trigger update handler
                this.triggerUpdate();
            }
        },

        /**
         * Updates status of toolbar items.
         */
        updateToolbarItemsStatus: function() {
            var _this = this;
            // add actions to toolbar buttons
            if (_this._validateEqualMaxItems()) {
                $('.alpaca-fieldset-array-item-toolbar-add', this.outerEl).each(function(index) {
                    $(this).removeClass('alpaca-fieldset-array-item-toolbar-disabled');
                });
            } else {
                $('.alpaca-fieldset-array-item-toolbar-add', this.outerEl).each(function(index) {
                    $(this).addClass('alpaca-fieldset-array-item-toolbar-disabled');
                });
            }
            if (_this._validateEqualMinItems()) {
                $('.alpaca-fieldset-array-item-toolbar-remove', this.outerEl).each(function(index) {
                    $(this).removeClass('alpaca-fieldset-array-item-toolbar-disabled');
                });
            } else {
                $('.alpaca-fieldset-array-item-toolbar-remove', this.outerEl).each(function(index) {
                    $(this).addClass('alpaca-fieldset-array-item-toolbar-disabled');
                });
            }
            if (this.getSize() === 0) {
                this.renderArrayToolbar(this.outerEl);
            } else {
                if (this.arrayToolbar) {
                    this.arrayToolbar.remove();
                }
            }
            // update counter
            $('.alpaca-item-label-counter', this.outerEl).each(function(index) {
                $(this).html(index + 1);
            });
        },

        /**
         * Renders array item toolbar.
         *
         * @param {Object} containerElem Toolbar container.
         */
        renderToolbar: function(containerElem) {
            var _this = this;

            // we do not render the toolbar in "display" mode
            if (this.view && this.view.type == "view")
            {
                return;
            }

            if (!this.options.readonly) {
                var id = containerElem.attr('alpaca-id');
                var fieldControl = this.childrenById[id];
                var itemToolbarTemplateDescriptor = this.view.getTemplateDescriptor("arrayItemToolbar");
                if (itemToolbarTemplateDescriptor) {

                    // Base buttons : add & remove
                    var buttonsDef = [
                        {
                            feature: "add",
                            icon: _this.addIcon,
                            label: (_this.options.items && _this.options.items.addItemLabel) ? _this.options.items.addItemLabel : "Add Item",
                            clickCallback: function(id, arrayField) {

                                _this.resolveItemSchemaOptions(function(schema, options) {

                                    arrayField.addItem(containerElem.index() + 1, schema, options, null, id, true, function(addedField) {
                                        arrayField.enrichElements(addedField.getEl());
                                    });

                                });

                                return false;
                            }
                        },
                        {
                            feature: "remove",
                            icon: _this.removeIcon,
                            label: (_this.options.items && _this.options.items.removeItemLabel) ? _this.options.items.removeItemLabel : "Remove Item",
                            clickCallback: function(id, arrayField) {
                                arrayField.removeItem(id);
                            }
                        }
                    ];

                    // Optional buttons : up & down
                    if ((_this.options.items && _this.options.items.showMoveUpItemButton)) {
                        buttonsDef.push({
                            feature: "up",
                            icon: _this.upIcon,
                            label: (_this.options.items && _this.options.items.moveUpItemLabel) ? _this.options.items.moveUpItemLabel : "Move Up",
                            clickCallback: function(id, arrayField) {
                                arrayField.moveItem(id, true);
                            }
                        });
                    }

                    if ((_this.options.items && _this.options.items.showMoveDownItemButton)) {
                        buttonsDef.push({
                            feature: "down",
                            icon: _this.downIcon,
                            label: (_this.options.items && _this.options.items.moveDownItemLabel) ? _this.options.items.moveDownItemLabel : "Move Down",
                            clickCallback: function(id, arrayField) {
                                arrayField.moveItem(id, false);
                            }
                        });
                    }

                    // Extra buttons : user-defined
                    if (_this.options.items && _this.options.items.extraToolbarButtons) {
                        buttonsDef = $.merge(buttonsDef,_this.options.items.extraToolbarButtons);
                    }

                    var toolbarElem = _this.view.tmpl(itemToolbarTemplateDescriptor, {
                        "id": id,
                        "buttons": buttonsDef
                    });
                    if (toolbarElem.attr("id") === null) {
                        toolbarElem.attr("id", id + "-item-toolbar");
                    }

                    // Process all buttons
                    for (var i in buttonsDef) {
                        (function(def) { // closure to prevent "def" leaking
                            var el = toolbarElem.find('.alpaca-fieldset-array-item-toolbar-'+def.feature);
                            el.click(function(e) {return def.clickCallback(id, _this, e);});
                            if (_this.buttonBeautifier) {
                                _this.buttonBeautifier.call(_this,el, def.icon);
                            }
                        })(buttonsDef[i]);
                    }

                    if (this.options.toolbarSticky) {
                        toolbarElem.prependTo(containerElem);
                    } else {
                        toolbarElem.hide().prependTo(containerElem);
                        containerElem.hover(function() {
                            $('.alpaca-fieldset-array-item-toolbar', this).show();
                        }, function() {
                            $('.alpaca-fieldset-array-item-toolbar', this).hide();
                        });
                    }

                }
            }
        },

        /**
         * Renders array toolbar.
         * @param {Object} containerElem Array toolbar container.
         */
        renderArrayToolbar: function(containerElem) {
            var _this = this;

            // we do not render the array toolbar in "display" mode
            if (this.view && this.view.type == "view")
            {
                return;
            }

            var id = containerElem.attr('alpaca-id');
            var itemToolbarTemplateDescriptor = this.view.getTemplateDescriptor("arrayToolbar");
            if (itemToolbarTemplateDescriptor) {
                var toolbarElem = _this.view.tmpl(itemToolbarTemplateDescriptor, {
                    "id": id,
                    "addItemLabel": (_this.options.items && _this.options.items.addItemLabel) ? _this.options.items.addItemLabel : "Add Item"
                });
                if (toolbarElem.attr("id") === null) {
                    toolbarElem.attr("id", id + "-array-toolbar");
                }

                // add actions to toolbar buttons
                if (this.options.toolbarStyle == "link") {
                    $('.alpaca-fieldset-array-toolbar-add', toolbarElem).click(function() {

                        _this.resolveItemSchemaOptions(function(schema, options) {

                            _this.addItem(0, schema, options, "", id, true, function(addedField) {
                                _this.enrichElements(addedField.getEl());
                            });


                        });
                    });
                } else {
                    var toolbarElemAdd = $('.alpaca-fieldset-array-toolbar-add', toolbarElem);
                    if (_this.buttonBeautifier) {
                        _this.buttonBeautifier.call(_this, toolbarElemAdd, _this.addIcon, true);
                    }
                    toolbarElemAdd.click(function() {

                        _this.resolveItemSchemaOptions(function(schema, options) {

                            _this.addItem(0, schema, options, "", id, true, function(addedField) {
                                _this.enrichElements(addedField.getEl());
                            });
                        });

                        return false;
                    }).wrap('<small></small>');

                }
                toolbarElem.appendTo(containerElem);
                this.arrayToolbar = toolbarElem;
            }
        },

        /**
         * Re-renders item.
         *
         * @param {Object} fieldControl Item control to be re-rendered
         *
         * @param {Object} newContainer New field container.
         */
        reRenderItem: function(fieldControl, newContainer) {
            fieldControl.container = newContainer;
            fieldControl.render();

            newContainer.attr("id", fieldControl.getId() + "-item-container");
            newContainer.attr("alpaca-id", fieldControl.getId());
            newContainer.addClass("alpaca-item-container");

            $(".alpaca-fieldset-array-item-toolbar", newContainer).remove();
            this.renderToolbar(newContainer);
            this.enrichElements(newContainer);
        },

        /**
         * Adds item.
         *
         * @param {String} index Index of the item
         * @param {Object} itemSchema field schema
         * @param {Object} itemOptions field options
         * @param {Any} itemData field data
         * @param {String} insertAfterId Where the item will be inserted
         * @param [Boolean] isDynamicSubItem whether this item is being dynamically created (after first render)
         * @param [Function] postRenderCallback called after the child is added
         */
        addItem: function(index, itemSchema, itemOptions, itemData, insertAfterId, isDynamicSubItem, postRenderCallback) {
            return this._addItem(index, itemSchema, itemOptions, itemData, insertAfterId, isDynamicSubItem, postRenderCallback);
        },

        /**
         * Workhorse method for addItem.
         *
         * @param index
         * @param itemSchema
         * @param itemOptions
         * @param itemData
         * @param insertAfterId
         * @param isDynamicSubItem
         * @param postRenderCallback
         * @return {*}
         * @private
         */
        _addItem: function(index, itemSchema, itemOptions, itemData, insertAfterId, isDynamicSubItem, postRenderCallback) {
            var _this = this;
            if (_this._validateEqualMaxItems()) {

                if (itemOptions === null && _this.options && _this.options.fields && _this.options.fields["item"]) {
                    itemOptions = _this.options.fields["item"];
                }

                var containerElem = _this.renderItemContainer(insertAfterId);
                containerElem.alpaca({
                    "data" : itemData,
                    "options": itemOptions,
                    "schema" : itemSchema,
                    "view" : this.view.id ? this.view.id : this.view,
                    "connector": this.connector,
                    "error": function(err)
                    {
                        _this.destroy();

                        _this.errorCallback.call(_this, err);
                    },
                    "notTopLevel":true,
                    "isDynamicCreation": (isDynamicSubItem || this.isDynamicCreation),
                    "render" : function(fieldControl, cb) {
                        // render
                        fieldControl.parent = _this;
                        // setup item path
                        fieldControl.path = _this.path + "[" + index + "]";
                        fieldControl.nameCalculated = true;
                        fieldControl.render(null, function() {

                            containerElem.attr("id", fieldControl.getId() + "-item-container");
                            containerElem.attr("alpaca-id", fieldControl.getId());
                            containerElem.addClass("alpaca-item-container");
                            // render item label if needed
                            if (_this.options && _this.options.itemLabel) {
                                var itemLabelTemplateDescriptor = _this.view.getTemplateDescriptor("itemLabel");
                                var itemLabelElem = _this.view.tmpl(itemLabelTemplateDescriptor, {
                                    "options": _this.options,
                                    "index": index ? index + 1 : 1,
                                    "id": _this.id
                                });
                                itemLabelElem.prependTo(containerElem);
                            }
                            // remember the control
                            _this.addChild(fieldControl, index);
                            _this.renderToolbar(containerElem);
                            _this.refreshValidationState();
                            _this.updatePathAndName();

                            // trigger update on the parent array
                            _this.triggerUpdate();

                            // if not empty, mark the "last" and "first" dom elements in the list
                            if ($(containerElem).siblings().addBack().length > 0)
                            {
                                $(containerElem).parent().removeClass("alpaca-fieldset-items-container-empty");

                                $(containerElem).siblings().addBack().removeClass("alpaca-item-container-first");
                                $(containerElem).siblings().addBack().removeClass("alpaca-item-container-last");
                                $(containerElem).siblings().addBack().first().addClass("alpaca-item-container-first");
                                $(containerElem).siblings().addBack().last().addClass("alpaca-item-container-last");
                            }

                            // store key on dom element
                            $(containerElem).attr("data-alpaca-item-container-item-key", index);

                            _this.updateToolbarItemsStatus(_this.outerEl);

                            if (Alpaca.isFunction(_this.options.items.postRender)) {
                                _this.options.items.postRender(containerElem);
                            }

                            if (cb)
                            {
                                cb();
                            }
                        });
                    },
                    "postRender": function(control)
                    {
                        if (postRenderCallback)
                        {
                            postRenderCallback(control);
                        }
                    }
                });

                //this.updateToolbarItemsStatus(this.outerEl);

                return containerElem;
            }
        },

        /**
         * Enriches styles for dynamic elements.
         *
         * @param {Object} containerElem Field container element.
         */
        enrichElements: function(containerElem) {
            this.getStyleInjection('array',containerElem);
        },

        /**
         * Determines the schema and options to utilize for items within this array.
         *
         * @param callback
         */
        resolveItemSchemaOptions: function(callback)
        {
            var _this = this;

            var itemOptions;
            if (_this.options && _this.options.fields && _this.options.fields["item"]) {
                itemOptions = _this.options.fields["item"];
            }
            var itemSchema;
            if (_this.schema && _this.schema.items) {
                itemSchema = _this.schema.items;
            }

            // handle $ref
            if (itemSchema && itemSchema["$ref"])
            {
                var referenceId = itemSchema["$ref"];

                console.log("itemSchema");

                var topField = this;
                var fieldChain = [topField];
                while (topField.parent)
                {
                    topField = topField.parent;
                    fieldChain.push(topField);
                }

                var originalItemSchema = itemSchema;
                var originalItemOptions = itemOptions;

                Alpaca.loadRefSchemaOptions(topField, referenceId, function(itemSchema, itemOptions) {

                    // walk the field chain to see if we have any circularity
                    var refCount = 0;
                    for (var i = 0; i < fieldChain.length; i++)
                    {
                        if (fieldChain[i].schema && fieldChain[i].schema.id === referenceId)
                        {
                            refCount++;
                        }
                    }

                    var circular = (refCount > 1);

                    var resolvedItemSchema = {};
                    if (originalItemSchema) {
                        Alpaca.mergeObject(resolvedItemSchema, originalItemSchema);
                    }
                    if (itemSchema)
                    {
                        Alpaca.mergeObject(resolvedItemSchema, itemSchema);
                    }
                    delete resolvedItemSchema.id;

                    var resolvedItemOptions = {};
                    if (originalItemOptions) {
                        Alpaca.mergeObject(resolvedItemOptions, originalItemOptions);
                    }
                    if (itemOptions)
                    {
                        Alpaca.mergeObject(resolvedItemOptions, itemOptions);
                    }

                    callback(resolvedItemSchema, resolvedItemOptions, circular);
                });
            }
            else
            {
                callback(itemSchema, itemOptions);
            }
        },

        /**
         * @see Alpaca.ContainerField#renderItems
         */
        renderItems: function(onSuccess)
        {
            var self = this;

            // mark field container as empty by default
            // the "addItem" method below gets the opportunity to unset this
            $(self.fieldContainer).addClass("alpaca-fieldset-items-container-empty");

            if (self.data)
            {
                // all items within the array have the same schema and options
                // so we only need to load this once
                self.resolveItemSchemaOptions(function(schema, options) {

                    // waterfall functions
                    var funcs = [];
                    for (var index = 0; index < self.data.length; index++)
                    {
                        var value = self.data[index];

                        var pf = (function(index, value)
                        {
                            return function(callback)
                            {
                                self.addItem(index, schema, options, value, false, false, function() {

                                    // by the time we get here, we may have constructed a very large child chain of
                                    // sub-dependencies and so we use nextTick() instead of a straight callback so as to
                                    // avoid blowing out the stack size
                                    Alpaca.nextTick(function() {
                                        callback();
                                    });

                                });
                            };

                        })(index, value);

                        funcs.push(pf);
                    }

                    Alpaca.series(funcs, function(err) {

                        self.updateToolbarItemsStatus();

                        if (onSuccess)
                        {
                            onSuccess();
                        }
                    });

                });
            }
            else
            {
                self.updateToolbarItemsStatus();

                if (onSuccess)
                {
                    onSuccess();
                }
            }
        },

        /**
         * Validates if the number of items has been reached to maxItems.
         * @returns {Boolean} true if the number of items has been reached to maxItems
         */
        _validateEqualMaxItems: function() {
            if (this.schema.items && this.schema.items.maxItems) {
                if (this.getSize() >= this.schema.items.maxItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Validates if the number of items has been reached to minItems.
         * @returns {Boolean} true if number of items has been reached to minItems
         */
        _validateEqualMinItems: function() {
            if (this.schema.items && this.schema.items.minItems) {
                if (this.getSize() <= this.schema.items.minItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Validates if number of items has been less than minItems.
         * @returns {Boolean} true if number of items has been less than minItems
         */
        _validateMinItems: function() {
            if (this.schema.items && this.schema.items.minItems) {
                if (this.getSize() < this.schema.items.minItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Validates if number of items has been over maxItems.
         * @returns {Boolean} true if number of items has been over maxItems
         */
        _validateMaxItems: function() {
            if (this.schema.items && this.schema.items.maxItems) {
                if (this.getSize() > this.schema.items.maxItems) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Validates if all items are unique.
         * @returns {Boolean} true if all items are unique.
         */
        _validateUniqueItems: function() {
            if (this.schema.items && this.schema.uniqueItems) {
                var hash = {};
                for (var i = 0, l = this.children.length; i < l; ++i) {
                    if (!hash.hasOwnProperty(this.children[i])) {
                        hash[this.children[i]] = true;
                    } else {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * @see Alpaca.ContainerField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateUniqueItems();
            valInfo["valueNotUnique"] = {
                "message": status ? "" : this.view.getMessage("valueNotUnique"),
                "status": status
            };

            status = this._validateMaxItems();
            valInfo["tooManyItems"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("tooManyItems"), [this.schema.items.maxItems]),
                "status": status
            };

            status = this._validateMinItems();
            valInfo["notEnoughItems"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("notEnoughItems"), [this.schema.items.minItems]),
                "status": status
            };

            return baseStatus && valInfo["valueNotUnique"]["status"] && valInfo["tooManyItems"]["status"] && valInfo["notEnoughItems"]["status"];
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.ContainerField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var properties = {
                "properties": {
                    "items": {
                        "title": "Array Items",
                        "description": "Schema for array items.",
                        "type": "object",
                        "properties": {
                            "minItems": {
                                "title": "Minimum Items",
                                "description": "Minimum number of items.",
                                "type": "number"
                            },
                            "maxItems": {
                                "title": "Maximum Items",
                                "description": "Maximum number of items.",
                                "type": "number"
                            },
                            "uniqueItems": {
                                "title": "Items Unique",
                                "description": "Item values should be unique if true.",
                                "type": "boolean",
                                "default": false
                            }
                        }
                    }
                }
            };

            if (this.children && this.children[0]) {
                Alpaca.merge(properties.properties.items.properties, this.children[0].getSchemaOfSchema());
            }

            return Alpaca.merge(this.base(), properties);
        },

        /**
         * @private
         * @see Alpaca.ContainerField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "items": {
                        "type": "object",
                        "fields": {
                            "minItems": {
                                "type": "integer"
                            },
                            "maxItems": {
                                "type": "integer"
                            },
                            "uniqueItems": {
                                "type": "checkbox"
                            }
                        }
                    }
                }
            });
        },
        /**
         * @private
         * @see Alpaca.ContainerField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            var properties = {
                "properties": {
                    "toolbarSticky": {
                        "title": "Sticky Toolbar",
                        "description": "Array item toolbar will be aways on if true.",
                        "type": "boolean",
                        "default": false
                    },
                    "items": {
                        "title": "Array Items",
                        "description": "Options for array items.",
                        "type": "object",
                        "properties": {
                            "extraToolbarButtons": {
                                "title": "Extra Toolbar buttons",
                                "description": "Buttons to be added next to add/remove/up/down, see examples",
                                "type": "array",
                                "default": undefined
                            },
                            "moveUpItemLabel": {
                                "title": "Move Up Item Label",
                                "description": "The label to use for the toolbar's 'move up' button.",
                                "type": "string",
                                "default": "Move Up"
                            },
                            "moveDownItemLabel": {
                                "title": "Move Down Item Label",
                                "description": "The label to use for the toolbar's 'move down' button.",
                                "type": "string",
                                "default": "Move Down"
                            },
                            "removeItemLabel": {
                                "title": "Remove Item Label",
                                "description": "The label to use for the toolbar's 'remove item' button.",
                                "type": "string",
                                "default": "Remove Item"
                            },
                            "addItemLabel": {
                                "title": "Add Item Label",
                                "description": "The label to use for the toolbar's 'add item' button.",
                                "type": "string",
                                "default": "Add Item"
                            },
                            "showMoveDownItemButton": {
                                "title": "Show Move Down Item Button",
                                "description": "Whether to show to the 'Move Down' button on the toolbar.",
                                "type": "boolean",
                                "default": true
                            },
                            "showMoveUpItemButton": {
                                "title": "Show Move Up Item Button",
                                "description": "Whether to show the 'Move Up' button on the toolbar.",
                                "type": "boolean",
                                "default": true
                            }
                        }
                    }
                }
            };

            if (this.children && this.children[0]) {
                Alpaca.merge(properties.properties.items.properties, this.children[0].getSchemaOfSchema());
            }

            return Alpaca.merge(this.base(), properties);
        },

        /**
         * @private
         * @see Alpaca.ContainerField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "toolbarSticky": {
                        "type": "checkbox"
                    },
                    "items": {
                        "type": "object",
                        "fields": {
                        }
                    }
                }
            });
        },
        /**
         * @see Alpaca.ContainerField#getTitle
         */
        getTitle: function() {
            return "Array Field";
        },

        /**
         * @see Alpaca.ContainerField#getDescription
         */
        getDescription: function() {
            return "Field for list of items with same data type or structure.";
        },

        /**
         * @see Alpaca.ContainerField#getType
         */
        getType: function() {
            return "array";
        },

        /**
         * @see Alpaca.ContainerField#getFiledType
         */
        getFieldType: function() {
            return "array";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerTemplate("itemLabel", '{{if options.itemLabel}}<div class="alpaca-controlfield-label"><div>${options.itemLabel}{{if index}} <span class="alpaca-item-label-counter">${index}</span>{{/if}}</div></div>{{/if}}');
    Alpaca.registerTemplate("arrayToolbar", '<span class="ui-widget ui-corner-all alpaca-fieldset-array-toolbar"><button class="alpaca-fieldset-array-toolbar-icon alpaca-fieldset-array-toolbar-add">${addItemLabel}</button></span>');
    Alpaca.registerTemplate("arrayItemToolbar", '<div class="ui-widget-header ui-corner-all alpaca-fieldset-array-item-toolbar">{{each(k,v) buttons}}<button class="alpaca-fieldset-array-item-toolbar-icon alpaca-fieldset-array-item-toolbar-${v.feature}">${v.label}</button>{{/each}}</div>');
    Alpaca.registerMessages({
        "notEnoughItems": "The minimum number of items is {0}",
        "tooManyItems": "The maximum number of items is {0}",
        "valueNotUnique": "Values are not unique",
        "notAnArray": "This value is not an Array"
    });
    Alpaca.registerFieldClass("array", Alpaca.Fields.ArrayField);
    Alpaca.registerDefaultSchemaFieldMapping("array", "array");

})(jQuery);
/*jshint -W004 */ // duplicate variables
/*jshint -W083 */ // inline functions are used safely
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.ObjectField = Alpaca.ContainerField.extend(
    /**
     * @lends Alpaca.Fields.ObjectField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ContainerField
         *
         * @class Control for JSON Schema object type.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.ContainerField#setup
         */
        setup: function() {
            this.base();

            this.wizardPreIcon = "";
            this.wizardNextIcon = "";
            this.wizardDoneIcon= "";

            if (this.view.style && Alpaca.styleInjections[this.view.style]) {
                if (Alpaca.styleInjections[this.view.style]["wizardPreIcon"]) {
                    this.wizardPreIcon = Alpaca.styleInjections[this.view.style]["wizardPreIcon"];
                }
                if (Alpaca.styleInjections[this.view.style]["wizardNextIcon"]) {
                    this.wizardNextIcon = Alpaca.styleInjections[this.view.style]["wizardNextIcon"];
                }
                if (Alpaca.styleInjections[this.view.style]["wizardDoneIcon"]) {
                    this.wizardDoneIcon = Alpaca.styleInjections[this.view.style]["wizardDoneIcon"];
                }
            }

            if (Alpaca.isEmpty(this.data)) {
                return;
            }

            if (this.data == "")
            {
                return;
            }

            if (!Alpaca.isObject(this.data)) {
                if (!Alpaca.isString(this.data)) {
                    return;
                } else {
                    try {
                        this.data = Alpaca.parseJSON(this.data);
                        if (!Alpaca.isObject(this.data)) {
                            Alpaca.logWarn("ObjectField parsed data but it was not an object: " + JSON.stringify(this.data));
                            return;
                        }
                    } catch (e) {
                        return;
                    }
                }
            }
        },

        /**
         * Picks apart the data object and set onto child fields.
         *
         * @see Alpaca.Field#setValue
         */
        setValue: function(data)
        {
            if (!data)
            {
                data = {};
            }

            // if not an object by this point, we don't handle it
            if (!Alpaca.isObject(data))
            {
                return;
            }

            // sort existing fields by property id
            var existingFieldsByPropertyId = {};
            for (var fieldId in this.childrenById)
            {
                var propertyId = this.childrenById[fieldId].propertyId;
                existingFieldsByPropertyId[propertyId] = this.childrenById[fieldId];
            }

            // new data mapped by property id
            var newDataByPropertyId = {};
            for (var k in data)
            {
                if (data.hasOwnProperty(k))
                {
                    newDataByPropertyId[k] = data[k];
                }
            }

            // walk through new property ids
            // if a field exists, set value onto it and remove from newDataByPropertyId and existingFieldsByPropertyId
            // if a field doesn't exist, let it remain in list
            for (var propertyId in newDataByPropertyId)
            {
                var field = existingFieldsByPropertyId[propertyId];
                if (field)
                {
                    field.setValue(newDataByPropertyId[propertyId]);

                    delete existingFieldsByPropertyId[propertyId];
                    delete newDataByPropertyId[propertyId];
                }
            }

            // anything left in existingFieldsByPropertyId describes data that is missing, null or empty
            // we null out those values
            for (var propertyId in existingFieldsByPropertyId)
            {
                var field = existingFieldsByPropertyId[propertyId];
                field.setValue(null);
            }

            // anything left in newDataByPropertyId is new stuff that we need to add
            // the object field doesn't support this since it runs against a schema
            // so we drop this off
        },

        /**
         * Reconstructs the data object from the child fields.
         *
         * @see Alpaca.Field#getValue
         */
        getValue: function() {

            // if we don't have any children and we're not required, hand back empty object
            if (this.children.length === 0 && !this.schema.required)
            {
                return {};
            }

            // otherwise, hand back an object with our child properties in it
            var o = {};

            // walk through all of the properties object
            // for each property, we insert it into a JSON object that we'll hand back as the result

            // if the property has dependencies, then we evaluate those dependencies first to determine whether the
            // resulting property should be included

            for (var i = 0; i < this.children.length; i++) {

                // the property key and vlaue
                var propertyId = this.children[i].propertyId;
                var fieldValue = this.children[i].getValue();

                if (typeof(fieldValue) !== "undefined")
                {
                    if (this.determineAllDependenciesValid(propertyId))
                    {
                        var assignedValue = null;

                        if (typeof(fieldValue) === "boolean")
                        {
                            assignedValue = (fieldValue? true: false);
                        }
                        else if (Alpaca.isArray(fieldValue) || Alpaca.isObject(fieldValue))
                        {
                            assignedValue = fieldValue;
                        }
                        else if (fieldValue)
                        {
                            assignedValue = fieldValue;
                        }

                        if (assignedValue)
                        {
                            o[propertyId] = assignedValue;
                        }
                    }
                }
            }

            return o;
        },

        /**
         * @see Alpaca.Field#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                // Generates wizard if requested
                if (self.isTopLevel()) {
                    if (self.view) {
                        self.wizardConfigs = self.view.getWizard();
                        if (self.wizardConfigs) {

                            // set up defaults for wizard
                            if (Alpaca.isUndefined(self.wizardConfigs.validation)) {
                                self.wizardConfigs.validation = true;
                            }
                            if (!self.wizardConfigs.buttons) {
                                self.wizardConfigs.buttons = {};
                            }

                            // done
                            if (!self.wizardConfigs.buttons.done) {
                                self.wizardConfigs.buttons.done = {};
                            }
                            if (Alpaca.isUndefined(self.wizardConfigs.buttons.done.validateOnClick)) {
                                self.wizardConfigs.buttons.done.validateOnClick = true;
                            }

                            // prev
                            if (!self.wizardConfigs.buttons.prev) {
                                self.wizardConfigs.buttons.prev = {};
                            }
                            if (Alpaca.isUndefined(self.wizardConfigs.buttons.prev.validateOnClick)) {
                                self.wizardConfigs.buttons.prev.validateOnClick = true;
                            }

                            // next
                            if (!self.wizardConfigs.buttons.next) {
                                self.wizardConfigs.buttons.next = {};
                            }
                            if (Alpaca.isUndefined(self.wizardConfigs.buttons.next.validateOnClick)) {
                                self.wizardConfigs.buttons.next.validateOnClick = true;
                            }
                        }
                        var layoutTemplateDescriptor = self.view.getLayout().templateDescriptor;
                        if (self.wizardConfigs && self.wizardConfigs.renderWizard) {
                            if (layoutTemplateDescriptor) {
                                //Wizard based on layout
                                self.wizard();
                            } else {
                                //Wizard based on injections
                                self.autoWizard();
                            }
                        }
                    }
                }

                callback();
            });
        },

        /**
         * @see Alpaca.ContainerField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateMaxProperties();
            valInfo["tooManyProperties"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("tooManyProperties"), [this.schema.maxProperties]),
                "status": status
            };

            status = this._validateMinProperties();
            valInfo["tooFewProperties"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("tooManyItems"), [this.schema.items.minProperties]),
                "status": status
            };

            return baseStatus && valInfo["tooManyProperties"]["status"] && valInfo["tooFewProperties"]["status"];
        },//__BUILDER_HELPERS

        /**
         * Validate maxProperties schema property.
         *
         * @returns {Boolean} whether maxProperties is satisfied
         */
        _validateMaxProperties: function()
        {
            if (typeof(this.schema["maxProperties"]) == "undefined")
            {
                return true;
            }

            var maxProperties = this.schema["maxProperties"];

            // count the number of properties that we currently have
            var propertyCount = 0;
            for (var k in this.data)
            {
                propertyCount++;
            }

            return propertyCount <= maxProperties;
        },

        /**
         * Validate maxProperties schema property.
         *
         * @returns {Boolean} whether maxProperties is satisfied
         */
        _validateMinProperties: function()
        {
            if (typeof(this.schema["minProperties"]) == "undefined")
            {
                return true;
            }

            var minProperties = this.schema["minProperties"];

            // count the number of properties that we currently have
            var propertyCount = 0;
            for (var k in this.data)
            {
                propertyCount++;
            }

            return propertyCount >= minProperties;
        },

        //__BUILDER_HELPERS


        /**
         * Gets child index.
         *
         * @param {Object} propertyId Child field property ID.
         */
        getIndex: function(propertyId) {
            if (Alpaca.isEmpty(propertyId)) {
                return -1;
            }
            for (var i = 0; i < this.children.length; i++) {
                var pid = this.children[i].propertyId;
                if (pid == propertyId) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * Determines the schema and options to utilize for sub-objects within this object.
         *
         * @param propertyId
         * @param callback
         */
        resolvePropertySchemaOptions: function(propertyId, callback)
        {
            var _this = this;

            var propertySchema = null;
            if (_this.schema && _this.schema.properties && _this.schema.properties[propertyId]) {
                propertySchema = _this.schema.properties[propertyId];
            }
            var propertyOptions = {};
            if (_this.options && _this.options.fields && _this.options.fields[propertyId]) {
                propertyOptions = _this.options.fields[propertyId];
            }

            // handle $ref
            if (propertySchema && propertySchema["$ref"])
            {
                var referenceId = propertySchema["$ref"];
                var topField = this;
                var fieldChain = [topField];
                while (topField.parent)
                {
                    topField = topField.parent;
                    fieldChain.push(topField);
                }

                var originalPropertySchema = propertySchema;
                var originalPropertyOptions = propertyOptions;

                Alpaca.loadRefSchemaOptions(topField, referenceId, function(propertySchema, propertyOptions) {

                    // walk the field chain to see if we have any circularity
                    var refCount = 0;
                    for (var i = 0; i < fieldChain.length; i++)
                    {
                        if (fieldChain[i].schema && fieldChain[i].schema.id === referenceId)
                        {
                            refCount++;
                        }
                    }

                    var circular = (refCount > 1);

                    var resolvedPropertySchema = {};
                    if (originalPropertySchema) {
                        Alpaca.mergeObject(resolvedPropertySchema, originalPropertySchema);
                    }
                    if (propertySchema)
                    {
                        Alpaca.mergeObject(resolvedPropertySchema, propertySchema);
                    }
                    // keep original id
                    if (originalPropertySchema && originalPropertySchema.id) {
                        resolvedPropertySchema.id = originalPropertySchema.id;
                    }
                    //delete resolvedPropertySchema.id;

                    var resolvedPropertyOptions = {};
                    if (originalPropertyOptions) {
                        Alpaca.mergeObject(resolvedPropertyOptions, originalPropertyOptions);
                    }
                    if (propertyOptions)
                    {
                        Alpaca.mergeObject(resolvedPropertyOptions, propertyOptions);
                    }

                    Alpaca.nextTick(function() {
                        callback(resolvedPropertySchema, resolvedPropertyOptions, circular);
                    });

                    //callback(resolvedPropertySchema, resolvedPropertyOptions, circular);
                });
            }
            else
            {
                Alpaca.nextTick(function() {
                    callback(propertySchema, propertyOptions);
                });

                //callback(propertySchema, propertyOptions);
            }
        },

        /**
         * Removes child
         *
         * @param {String} id the alpaca field id of the field to be removed
         */
        removeItem: function(id)
        {
            this.children = $.grep(this.children, function(val, index) {
                return (val.getId() != id);
            });

            var childField = this.childrenById[id];

            delete this.childrenById[id];
            if (childField.propertyId)
            {
                delete this.childrenByPropertyId[childField.propertyId];
            }

            childField.destroy();

            this.refreshValidationState();

            // trigger update handler
            this.triggerUpdate();
        },

        /**
         * Adds a child item.  Returns the container element right away.  The postRenderCallback method is called
         * upon completion.
         *
         * @param {String} propertyId Child field property ID.
         * @param {Object} itemSchema schema
         * @param {Object} fieldOptions Child field options.
         * @param {Any} value Child field value
         * @param {String} insertAfterId Location where the child item will be inserted.
         * @param [Boolean] isDynamicSubItem whether this item is being dynamically created (after first render)
         * @param [Function} postRenderCallback called once the item has been added
         */
        addItem: function(propertyId, itemSchema, itemOptions, itemData, insertAfterId, isDynamicSubItem, postRenderCallback) {
            var _this = this;

            var containerElem = _this.renderItemContainer(insertAfterId, this, propertyId);
            containerElem.alpaca({
                "data" : itemData,
                "options": itemOptions,
                "schema" : itemSchema,
                "view" : this.view.id ? this.view.id : this.view,
                "connector": this.connector,
                "error": function(err)
                {
                    _this.destroy();

                    _this.errorCallback.call(_this, err);
                },
                "notTopLevel":true,
                "isDynamicCreation": (isDynamicSubItem || this.isDynamicCreation),
                "render" : function(fieldControl, cb) {
                    // render
                    fieldControl.parent = _this;
                    // add the property Id
                    fieldControl.propertyId = propertyId;
                    // setup item path
                    if (_this.path != "/") {
                        fieldControl.path = _this.path + "/" + propertyId;
                    } else {
                        fieldControl.path = _this.path + propertyId;
                    }
                    fieldControl.render(null, function() {

                        containerElem.attr("id", fieldControl.getId() + "-item-container");
                        containerElem.attr("alpaca-id", fieldControl.getId());
                        containerElem.addClass("alpaca-fieldset-item-container");
                        // remember the control
                        if (Alpaca.isEmpty(insertAfterId)) {
                            _this.addChild(fieldControl);
                        } else {
                            var index = _this.getIndex(insertAfterId);
                            if (index != -1) {
                                _this.addChild(fieldControl, index + 1);
                            } else {
                                _this.addChild(fieldControl);
                            }
                        }
                        if (insertAfterId) {
                            _this.refreshValidationState();
                        }

                        // if not empty, mark the "last" and "first" dom elements in the list
                        if ($(containerElem).siblings().addBack().length > 0)
                        {
                            $(containerElem).parent().removeClass("alpaca-fieldset-items-container-empty");

                            $(containerElem).siblings().addBack().removeClass("alpaca-item-container-first");
                            $(containerElem).siblings().addBack().removeClass("alpaca-item-container-last");
                            $(containerElem).siblings().addBack().first().addClass("alpaca-item-container-first");
                            $(containerElem).siblings().addBack().last().addClass("alpaca-item-container-last");
                        }

                        // store key on dom element
                        $(containerElem).attr("data-alpaca-item-container-item-key", propertyId);

                        // trigger update on the parent array
                        _this.triggerUpdate();

                        if (cb)
                        {
                            cb();
                        }

                    });
                },
                "postRender": function(control) {

                    if (postRenderCallback)
                    {
                        postRenderCallback(control);
                    }
                }
            });

            return containerElem;
        },

        /**
         * @see Alpaca.ContainerField#renderItems
         */
        renderItems: function(onSuccess) {

            var _this = this;

            // we keep a map of all of the properties in our original data object
            // as we render elements out of the schema, we remove from the dataProperties map
            // whatever is leftover are the data properties that were NOT rendered because they were not part
            // of the schema
            // we use this for debugging
            var extraDataProperties = {};
            for (var dataKey in _this.data) {
                extraDataProperties[dataKey] = dataKey;
            }

            var properties = _this.data;
            if (_this.schema && _this.schema.properties) {
                properties = _this.schema.properties;
            }

            var cf = function()
            {
                // If the schema and the data line up perfectly, then there will be no properties in the data that are
                // not also in the schema, and thus, extraDataProperties will be empty.
                //
                // On the other hand, if there are some properties in data that were not in schema, then they will
                // remain in extraDataProperties and we can inform developers for debugging purposes
                //
                var extraDataKeys = [];
                for (var extraDataKey in extraDataProperties) {
                    extraDataKeys.push(extraDataKey);
                }
                if (extraDataKeys.length > 0) {
                    Alpaca.logDebug("There were " + extraDataKeys.length + " extra data keys that were not part of the schema " + JSON.stringify(extraDataKeys));
                }

                //_this.refreshValidationState();

                if (onSuccess)
                {
                    onSuccess();
                }
            };

            // each property in the object can have a different schema and options so we need to process
            // asynchronously and wait for all to complete

            // wrap into waterfall functions
            var propertyFunctions = [];
            for (var propertyId in properties)
            {
                var itemData = null;
                if (_this.data)
                {
                    itemData = _this.data[propertyId];
                }

                var pf = (function(propertyId, itemData, extraDataProperties)
                {
                    return function(callback)
                    {
                        // only allow this if we have data, otherwise we end up with circular reference
                        _this.resolvePropertySchemaOptions(propertyId, function(schema, options, circular) {

                            // we only allow addition if the resolved schema isn't circularly referenced
                            // or the schema is optional
                            if (circular)
                            {
                                return Alpaca.throwErrorWithCallback("Circular reference detected for schema: " + schema, _this.errorCallback);
                            }

                            if (!schema)
                            {
                                Alpaca.logError("Unable to resolve schema for property: " + propertyId);
                            }

                            _this.addItem(propertyId, schema, options, itemData, null, false, function(addedItemControl) {

                                // remove from extraDataProperties helper
                                delete extraDataProperties[propertyId];

                                // HANDLE PROPERTY DEPENDENCIES (IF THE PROPERTY HAS THEM)

                                // if this property has dependencies, show or hide this added item right away
                                _this.showOrHidePropertyBasedOnDependencies(propertyId);

                                // if this property has dependencies, bind update handlers to dependent fields
                                _this.bindDependencyFieldUpdateEvent(propertyId);

                                // if this property has dependencies, trigger those to ensure it is in the right state
                                _this.refreshDependentFieldStates(propertyId);

                                // by the time we get here, we may have constructed a very large child chain of
                                // sub-dependencies and so we use nextTick() instead of a straight callback so as to
                                // avoid blowing out the stack size
                                Alpaca.nextTick(function() {
                                    callback();
                                });
                            });
                        });
                    };

                })(propertyId, itemData, extraDataProperties);

                propertyFunctions.push(pf);
            }

            Alpaca.series(propertyFunctions, function(err) {
                cf();
            });
        },


        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // DEPENDENCIES
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Shows or hides a property's field based on how its dependencies evaluate.
         * If a property doesn't have dependencies, this no-ops.
         *
         * @param propertyId
         */
        showOrHidePropertyBasedOnDependencies: function(propertyId)
        {
            var self = this;

            var item = this.childrenByPropertyId[propertyId];
            if (!item)
            {
                return Alpaca.throwErrorWithCallback("Missing property: " + propertyId, self.errorCallback);
            }

            var valid = this.determineAllDependenciesValid(propertyId);
            if (valid)
            {
                item.show();
                item.onDependentReveal();
            }
            else
            {
                item.hide();
                item.onDependentConceal();
            }
        },

        /**
         * Determines whether the dependencies for a property pass.
         *
         * @param propertyId
         */
        determineAllDependenciesValid: function(propertyId)
        {
            var self = this;

            var item = this.childrenByPropertyId[propertyId];
            if (!item)
            {
                return Alpaca.throwErrorWithCallback("Missing property: " + propertyId, self.errorCallback);
            }

            var itemDependencies = item.schema.dependencies;
            if (!itemDependencies)
            {
                // no dependencies, so yes, we pass
                return true;
            }

            var valid = true;
            if (Alpaca.isString(itemDependencies))
            {
                valid = self.determineSingleDependencyValid(propertyId, itemDependencies);
            }
            else if (Alpaca.isArray(itemDependencies))
            {
                $.each(itemDependencies, function(index, value) {
                    valid = valid && self.determineSingleDependencyValid(propertyId, value);
                });
            }

            return valid;
        },

        /**
         * Binds field updates to any field dependencies.
         *
         * @param propertyId
         */
        bindDependencyFieldUpdateEvent: function(propertyId)
        {
            var self = this;

            var item = this.childrenByPropertyId[propertyId];
            if (!item)
            {
                return Alpaca.throwErrorWithCallback("Missing property: " + propertyId, self.errorCallback);
            }

            var itemDependencies = item.schema.dependencies;
            if (!itemDependencies)
            {
                // no dependencies, so simple return
                return true;
            }

            // helper function
            var bindEvent = function(propertyId, dependencyPropertyId)
            {
                // dependencyPropertyId is the identifier for the property that the field "propertyId" is dependent on

                var dependentField = Alpaca.resolveField(self, dependencyPropertyId);
                if (dependentField)
                {
                    dependentField.getEl().bind("fieldupdate", function(propertyField, dependencyField, propertyId, dependencyPropertyId) {

                        return function(event)
                        {
                            // the property "dependencyPropertyId" changed and affects target property ("propertyId")

                            // update UI state for target property
                            self.showOrHidePropertyBasedOnDependencies(propertyId);

                            propertyField.trigger("fieldupdate");
                        };

                    }(item, dependentField, propertyId, dependencyPropertyId));

                    // trigger field update
                    dependentField.trigger("fieldupdate");
                }
            };

            if (Alpaca.isString(itemDependencies))
            {
                bindEvent(propertyId, itemDependencies);
            }
            else if (Alpaca.isArray(itemDependencies))
            {
                $.each(itemDependencies, function(index, value) {
                    bindEvent(propertyId, value);
                });
            }
        },

        refreshDependentFieldStates: function(propertyId)
        {
            var self = this;

            var propertyField = this.childrenByPropertyId[propertyId];
            if (!propertyField)
            {
                return Alpaca.throwErrorWithCallback("Missing property: " + propertyId, self.errorCallback);
            }

            var itemDependencies = propertyField.schema.dependencies;
            if (!itemDependencies)
            {
                // no dependencies, so simple return
                return true;
            }

            // helper function
            var triggerFieldUpdateForProperty = function(otherPropertyId)
            {
                var dependentField = Alpaca.resolveField(self, otherPropertyId);
                if (dependentField)
                {
                    // trigger field update
                    dependentField.trigger("fieldupdate");
                }
            };

            if (Alpaca.isString(itemDependencies))
            {
                triggerFieldUpdateForProperty(itemDependencies);
            }
            else if (Alpaca.isArray(itemDependencies))
            {
                $.each(itemDependencies, function(index, value) {
                    triggerFieldUpdateForProperty(value);
                });
            }
        },

        /**
         * Checks whether a single property's dependency is satisfied or not.
         *
         * In order to be valid, the property's dependency must exist (JSON schema) and optionally must satisfy
         * any dependency options (value matches using an AND).  Finally, the dependency field must be showing.
         *
         * @param {Object} propertyId Field property id.
         * @param {Object} dependentOnPropertyId Property id of the dependency field.
         *
         * @returns {Boolean} True if all dependencies have been satisfied and the field needs to be shown,
         * false otherwise.
         */
        determineSingleDependencyValid: function(propertyId, dependentOnPropertyId)
        {
            var self = this;

            // checks to see if the referenced "dependent-on" property has a value
            // basic JSON-schema supports this (if it has ANY value, it is considered valid
            // special consideration for boolean false
            var dependentOnField = Alpaca.resolveField(self, dependentOnPropertyId);
            if (!dependentOnField)
            {
                // no dependent-on field found, return false
                return false;
            }

            var dependentOnData = dependentOnField.data;

            // assume it isn't valid
            var valid = false;

            // go one of two directions depending on whether we have conditional dependencies or not
            var conditionalDependencies = this.childrenByPropertyId[propertyId].options.dependencies;
            if (!conditionalDependencies || conditionalDependencies.length === 0)
            {
                //
                // BASIC DEPENENDENCY CHECKING (CORE JSON SCHEMA)
                //

                // special case: if the field is a boolean field and we have no conditional dependency checking,
                // then we set valid = false if the field data is a boolean false
                if (dependentOnField.getType() === "boolean" && !this.childrenByPropertyId[propertyId].options.dependencies && !dependentOnData)
                {
                    valid = false;
                }
                else
                {
                    valid = !Alpaca.isValEmpty(dependentOnField.data);
                }
            }
            else
            {
                //
                // CONDITIONAL DEPENDENCY CHECKING (ALPACA EXTENSION VIA OPTIONS)
                //

                // Alpaca extends JSON schema by allowing dependencies to trigger only for specific values on the
                // dependent fields.  If options are specified to define this, we walk through and perform an
                // AND operation across any fields

                // do some data sanity cleanup
                if (dependentOnField.getType() === "boolean" && !dependentOnData) {
                    dependentOnData = false
                }

                var conditionalData = conditionalDependencies[dependentOnPropertyId];

                // if the option is a function, then evaluate the function to determine whether to show
                // the function evaluates regardless of whether the schema-based fallback determined we should show
                if (!Alpaca.isEmpty(conditionalData) && Alpaca.isFunction(conditionalData))
                {
                    valid = conditionalData.call(this, dependentOnData);
                }
                else
                {
                    // assume true
                    valid = true;

                    // the conditional data is an array of values
                    if (Alpaca.isArray(conditionalData)) {

                        // check array value
                        //if (conditionalDependencies[dependentOnPropertyId] && $.inArray(dependentOnData, conditionalDependencies[dependentOnPropertyId]) == -1)
                        if (Alpaca.anyEquality(dependentOnData, conditionalData))
                        {
                            valid = false;
                        }
                    }
                    else
                    {
                        // check object value
                        if (!Alpaca.isEmpty(conditionalData) && !Alpaca.anyEquality(conditionalData, dependentOnData))
                        {
                            valid = false;
                        }
                    }
                }
            }

            //
            // NESTED HIDDENS DEPENDENCY HIDES (ALPACA EXTENSION)
            //

            // final check: only set valid if the dependentOnPropertyId is showing
            if (dependentOnField && dependentOnField.isHidden())
            {
                valid = false;
            }

            return valid;
        },




        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // WIZARD
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////



        /**
         * Renders a template-based wizard.
         */
        wizard: function() {

            var _this = this;

            var element = this.outerEl;
            var steps = $('.alpaca-wizard-step', element);
            var count = steps.size();

            this.totalSteps = count;

            var stepTitles = [];
            if (this.wizardConfigs.stepTitles) {
                stepTitles = this.wizardConfigs.stepTitles;
            } else {
                // Prepare step titles
                steps.each(function(i) {
                    var stepTitle = {
                        "title": "",
                        "description": ""
                    };
                    if ($('.alpaca-wizard-step-title', this)) {
                        stepTitle.title = $('.alpaca-wizard-step-title', this).html();
                        $('.alpaca-wizard-step-title', this).hide();
                    }
                    if ($('.alpaca-wizard-step-description', this)) {
                        stepTitle.description = $('.alpaca-wizard-step-description', this).html();
                        $('.alpaca-wizard-step-description', this).hide();
                    }
                    stepTitles.push(stepTitle);
                });
            }
            var wizardStatusBarElement = this._renderWizardStatusBar(stepTitles);
            if (wizardStatusBarElement) {
                $(element).before(wizardStatusBarElement);
            }

            steps.each(function(i) {

                var wizardStepTargetId = $(this).attr("id");

                var stepId = 'step' + i;
                var wizardStepTemplateDescriptor = _this.view.getTemplateDescriptor("wizardStep");
                if (wizardStepTemplateDescriptor) {
                    var wizardStepElement = _this.view.tmpl(wizardStepTemplateDescriptor, {});
                    wizardStepElement.attr("id", stepId);
                    $(this).wrap(wizardStepElement);
                }

                var navBarId = stepId + '-nav-bar';
                var wizardNavBarTemplateDescriptor = _this.view.getTemplateDescriptor("wizardNavBar");
                if (wizardNavBarTemplateDescriptor) {
                    var wizardNavBarElement = _this.view.tmpl(wizardNavBarTemplateDescriptor, {});
                    wizardNavBarElement.attr("id", navBarId);
                    wizardNavBarElement.addClass('alpaca-wizard-nav-bar');
                    $(this).append(wizardNavBarElement);
                }

                // collect all of the stepBindings for this step
                var stepBindings = {};
                var bindings = _this.view.getLayout().bindings;
                for (var fieldId in bindings)
                {
                    var bindingTargetId = bindings[fieldId];

                    if (bindingTargetId == wizardStepTargetId)
                    {
                        stepBindings[fieldId] = wizardStepTargetId;
                    }
                }

                var vFunc = function(stepCount, stepBindings)
                {
                    return function() {

                        var valid = true;

                        if (_this.wizardConfigs && _this.wizardConfigs.validation) {

                            // if auto-wizard, process bindings one at a time
                            if (stepBindings) {
                                $.each(stepBindings, function(propertyId, step) {
                                    valid = valid & _this.childrenByPropertyId[propertyId].validate();
                                    _this.childrenByPropertyId[propertyId].refreshValidationState();
                                });
                            }

                        }

                        return valid;
                    };
                }(i, stepBindings);

                if (i === 0) {
                    _this._createNextButton(i, true, vFunc);
                    _this._selectStep(i);
                } else if (i == count - 1) {
                    $("#step" + i).hide();
                    _this._createPrevButton(i, false);
                    _this._createDoneButton(i, true, vFunc);
                } else {
                    $("#step" + i).hide();
                    _this._createPrevButton(i, false);
                    _this._createNextButton(i, true, vFunc);
                }
            });
        },

        /**
         * Renders a configuration-based wizard without a layout template.
         */
        autoWizard: function() {

            var _this = this;

            var totalSteps = this.wizardConfigs.steps;

            if (!totalSteps) {
                totalSteps = 1;
            }

            this.totalSteps = totalSteps;

            var stepBindings = this.wizardConfigs.bindings;

            if (!stepBindings) {
                stepBindings = {};
            }

            for (var propertyId in this.childrenByPropertyId) {
                if (!stepBindings.hasOwnProperty(propertyId)) {
                    stepBindings[propertyId] = 1;
                }
            }

            for (var i = 0; i < totalSteps; i++) {
                var step = i + 1;
                var tmpArray = [];
                for (var propertyId in stepBindings) {
                    if (stepBindings[propertyId] == step) {
                        if (this.childrenByPropertyId && this.childrenByPropertyId[propertyId]) {
                            tmpArray.push("#" + this.childrenByPropertyId[propertyId].container.attr('id'));
                        }
                    }
                }

                var stepId = 'step' + i;
                var wizardStepTemplateDescriptor = this.view.getTemplateDescriptor("wizardStep");
                if (wizardStepTemplateDescriptor) {
                    var wizardStepElement = _this.view.tmpl(wizardStepTemplateDescriptor, {});
                    wizardStepElement.attr("id", stepId);
                    $(tmpArray.join(',')).wrapAll(wizardStepElement);
                }

                var navBarId = stepId + '-nav-bar';
                var wizardNavBarTemplateDescriptor = this.view.getTemplateDescriptor("wizardNavBar");
                if (wizardNavBarTemplateDescriptor) {
                    var wizardNavBarElement = _this.view.tmpl(wizardNavBarTemplateDescriptor, {});
                    wizardNavBarElement.attr("id", navBarId);
                    wizardNavBarElement.addClass('alpaca-wizard-nav-bar');
                    $('#' + stepId, this.outerEl).append(wizardNavBarElement);
                }
            }

            var wizardStatusBarElement = this._renderWizardStatusBar(this.wizardConfigs.stepTitles);
            if (wizardStatusBarElement) {
                wizardStatusBarElement.prependTo(this.fieldContainer);
            }

            for (var i = 0; i < totalSteps; i++) {

                var vFunc = function(stepCount, stepBindings)
                {
                    return function() {

                        var valid = true;

                        if (_this.view && _this.wizardConfigs && _this.wizardConfigs.validation) {

                            // if auto-wizard, process bindings one at a time
                            if (stepBindings) {
                                $.each(stepBindings, function(propertyId, step) {
                                    if (step == stepCount + 1 && valid) {
                                        valid = _this.childrenByPropertyId[propertyId].validate();
                                        _this.childrenByPropertyId[propertyId].validate();
                                    }
                                });
                            }
                        }

                        return valid;

                    };
                }(i, stepBindings);


                if (i === 0) {
                    _this._createNextButton(i, false, vFunc);
                    _this._selectStep(i);
                } else if (i == totalSteps - 1) {
                    $("#step" + i).hide();
                    _this._createPrevButton(i, false);
                    _this._createDoneButton(i, true, vFunc);
                } else {
                    $("#step" + i).hide();
                    _this._createPrevButton(i, false);
                    _this._createNextButton(i, false, vFunc);
                }
            }
        },

        /**
         * Renders wizard status bar.
         *
         * @param {Object} stepTitles Step titles.
         */
        _renderWizardStatusBar: function(stepTitles) {

            var _this = this;

            var wizardStatusBar = this.wizardConfigs.statusBar;
            if (wizardStatusBar && stepTitles) {
                var wizardStatusBarTemplateDescriptor = this.view.getTemplateDescriptor("wizardStatusBar");
                if (wizardStatusBarTemplateDescriptor) {
                    var wizardStatusBarElement = _this.view.tmpl(wizardStatusBarTemplateDescriptor, {
                        "id": this.getId() + "-wizard-status-bar",
                        "titles": stepTitles
                    });
                    wizardStatusBarElement.addClass("alpaca-wizard-status-bar");
                    this.getStyleInjection("wizardStatusBar",wizardStatusBarElement);
                    return wizardStatusBarElement;
                }
            }
        },

        /**
         * Creates an "prev" button.
         *
         * @param {Integer} i Step number.
         * @param [boolean] whether to add a clear div at the end
         * @param [validationFunction] function test whether the button should be allowed to proceed
         */
        _createPrevButton: function(i, clear, validationFunction) {

            // only apply validation if configured to do so
            if (this.wizardConfigs.buttons && this.wizardConfigs.buttons.prev) {
                if (!this.wizardConfigs.buttons.prev.validateOnClick) {
                    validationFunction = null;
                }
            }

            var stepName = "step" + i;
            var _this = this;

            var wizardPreButtonTemplateDescriptor = this.view.getTemplateDescriptor("wizardPreButton");
            if (wizardPreButtonTemplateDescriptor) {
                var wizardPreButtonElement = _this.view.tmpl(wizardPreButtonTemplateDescriptor, {});
                wizardPreButtonElement.attr("id", stepName + '-button-pre');
                wizardPreButtonElement.addClass("alpaca-wizard-button-pre");
                if (_this.buttonBeautifier) {
                    _this.buttonBeautifier.call(_this, wizardPreButtonElement, this.wizardPreIcon,true );
                }

                // when they click "prev", run validation function first to make sure they're allowed to proceed
                wizardPreButtonElement.click(function(stepName, stepCount, validationFunction) {

                    return function() {
                        var valid = true;

                        if (validationFunction)
                        {
                            valid = validationFunction(stepName, stepCount);
                        }

                        if (valid) {
                            $("#" + stepName).hide();
                            $("#step" + (i - 1)).show();
                            _this._selectStep(i - 1);

                            // TODO: fire click handler?
                            if (_this.wizardConfigs.buttons.prev && _this.wizardConfigs.buttons.prev.onClick) {
                                _this.wizardConfigs.buttons.prev.onClick();
                            }
                        }

                        return false;
                    };
                }(stepName, i, validationFunction));

                $("#" + stepName + "-nav-bar").append(wizardPreButtonElement);
                if (clear) {
                    $("#" + stepName + "-nav-bar").parent().append("<div style='clear:both'></div>");
                }
            }

        },

        /**
         * Creates a "next" button.
         *
         * @param {Integer} i Step number.
         * @param [boolean] whether to add a clear div at the end
         * @param [validationFunction] function test whether the button should be allowed to proceed
         */
        _createNextButton: function(i, clear, validationFunction) {

            // only apply validation if configured to do so
            if (this.wizardConfigs.buttons && this.wizardConfigs.buttons.next) {
                if (!this.wizardConfigs.buttons.next.validateOnClick) {
                    validationFunction = null;
                }
            }

            var stepName = "step" + i;
            var _this = this;

            var wizardNextButtonTemplateDescriptor = this.view.getTemplateDescriptor("wizardNextButton");
            if (wizardNextButtonTemplateDescriptor) {
                var wizardNextButtonElement = _this.view.tmpl(wizardNextButtonTemplateDescriptor, {});
                wizardNextButtonElement.attr("id", stepName + '-button-next');
                wizardNextButtonElement.addClass("alpaca-wizard-button-next");
                if (_this.buttonBeautifier) {
                    _this.buttonBeautifier.call(_this, wizardNextButtonElement, this.wizardNextIcon,true );
                }

                // when they click "next", run validation function first to make sure they're allowed to proceed
                wizardNextButtonElement.click(function(stepName, stepCount, validationFunction) {

                    return function() {
                        var valid = true;

                        if (validationFunction)
                        {
                            valid = validationFunction(stepName, stepCount);
                        }

                        if (valid) {
                            $("#" + stepName).hide();
                            $("#step" + (stepCount + 1)).show();
                            _this._selectStep(stepCount + 1);

                            // TODO: fire click handler?
                            if (_this.wizardConfigs.buttons.next && _this.wizardConfigs.buttons.next.onClick) {
                                _this.wizardConfigs.buttons.next.onClick();
                            }
                        }

                        return false;
                    };
                }(stepName, i, validationFunction));

                $("#" + stepName + "-nav-bar").append(wizardNextButtonElement);
                if (clear) {
                    $("#" + stepName + "-nav-bar").parent().append("<div style='clear:both'></div>");
                }
            }
        },

        /**
         * Creates a "done" button.
         *
         * @param {Integer} i Step number.
         * @param [boolean] whether to add a clear div at the end
         * @param [validationFunction] function test whether the button should be allowed to proceed
         */
        _createDoneButton: function(i, clear, validationFunction) {

            // only apply validation if configured to do so
            if (this.wizardConfigs.buttons && this.wizardConfigs.buttons.done) {
                if (!this.wizardConfigs.buttons.done.validateOnClick) {
                    validationFunction = null;
                }
            }

            var stepName = "step" + i;
            var _this = this;

            var wizardDoneButtonTemplateDescriptor = this.view.getTemplateDescriptor("wizardDoneButton");
            if (wizardDoneButtonTemplateDescriptor) {
                var wizardDoneButtonElement = _this.view.tmpl(wizardDoneButtonTemplateDescriptor, {});
                wizardDoneButtonElement.attr("id", stepName + '-button-done');
                wizardDoneButtonElement.addClass("alpaca-wizard-button-done");
                if (_this.buttonBeautifier) {
                    _this.buttonBeautifier.call(_this, wizardDoneButtonElement, this.wizardDoneIcon,true );
                }

                // when they click "done", run validation function first to make sure they're allowed to proceed
                wizardDoneButtonElement.click(function(stepName, stepCount, validationFunction) {

                    return function() {
                        var valid = true;

                        if (validationFunction)
                        {
                            valid = validationFunction(stepName, stepCount);
                        }

                        if (valid) {
                            $("#" + stepName + "-nav-bar").append(wizardDoneButtonElement);
                            if (clear) {
                                $("#" + stepName + "-nav-bar").parent().append("<div style='clear:both'></div>");
                            }

                            // TODO: fire click handler?
                            if (_this.wizardConfigs.buttons.done && _this.wizardConfigs.buttons.done.onClick) {
                                _this.wizardConfigs.buttons.done.onClick();
                            }
                        }

                        return false;
                    };
                }(stepName, i, validationFunction));

                $("#" + stepName + "-nav-bar").append(wizardDoneButtonElement);
                if (clear) {
                    $("#" + stepName + "-nav-bar").parent().append("<div style='clear:both'></div>");
                }
            }

        },

        /**
         * Selects a wizard step.
         *
         * @param {Integer} i Step number.
         */
        _selectStep: function(i) {
            var unCurrentStepElem = $("#" + this.getId() + "-wizard-status-bar" + " li");
            unCurrentStepElem.removeClass("current current-has-next");
            this.getStyleInjection("wizardUnCurrentStep",unCurrentStepElem);
            var currentStepElem = $("#stepDesc" + i);
            currentStepElem.addClass("current");
            this.getStyleInjection("wizardCurrentStep",currentStepElem);
            if (i < this.totalSteps - 1) {
                $("#stepDesc" + i).addClass("current-has-next");
            }
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.ContainerField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var properties = {
                "properties": {
                    "properties": {
                        "title": "Properties",
                        "description": "List of child properties.",
                        "type": "object"
                    },
                    "maxProperties": {
                        "type": "number",
                        "title": "Maximum Number Properties",
                        "description": "The maximum number of properties that this object is allowed to have"
                    },
                    "minProperties": {
                        "type": "number",
                        "title": "Minimum Number of Properties",
                        "description": "The minimum number of properties that this object is required to have"
                    }
                }
            };

            var fieldsProperties = properties.properties.properties;

            fieldsProperties.properties = {};

            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    var propertyId = this.children[i].propertyId;
                    fieldsProperties.properties[propertyId] = this.children[i].getSchemaOfSchema();
                    fieldsProperties.properties[propertyId].title = propertyId + " :: " + fieldsProperties.properties[propertyId].title;
                }
            }

            return Alpaca.merge(this.base(), properties);
        },

        /**
         * @private
         * @see Alpaca.ContainerField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            var schemaOfOptions = Alpaca.merge(this.base(), {
                "properties": {
                }
            });

            var properties = {
                "properties": {
                    "fields": {
                        "title": "Field Options",
                        "description": "List of options for child fields.",
                        "type": "object"
                    }
                }
            };

            var fieldsProperties = properties.properties.fields;

            fieldsProperties.properties = {};

            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    var propertyId = this.children[i].propertyId;
                    fieldsProperties.properties[propertyId] = this.children[i].getSchemaOfOptions();
                    fieldsProperties.properties[propertyId].title = propertyId + " :: " + fieldsProperties.properties[propertyId].title;
                }
            }

            return Alpaca.merge(schemaOfOptions, properties);
        },

        /**
         * @see Alpaca.Field#getTitle
         */
        getTitle: function() {
            return "Object Field";
        },

        /**
         * @see Alpaca.Field#getDescription
         */
        getDescription: function() {
            return "Object field for containing other fields";
        },

        /**
         * @see Alpaca.Field#getType
         */
        getType: function() {
            return "object";
        },

        /**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "object";
        }//__END_OF_BUILDER_HELPERS

    });

    // Additional Registrations
    Alpaca.registerMessages({
        "tooManyProperties": "The maximum number of properties ({0}) has been exceeded.",
        "tooFewProperties": "There are not enough properties ({0} are required)"
    });

    Alpaca.registerFieldClass("object", Alpaca.Fields.ObjectField);
    Alpaca.registerDefaultSchemaFieldMapping("object", "object");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.AnyField = Alpaca.ControlField.extend(
    /**
     * @lends Alpaca.Fields.AnyField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ControlField
         *
         * @class Basic field control for JSON schema any type. This control should be used with additional options parameter
         * for combo fields. Without options parameter it will simply render a text field.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Field#setup
         */
        setup: function() {
            this.base();

            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldAny");
        },

        /**
         * @see Alpaca.ControlField#renderField
         */
        renderField: function(onSuccess) {

            if (this.controlFieldTemplateDescriptor) {
                this.field = this.view.tmpl(this.controlFieldTemplateDescriptor, {
                    "id": this.getId(),
                    "name": this.name,
                    "options": this.options
                });
                this.injectField(this.field);
            }

            if (onSuccess) {
                onSuccess();
            }
        },

        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function() {
            return this.field.val();
        },

        /**
         * @see Alpaca.Field#setValue
         */
        setValue: function(value) {
            if (Alpaca.isEmpty(value)) {
                this.field.val("");
            } else {
                this.field.val(value);
            }
            // be sure to call into base method
            this.base(value);
        },

        /**
         * @see Alpaca.ControlField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();
            return baseStatus;
        },

        /**
         * @see Alpaca.Field#disable
         */
        disable: function() {
            this.field.disabled = true;
        },

        /**
         * @see Alpaca.Field#enable
         */
        enable: function() {
            this.field.disabled = false;
        },

        /**
         * @see Alpaca.Field#focus
         */
        focus: function() {
            this.field.focus();
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                }
            });
        },

        /**
         * @see Alpaca.Field#getTitle
         */
        getTitle: function() {
            return "Any Field";
        },

        /**
         * @see Alpaca.Field#getDescription
         */
        getDescription: function() {
            return "Any field.";
        },

        /**
         * @see Alpaca.Field#getType
         */
        getType: function() {
            return "any";
        },

        /**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "any";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerTemplate("controlFieldAny", '<input type="text" id="${id}" size="20" {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerFieldClass("any", Alpaca.Fields.AnyField);
    Alpaca.registerDefaultSchemaFieldMapping("any", "any");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.HiddenField = Alpaca.ControlField.extend(
    /**
     * @lends Alpaca.Fields.ControlField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.ControlField
         *
         * @class Basic Control for Hidden field
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Field#setup
         */
        setup: function() {
            this.base();

            if (!this.options.size) {
                this.options.size = 20;
            }

            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldHidden");
        },

        /**
         * @see Alpaca.ControlField#renderField
         */
        renderField: function(onSuccess) {

            var _this = this;

            if (this.controlFieldTemplateDescriptor) {

                this.field = _this.view.tmpl(this.controlFieldTemplateDescriptor, {
                    "id": this.getId(),
                    "name": this.name,
                    "options": this.options
                });
                this.injectField(this.field);
            }

            if (onSuccess) {
                onSuccess();
            }
        },

        /**
         * @see Alpaca.ControlField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-hidden');
                }

                callback();
            });

        },

        
        /**
         * @see Alpaca.Field#getValue
         */
        getValue: function() {
            return this.field.val();
        },
        
        /**
         * @see Alpaca.Field#setValue
         */
        setValue: function(value) {
            if (Alpaca.isEmpty(value)) {
                this.field.val("");
            } else {
                this.field.val(value);
            }
            
            // be sure to call into base method
            this.base(value);
        },

        /**
         * @see Alpaca.Field#getTitle
         */
        getTitle: function() {
            return "Hidden";
        },
        
        /**
         * @see Alpaca.Field#getDescription
         */
        getDescription: function() {
            return "Field for a hidden HTML input";
        },
        
        /**
         * @see Alpaca.Field#getType
         */
        getType: function() {
            return "string";
        },
		
        /**
         * @see Alpaca.Field#getFieldType
         */
        getFieldType: function() {
            return "hidden";
        }//__END_OF_BUILDER_HELPERS
        
    });

    Alpaca.registerTemplate("controlFieldHidden", '<input type="hidden" id="${id}" {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerFieldClass("hidden", Alpaca.Fields.HiddenField);

})(jQuery);
(function($) {

	var Alpaca = $.alpaca;

	Alpaca.registerView ({
		"id": "VIEW_BASE",
		"messages": {
			"zh_CN": {
				required: "&#27492;&#22495;&#24517;&#39035;",
				invalid: "&#27492;&#22495;&#19981;&#21512;&#26684;",
				months: ["&#19968;&#26376;", "&#20108;&#26376;", "&#19977;&#26376;", "&#22235;&#26376;", "&#20116;&#26376;", "&#20845;&#26376;", "&#19971;&#26376;", "&#20843;&#26376;", "&#20061;&#26376;", "&#21313;&#26376;", "&#21313;&#19968;&#26376;", "&#21313;&#20108;&#26376;"],
				timeUnits: {
					SECOND: "&#31186;",
					MINUTE: "&#20998;",
					HOUR: "&#26102;",
					DAY: "&#26085;",
					MONTH: "&#26376;",
					YEAR: "&#24180;"
				},
				"notOptional": "&#27492;&#22495;&#38750;&#20219;&#36873;",
				"disallowValue": "&#38750;&#27861;&#36755;&#20837;&#21253;&#25324; {0}.",
				"invalidValueOfEnum": "&#20801;&#35768;&#36755;&#20837;&#21253;&#25324; {0}.",
				"notEnoughItems": "&#26368;&#23567;&#20010;&#25968; {0}",
				"tooManyItems": "&#26368;&#22823;&#20010;&#25968; {0}",
				"valueNotUnique": "&#36755;&#20837;&#20540;&#19981;&#29420;&#29305;",
				"notAnArray": "&#19981;&#26159;&#25968;&#32452;",
				"invalidDate": "&#26085;&#26399;&#26684;&#24335;&#22240;&#35813;&#26159; {0}",
				"invalidEmail": "&#20234;&#22969;&#20799;&#26684;&#24335;&#19981;&#23545;, ex: info@cloudcms.com",
				"stringNotAnInteger": "&#19981;&#26159;&#25972;&#25968;.",
				"invalidIPv4": "&#19981;&#26159;&#21512;&#27861;IP&#22320;&#22336;, ex: 192.168.0.1",
				"stringValueTooSmall": "&#26368;&#23567;&#20540;&#26159; {0}",
				"stringValueTooLarge": "&#26368;&#22823;&#20540;&#26159; {0}",
				"stringValueTooSmallExclusive": "&#20540;&#24517;&#39035;&#22823;&#20110; {0}",
				"stringValueTooLargeExclusive": "&#20540;&#24517;&#39035;&#23567;&#20110; {0}",
				"stringDivisibleBy": "&#20540;&#24517;&#39035;&#33021;&#34987; {0} &#25972;&#38500;",
				"stringNotANumber": "&#19981;&#26159;&#25968;&#23383;.",
				"invalidPassword": "&#38750;&#27861;&#23494;&#30721;",
				"invalidPhone": "&#38750;&#27861;&#30005;&#35805;&#21495;&#30721;, ex: (123) 456-9999",
				"invalidPattern": "&#27492;&#22495;&#39035;&#26377;&#26684;&#24335; {0}",
				"stringTooShort": "&#27492;&#22495;&#33267;&#23569;&#38271;&#24230; {0}",
				"stringTooLong": "&#27492;&#22495;&#26368;&#22810;&#38271;&#24230; {0}"
			
			}
        }
    });

})(jQuery);
(function($) {

	var Alpaca = $.alpaca;

	Alpaca.registerView ({
		"id": "VIEW_BASE",
		"messages": {
			"es_ES": {
				required: "Este campo es obligatorio",
				invalid: "Este campo es inválido",
				months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
				timeUnits: {
					SECOND: "segundos",
					MINUTE: "minutos",
					HOUR: "horas",
					DAY: "días",
					MONTH: "meses",
					YEAR: "años"
				},
				"notOptional": "Este campo no es opcional.",
				"disallowValue": "{0} son los valores rechazados.",
				"invalidValueOfEnum": "Este campo debe tener uno de los valores adentro {0}.",
				"notEnoughItems": "El número mínimo de artículos es {0}",
				"tooManyItems": "El número máximo de artículos es {0}",
				"valueNotUnique": "Los valores no son únicos",
				"notAnArray": "Este valor no es un arsenal",
				"invalidDate": "Fecha inválida para el formato {0}",
				"invalidEmail": "Email address inválido, ex: info@cloudcms.com",
				"stringNotAnInteger": "Este valor no es un número entero.",
				"invalidIPv4": "Dirección inválida IPv4, ex: 192.168.0.1",
				"stringValueTooSmall": "El valor mínimo para este campo es {0}",
				"stringValueTooLarge": "El valor míximo para este campo es {0}",
				"stringValueTooSmallExclusive": "El valor de este campo debe ser mayor que {0}",
				"stringValueTooLargeExclusive": "El valor de este campo debe ser menos que {0}",
				"stringDivisibleBy": "El valor debe ser divisible cerca {0}",
				"stringNotANumber": "Este valor no es un número.",
				"invalidPassword": "Contraseña inválida",
				"invalidPhone": "Número de teléfono inválido, ex: (123) 456-9999",
				"invalidPattern": "Este campo debe tener patrón {0}",
				"stringTooShort": "Este campo debe contener por lo menos {0} números o caracteres",
				"stringTooLong": "Este campo debe contener a lo más {0} números o caracteres"
			}
        }
	});

})(jQuery);
(function($) {

	var Alpaca = $.alpaca;

	Alpaca.registerView ({
		"id": "VIEW_BASE",
		"messages": {
			"fr_FR": {
				required: "Ce champ est requis",
				invalid: "Ce champ est invalide",
				months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
				timeUnits: {
					SECOND: "secondes",
					MINUTE: "minutes",
					HOUR: "heures",
					DAY: "jours",
					MONTH: "mois",
					YEAR: "années"
				},
				"notOptional": "Ce champ n'est pas optionnel.",
				"disallowValue": "{0} sont des valeurs interdites.",
				"invalidValueOfEnum": "Ce champ doit prendre une des valeurs suivantes : {0}.",
				"notEnoughItems": "Le nombre minimum d'éléments est {0}",
				"tooManyItems": "Le nombre maximum d'éléments est {0}",
				"valueNotUnique": "Les valeurs sont uniques",
				"notAnArray": "Cette valeur n'est pas une liste",
				"invalidDate": "Cette date ne correspond pas au format {0}",
				"invalidEmail": "Adresse de courriel invalide, ex: info@cloudcms.com",
				"stringNotAnInteger": "Cette valeur n'est pas un nombre entier.",
				"invalidIPv4": "Adresse IPv4 invalide, ex: 192.168.0.1",
				"stringValueTooSmall": "La valeur minimale pour ce champ est {0}",
				"stringValueTooLarge": "La valeur maximale pour ce champ est {0}",
				"stringValueTooSmallExclusive": "La valeur doit-être supérieure à {0}",
				"stringValueTooLargeExclusive": "La valeur doit-être inférieure à {0}",
				"stringDivisibleBy": "La valeur doit-être divisible par {0}",
				"stringNotANumber": "Cette valeur n'est pas un nombre.",
				"invalidPassword": "Mot de passe invalide",
				"invalidPhone": "Numéro de téléphone invalide, ex: (123) 456-9999",
				"invalidPattern": "Ce champ doit correspondre au motif {0}",
                "stringTooShort": "Ce champ doit contenir au moins {0} caractères",
                "stringTooLong": "Ce champ doit contenir au plus {0} caractères"
            }
        }
    });

})(jQuery);
(function($) {

	var Alpaca = $.alpaca;

	Alpaca.registerView ({
		"id": "VIEW_BASE",
		"messages": {
            "de_AT": {
                required: "Eingabe erforderlich",
                invalid: "Eingabe invalid",
                months: ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                timeUnits: {
                    SECOND: "Sekunden",
                    MINUTE: "Minuten",
                    HOUR: "Stunden",
                    DAY: "Tage",
                    MONTH: "Monate",
                    YEAR: "Jahre"
                },
                "notOptional": "Dieses Feld ist nicht optional",
                "disallowValue": "Diese Werte sind nicht erlaubt: {0}",
                "invalidValueOfEnum": "Diese Feld sollte einen der folgenden Werte enthalten: {0}",
                "notEnoughItems": "Die Mindestanzahl von Elementen ist {0}",
                "tooManyItems": "Die Maximalanzahl von Elementen ist {0}",
                "valueNotUnique": "Diese Werte sind nicht eindeutig",
                "notAnArray": "Keine Liste von Werten",
                "invalidDate": "Falsches Datumsformat: {0}",
                "invalidEmail": "Ungültige e-Mail Adresse, z.B.: info@cloudcms.com",
                "stringNotAnInteger": "Eingabe ist keine Ganz Zahl.",
                "invalidIPv4": "Ungültige IPv4 Adresse, z.B.: 192.168.0.1",
                "stringValueTooSmall": "Die Mindestanzahl von Zeichen ist {0}",
                "stringValueTooLarge": "Die Maximalanzahl von Zeichen ist {0}",
                "stringValueTooSmallExclusive": "Die Anzahl der Zeichen muss größer sein als {0}",
                "stringValueTooLargeExclusive": "Die Anzahl der Zeichen muss kleiner sein als {0}",
                "stringDivisibleBy": "Der Wert muss durch {0} dividierbar sein",
                "stringNotANumber": "Die Eingabe ist keine Zahl",
                "invalidPassword": "Ungültiges Passwort.",
                "invalidPhone": "Ungültige Telefonnummer, z.B.: (123) 456-9999",
                "invalidPattern": "Diese Feld stimmt nicht mit folgender Vorgabe überein {0}",
                "stringTooShort": "Dieses Feld sollte mindestens {0} Zeichen enthalten",
                "stringTooLong": "Dieses Feld sollte höchstens {0} Zeichen enthalten"
            }
		}
	});

})(jQuery);
(function($) {

	var Alpaca = $.alpaca;

	Alpaca.registerView ({
		"id": "VIEW_BASE",
		"messages": {
            "pl_PL": {
                required: "To pole jest wymagane",
                invalid: "To pole jest nieprawidłowe",
                months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                timeUnits: {
                    SECOND: "sekundy",
                    MINUTE: "minuty",
                    HOUR: "godziny",
                    DAY: "dni",
                    MONTH: "miesiące",
                    YEAR: "lata"
                },
                "notOptional": "To pole nie jest opcjonalne",
                "disallowValue": "Ta wartość nie jest dozwolona: {0}",
                "invalidValueOfEnum": "To pole powinno zawierać jedną z następujących wartości: {0}",
                "notEnoughItems": "Minimalna liczba elementów wynosi {0}",
                "tooManyItems": "Maksymalna liczba elementów wynosi {0}",
                "valueNotUnique": "Te wartości nie są unikalne",
                "notAnArray": "Ta wartość nie jest tablicą",
                "invalidDate": "Niepoprawny format daty: {0}",
                "invalidEmail": "Niepoprawny adres email, n.p.: info@cloudcms.com",
                "stringNotAnInteger": "Ta wartość nie jest liczbą całkowitą",
                "invalidIPv4": "Niepoprawny adres IPv4, n.p.: 192.168.0.1",
                "stringValueTooSmall": "Minimalna wartość dla tego pola wynosi {0}",
                "stringValueTooLarge": "Maksymalna wartość dla tego pola wynosi {0}",
                "stringValueTooSmallExclusive": "Wartość dla tego pola musi być większa niż {0}",
                "stringValueTooLargeExclusive": "Wartość dla tego pola musi być mniejsza niż {0}",
                "stringDivisibleBy": "Wartość musi być podzielna przez {0}",
                "stringNotANumber": "Wartość nie jest liczbą",
                "invalidPassword": "Niepoprawne hasło",
                "invalidPhone": "Niepoprawny numer telefonu, n.p.: (123) 456-9999",
                "invalidPattern": "To pole powinno mieć format {0}",
                "stringTooShort": "To pole powinno zawierać co najmniej {0} znaków",
                "stringTooLong": "To pole powinno zawierać najwyżej {0} znaków"
            }
		}
	});

})(jQuery);/*!
Alpaca Version 1.1.3

Copyright 2014 Gitana Software, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); 
you may not use this file except in compliance with the License. 

You may obtain a copy of the License at 
	http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
See the License for the specific language governing permissions and 
limitations under the License. 

For more information, please contact Gitana Software, Inc. at this
address:

  info@gitanasoftware.com
*/
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.AddressField = Alpaca.Fields.ObjectField.extend(
    /**
     * @lends Alpaca.Fields.AddressField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.ObjectField
         *
         * @class A combo field for rendering a standard US address. It also comes up with support for Google Map
         * which would requires including Google Map JS file for the form that uses this class.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector,errorCallback) {
            this.base(container, data, options, schema, view, connector,errorCallback);
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#setup
         */
        setup: function() {
            this.base();

            this.schema = {
                "title": "Home Address",
                "type": "object",
                "properties": {
                    "street": {
                        "title": "Street",
                        "type": "array",
                        "items": {
                            "type": "string",
                            "maxLength": 30,
                            "minItems": 0,
                            "maxItems": 3
                        }
                    },
                    "city": {
                        "title": "City",
                        "type": "string"
                    },
                    "state": {
                        "title": "State",
                        "type": "string",
                        "enum": ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"]
                    },
                    "zip": {
                        "title": "Zip Code",
                        "type": "string",
                        "pattern": /^(\d{5}(-\d{4})?)?$/
                    }
                }
            };
            Alpaca.merge(this.options, {
                "fields": {
                    "zip": {
                        "maskString": "99999",
                        "size": 5
                    },
                    "state": {
                        "optionLabels": ["ALABAMA", "ALASKA", "AMERICANSAMOA", "ARIZONA", "ARKANSAS", "CALIFORNIA", "COLORADO", "CONNECTICUT", "DELAWARE", "DISTRICTOFCOLUMBIA", "FEDERATEDSTATESOFMICRONESIA", "FLORIDA", "GEORGIA", "GUAM", "HAWAII", "IDAHO", "ILLINOIS", "INDIANA", "IOWA", "KANSAS", "KENTUCKY", "LOUISIANA", "MAINE", "MARSHALLISLANDS", "MARYLAND", "MASSACHUSETTS", "MICHIGAN", "MINNESOTA", "MISSISSIPPI", "MISSOURI", "MONTANA", "NEBRASKA", "NEVADA", "NEWHAMPSHIRE", "NEWJERSEY", "NEWMEXICO", "NEWYORK", "NORTHCAROLINA", "NORTHDAKOTA", "NORTHERNMARIANAISLANDS", "OHIO", "OKLAHOMA", "OREGON", "PALAU", "PENNSYLVANIA", "PUERTORICO", "RHODEISLAND", "SOUTHCAROLINA", "SOUTHDAKOTA", "TENNESSEE", "TEXAS", "UTAH", "VERMONT", "VIRGINISLANDS", "VIRGINIA", "WASHINGTON", "WESTVIRGINIA", "WISCONSIN", "WYOMING"]
                    }
                }
            });

            if (Alpaca.isEmpty(this.options.addressValidation)) {
                this.options.addressValidation = true;
            }
        },

        /**
         * Returns address in a single line string.
         *
         * @returns {String} Address as a single line string.
         */
        getAddress: function() {
            var value = this.getValue();
            if (this.view.type == "view") {
                value = this.data;
            }
            var address = "";
            if (value) {
                if (value.street) {
                    $.each(value.street, function(index, value) {
                        address += value + " ";
                    });
                }
                if (value.city) {
                    address += value.city + " ";
                }
                if (value.state) {
                    address += value.state + " ";
                }
                if (value.zip) {
                    address += value.zip;
                }
            }
            return address;
        },

        /**
         * @see Alpaca.Field#renderField
         */
        renderField: function(onSuccess) {

            var self = this;

            this.base(function() {

                // apply additional css
                $(self.fieldContainer).addClass("alpaca-addressfield");

                if (self.options.addressValidation && !self.isDisplayOnly()) {
                    $('<div style="clear:both;"></div>').appendTo(self.fieldContainer);
                    var mapButton = $('<div class="alpaca-form-button">Google Map</div>').appendTo(self.fieldContainer);
                    if (mapButton.button) {
                        mapButton.button({
                            text: true
                        });
                    }
                    mapButton.click(
                        function() {
                            if (google && google.maps) {
                                var geocoder = new google.maps.Geocoder();
                                var address = self.getAddress();
                                if (geocoder) {
                                    geocoder.geocode({
                                        'address': address
                                    }, function(results, status) {
                                        if (status == google.maps.GeocoderStatus.OK) {
                                            var mapCanvasId = self.getId() + "-map-canvas";
                                            if ($('#' + mapCanvasId).length === 0) {
                                                $("<div id='" + mapCanvasId + "' class='alpaca-controlfield-address-mapcanvas'></div>").appendTo(self.fieldContainer);
                                            }
                                            var map = new google.maps.Map(document.getElementById(self.getId() + "-map-canvas"), {
                                                "zoom": 10,
                                                "center": results[0].geometry.location,
                                                "mapTypeId": google.maps.MapTypeId.ROADMAP
                                            });
                                            var marker = new google.maps.Marker({
                                                map: map,
                                                position: results[0].geometry.location
                                            });
                                        } else {
                                            self.displayMessage("Geocoding failed: " + status);
                                        }
                                    });
                                }
                            } else {
                                self.displayMessage("Google Map API is not installed.");
                            }
                        }).wrap('<small/>');

                    if (self.options.showMapOnLoad)
                    {
                        mapButton.click();
                    }
                }

                if (onSuccess) {
                    onSuccess();
                }
            });

        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Field#isContainer
         */
        isContainer: function() {
            return false;
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "validateAddress": {
                        "title": "Address Validation",
                        "description": "Enable address validation if true",
                        "type": "boolean",
                        "default": true
                    },
                    "showMapOnLoad": {
                        "title": "Whether to show the map when first loaded",
                        "type": "boolean"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "validateAddress": {
                        "helper": "Address validation if checked",
                        "rightLabel": "Enable Google Map for address validation?",
                        "type": "checkbox"
                    }
                }
            });
        },
        /**
         * @see Alpaca.Fields.ObjectField#getTitle
         */
        getTitle: function() {
            return "Address";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getDescription
         */
        getDescription: function() {
            return "Standard US Address with Street, City, State and Zip. Also comes with support for Google map.";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getType
         */
        getType: function() {
            return "any";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getFieldType
         */
        getFieldType: function() {
            return "address";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("address", Alpaca.Fields.AddressField);
})(jQuery);
(function($) {

    var round = (function() {
        var strategies = {
            up:      Math.ceil,
            down:    function(input) { return ~~input; },
            nearest: Math.round
        };
        return function(strategy) {
            return strategies[strategy];
        };
    })();

    var Alpaca = $.alpaca;

    Alpaca.Fields.CurrencyField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.CurrencyField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Currency Control
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            options = options || {};

            var pfOptionsSchema = this.getSchemaOfPriceFormatOptions().properties;
            for (var i in pfOptionsSchema) {
                var option = pfOptionsSchema[i];
                if (!(i in options)) {
                    options[i] = option["default"] || undefined;
                }
            }

            data = "" + parseFloat(data).toFixed(options.centsLimit);

            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                $(self.field).priceFormat(self.options);

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#getValue
         */
        getValue: function() {
            var field = this.field;
            var val   = $(field).is('input') ? field.val() : field.hmtl();
            if (this.options.unmask || this.options.round !== "none") {
                var unmasked = (function() {
                    var result = '';
                    for (var i in val) {
                        var cur = val[i];
                        if (!isNaN(cur)) {
                            result += cur;
                        } else if (cur === this.options.centsSeparator) {
                            result += '.';
                        }
                    }
                    return parseFloat(result);
                }).bind(this)();
                if (this.options.round !== "none") {
                    unmasked = round(this.options.round)(unmasked);
                    if (!this.options.unmask) {
                        var result = [];
                        var unmaskedString = "" + unmasked;
                        for (var i = 0, u = 0; i < val.length; i++) {
                            if (!isNaN(val[i])) {
                                result.push(unmaskedString[u++] || 0)
                            } else {
                                result.push(val[i]);
                            }
                        }
                        return result.join('');
                    }
                }
                return unmasked;
            } else {
                return val;
            }
        },//__BUILDER_HELPERS

        getSchemaOfPriceFormatOptions: function() {
            return {
                "properties": {
                    "allowNegative": {
                        "title": "Allow Negative",
                        "description": "Determines if negative numbers are allowed.",
                        "type": "boolean",
                        "default": false
                    },
                    "centsLimit": {
                        "title": "Cents Limit",
                        "description": "The limit of fractional digits.",
                        "type": "number",
                        "default": 2,
                        "minimum": 0
                    },
                    "centsSeparator": {
                        "title": "Cents Separator",
                        "description": "The separator between whole and fractional amounts.",
                        "type": "text",
                        "default": "."
                    },
                    "clearPrefix": {
                        "title": "Clear Prefix",
                        "description": "Determines if the prefix is cleared on blur.",
                        "type": "boolean",
                        "default": false
                    },
                    "clearSuffix": {
                        "title": "Clear Suffix",
                        "description": "Determines if the suffix is cleared on blur.",
                        "type": "boolean",
                        "default": false
                    },
                    "insertPlusSign": {
                        "title": "Plus Sign",
                        "description": "Determines if a plus sign should be inserted for positive values.",
                        "type": "boolean",
                        "default": false
                    },
                    "limit": {
                        "title": "Limit",
                        "description": "A limit of the length of the field.",
                        "type": "number",
                        "default": undefined,
                        "minimum": 0
                    },
                    "prefix": {
                        "title": "Prefix",
                        "description": "The prefix if any for the field.",
                        "type": "text",
                        "default": "$"
                    },
                    "round": {
                        "title": "Round",
                        "description": "Determines if the field is rounded. (Rounding is done when getValue is called and is not reflected in the UI)",
                        "type": "string",
                        "enum": [ "up", "down", "nearest", "none" ],
                        "default": "none"
                    },
                    "suffix": {
                        "title": "Suffix",
                        "description": "The suffix if any for the field.",
                        "type": "text",
                        "default": ""
                    },
                    "thousandsSeparator": {
                        "title": "Thousands Separator",
                        "description": "The separator between thousands.",
                        "type": "string",
                        "default": ","
                    },
                    "unmask": {
                        "title": "Unmask",
                        "description": "If true then the resulting value for this field will be unmasked.  That is, the resulting value will be a float instead of a string (with the prefix, suffix, etc. removed).",
                        "type": "boolean",
                        "default": true
                    }
                }
            };
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), this.getSchemaOfPriceFormatOptions());
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "allowNegative": {
                        "type": "checkbox"
                    },
                    "centsLimit": {
                        "type": "number"
                    },
                    "centsSeparator": {
                        "type": "text"
                    },
                    "clearPrefix": {
                        "type": "checkbox"
                    },
                    "clearSuffix": {
                        "type": "checkbox"
                    },
                    "insertPlusSign": {
                        "type": "checkbox"
                    },
                    "limit": {
                        "type": "number"
                    },
                    "prefix": {
                        "type": "text"
                    },
                    "round": {
                        "type": "select"
                    },
                    "suffix": {
                        "type": "text"
                    },
                    "thousandsSeparator": {
                        "type": "string"
                    },
                    "unmask": {
                        "type": "checkbox"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Currency Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Provides an automatically formatted and configurable input for entering currency amounts.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "currency";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("currency", Alpaca.Fields.CurrencyField);

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.DateField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.DateField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Date control for JSON schema date format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            this.base();

            if (!this.options.dateFormat) {
                this.options.dateFormat = Alpaca.defaultDateFormat;
            }
            if (!this.options.dateFormatRegex) {
                this.options.dateFormatRegex = Alpaca.regexps.date;
            }
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.field && $.datepicker)
                {
                    var datePickerOptions = self.options.datepicker;
                    if (!datePickerOptions)
                    {
                        datePickerOptions = {
                            "changeMonth": true,
                            "changeYear": true
                        };
                    }
                    if (!datePickerOptions.dateFormat)
                    {
                        datePickerOptions.dateFormat = self.options.dateFormat;
                    }
                    self.field.datepicker(datePickerOptions);

                    if (self.fieldContainer) {
                        self.fieldContainer.addClass('alpaca-controlfield-date');
                    }
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Field#onChange
         */
        onChange: function(e) {
            this.base();
            this.refreshValidationState();
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateDateFormat();
            valInfo["invalidDate"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("invalidDate"), [this.options.dateFormat]),
                "status": status
            };

            return baseStatus && valInfo["invalidDate"]["status"];
        },

        /**
         * Validates date format.
         * @returns {Boolean} True if it is a valid date, false otherwise.
         */
        _validateDateFormat: function() {
            var value = this.getValue();

            if ($.datepicker) {
                try {
                    $.datepicker.parseDate(this.options.dateFormat, value);
                    return true;
                } catch(e) {
                    return false;
                }
            } else {
                //validate the date without the help of datepicker.parseDate
                return value.match(this.options.dateFormatRegex);
            }
        },

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {
            // skip out if no date
            if (val === "") {
                this.base(val);
                return;
            }

            this.base(val);
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
                        "default":"date",
                        "enum" : ["date"],
                        "readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "dateFormat": {
                        "title": "Date Format",
                        "description": "Date format",
                        "type": "string",
                        "default": Alpaca.defaultDateFormat
                    },
                    "dateFormatRegex": {
                        "title": "Format Regular Expression",
                        "description": "Regular expression for validation date format",
                        "type": "string",
                        "default": Alpaca.regexps.date
                    },
                    "datepicker": {
                        "title": "Date Picker options",
                        "description": "Optional configuration to be passed to jQuery UI DatePicker control",
                        "type": "any"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "dateFormat": {
                        "type": "text"
                    },
                    "dateFormatRegex": {
                        "type": "text"
                    },
                    "datetime": {
                        "type": "any"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Date Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Date Field.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "date";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidDate": "Invalid date for format {0}"
    });
    Alpaca.registerFieldClass("date", Alpaca.Fields.DateField);
    Alpaca.registerDefaultFormatFieldMapping("date", "date");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.DatetimeField = Alpaca.Fields.TextField.extend(
        /**
         * @lends Alpaca.Fields.DatetimeField.prototype
         */
        {
            /**
             * @constructs
             * @augments Alpaca.Fields.ObjectField
             *
             * @class A combo field for rendering a standard US range. It also comes up with support for Google Map
             * which would requires including Google Map JS file for the form that uses this class.
             *
             * @param {Object} container Field container.
             * @param {Any} data Field data.
             * @param {Object} options Field options.
             * @param {Object} schema Field schema.
             * @param {Object|String} view Field view.
             * @param {Alpaca.Connector} connector Field connector.
             * @param {Function} errorCallback Error callback.
             */
            constructor: function(container, data, options, schema, view, connector, errorCallback) {
                this.base(container, data, options, schema, view, connector, errorCallback);
            },

            /**
             * @see Alpaca.Fields.TextField#setup
             */
            /**
             * @private
             * @see Alpaca.Fields.ObjectField#setup
             */
            setup: function() {
                this.base();
            },

            /**
             * @see Alpaca.Fields.TextField#postRender
             */
            postRender: function(callback) {

                var self = this;

                this.base(function() {

                    if (self.field)
                    {
                        if (self.field.datetimepicker) {
                            self.field.hover(function() {
                                if (!$(this).hasClass('hasDatepicker')) {

                                    var timePickerOptions = self.options.timepicker;
                                    if (!timePickerOptions)
                                    {
                                        timePickerOptions = self.options.timepicker;
                                    }
                                    if (!timePickerOptions)
                                    {
                                        timePickerOptions = {
                                            "changeYear": true,
                                            "changeMonth": true
                                        };
                                    }
                                    $(this).datetimepicker(timePickerOptions);
                                }
                            });
                            if (self.fieldContainer) {
                                self.fieldContainer.addClass('alpaca-controlfield-datetime');
                            }
                        }
                    }

                    callback();

                });
            },

            /**
             *@see Alpaca.Fields.TextField#setValue
             */
            setValue: function(value) {
                if (value) {
                    if (Alpaca.isNumber()) {
                        value = new Date(value);
                    }
                    if (Object.prototype.toString.call(value) == "[object Date]") {
                        this.base((value.getMonth() + 1) + "/" + value.getDate() + "/" + value.getFullYear() + " " + value.getHours() + ":" + value.getMinutes());
                    } else {
                        this.base(value);
                    }
                } else {
                    this.base(value);
                }
            },

            /**
             * @see Alpaca.Fields.TextField#getValue
             */
            getValue: function() {
                return this.base();
            },

            /**
             * Returns field value in datetime.
             *
             * @returns {Date} Field value.
             */
            getDatetime: function() {
                try {
                    return this.field.datetimepicker('getDate');
                } catch (e) {
                    return this.getValue();
                }
            },//__BUILDER_HELPERS

            /**
             * @private
             * @see Alpaca.ControlField#getSchemaOfOptions
             */
            getSchemaOfOptions: function() {
                return Alpaca.merge(this.base(), {
                    "properties": {
                        "timepicker": {
                            "title": "Timepicker options",
                            "description": "Options that are supported by the <a href='http://trentrichardson.com/examples/timepicker/'>jQuery timepicker addon</a>.",
                            "type": "any"
                        }
                    }
                });
            },

            /**
             * @private
             * @see Alpaca.ControlField#getOptionsForOptions
             */
            getOptionsForOptions: function() {
                return Alpaca.merge(this.base(), {
                    "fields": {
                        "timepicker": {
                            "type": "any"
                        }
                    }
                });
            },

            /**
             * @see Alpaca.Fields.TextField#getTitle
             */
            getTitle: function() {
                return "Datetime Field";
            },

            /**
             * @see Alpaca.Fields.TextField#getDescription
             */
            getDescription: function() {
                return "Datetime Field based on Trent Richardson's <a href='http://trentrichardson.com/examples/timepicker/'>jQuery timepicker addon</a>.";
            },

            /**
             * @see Alpaca.Fields.TextField#getFieldType
             */
            getFieldType: function() {
                return "datetime";
            }//__END_OF_BUILDER_HELPERS
        });

    Alpaca.registerFieldClass("datetime", Alpaca.Fields.DatetimeField);

    // "datetime" is legacy (pre v4 schema)
    Alpaca.registerDefaultFormatFieldMapping("datetime", "datetime");

    // official v4 uses date-time
    Alpaca.registerDefaultFormatFieldMapping("date-time", "datetime");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.EditorField = Alpaca.Fields.TextField.extend(
        /**
         * @lends Alpaca.Fields.EditorField.prototype
         */
        {
            /**
             * @constructs
             * @augments Alpaca.Fields.TextField
             *
             * @class Textarea control for chunk of text.
             *
             * @param {Object} container Field container.
             * @param {Any} data Field data.
             * @param {Object} options Field options.
             * @param {Object} schema Field schema.
             * @param {Object|String} view Field view.
             * @param {Alpaca.Connector} connector Field connector.
             * @param {Function} errorCallback Error callback.
             */
            constructor: function(container, data, options, schema, view, connector, errorCallback) {
                this.base(container, data, options, schema, view, connector, errorCallback);
            },

            /**
             * @see Alpaca.Fields.TextField#setup
             */
            setup: function() {
                this.base();

                this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldEditor");
            },

            /**
             * @see Alpaca.Fields.TextField#postRender
             */
            postRender: function(callback) {

                var self = this;

                this.base(function() {

                    if (self.fieldContainer)
                    {
                        self.fieldContainer.addClass('alpaca-controlfield-editor');

                        // set field container parent width = 100%
                        $(self.fieldContainer).parent().css("width", "100%");

                        // ACE HEIGHT
                        var aceHeight = self.options.aceHeight;
                        if (aceHeight)
                        {
                            $(self.fieldContainer).css("height", aceHeight);
                        }

                        // ACE WIDTH
                        var aceWidth = self.options.aceWidth;
                        if (!aceWidth) {
                            aceWidth = "100%";
                        }
                        $(self.fieldContainer).css("width", aceWidth);
                    }

                    // locate where we will insert the editor
                    var el = $(self.fieldContainer).find(".control-field-editor-el")[0];

                    // ace must be included ahead of time
                    if (!ace && window.ace) {
                        ace = window.ace;
                    }

                    if (!ace)
                    {
                        Alpaca.logError("Editor Field is missing the 'ace' Cloud 9 Editor");
                    }
                    else
                    {
                        self.editor = ace.edit(el);

                        // theme
                        var aceTheme = self.options.aceTheme;
                        if (!aceTheme) {
                            aceTheme = "ace/theme/chrome";
                        }
                        self.editor.setTheme(aceTheme);

                        // mode
                        var aceMode = self.options.aceMode;
                        if (!aceMode) {
                            aceMode = "ace/mode/json";
                        }
                        self.editor.getSession().setMode(aceMode);

                        self.editor.renderer.setHScrollBarAlwaysVisible(false);
                        //this.editor.renderer.setVScrollBarAlwaysVisible(false); // not implemented
                        self.editor.setShowPrintMargin(false);

                        // set data onto editor
                        self.editor.setValue(self.data);
                        self.editor.clearSelection();

                        // clear undo session
                        self.editor.getSession().getUndoManager().reset();

                        // FIT-CONTENT the height of the editor to the contents contained within
                        if (self.options.aceFitContentHeight)
                        {
                            var heightUpdateFunction = function() {

                                var first = false;
                                if (self.editor.renderer.lineHeight === 1)
                                {
                                    first = true;
                                    self.editor.renderer.lineHeight = 16;
                                }

                                // http://stackoverflow.com/questions/11584061/
                                var newHeight = self.editor.getSession().getScreenLength() * self.editor.renderer.lineHeight + self.editor.renderer.scrollBar.getWidth();

                                $(self.fieldContainer).height(newHeight.toString() + "px");

                                // This call is required for the editor to fix all of
                                // its inner structure for adapting to a change in size
                                self.editor.resize();

                                if (first)
                                {
                                    window.setTimeout(function() {
                                        self.editor.clearSelection();
                                    }, 5);
                                }
                            };

                            // Set initial size to match initial content
                            heightUpdateFunction();

                            // Whenever a change happens inside the ACE editor, update
                            // the size again
                            self.editor.getSession().on('change', heightUpdateFunction);
                        }

                        // READONLY
                        if (self.schema.readonly)
                        {
                            self.editor.setReadOnly(true);
                        }

                        // if the editor's dom element gets destroyed, make sure we clean up the editor instance
                        // normally, we expect Alpaca fields to be destroyed by the destroy() method but they may also be
                        // cleaned-up via the DOM, thus we check here.
                        $(el).bind('destroyed', function() {

                            if (self.editor) {
                                self.editor.destroy();
                                self.editor = null;
                            }
                        });
                    }

                    callback();
                });

            },

            /**
             * @see Alpaca.Field#destroy
             */
            destroy: function() {

                // destroy the editor instance
                if (this.editor)
                {
                    this.editor.destroy();
                    this.editor = null;
                }

                // call up to base method
                this.base();
            },

            /**
             * @return the ACE editor instance
             */
            getEditor: function()
            {
                return this.editor;
            },

            /**
             * @see Alpaca.ControlField#handleValidate
             */
            handleValidate: function() {
                var baseStatus = this.base();

                var valInfo = this.validation;

                var wordCountStatus =  this._validateWordCount();
                valInfo["wordLimitExceeded"] = {
                    "message": wordCountStatus ? "" : Alpaca.substituteTokens(this.view.getMessage("wordLimitExceeded"), [this.options.wordlimit]),
                    "status": wordCountStatus
                };

                var editorAnnotationsStatus = this._validateEditorAnnotations();
                valInfo["editorAnnotationsExist"] = {
                    "message": editorAnnotationsStatus ? "" : this.view.getMessage("editorAnnotationsExist"),
                    "status": editorAnnotationsStatus
                };

                return baseStatus && valInfo["wordLimitExceeded"]["status"] && valInfo["editorAnnotationsExist"]["status"];
            },

            _validateEditorAnnotations: function() {

                if (this.editor)
                {
                    var annotations = this.editor.getSession().getAnnotations();
                    if (annotations && annotations.length > 0)
                    {
                        return false;
                    }
                }

                return true;
            },

            /**
             * Validate for word limit.
             *
             * @returns {Boolean} True if the number of words is equal to or less than the word limit.
             */
            _validateWordCount: function() {

                if (this.options.wordlimit && this.options.wordlimit > -1)
                {
                    var val = this.editor.getValue();

                    if (val)
                    {
                        var wordcount = val.split(" ").length;
                        if (wordcount > this.options.wordlimit)
                        {
                            return false;
                        }
                    }
                }

                return true;
            },

            /**
             * Force editor to resize to ensure it gets drawn correctly.
             * @override
             */
            onDependentReveal: function()
            {
                if (this.editor)
                {
                    this.editor.resize();
                }
            },

            /**
             *@see Alpaca.Fields.TextField#setValue
             */
            setValue: function(value) {

                var self = this;

                if (this.editor)
                {
                    this.editor.setValue(value);
                }

                // be sure to call into base method
                this.base(value);
            },

            /**
             * @see Alpaca.Fields.TextField#getValue
             */
            getValue: function() {

                var value = null;

                if (this.editor)
                {
                    value = this.editor.getValue();
                }

                return value;
            },//__BUILDER_HELPERS

            /**
             * @private
             * @see Alpaca.Fields.TextField#getSchemaOfOptions
             */
            getSchemaOfOptions: function() {
                return Alpaca.merge(this.base(), {
                    "properties": {
                        "aceTheme": {
                            "title": "ACE Editor Theme",
                            "description": "Specifies the theme to set onto the editor instance",
                            "type": "string",
                            "default": "ace/theme/twilight"
                        },
                        "aceMode": {
                            "title": "ACE Editor Mode",
                            "description": "Specifies the mode to set onto the editor instance",
                            "type": "string",
                            "default": "ace/mode/javascript"
                        },
                        "aceWidth": {
                            "title": "ACE Editor Height",
                            "description": "Specifies the width of the wrapping div around the editor",
                            "type": "string",
                            "default": "100%"
                        },
                        "aceHeight": {
                            "title": "ACE Editor Height",
                            "description": "Specifies the height of the wrapping div around the editor",
                            "type": "string",
                            "default": "300px"
                        },
                        "aceFitContentHeight": {
                            "title": "ACE Fit Content Height",
                            "description": "Configures the ACE Editor to auto-fit its height to the contents of the editor",
                            "type": "boolean",
                            "default": false
                        },
                        "wordlimit": {
                            "title": "Word Limit",
                            "description": "Limits the number of words allowed in the text area.",
                            "type": "number",
                            "default": -1
                        }
                    }
                });
            },

            /**
             * @private
             * @see Alpaca.Fields.TextField#getOptionsForOptions
             */
            getOptionsForOptions: function() {
                return Alpaca.merge(this.base(), {
                    "fields": {
                        "aceTheme": {
                            "type": "text"
                        },
                        "aceMode": {
                            "type": "text"
                        },
                        "wordlimit": {
                            "type": "integer"
                        }
                    }
                });
            },

            /**
             * @see Alpaca.Fields.TextField#getTitle
             */
            getTitle: function() {
                return "Editor";
            },

            /**
             * @see Alpaca.Fields.TextField#getDescription
             */
            getDescription: function() {
                return "Editor";
            },

            /**
             * @see Alpaca.Fields.TextField#getFieldType
             */
            getFieldType: function() {
                return "editor";
            }//__END_OF_BUILDER_HELPERS

        });

    Alpaca.registerMessages({
        "wordLimitExceeded": "The maximum word limit of {0} has been exceeded.",
        "editorAnnotationsExist": "The editor has errors in it that must be corrected"
    });

    Alpaca.registerTemplate("controlFieldEditor", '<div id="${id}" class="control-field-editor-el"></div>');
    Alpaca.registerFieldClass("editor", Alpaca.Fields.EditorField);

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.EmailField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.EmailField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for JSON schema email format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();

            if (!this.schema.pattern) {
                this.schema.pattern = Alpaca.regexps.email;
            }
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (this.fieldContainer) {
                    this.fieldContainer.addClass('alpaca-controlfield-email');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["invalidPattern"]["status"]) {
                valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidEmail");
            }

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var pattern = (this.schema && this.schema.pattern) ? this.schema.pattern : Alpaca.regexps.email;
            return Alpaca.merge(this.base(), {
                "properties": {
                    "pattern": {
                        "title": "Pattern",
                        "description": "Field Pattern in Regular Expression",
                        "type": "string",
                        "default": pattern,
                        "enum":[pattern],
                        "readonly": true
                    },
                    "format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
                        "default":"email",
                        "enum":["email"],
                        "readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Email Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Email Field.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "email";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidEmail": "Invalid Email address e.g. info@cloudcms.com"
    });
    Alpaca.registerFieldClass("email", Alpaca.Fields.EmailField);
    Alpaca.registerDefaultFormatFieldMapping("email", "email");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.IntegerField = Alpaca.Fields.NumberField.extend(
    /**
     * @lends Alpaca.Fields.IntegerField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.NumberField
         *
         * @class Control for integers. If jQuery UI is enabled, it can also be
         * turned into a slider.
         *<p>
         * The following additional JSON Schema properties are supported:
         *<p/>
         *<code>
         *     <pre>
         * {
         *    minimum: {number},
         *    maximum: {number},
         *    minimumCanEqual: {boolean},
         *    maximumCanEqual: {boolean},
         *    divisibleBy: {number}
         * }
         * </pre>
         * </code>
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.NumberField#getValue
         */
        getValue: function() {
            var textValue = this.field.val();
            if (Alpaca.isValEmpty(textValue)) {
                return -1;
            } else {
                return parseInt(textValue, 10);
            }
        },

        /**
         * @see Alpaca.Field#onChange
         */
        onChange: function(e) {
            this.base();
            if (this.slider) {
                this.slider.slider("value", this.getValue());
            }
        },

        /**
         * @see Alpaca.Fields.NumberField#postRender
         */
        postRender: function(callback)
        {
            var self = this;

            this.base(function() {

                if (self.options.slider) {
                    if (!Alpaca.isEmpty(self.schema.maximum) && !Alpaca.isEmpty(self.schema.minimum)) {

                        if (self.field)
                        {
                            self.field.after('<div id="slider"></div>');
                            self.slider = $('#slider', self.field.parent()).slider({
                                value: self.getValue(),
                                min: self.schema.minimum,
                                max: self.schema.maximum,
                                slide: function(event, ui) {
                                    self.setValue(ui.value);
                                    self.refreshValidationState();
                                }
                            });
                        }
                    }
                }

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-integer');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.NumberField#handleValidate
         */
        handleValidate: function() {

            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["stringNotANumber"]["status"]) {
                valInfo["stringNotANumber"]["message"] = this.view.getMessage("stringNotAnInteger");
            }

            return baseStatus;
        },

        /**
         * Validates if it is an integer.
         * @returns {Boolean} true if it is an integer
         */
        _validateNumber: function() {
            var textValue = this.field.val();

            if (Alpaca.isValEmpty(textValue)) {
                return true;
            }

            var floatValue = this.getValue();

            // quick check to see if what they entered was a number
            if (isNaN(floatValue)) {
                return false;
            }

            // check if valid number format
            if (!textValue.match(Alpaca.regexps.integer)) {
                return false;
            }

            return true;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "minimum": {
                        "title": "Minimum",
                        "description": "Minimum value of the property.",
                        "type": "integer"
                    },
                    "maximum": {
                        "title": "Maximum",
                        "description": "Maximum value of the property.",
                        "type": "integer"
                    },
                    "divisibleBy": {
                        "title": "Divisible By",
                        "description": "Property value must be divisible by this number.",
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "minimum": {
                        "helper": "Minimum value of the field.",
                        "type": "integer"
                    },
                    "maximum": {
                        "helper": "Maximum value of the field.",
                        "type": "integer"
                    },
                    "divisibleBy": {
                        "helper": "Property value must be divisible by this number.",
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "slider": {
                        "title": "Slider",
                        "description": "Generate jQuery UI slider control with the field if true.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "slider": {
                        "rightLabel": "Slider control ?",
                        "helper": "Generate slider control if selected.",
                        "type": "checkbox"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.NumberField#getTitle
         */
        getTitle: function() {
            return "Integer Field";
        },

        /**
         * @see Alpaca.Fields.NumberField#getDescription
         */
        getDescription: function() {
            return "Field for integers.";
        },

        /**
         * @see Alpaca.Fields.NumberField#getType
         */
        getType: function() {
            return "integer";
        },

        /**
         * @see Alpaca.Fields.NumberField#getFieldType
         */
        getFieldType: function() {
            return "integer";
        }//__END_OF_BUILDER_HELPERS
    });

    // Additional Registrations
    Alpaca.registerMessages({
        "stringNotAnInteger": "This value is not an integer."
    });
    Alpaca.registerFieldClass("integer", Alpaca.Fields.IntegerField);
    Alpaca.registerDefaultSchemaFieldMapping("integer", "integer");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.IPv4Field = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.IPv4Field.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for JSON schema ip-address format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();
            
            if (!this.schema.pattern) {
                this.schema.pattern = Alpaca.regexps.ipv4;
            }
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-ipv4');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();
            
            var valInfo = this.validation;
            
            if (!valInfo["invalidPattern"]["status"]) {
                valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidIPv4");
            }
            
            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var pattern = (this.schema && this.schema.pattern)? this.schema.pattern : Alpaca.regexps.ipv4;
            return Alpaca.merge(this.base(), {
                "properties": {
                    "pattern": {
                        "title": "Pattern",
                        "description": "Field Pattern in Regular Expression",
                        "type": "string",
                        "default": pattern,
                        "readonly": true
                    },                    
					"format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
                        "enum": ["ip-address"],
						"default":"ip-address",
						"readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
		getOptionsForSchema: function() {
            return Alpaca.merge(this.base(),{
				"fields": {
					"format": {
						"type": "text"
					}
				}
			});
        },
        
        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "IP Address Field";
        },
        
        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "IP Address Field.";
        },

		/**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "ipv4";
        }//__END_OF_BUILDER_HELPERS
    });
    
    Alpaca.registerMessages({
        "invalidIPv4": "Invalid IPv4 address, e.g. 192.168.0.1"
    });
    Alpaca.registerFieldClass("ipv4", Alpaca.Fields.IPv4Field);
    Alpaca.registerDefaultFormatFieldMapping("ip-address", "ipv4");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.JSONField = Alpaca.Fields.TextAreaField.extend(
    /**
     * @lends Alpaca.Fields.JSONField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextAreaField
         *
         * @class JSON control for chunk of text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.ContainerField#getValue
         */
        setValue: function(value) {
            if (Alpaca.isObject(value) || typeof(value) == "object") {
                value = JSON.stringify(value, null, 3);
            }
            this.base(value);
        },

        /**
         * @see Alpaca.ContainerField#getValue
         */
        getValue: function() {

            var val = this.base();

            if (val && Alpaca.isString(val)) {
                val = JSON.parse(val);
            }

            return val;
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

			var status = this._validateJSON();
            valInfo["stringNotAJSON"] = {
                "message": status.status ? "" : this.view.getMessage("stringNotAJSON") +" "+ status.message,
                "status": status.status
            };

            return baseStatus && valInfo["stringNotAJSON"]["status"] ;
        },

        /**
         * Validates if it is a valid JSON object.
         * @returns {Boolean} true if it is a valid JSON object
         */
        _validateJSON: function() {
            var textValue = this.field.val();
            // allow null
            if (Alpaca.isValEmpty(textValue)) {
                return {
                    "status" : true
                };
            }

            // parse the string
            try {
                var obj = JSON.parse(textValue);
                // format the string as well
                this.setValue(JSON.stringify(obj, null, 3));
                return {
                    "status" : true
                };
            } catch(e) {
                return {
                    "status" : false,
                    "message" : e.message
                };
            }
        },

        /**
         * @see Alpaca.Fields.TextAreaField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.field)
                {
                    // Some auto-formatting capabilities
                    self.field.bind('keypress', function(e) {
                        //console.log(e.which);
                        if (e.which == 34) {
                            self.field.insertAtCaret('"');
                        }
                        if (e.which == 123) {
                            self.field.insertAtCaret('}');
                        }
                        if (e.which == 91) {
                            self.field.insertAtCaret(']');
                        }
                    });
                    self.field.bind('keypress', 'Ctrl+l', function() {
                        self.getEl().removeClass("alpaca-field-focused");

                        // set class from state
                        self.refreshValidationState();
                    });
                    self.field.attr('title','Type Ctrl+L to format and validate the JSON string.');
                }

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-json');
                }

                callback();

            });

        },//__BUILDER_HELPERS

		/**
         * @see Alpaca.Fields.TextAreaField#getTitle
		 */
		getTitle: function() {
			return "JSON Editor";
		},

		/**
         * @see Alpaca.Fields.TextAreaField#getDescription
		 */
		getDescription: function() {
			return "Editor for JSON objects with basic validation and formatting.";
		},

		/**
         * @see Alpaca.Fields.TextAreaField#getFieldType
         */
        getFieldType: function() {
            return "json";
        }//__END_OF_BUILDER_HELPERS
    });

    // Additional Registrations
    Alpaca.registerMessages({
        "stringNotAJSON": "This value is not a valid JSON string."
    });

    Alpaca.registerFieldClass("json", Alpaca.Fields.JSONField);

    $.fn.insertAtCaret = function (myValue) {

        return this.each(function() {

            //IE support
            if (document.selection) {

                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();

            } else if (this.selectionStart || this.selectionStart == '0') {

                //MOZILLA / NETSCAPE support
                var startPos = this.selectionStart;
                var endPos = this.selectionEnd;
                var scrollTop = this.scrollTop;
                this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                this.focus();
                this.selectionStart = startPos /*+ myValue.length*/;
                this.selectionEnd = startPos /*+ myValue.length*/;
                this.scrollTop = scrollTop;

            } else {

                this.value += myValue;
                this.focus();
            }
        });
    };
/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * http://github.com/tzuryby/hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
*/
    jQuery.hotkeys = {
        version: "0.8",

        specialKeys: {
            8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
            20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
            37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
            96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
            104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
            112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
            120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
        },

        shiftNums: {
            "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
            "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
            ".": ">",  "/": "?",  "\\": "|"
        }
    };

    function keyHandler( handleObj ) {
        // Only care when a possible input has been specified
        if ( typeof handleObj.data !== "string" ) {
            return;
        }

        var origHandler = handleObj.handler,
            keys = handleObj.data.toLowerCase().split(" ");

        handleObj.handler = function( event ) {
            // Don't fire in text-accepting inputs that we didn't directly bind to
            if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
                 event.target.type === "text") ) {
                return;
            }

            // Keypress represents characters, not special keys
            var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
                character = String.fromCharCode( event.which ).toLowerCase(),
                key, modif = "", possible = {};

            // check combinations (alt|ctrl|shift+anything)
            if ( event.altKey && special !== "alt" ) {
                modif += "alt+";
            }

            if ( event.ctrlKey && special !== "ctrl" ) {
                modif += "ctrl+";
            }

            // TODO: Need to make sure this works consistently across platforms
            if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
                modif += "meta+";
            }

            if ( event.shiftKey && special !== "shift" ) {
                modif += "shift+";
            }

            if ( special ) {
                possible[ modif + special ] = true;

            } else {
                possible[ modif + character ] = true;
                possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

                // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
                if ( modif === "shift+" ) {
                    possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
                }
            }

            for ( var i = 0, l = keys.length; i < l; i++ ) {
                if ( possible[ keys[i] ] ) {
                    return origHandler.apply( this, arguments );
                }
            }
        };
    }

    jQuery.each([ "keydown", "keyup", "keypress" ], function() {
        jQuery.event.special[ this ] = { add: keyHandler };
    });

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.IntegerField = Alpaca.Fields.NumberField.extend(
    /**
     * @lends Alpaca.Fields.IntegerField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.NumberField
         *
         * @class Control for integers. If jQuery UI is enabled, it can also be
         * turned into a slider.
         *<p>
         * The following additional JSON Schema properties are supported:
         *<p/>
         *<code>
         *     <pre>
         * {
         *    minimum: {number},
         *    maximum: {number},
         *    minimumCanEqual: {boolean},
         *    maximumCanEqual: {boolean},
         *    divisibleBy: {number}
         * }
         * </pre>
         * </code>
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.NumberField#getValue
         */
        getValue: function() {
            var textValue = this.field.val();
            if (Alpaca.isValEmpty(textValue)) {
                return -1;
            } else {
                return parseInt(textValue, 10);
            }
        },

        /**
         * @see Alpaca.Field#onChange
         */
        onChange: function(e) {
            this.base();
            if (this.slider) {
                this.slider.slider("value", this.getValue());
            }
        },

        /**
         * @see Alpaca.Fields.NumberField#postRender
         */
        postRender: function(callback)
        {
            var self = this;

            this.base(function() {

                if (self.options.slider) {
                    if (!Alpaca.isEmpty(self.schema.maximum) && !Alpaca.isEmpty(self.schema.minimum)) {

                        if (self.field)
                        {
                            self.field.after('<div id="slider"></div>');
                            self.slider = $('#slider', self.field.parent()).slider({
                                value: self.getValue(),
                                min: self.schema.minimum,
                                max: self.schema.maximum,
                                slide: function(event, ui) {
                                    self.setValue(ui.value);
                                    self.refreshValidationState();
                                }
                            });
                        }
                    }
                }

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-integer');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.NumberField#handleValidate
         */
        handleValidate: function() {

            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["stringNotANumber"]["status"]) {
                valInfo["stringNotANumber"]["message"] = this.view.getMessage("stringNotAnInteger");
            }

            return baseStatus;
        },

        /**
         * Validates if it is an integer.
         * @returns {Boolean} true if it is an integer
         */
        _validateNumber: function() {
            var textValue = this.field.val();

            if (Alpaca.isValEmpty(textValue)) {
                return true;
            }

            var floatValue = this.getValue();

            // quick check to see if what they entered was a number
            if (isNaN(floatValue)) {
                return false;
            }

            // check if valid number format
            if (!textValue.match(Alpaca.regexps.integer)) {
                return false;
            }

            return true;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "minimum": {
                        "title": "Minimum",
                        "description": "Minimum value of the property.",
                        "type": "integer"
                    },
                    "maximum": {
                        "title": "Maximum",
                        "description": "Maximum value of the property.",
                        "type": "integer"
                    },
                    "divisibleBy": {
                        "title": "Divisible By",
                        "description": "Property value must be divisible by this number.",
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "minimum": {
                        "helper": "Minimum value of the field.",
                        "type": "integer"
                    },
                    "maximum": {
                        "helper": "Maximum value of the field.",
                        "type": "integer"
                    },
                    "divisibleBy": {
                        "helper": "Property value must be divisible by this number.",
                        "type": "integer"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "slider": {
                        "title": "Slider",
                        "description": "Generate jQuery UI slider control with the field if true.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.NumberField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "slider": {
                        "rightLabel": "Slider control ?",
                        "helper": "Generate slider control if selected.",
                        "type": "checkbox"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.NumberField#getTitle
         */
        getTitle: function() {
            return "Integer Field";
        },

        /**
         * @see Alpaca.Fields.NumberField#getDescription
         */
        getDescription: function() {
            return "Field for integers.";
        },

        /**
         * @see Alpaca.Fields.NumberField#getType
         */
        getType: function() {
            return "integer";
        },

        /**
         * @see Alpaca.Fields.NumberField#getFieldType
         */
        getFieldType: function() {
            return "integer";
        }//__END_OF_BUILDER_HELPERS
    });

    // Additional Registrations
    Alpaca.registerMessages({
        "stringNotAnInteger": "This value is not an integer."
    });
    Alpaca.registerFieldClass("integer", Alpaca.Fields.IntegerField);
    Alpaca.registerDefaultSchemaFieldMapping("integer", "integer");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.LowerCaseField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.LowerCaseField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for lower case text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback)
        {
            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-lowercase');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {
            var lowerValue = val.toLowerCase();

            if (lowerValue != this.getValue()) {
                this.base(lowerValue);
            }
        },

        /**
         * @see Alpaca.ControlField#onKeyPress
         */
        onKeyPress: function(e) {
            this.base(e);

            var _this = this;

            Alpaca.later(25, this, function() {
                var v = _this.getValue();
                _this.setValue(v);
            });
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Lowercase Text";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Text field for lowercase text.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "lowercase";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("lowercase", Alpaca.Fields.LowerCaseField);
    Alpaca.registerDefaultFormatFieldMapping("lowercase", "lowercase");

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.MapField = Alpaca.Fields.ArrayField.extend(
    /**
     * @lends Alpaca.Fields.MapField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextAreaField
         *
         * @class JSON control for chunk of text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextAreaField#setup
         */
        setup: function() {

            this.base();

            Alpaca.mergeObject(this.options, {
                "forceRevalidation" : true
            });

            if (Alpaca.isEmpty(this.data)) {
                return;
            }

            if (!Alpaca.isArray(this.data)) {

                if (Alpaca.isObject(this.data)) {
                    var newData = [];
                    $.each(this.data, function(key, value) {
                        var newValue = Alpaca.copyOf(value);
                        newValue["_key"] = key;
                        newData.push(newValue);
                    });
                    this.data = newData;
                }
            }
        },

        /**
         * @see Alpaca.ContainerField#getValue
         */
        getValue: function()
        {
            // if we don't have any children and we're not required, hand back undefined
            if (this.children.length === 0 && !this.schema.required)
            {
                return;
            }

            var o = {};
            for (var i = 0; i < this.children.length; i++) {
                var v = this.children[i].getValue();
                var key = v["_key"];
                if (key) {
                    delete v["_key"];
                    o[key] = v;
                }
            }
            return o;
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var isValidMapKeysNotEmpty = this._validateMapKeysNotEmpty();
            valInfo["keyMissing"] = {
                "message": isValidMapKeysNotEmpty ? "" : this.view.getMessage("keyMissing"),
                "status": isValidMapKeysNotEmpty
            };

            var isValidMapKeysUnique = this._validateMapKeysUnique();
            valInfo["keyNotUnique"] = {
                "message": isValidMapKeysUnique ? "" : this.view.getMessage("keyNotUnique"),
                "status": isValidMapKeysUnique
            };

            return baseStatus && valInfo["keyMissing"]["status"] && valInfo["keyNotUnique"]["status"];
        },

        /**
         * Validates if key fields are unique.
         * @returns {Boolean} true if keys are unique
         */
        _validateMapKeysNotEmpty: function() {

            var isValid = true;

            for (var i = 0; i < this.children.length; i++) {
                var v = this.children[i].getValue();
                var key = v["_key"];

                if (!key) {
                    isValid = false;
                    break;
                }
            }

            return isValid;
        },

        /**
         * Validates if key fields are unique.
         * @returns {Boolean} true if keys are unique
         */
        _validateMapKeysUnique: function() {

            var isValid = true;

            var keys = {};
            for (var i = 0; i < this.children.length; i++) {
                var v = this.children[i].getValue();
                var key = v["_key"];

                if (keys[key]) {
                    isValid = false;
                }

                keys[key] = key;
            }

            return isValid;
        },

        /**
         * @see Alpaca.Fields.TextAreaField#postRender
         */
        postRender: function(callback)
        {
            var self = this;

            this.base(function() {

                if (this.fieldContainer) {
                    this.fieldContainer.addClass('alpaca-controlfield-map');
                }

                callback();
            });

        },//__BUILDER_HELPERS

		/**
         * @see Alpaca.Fields.TextAreaField#getTitle
		 */
		getTitle: function() {
			return "Map Field";
		},

		/**
         * @see Alpaca.Fields.TextAreaField#getDescription
		 */
		getDescription: function() {
			return "Field for objects with key/value pairs that share the same schema for values.";
		},

		/**
         * @see Alpaca.Fields.TextAreaField#getFieldType
         */
        getFieldType: function() {
            return "map";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("map", Alpaca.Fields.MapField);

    // Additional Registrations
    Alpaca.registerMessages({
        "keyNotUnique": "Keys of map field are not unique.",
        "keyMissing": "Map contains an empty key."
    });
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.PasswordField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.PasswordField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for JSON schema password format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();
            
            if (!this.schema.pattern) {
                this.schema.pattern = Alpaca.regexps.password;
            }
            
            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldPassword");
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-password');
                }

                callback();
            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();
            
            var valInfo = this.validation;
            
            if (!valInfo["invalidPattern"]["status"]) {
                valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidPassword");
            }
            
            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var pattern = (this.schema && this.schema.pattern)? this.schema.pattern : /^[0-9a-zA-Z\x20-\x7E]*$/;
            return Alpaca.merge(this.base(), {
                "properties": {
                    "pattern": {
                        "title": "Pattern",
                        "description": "Field Pattern in Regular Expression",
                        "type": "string",
                        "default": this.schema.pattern,
                        "enum":[pattern],
                        "readonly": true
                    },                    
					"format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
						"default":"password",
                        "enum":["password"],
						"readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
		getOptionsForSchema: function() {
            return Alpaca.merge(this.base(),{
				"fields": {
					"format": {
						"type": "text"
					}
				}
			});
        },
        
        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Password Field";
        },
        
        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Password Field.";
        },

		/**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "password";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerTemplate("controlFieldPassword", '<input type="password" id="${id}" {{if options.size}}size="${options.size}"{{/if}} {{if options.readonly}}readonly="readonly"{{/if}} {{if name}}name="${name}"{{/if}} {{each(i,v) options.data}}data-${i}="${v}"{{/each}}/>');
    Alpaca.registerMessages({
        "invalidPassword": "Invalid Password"
    });
    Alpaca.registerFieldClass("password", Alpaca.Fields.PasswordField);
    Alpaca.registerDefaultFormatFieldMapping("password", "password");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.PersonalNameField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.PersonalNameField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for upper case text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-personalname');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {
            var upperValue = "";

            for ( var i = 0; i < val.length; i++ ) {
                if ( i === 0 ) {
                    upperValue += val.charAt(i).toUpperCase();
                } else if (val.charAt(i-1) == ' ' ||  val.charAt(i-1) == '-' || val.charAt(i-1) == "'") {
                    upperValue += val.charAt(i).toUpperCase();
                } else {
                    upperValue += val.charAt(i);
                }
            }

            if (upperValue != this.getValue()) {
                this.base(upperValue);
            }
        },

        /**
         * @see Alpaca.ControlField#onKeyPress
         */
        onKeyPress: function(e) {
            this.base(e);

            var _this = this;

            Alpaca.later(25, this, function() {
                var v = _this.getValue();
                _this.setValue(v);
            });
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Personal Name";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Text Field for personal name with captical letter for first letter & after hyphen, space or apostrophe.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "personalname";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("personalname", Alpaca.Fields.PersonalNameField);

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.PhoneField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.PhoneField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for standard US phone numbers.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();

            if (!this.schema.pattern) {
                this.schema.pattern = Alpaca.regexps.phone;
            }

            if (Alpaca.isEmpty(this.options.maskString)) {
                this.options.maskString = "(999) 999-9999";
            }

        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-phone');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["invalidPattern"]["status"]) {
                valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidPhone");
            }

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            var pattern = (this.schema && this.schema.pattern) ? this.schema.pattern : Alpaca.regexps.phone;
            return Alpaca.merge(this.base(), {
                "properties": {
                    "pattern": {
                        "title": "Pattern",
                        "description": "Field Pattern in Regular Expression",
                        "type": "string",
                        "default": pattern,
                        "enum":[pattern],
                        "readonly": true
                    },
                    "format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
                        "default":"phone",
                        "enum":["phone"],
                        "readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "maskString": {
                        "title": "Field Mask String",
                        "description": "Expression for field mask",
                        "type": "string",
                        "default": "(999) 999-9999"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Phone Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Phone Field.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "phone";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidPhone": "Invalid Phone Number, e.g. (123) 456-9999"
    });
    Alpaca.registerFieldClass("phone", Alpaca.Fields.PhoneField);
    Alpaca.registerDefaultFormatFieldMapping("phone", "phone");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.TagField = Alpaca.Fields.LowerCaseField.extend(
    /**
     * @lends Alpaca.Fields.TagField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Time control for JSON schema time format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();

            if (!this.options.separator) {
                this.options.separator = ",";
            }
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-tag');
                }

                callback();
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getValue
         */
        getValue: function() {
            var val = this.base();
            if (val === "") {
                return [];
            }
            return val.split(this.options.separator);
        },

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {
            if (val === "") {
                return;
            }

            this.base(val.join(this.options.separator));
        },

        /**
         * @see Alpaca.Field#onBlur
         */
        onBlur: function(e) {
            this.base(e);

            var vals = this.getValue();

            var trimmed = [];

            $.each(vals, function(i, v) {
                if (v.trim() !== "") {
                    trimmed.push(v.trim());
                }
            });

            this.setValue(trimmed);

        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "separator": {
                        "title": "Separator",
                        "description": "Separator used to split tags.",
                        "type": "string",
                        "default":","
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "separator": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Tag Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Text field for entering list of tags separated by delimiter.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "tag";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("tag", Alpaca.Fields.TagField);
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.TimeField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.TimeField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Time control for JSON schema time format.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {
            this.base();

            if (!this.options.timeFormat) {
                this.options.timeFormat = "hh:mm:ss";
            }

            if (!this.options.timeFormatRegex) {
                this.options.timeFormatRegex = /^(([0-1][0-9])|([2][0-3])):([0-5][0-9]):([0-5][0-9])$/;
            }

            if (Alpaca.isEmpty(this.options.maskString)) {
                this.options.maskString = "99:99:99";
            }
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-time');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Field#onChange
         */
        onChange: function(e) {
            this.base();
            this.refreshValidationState();
        },

        /**
         * @see Alpaca.Fields.TextField#handleValitime
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            var status = this._validateTimeFormat();
            valInfo["invalidTime"] = {
                "message": status ? "" : Alpaca.substituteTokens(this.view.getMessage("invalidTime"), [this.options.timeFormat]),
                "status": status
            };

            return baseStatus && valInfo["invalidTime"]["status"];
        },

        /**
         * Valitimes time format.
         * @returns {Boolean} True if it is a valid time, false otherwise.
         */
        _validateTimeFormat: function() {
            var value = this.field.val();
            if (!this.schema.required && (Alpaca.isValEmpty(value) || value == "__:__:__")) {
                return true;
            }
            //valitime the time without the help of timepicker.parseTime
            return value.match(this.options.timeFormatRegex);
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {
            // skip out if no time
            if (val === "") {
                this.base(val);
                return;
            }

            this.base(val);
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfSchema
         */
        getSchemaOfSchema: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "format": {
                        "title": "Format",
                        "description": "Property data format",
                        "type": "string",
                        "default":"time",
                        "enum" : ["time"],
                        "readonly":true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForSchema
         */
        getOptionsForSchema: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "timeFormat": {
                        "title": "Time Format",
                        "description": "Time format",
                        "type": "string",
                        "default": "hh:mm:ss"
                    },
                    "timeFormatRegex": {
                        "title": "Format Regular Expression",
                        "description": "Regular expression for validation time format",
                        "type": "string",
                        "default": /^(([0-1][0-9])|([2][0-3])):([0-5][0-9]):([0-5][0-9])$/
                    },
                    "maskString": {
                        "default" : "99:99:99"
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "timeFormat": {
                        "type": "text"
                    },
                    "timeFormatRegex": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Time Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Field for time.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "time";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidTime": "Invalid time for format {0}"
    });
    Alpaca.registerFieldClass("time", Alpaca.Fields.TimeField);
    Alpaca.registerDefaultFormatFieldMapping("time", "time");
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.UpperCaseField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.UpperCaseField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Control for upper case text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-uppercase');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#setValue
         */
        setValue: function(val) {

            var upperValue = val.toUpperCase();

            if (upperValue != this.getValue()) {
                this.base(upperValue);
            }
        },

        /**
         * @see Alpaca.ControlField#onKeyPress
         */
        onKeyPress: function(e) {
            this.base(e);

            var _this = this;

            Alpaca.later(25, this, function() {
                var v = _this.getValue();
                _this.setValue(v);
            });
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Uppercase Text";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Text field for uppercase text.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "uppercase";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("uppercase", Alpaca.Fields.UpperCaseField);
    Alpaca.registerDefaultFormatFieldMapping("uppercase", "uppercase");

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.WysiwygField = Alpaca.Fields.TextAreaField.extend(
    /**
     * @lends Alpaca.Fields.WysiwygField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextAreaField
         *
         * @class WYSIWYG control for chunk of text.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);

            this.controlsConfig = {};
            this.controlsConfig.simple = {
                "html": { "visible": true },
                "createLink": { "visible": false },
                "unLink": { "visible": false },
                "h1": { "visible": false },
                "h2": { "visible": false },
                "h3": { "visible": false },
                "indent": { "visible": false },
                "insertHorizontalRule": { "visible": false },
                "insertImage": { "visible": false },
                "insertOrderedList": { "visible": false },
                "insertTable": { "visible": false },
                "insertUnorderedList": { "visible": false },
                "justifyCenter": { "visible": false },
                "justifyFull": { "visible": false },
                "justifyLeft": { "visible": false },
                "justifyRight": { "visible": false },
                "outdent": { "visible": false },
                "redo": { "visible": false },
                "removeFormat": { "visible": false },
                "subscript": { "visible": false },
                "superscript": { "visible": false },
                "undo": { "visible": false },
                "code": { "visible": false },
                "strikeThrough": { "visible": false }
            };
        },

        /**
         * @see Alpaca.Fields.TextAreaField#setup
         */
        setup: function() {
            this.base();

            // instantiated plugin reference
            this.plugin = null;
        },
        
        /**
         * @see Alpaca.Fields.TextAreaField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                // see if we can render jWysiwyg
                if (self.field && $.wysiwyg)
                {
                    var wysiwygOptions = self.options.wysiwyg ? self.options.wysiwyg : {};

                    if (wysiwygOptions.controls)
                    {
                        if (typeof(wysiwygOptions.controls) === "string")
                        {
                            wysiwygOptions.controls = self.controlsConfig[wysiwygOptions.controls];
                            if (!wysiwygOptions.controls)
                            {
                                wysiwygOptions.controls = {};
                            }
                        }
                    }

                    if (self.options.onDemand)
                    {
                        self.outerEl.find("textarea").mouseover(function() {

                            if (!self.plugin)
                            {
                                self.plugin = $(this).wysiwyg(wysiwygOptions);

                                self.outerEl.find(".wysiwyg").mouseout(function() {

                                    if (self.plugin) {
                                        self.plugin.wysiwyg('destroy');
                                    }

                                    self.plugin = null;

                                });
                            }
                        });
                    }
                    else
                    {
                        self.plugin = self.field.wysiwyg(wysiwygOptions);
                    }

                    self.outerEl.find(".wysiwyg").mouseout(function() {
                        self.data = _this.getValue();
                        self.refreshValidationState();
                    });
                }

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-wysiwyg');
                }

                callback();
            });

        },//__BUILDER_HELPERS
		
        /**
         * @private
         * @see Alpaca.ControlField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "wysiwyg": {
                        "title": "Editor options",
                        "description": "Options that are supported by the <a href='https://github.com/akzhan/jwysiwyg'>jQuery WYSIWYG plugin</a>.",
                        "type": "any"
                    },
                    "onDemand": {
                        "title": "On Demand",
                        "description": "If true, WYSIWYG editor will only be enabled when the field is hovered.",
                        "type": "boolean",
                        "default": false
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.ControlField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "wysiwyg": {
                        "type": "any"
                    },
                    "onDemand": {
                        "type": "checkbox",
                        "rightLabel": "Make the editor on-demand?"
                    }
                }
            });
        },

		/**
         * @see Alpaca.Fields.TextAreaField#getTitle
		 */
		getTitle: function() {
			return "Wysiwyg Editor";
		},
		
		/**
         * @see Alpaca.Fields.TextAreaField#getDescription
		 */
		getDescription: function() {
			return "Wysiwyg editor for multi-line text which is based on Akzhan Abdulin's <a href='https://github.com/akzhan/jwysiwyg'>jQuery WYSIWYG plugin</a>.";
		},

		/**
         * @see Alpaca.Fields.TextAreaField#getFieldType
         */
        getFieldType: function() {
            return "wysiwyg";
        }//__END_OF_BUILDER_HELPERS
    });
    
    Alpaca.registerFieldClass("wysiwyg", Alpaca.Fields.WysiwygField);
    
})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.StateField = Alpaca.Fields.SelectField.extend(
    /**
     * @lends Alpaca.Fields.StateField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class State Control
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            // defaults
            if (Alpaca.isUndefined(this.options.capitalize)) {
                this.options.capitalize = false;
            }
            if (Alpaca.isUndefined(this.options.includeStates)) {
                this.options.includeStates = true;
            }
            if (Alpaca.isUndefined(this.options.includeTerritories)) {
                this.options.includeTerritories = true;
            }
            if (Alpaca.isUndefined(this.options.format)) {
                this.options.format = "name";
            }

            // validate settings
            if (this.options.format == "name" || this.options.format == "code")
            {
                // valid formats
            }
            else
            {
                Alpaca.logError("The configured state format: " + this.options.format + " is not a legal value [name, code]");

                // default to name format
                this.options.format = "name";
            }

            // configure
            var holdings = Alpaca.retrieveUSHoldings(
                this.options.includeStates,
                this.options.includeTerritories,
                (this.options.format == "code"),
                this.options.capitalize);

            this.schema["enum"] = holdings.keys;
            this.options.optionLabels = holdings.values;

            this.base();
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-state');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            // no additional validation

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {

            return Alpaca.merge(this.base(), {
                "properties": {
                    "format": {
                        "title": "Format",
                        "description": "How to represent the state values in the selector",
                        "type": "string",
                        "default": "name",
                        "enum":["name", "code"],
                        "readonly": true
                    },
                    "capitalize": {
                        "title": "Capitalize",
                        "description": "Whether the values should be capitalized",
                        "type": "boolean",
                        "default": false,
                        "readonly": true
                    },
                    "includeStates": {
                        "title": "Include States",
                        "description": "Whether to include the states of the United States",
                        "type": "boolean",
                        "default": true,
                        "readonly": true
                    },
                    "includeTerritories": {
                        "title": "Include Territories",
                        "description": "Whether to include the territories of the United States",
                        "type": "boolean",
                        "default": true,
                        "readonly": true
                    }
                }
            });

        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    },
                    "capitalize": {
                        "type": "checkbox"
                    },
                    "includeStates": {
                        "type": "checkbox"
                    },
                    "includeTerritories": {
                        "type": "checkbox"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "State Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Provides a dropdown selector of states and/or territories in the United States, keyed by their two-character code.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "state";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("state", Alpaca.Fields.StateField);
    Alpaca.registerDefaultFormatFieldMapping("state", "state");

    /**
     * Helper function to retrieve the holdings of US states and territories.
     *
     * @param {Boolean} includeStates whether to include US states
     * @param {Boolean} includeTerritories whether to include US territories
     * @param {Boolean} codeValue whether to hand back US holding codes (instead of names)
     * @param {Boolean} capitalize whether to capitalize the values handed back
     *
     * @type {Object} an object containing "keys" and "values", both of which are arrays.
     */
    Alpaca.retrieveUSHoldings = function()
    {
        var holdings = [];
        holdings.push({
            "name": "Arkansas",
            "code": "AK",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Alabama",
            "code": "AL",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "American Samoa",
            "code": "AS",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Arizona",
            "code": "AR",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "California",
            "code": "CA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Colorado",
            "code": "CO",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Connecticut",
            "code": "CT",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Delaware",
            "code": "DE",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Distict of Columbia",
            "code": "DC",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Federated States of Micronesia",
            "code": "FM",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Florida",
            "code": "FL",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Georgia",
            "code": "GA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Guam",
            "code": "GU",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Georgia",
            "code": "GA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Hawaii",
            "code": "HI",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Idaho",
            "code": "ID",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Illinois",
            "code": "IL",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Indiana",
            "code": "IN",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Iowa",
            "code": "IA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Kansas",
            "code": "KS",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Kentucky",
            "code": "KY",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Louisiana",
            "code": "LA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Maine",
            "code": "ME",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Marshall Islands",
            "code": "MH",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Maryland",
            "code": "MD",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Massachusetts",
            "code": "MA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Michigan",
            "code": "MI",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Minnesota",
            "code": "MN",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Mississippi",
            "code": "MS",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Missouri",
            "code": "MO",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Montana",
            "code": "MT",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Nebraska",
            "code": "NE",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Nevada",
            "code": "NV",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "New Hampshire",
            "code": "NH",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "New Jersey",
            "code": "NJ",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "New Mexico",
            "code": "NM",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "New York",
            "code": "NY",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "North Carolina",
            "code": "NC",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "North Dakota",
            "code": "ND",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Northern Mariana Islands",
            "code": "MP",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Ohio",
            "code": "OH",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Oklahoma",
            "code": "OK",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Oregon",
            "code": "OR",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Palau",
            "code": "PW",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Pennsylvania",
            "code": "PA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Puerto Rico",
            "code": "PR",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Rhode Island",
            "code": "RI",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "South Carolina",
            "code": "SC",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "South Dakota",
            "code": "SD",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Tennessee",
            "code": "TN",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Texas",
            "code": "TX",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Utah",
            "code": "UT",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Vermont",
            "code": "VT",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Virgin Islands",
            "code": "VI",
            "state": false,
            "territory": true
        });
        holdings.push({
            "name": "Virginia",
            "code": "VA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Washington",
            "code": "WA",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "West Virginia",
            "code": "WV",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Wisconsin",
            "code": "WI",
            "state": true,
            "territory": false
        });
        holdings.push({
            "name": "Wyoming",
            "code": "WY",
            "state": true,
            "territory": false
        });

        return function(includeStates, includeTerritories, codeValue, capitalize) {

            var result = {
                "keys": [],
                "values": []
            };

            for (var i = 0; i < holdings.length; i++)
            {
                var keep = false;

                if (holdings[i].state && includeStates) {
                    keep = true;
                } else if (holdings[i].territory && includeTerritories) {
                    keep = true;
                }

                if (keep) {

                    var key = holdings[i].code;
                    var value = holdings[i].name;

                    if (codeValue) {
                        value = holdings[i].code;
                    }
                    if (capitalize) {
                        value = value.toUpperCase();
                    }

                    result.keys.push(key);
                    result.values.push(value);
                }
            }

            return result;
        };
    }();

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.CountryField = Alpaca.Fields.SelectField.extend(
    /**
     * @lends Alpaca.Fields.CountryField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Country Control
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            // defaults
            if (Alpaca.isUndefined(this.options.capitalize)) {
                this.options.capitalize = false;
            }

            this.schema["enum"] = [];
            this.options.optionLabels = [];

            var countriesMap = this.view.getMessage("countries");
            if (countriesMap)
            {
                for (var countryKey in countriesMap)
                {
                    this.schema["enum"].push(countryKey);

                    var label = countriesMap[countryKey];
                    if (this.options.capitalize) {
                        label = label.toUpperCase();
                    }
                    this.options.optionLabels.push(label);
                }
            }

            this.base();
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-country');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            // no additional validation

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {

            return Alpaca.merge(this.base(), {
                "properties": {
                    "capitalize": {
                        "title": "Capitalize",
                        "description": "Whether the values should be capitalized",
                        "type": "boolean",
                        "default": false,
                        "readonly": true
                    }
                }
            });

        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "capitalize": {
                        "type": "checkbox"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Country Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Provides a dropdown selector of countries keyed by their ISO3 code.  The names of the countries are read from the I18N bundle for the current locale.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "country";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("country", Alpaca.Fields.CountryField);
    Alpaca.registerDefaultFormatFieldMapping("country", "country");

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.ZipcodeField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.ZipcodeField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class Zipcode Control
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            this.options.format = (this.options.format ? this.options.format : "nine");

            if (this.options.format == "nine")
            {
                this.schema.pattern = Alpaca.regexps["zipcode-nine"];
            }
            else if (this.options.format == "five")
            {
                this.schema.pattern = Alpaca.regexps["zipcode-five"];
            }
            else
            {
                Alpaca.logError("The configured zipcode format: " + this.options.format + " is not a legal value [five, nine]");

                // default to nine format
                this.options.format = "nine";
                this.schema.pattern = Alpaca.regexps["zipcode-nine"];
            }

            // set mask string
            if (this.options.format == "nine")
            {
                this.options["maskString"] = "99999-9999";
            }
            else if (this.options.format == "five")
            {
                this.options["maskString"] = "99999";
            }

            this.base();
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-zipcode');
                }

                callback();
            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["invalidPattern"]["status"]) {

                if (this.options.format == "nine")
                {
                    valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidZipcodeFormatNine");
                }
                else if (this.options.format == "five")
                {
                    valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidZipcodeFormatFive");
                }
            }

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {

            return Alpaca.merge(this.base(), {
                "properties": {
                    "format": {
                        "title": "Format",
                        "description": "How to represent the zipcode field",
                        "type": "string",
                        "default": "five",
                        "enum":["five", "nine"],
                        "readonly": true
                    }
                }
            });

        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "format": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Zipcode Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Provides a five or nine-digital US zipcode control with validation.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "zipcode";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidZipcodeFormatFive": "Invalid Five-Digit Zipcode (#####)",
        "invalidZipcodeFormatNine": "Invalid Nine-Digit Zipcode (#####-####)"
    });
    Alpaca.registerFieldClass("zipcode", Alpaca.Fields.ZipcodeField);
    Alpaca.registerDefaultFormatFieldMapping("zipcode", "zipcode");

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.URLField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.URLField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.TextField
         *
         * @class URL Control
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            this.schema.pattern = Alpaca.regexps.url;
            this.schema.format = "uri";

            this.base();
        },

        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-url');
                }

                callback();

            });
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function() {
            var baseStatus = this.base();

            var valInfo = this.validation;

            if (!valInfo["invalidPattern"]["status"]) {

                valInfo["invalidPattern"]["message"] = this.view.getMessage("invalidURLFormat");
            }

            return baseStatus;
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "URL Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Provides a text control with validation for an internet web address.";
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "url";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerMessages({
        "invalidURLFormat": "The URL provided is not a valid web address."
    });
    Alpaca.registerFieldClass("url", Alpaca.Fields.URLField);
    Alpaca.registerDefaultFormatFieldMapping("url", "url");

})(jQuery);
(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.UploadField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.UploadField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.ObjectField
         *
         * @class Upload Field
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector, errorCallback) {
            this.base(container, data, options, schema, view, connector, errorCallback);
        },

        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function() {

            var self = this;

            this.base();

            this.controlFieldTemplateDescriptor = this.view.getTemplateDescriptor("controlFieldUpload");
            this.uploadDescriptor = self.view.getTemplateDescriptor("controlFieldUpload_upload");
            this.downloadDescriptor = self.view.getTemplateDescriptor("controlFieldUpload_download");

            if (typeof(self.options.multiple) == "undefined")
            {
                self.options.multiple = false;
            }

            if (typeof(self.options.showUploadPreview) == "undefined")
            {
                self.options.showUploadPreview = true;
            }

        },

        /**
         * @see Alpaca.ControlField#renderField
         */
        renderField: function(onSuccess) {

            var self = this;

            this.base(function() {

                self.field = $(self.field).find(".alpaca-fileupload-input-hidden");

                if (onSuccess) {
                    onSuccess();
                }

            });
        },


        /**
         * @see Alpaca.Fields.TextField#postRender
         */
        postRender: function(callback) {

            var self = this;

            this.base(function() {

                if (self.fieldContainer) {
                    self.fieldContainer.addClass('alpaca-controlfield-upload');
                }

                self.handlePostRender(self.fieldContainer, function() {
                    callback();
                });

            });
        },

        handlePostRender: function(el, callback)
        {
            var self = this;

            var uploadTemplateFunction = function(data)
            {
                return Alpaca.tmpl(self.uploadDescriptor, {
                    o: data
                });
            };
             var downloadTemplateFunction = function(data)
             {
                 return Alpaca.tmpl(self.downloadDescriptor, {
                     o: data
                 });
             };

            // file upload config
            var fileUploadConfig = {};

            // defaults
            fileUploadConfig["dataType"] = "json";
            fileUploadConfig["uploadTemplateId"] = null;
            fileUploadConfig["uploadTemplate"] = uploadTemplateFunction;
            fileUploadConfig["downloadTemplateId"] = null;
            fileUploadConfig["downloadTemplate"] = downloadTemplateFunction;
            fileUploadConfig["filesContainer"] = $(el).find(".files");
            fileUploadConfig["dropZone"] = $(el).find(".fileupload-active-zone");
            fileUploadConfig["url"] = "/";
            fileUploadConfig["method"] = "post";
            fileUploadConfig["showUploadPreview"] = self.options.showUploadPreview;

            if (self.options.upload)
            {
                for (var k in self.options.upload)
                {
                    fileUploadConfig[k] = self.options.upload[k];
                }
            }

            if (self.options.multiple)
            {
                $(el).find(".alpaca-fileupload-input").attr("multiple", true);
                $(el).find(".alpaca-fileupload-input").attr("name", self.name + "_files[]");
            }

            // hide the progress bar at first
            $(el).find(".progress").css("display", "none");

            /**
             * If a file is being uploaded, show the progress bar.  Otherwise, hide it.
             *
             * @param e
             * @param data
             */
            fileUploadConfig["progressall"] = function (e, data) {

                var showProgressBar = false;
                if (data.loaded < data.total)
                {
                    showProgressBar = true;
                }
                if (showProgressBar)
                {
                    $(el).find(".progress").css("display", "block");
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('#progress .progress-bar').css(
                        'width',
                        progress + '%'
                    );
                }
                else
                {
                    $(el).find(".progress").css("display", "none");
                }
            };

            // allow for extension
            self.applyConfiguration(fileUploadConfig);

            // instantiate the control
            var fileUpload = self.fileUpload = $(el).find('.alpaca-fileupload-input').fileupload(fileUploadConfig);

            // When file upload of a file competes, we offer the chance to adjust the data ahead of FileUpload
            // getting it.  This is useful for cases where you can't change the server side JSON but could do
            // a little bit of magic in the client.
            fileUpload.bindFirst("fileuploaddone", function(e, data) {

                var enhanceFiles = self.options.enhanceFiles;
                if (enhanceFiles)
                {
                    enhanceFiles(fileUploadConfig, data);
                }
                else
                {
                    self.enhanceFiles(fileUploadConfig, data);
                }

                // copy back down into data.files
                data.files = data.result.files;
            });

            // When files are submitted, the "properties" and "parameters" options map are especially treated
            // and are written into property<index>__<key> and param<index>__key entries in the form data.
            // This allows for multi-part receivers to get values on a per-file basis.
            // Plans are to allow token substitution and other client-side treatment ahead of posting.
            fileUpload.bindFirst("fileuploadsubmit", function(e, data) {

                if (self.options["properties"])
                {
                    $.each(data.files, function(index, file) {

                        for (var key in self.options["properties"])
                        {
                            var propertyName = "property" + index + "__" + key;
                            var propertyValue = self.options["properties"][key];

                            // token substitutions
                            propertyValue = self.applyTokenSubstitutions(propertyValue, index, file);

                            if (!data.formData) {
                                data.formData = {};
                            }

                            data.formData[propertyName] = propertyValue;
                        }
                    });
                }

                if (self.options["parameters"])
                {
                    $.each(data.files, function(index, file) {

                        for (var key in self.options["parameters"])
                        {
                            var paramName = "param" + index + "__" + key;
                            var paramValue = self.options["parameters"][key];

                            // token substitutions
                            paramValue = self.applyTokenSubstitutions(paramValue, index, file);

                            if (!data.formData) {
                                data.formData = {};
                            }

                            data.formData[paramName] = paramValue;
                        }
                    });
                }
            });

            /**
             * When files are uploaded, we adjust the value of the field.
             */
            fileUpload.bind("fileuploaddone", function(e, data) {

                // existing
                var array = self.getValue();

                var f = function(i)
                {
                    if (i == data.files.length)
                    {
                        // done
                        self.setValue(array);
                        return;
                    }

                    self.convertFileToDescriptor(data.files[i], function(err, descriptor) {
                        if (descriptor)
                        {
                            array.push(descriptor);
                        }
                        f(i+1);
                    });
                };
                f(0);
            });

            // allow for extension
            self.applyBindings(fileUpload, el);

            // allow for preloading of documents
            self.preload(fileUpload, el, function(files) {

                if (files)
                {
                    var form = $(self.fieldContainer).find('.alpaca-fileupload-input');
                    $(form).fileupload('option', 'done').call(form, $.Event('done'), {
                        result: {
                            files: files
                        }
                    });

                    self.afterPreload(fileUpload, el, files, function() {
                        callback();
                    });
                }
                else
                {
                    callback();
                }
            });
        },

        applyTokenSubstitutions: function(text, index, file)
        {
            var tokens = {
                "index": index,
                "name": file.name,
                "size": file.size,
                "url": file.url,
                "thumbnailUrl": file.thumbnailUrl
            };

            // substitute any tokens
            var x = -1;
            var b = 0;
            do
            {
                x = text.indexOf("{", b);
                if (x > -1)
                {
                    var y = text.indexOf("}", x);
                    if (y > -1)
                    {
                        var token = text.substring(x + car.length, y);

                        var replacement = tokens[token];
                        if (replacement)
                        {
                            text = text.substring(0, x) + replacement + text.substring(y+1);
                        }

                        b = y + 1;
                    }
                }
            }
            while(x > -1);

            return text;
        },

        /**
         * Removes a descriptor with the given id from the value set.
         *
         * @param id
         */
        removeValue: function(id)
        {
            var self = this;

            var array = self.getValue();
            for (var i = 0; i < array.length; i++)
            {
                if (array[i].id == id)
                {
                    array.splice(i, 1);
                    break;
                }
            }

            self.setValue(array);
        },


        /**
         * Extension point for adding properties and callbacks to the file upload config.
         *
         * @param fileUploadconfig
         */
        applyConfiguration: function(fileUploadconfig)
        {
        },

        /**
         * Extension point for binding event handlers to file upload instance.
         *
         * @param fileUpload
         */
        applyBindings: function(fileUpload)
        {
        },

        /**
         * Converts from a file to a storage descriptor.
         *
         * A descriptor looks like:
         *
         *      {
         *          "id": ""
         *          ...
         *      }
         *
         * A descriptor may contain additional properties as needed by the underlying storage implementation
         * so as to retrieve metadata about the described file.
         *
         * Assumption is that the underlying persistence mechanism may need to be consulted.  Thus, this is async.
         *
         * By default, the descriptor mimics the file.
         *
         * @param file
         * @param callback function(err, descriptor)
         */
        convertFileToDescriptor: function(file, callback)
        {
            var descriptor = {
                "id": file.id,
                "name": file.name,
                "size": file.size,
                "url": file.url,
                "thumbnailUrl":file.thumbnailUrl,
                "deleteUrl": file.deleteUrl,
                "deleteType": file.deleteType
            };

            callback(null, descriptor);
        },

        /**
         * Converts a storage descriptor to a file.
         *
         * A file looks like:
         *
         *      {
         *          "id": "",
         *          "name": "picture1.jpg",
         *          "size": 902604,
         *          "url": "http:\/\/example.org\/files\/picture1.jpg",
         *          "thumbnailUrl": "http:\/\/example.org\/files\/thumbnail\/picture1.jpg",
         *          "deleteUrl": "http:\/\/example.org\/files\/picture1.jpg",
         *          "deleteType": "DELETE"
         *      }
         *
         * Since an underlying storage mechanism may be consulted, an async callback hook is provided.
         *
         * By default, the descriptor mimics the file.
         *
         * @param descriptor
         * @param callback function(err, file)
         */
        convertDescriptorToFile: function(descriptor, callback)
        {
            var file = {
                "id": descriptor.id,
                "name": descriptor.name,
                "size": descriptor.size,
                "url": descriptor.url,
                "thumbnailUrl":descriptor.thumbnailUrl,
                "deleteUrl": descriptor.deleteUrl,
                "deleteType": descriptor.deleteType
            };

            callback(null, file);
        },

        /**
         * Extension point for "enhancing" data received from the remote server after uploads have been submitted.
         * This provides a place to convert the data.rows back into the format which the upload control expects.
         *
         * Expected format:
         *
         *    data.result.rows = [{...}]
         *    data.result.files = [{
         *      "id": "",
         *      "path": "",
         *      "name": "picture1.jpg",
         *      "size": 902604,
         *      "url": "http:\/\/example.org\/files\/picture1.jpg",
         *      "thumbnailUrl": "http:\/\/example.org\/files\/thumbnail\/picture1.jpg",
         *      "deleteUrl": "http:\/\/example.org\/files\/picture1.jpg",
         *      "deleteType": "DELETE"*
         *    }]
         *
         * @param fileUploadConfig
         * @param row
         */
        enhanceFiles: function(fileUploadConfig, data)
        {
        },

        /**
         * Preloads data descriptors into files.
         *
         * @param fileUpload
         * @param el
         * @param callback
         */
        preload: function(fileUpload, el, callback)
        {
            var self = this;

            var files = [];

            // now preload with files based on property value
            var descriptors = self.getValue();

            var f = function(i)
            {
                if (i == descriptors.length)
                {
                    // all done
                    callback(files);
                    return;
                }

                self.convertDescriptorToFile(descriptors[i], function(err, file) {
                    if (file)
                    {
                        files.push(file);
                    }
                    f(i+1);
                });
            };
            f(0);
        },

        afterPreload: function(fileUpload, el, files, callback)
        {
            callback();
        },

        /**
         * @override
         *
         * Retrieves an array of descriptors.
         */
        getValue: function()
        {
            if (!this.data)
            {
                this.data = [];
            }

            return this.data;
        },

        /**
         * @override
         *
         * Sets an array of descriptors.
         *
         * @param data
         */
        setValue: function(data)
        {
            this.data = data;
        },

        reload: function(callback)
        {
            var self = this;

            var descriptors = this.getValue();

            var files = [];

            var f = function(i)
            {
                if (i == descriptors.length)
                {
                    // all done

                    var form = $(self.fieldContainer).find('.alpaca-fileupload-input');
                    $(form).fileupload('option', 'done').call(form, $.Event('done'), {
                        result: {
                            files: files
                        }
                    });

                    callback();

                    return;
                }

                self.convertDescriptorToFile(descriptors[i], function(err, file) {
                    if (file)
                    {
                        files.push(file);
                    }
                    f(i+1);
                });
            };
            f(0);
        },
        //__BUILDER_HELPERS

        /**
         * @see Alpaca.ControlField#getTitle
         */
        getTitle: function() {
            return "Upload Field";
        },

        /**
         * @see Alpaca.ControlField#getDescription
         */
        getDescription: function() {
            return "Provides an upload field with support for thumbnail preview";
        },

        /**
         * @see Alpaca.ControlField#getType
         */
        getType: function() {
            return "array";
        },

        /**
         * @see Alpaca.ControlField#getFieldType
         */
        getFieldType: function() {
            return "upload";
        }//__END_OF_BUILDER_HELPERS
    });

    var TEMPLATE = ' \
        <div class="alpaca-fileupload-container {{if cssClasses}}${cssClasses}{{/if}}"> \
            <div class="container-fluid"> \
                <div class="row"> \
                    <div class="col-md-12"> \
                        <div class="btn-group"> \
                            <button class="btn btn-default fileinput-button"> \
                                <i class="glyphicon glyphicon-upload"></i> \
                                <span class="fileupload-add-button">Choose files...</span> \
                                <input class="alpaca-fileupload-input" type="file" name="${name}_files"> \
                                <input class="alpaca-fileupload-input-hidden" type="hidden" name="${name}_files_hidden"> \
                            </button> \
                        </div> \
                    </div> \
                </div> \
                <div class="row alpaca-fileupload-well"> \
                    <div class="col-md-12 fileupload-active-zone"> \
                        <table class="table table-striped"> \
                            <tbody class="files"> \
                            </tbody> \
                        </table> \
                        <p align="center">Click the Choose button or Drag and Drop files here to start...</p> \
                    </div> \
                </div> \
                <div class="row"> \
                    <div class="col-md-12"> \
                        <div id="progress" class="progress"> \
                            <div class="progress-bar progress-bar-success"></div> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </div> \
    ';

    var TEMPLATE_UPLOAD = ' \
        <script id="template-upload" type="text/x-tmpl"> \
        {{each(i, file) o.files}} \
            <tr class="template-upload fade"> \
                {{if o.options.showUploadPreview}} \
                <td class="preview"> \
                    <span class="fade"></span> \
                </td> \
                {{else}} \
                <td> \
                </td> \
                {{/if}} \
                <td class="name"><span>${file.name}</span></td> \
                <td class="size"><span>${file.size}</span></td> \
            {{if file.error}} \
                <td class="error" colspan="2"><span class="label label-important">Error</span> ${file.error}</td> \
            {{else}} \
                {{if o.files.valid && !i}} \
                <td> \
                    <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"> \
                        <div class="progress-bar" style="width:0%;"></div>\
                    </div> \
                </td> \
                <td class="start">\
                {{if !o.options.autoUpload}} \
                    <button class="btn btn-primary"> \
                        <i class="glyphicon glyphicon-upload glyphicon-white"></i> \
                        <span>Start</span> \
                    </button> \
                {{/if}} \
                </td> \
                {{else}} \
                <td colspan="2"></td> \
                <td class="cancel">\
                {{if !i}} \
                    <button class="btn btn-warning"> \
                        <i class="glyphicon glyphicon-ban-circle glyphicon-white"></i> \
                        <span>Cancel</span> \
                    </button> \
                {{/if}} \
                </td> \
                {{/if}} \
            {{/if}} \
                <td></td> \
            </tr> \
        {{/each}} \
        </script> \
    ';

    var TEMPLATE_DOWNLOAD = ' \
        <script id="template-download" type="text/x-tmpl"> \
        {{each(i, file) o.files}} \
            <tr class="template-download fade"> \
            {{if file.error}} \
                <td></td> \
                <td class="name"><span>${file.name}</span></td> \
                <td class="size"><span>${file.size}</span></td> \
                <td class="error" colspan="2"><span class="label label-important">Error</span> ${file.error}</td> \
            {{else}} \
                <td class="preview"> \
                {{if file.thumbnailUrl}} \
                    <a href="${file.url}" title="${file.name}" data-gallery="gallery" download="${file.name}"> \
                        <img src="${file.thumbnailUrl}"> \
                    </a> \
                {{/if}} \
                </td> \
                <td class="name"> \
                    <a href="${file.url}" title="${file.name}" data-gallery="${file.thumbnailUrl}gallery" download="${file.name}">${file.name}</a> \
                </td> \
                <td class="size"><span>${file.size}</span></td> \
                <td colspan="2"></td> \
            {{/if}} \
                <td> \
                    <button class="delete btn btn-danger" data-type="${file.deleteType}" data-url="${file.deleteUrl}" {{if file.deleteWithCredentials}}data-xhr-fields="{\"withCredentials\":true}" {{/if}}> \
                        <i class="glyphicon glyphicon-trash glyphicon-white"></i> \
                        <span>Delete</span> \
                    </button> \
                </td> \
            </tr> \
        {{/each}} \
        </script> \
    ';

    Alpaca.registerTemplate("controlFieldUpload", TEMPLATE);
    Alpaca.registerTemplate("controlFieldUpload_upload", TEMPLATE_UPLOAD);
    Alpaca.registerTemplate("controlFieldUpload_download", TEMPLATE_DOWNLOAD);
    Alpaca.registerFieldClass("upload", Alpaca.Fields.UploadField);

    // https://github.com/private-face/jquery.bind-first/blob/master/dev/jquery.bind-first.js
    // jquery.bind-first.js
    (function($) {
        var splitVersion = $.fn.jquery.split(".");
        var major = parseInt(splitVersion[0]);
        var minor = parseInt(splitVersion[1]);

        var JQ_LT_17 = (major < 1) || (major == 1 && minor < 7);

        function eventsData($el)
        {
            return JQ_LT_17 ? $el.data('events') : $._data($el[0]).events;
        }

        function moveHandlerToTop($el, eventName, isDelegated)
        {
            var data = eventsData($el);
            var events = data[eventName];

            if (!JQ_LT_17) {
                var handler = isDelegated ? events.splice(events.delegateCount - 1, 1)[0] : events.pop();
                events.splice(isDelegated ? 0 : (events.delegateCount || 0), 0, handler);

                return;
            }

            if (isDelegated) {
                data.live.unshift(data.live.pop());
            } else {
                events.unshift(events.pop());
            }
        }

        function moveEventHandlers($elems, eventsString, isDelegate) {
            var events = eventsString.split(/\s+/);
            $elems.each(function() {
                for (var i = 0; i < events.length; ++i) {
                    var pureEventName = $.trim(events[i]).match(/[^\.]+/i)[0];
                    moveHandlerToTop($(this), pureEventName, isDelegate);
                }
            });
        }

        $.fn.bindFirst = function()
        {
            var args = $.makeArray(arguments);
            var eventsString = args.shift();

            if (eventsString) {
                $.fn.bind.apply(this, arguments);
                moveEventHandlers(this, eventsString);
            }

            return this;
        };

    })($);

})(jQuery);


    return Alpaca;

}));
