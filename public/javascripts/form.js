$.ajaxSetup({
    async:false
});

$(document).ready(function() {
    var apiName = $('.apiName').attr('id');
    if (apiName) {
        // Loads the proper JSON file
        $.getJSON("../data/"+apiName+".json", function(json) {
            apiJson = json;
        });

        // Adds definitions to all references to enable alpaca.js references
        function changeObj(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if ("object" == typeof(obj[key])) {
                        changeObj(obj[key]);
                    } else if (key == '$ref') {
                        obj[key] = '#/definitions/' + obj[key];
                    }
                }
            }
        }

        //Sets all parameter locations in schemas to body
        function addLocationBody(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if ("object" == typeof(obj[key])) {
                        if (key != "properties") {
                            if (!obj[key]["location"]) obj[key]["location"] = "body";
                        }
                        if (obj[key].title && !obj[key].description) {
                            obj[key].description = "No description."
                        }
                        addLocationBody(obj[key]);
                    }
                }
            }
        }

        changeObj(apiJson);
        addLocationBody(apiJson.schemas);

        for (resource in apiJson.resources) {
            for (method in apiJson.resources[resource].methods) {
                optionsFields = {};

                //Sets the proper type for Alpaca interpretation
                apiJson.resources[resource].methods[method].type = "object";

                // Adds request properties in the schemas to parameters to render
                if (apiJson.resources[resource].methods[method].request) {
                    if (apiJson.resources[resource].methods[method].request.$ref) {
                        requestParamRef = apiJson.resources[resource].methods[method].request.$ref.split("/")[2];    

                        //Adds a referenced parameter container to the schema from schemas
                        if (apiJson.schemas[requestParamRef].properties) {
                            for (bodyParam in apiJson.schemas[requestParamRef].properties) {
                                if (!apiJson.schemas[requestParamRef].properties[bodyParam].location && (apiJson.schemas[requestParamRef].properties[bodyParam].type != "array")) apiJson.schemas[requestParamRef].properties[bodyParam].location = "body";
                                if (typeof apiJson.resources[resource].methods[method].parameters == "undefined") apiJson.resources[resource].methods[method].parameters = {};
                                apiJson.resources[resource].methods[method].parameters[bodyParam] = apiJson.schemas[requestParamRef].properties[bodyParam];
                            }
                        }

                        //For a direct parameter reference
                        else {
                            if (!apiJson.schemas[requestParamRef].location && (apiJson.schemas[requestParamRef].type != "array")) apiJson.schemas[requestParamRef].location = "body";
                            if (typeof apiJson.resources[resource].methods[method].parameters == "undefined") apiJson.resources[resource].methods[method].parameters = {};
                            apiJson.resources[resource].methods[method].parameters[requestParamRef] = apiJson.schemas[requestParamRef];
                        }
                    }
                    //If the request contains the parameters directly
                    else {
                        //Defaults to location:body for any parameters in the request
                        addLocationBody(apiJson.resources[resource].methods[method].request);

                        if (apiJson.resources[resource].methods[method].request.properties) {
                            for (bodyParam in apiJson.resources[resource].methods[method].request.properties) {
                                if (!apiJson.resources[resource].methods[method].request.properties[bodyParam].location && (apiJson.resources[resource].methods[method].request.properties[bodyParam].type != "array")) apiJson.resources[resource].methods[method].request.properties[bodyParam].location = "body";
                                if (typeof apiJson.resources[resource].methods[method].parameters == "undefined") apiJson.resources[resource].methods[method].parameters = {};
                                apiJson.resources[resource].methods[method].parameters[bodyParam] = apiJson.resources[resource].methods[method].request.properties[bodyParam];
                            }
                        }
                        else {
                            for (bodyParam in apiJson.resources[resource].methods[method].request) {
                                if (!apiJson.resources[resource].methods[method].request[bodyParam].location && (apiJson.resources[resource].methods[method].request[bodyParam].type != "array")) apiJson.resources[resource].methods[method].request[bodyParam].location = "body";
                                if (typeof apiJson.resources[resource].methods[method].parameters == "undefined") apiJson.resources[resource].methods[method].parameters = {};
                                apiJson.resources[resource].methods[method].parameters[bodyParam] = apiJson.resources[resource].methods[method].request[bodyParam];
                            }
                        }
                    }
                }           

                var paramCount = 0;
                for (parameter in apiJson.resources[resource].methods[method].parameters) {
                    paramCount++;

                    //Sets the Alpaca options for each parameter
                    parameterOptions = {
                        "name": "values_" + paramCount,
                        "toolbarSticky": true,
                        "size": 20,
                        "number": paramCount,
                        "paramName": parameter,
                        "items": {
                            "addItemLabel": "Add " + parameter,
                            "removeItemLabel": "Remove " + parameter,
                            "moveUpItemLabel": "Move Up " + parameter,
                            "moveDownItemLabel": "Move Down " + parameter
                        },
                        "fields": {
                            "item": {
                                "size": 20,
                                "number": paramCount
                            }
                        }
                    };

                    var paramReference;
                    //Sets appropriate parameters of type == "array"
                    if (apiJson.resources[resource].methods[method].parameters[parameter].type == "array" || (apiJson.resources[resource].methods[method].parameters[parameter].$ref && apiJson.schemas[apiJson.resources[resource].methods[method].parameters[parameter].$ref.split("/")[2]].type == "array")) {
                        if (apiJson.resources[resource].methods[method].parameters[parameter].$ref) {
                            paramReference = apiJson.schemas[apiJson.resources[resource].methods[method].parameters[parameter].$ref.split("/")[2]].items;
                            paramContainerRef = apiJson.schemas[apiJson.resources[resource].methods[method].parameters[parameter].$ref.split("/")[2]];
                        }
                        else { 
                            paramReference = apiJson.resources[resource].methods[method].parameters[parameter].items;
                            paramContainerRef = apiJson.resources[resource].methods[method].parameters[parameter];
                        }

                        //Sets location 
                        if (paramContainerRef.location) {
                            paramReference.location = paramContainerRef.location;
                        }
                        else if (paramReference.location && !paramContainerRef.location) {
                            paramContainerRef.location = paramReference.location;
                        }
                        else if (!paramReference.location) {
                            //Default location body for array type
                            paramContainerRef.location = "body";
                            paramReference.location = "body";
                        }

                        // Sets placeholder if parameter is required
                        if (paramReference.required == true || paramReference.required == "Y") {
                            var fieldsOptions = {
                                "item": {
                                    "placeholder": "required",
                                    "size": 20
                                }
                            }
                            parameterOptions["fields"] = fieldsOptions;
                        }

                        //Accounts for whether the parameter has an enum
                        if (paramReference.enum) {
                                parameterOptions["fields"]["item"]["type"] = "select";
                                parameterOptions["fields"]["item"]["optionLabels"] = paramReference.enumDescription;
                                parameterOptions["fields"]["item"]["size"] = null;
                                parameterOptions["size"] = null;
                        }
                    }
                    else {
                        if (apiJson.resources[resource].methods[method].parameters[parameter].$ref) {
                            paramReference = apiJson.schemas[apiJson.resources[resource].methods[method].parameters[parameter].$ref.split("/")[2]];
                        }
                        else {
                            paramReference = apiJson.resources[resource].methods[method].parameters[parameter];
                        }

                        //Sets title if missing
                        if (!paramReference.title && !paramReference.$ref) {
                            paramReference.title = parameter;
                        }

                        //Sets placeholder if parameter is required
                        if (paramReference.required == true || paramReference.required == "Y") {
                            parameterOptions["placeholder"] = "required";    
                        }

                        //Sets options to textarea if necessary
                        if (paramReference.type == "textarea") {
                            parameterOptions["type"] = "textarea";
                            parameterOptions["cols"] = 20;
                            paramReference.type = "string";
                        }

                        //Sets options to type boolean 
                        if (paramReference.type == "boolean") {
                            parameterOptions["type"] = "select";
                            paramReference.enum = (paramReference.booleanValues) ? paramReference.booleanValues : [true, false];
                            parameterOptions["size"] = null;
                        }

                        if (paramReference.type == "object") {
                            if ((paramReference.location && paramReference.location == "body") || !paramReference.location) addLocationBody(paramReference);
                            for (subParam in paramReference.properties) {
                                parameterOptions["fields"][subParam] = {
                                    "size": 20,
                                    "number": paramCount,
                                    "paramName": parameter
                                };
                            }
                        }

                        if (paramReference.enum && paramReference.type != "boolean") {
                                parameterOptions["type"] = "select";
                                parameterOptions["optionLabels"] = paramReference.enumDescription;
                                parameterOptions["size"] = null;
                            }

                        //Default parameter location is query
                        if (!paramReference.location) {
                            paramReference.location = "query";
                        }
                    }

                    //Sets description to "No description" if none provided
                    if (!paramReference.description && !paramReference.$ref) {
                        paramReference.description = "No description.";
                    }

                    //Stores the options for each parameter
                    optionsFields[parameter] = parameterOptions
                }

                apiJson.resources[resource].methods[method]["definitions"] = apiJson.schemas;
                apiJson.resources[resource].methods[method].properties = apiJson.resources[resource].methods[method].parameters;
                apiJson.resources[resource].methods[method].parameters = null;
                apiJson.resources[resource].methods[method].methodKey = method;

                //Alpaca form generation
                $("#" + method).alpaca({
                    "schema": apiJson.resources[resource].methods[method],
                    "options": {
                        "fields": optionsFields
                    },
                    "view": {
                        "parent": "VIEW_WEB_EDIT",
                        "style": "jquery-ui",
                        "templates": {
                            "controlFieldMessage": '<div></div>',
                            "controlFieldLabel": '{{if options.label}}<div class="col-name body {{if options.labelClass}}${options.labelClass}{{/if}}">${options.label}</div>{{/if}}',
                            "controlFieldHelper": '{{if options.helper}}<div class="col-description body {{if options.helperClass}}${options.helperClass}{{/if}} alpaca-controlfield-helper-text">${options.helper}</div>{{/if}}',
                            "controlFieldLocation": '<div class="location body alpaca-data-label">${ this.data.schema.location }</div>',
                            "controlFieldType": '<div class="col-type body alpaca-data-label">${ this.data.schema.type }</div>',
                            "controlFieldContainer": '<div class="col-parameter body"></div>{{html this.html}}',
                            "controlField": '<div class="required row">{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{html Alpaca.fieldTemplate(this,"controlFieldLocation")}}{{html Alpaca.fieldTemplate(this,"controlFieldType")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{/wrap}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{/wrap}}</div>',
                            "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"></div>{{/if}}',
                            "fieldSetItemContainer": '<div class="container"></div>'
                        }
                    },
                    "postRender": function(form) {
                        $("." + form.schema.methodKey).click(function(event) {
                            var json = form.getValue();
                            var locations = {};
                            for (i in form.schema.properties) {
                                locations[i] = form.schema.properties[i].location;
                            }
                            for (j in form.schema.definitions) {
                                locations[j] = form.schema.definitions[j].location;   
                            }
                            $("#" + form.schema.methodKey + "json").val(JSON.stringify(json));
                            $("#" + form.schema.methodKey + "locations").val(JSON.stringify(locations));
                            return;
                        })
                    }
                });
            }
        }
    }
});