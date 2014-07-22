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

        for (resource in apiJson.resources) {
            for (method in apiJson.resources[resource].methods) {
                optionsFields = {};

                //Sets the proper type for Alpaca interpretation
                apiJson.resources[resource].methods[method].type = "object";

                // Adds referenced properties in the schemas to parameters to render
                if (apiJson.resources[resource].methods[method].request && apiJson.resources[resource].methods[method].request.$ref) {
                    requestParamRef = apiJson.resources[resource].methods[method].request.$ref;
                    for (bodyParam in apiJson.schemas[requestParamRef].properties) {
                        apiJson.schemas[requestParamRef].properties[bodyParam].location = "body";
                        if (typeof apiJson.resources[resource].methods[method].parameters == "undefined") apiJson.resources[resource].methods[method].parameters = {};
                        apiJson.resources[resource].methods[method].parameters[bodyParam] = apiJson.schemas[requestParamRef].properties[bodyParam];
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

                    //Sets appropriate parameters of type == "array"
                    if (apiJson.resources[resource].methods[method].parameters[parameter].type == "array") {
                        //If no parameter description, sets description to "No description"
                        if (!apiJson.resources[resource].methods[method].parameters[parameter].items.description) {
                            apiJson.resources[resource].methods[method].parameters[parameter].items.description = "No description.";
                        }

                        // Sets placeholder if required
                        if (apiJson.resources[resource].methods[method].parameters[parameter].items.required == true || apiJson.resources[resource].methods[method].parameters[parameter].items.required == "Y") {
                            var fieldsOptions = {
                                "item": {
                                    "placeholder": "required",
                                    "size": 20
                                }
                            }
                            parameterOptions["fields"] = fieldsOptions;
                        }

                        // Default array location == "body"
                        if (!apiJson.resources[resource].methods[method].parameters[parameter].items.location) {
                            apiJson.resources[resource].methods[method].parameters[parameter].items.location = "body";
                        }

                        if (apiJson.resources[resource].methods[method].parameters[parameter].items.enum) {
                                parameterOptions["fields"]["item"]["type"] = "select";
                                parameterOptions["fields"]["item"]["optionLabels"] = apiJson.resources[resource].methods[method].parameters[parameter].items.enumDescription;
                                parameterOptions["fields"]["item"]["size"] = null;
                                parameterOptions["size"] = null;
                            }
                    }
                    else {
                        //Sets description if missing
                        if (!apiJson.resources[resource].methods[method].parameters[parameter].description) {
                            apiJson.resources[resource].methods[method].parameters[parameter].description = "No description.";
                        }

                        //Sets title if missing
                        if (!apiJson.resources[resource].methods[method].parameters[parameter].title) {
                            apiJson.resources[resource].methods[method].parameters[parameter].title = parameter;
                        }

                        //Sets placeholder if parameter is required
                        if (apiJson.resources[resource].methods[method].parameters[parameter].required == true || apiJson.resources[resource].methods[method].parameters[parameter].required == "Y") {
                            parameterOptions["placeholder"] = "required";    
                        }

                        if (apiJson.resources[resource].methods[method].parameters[parameter].type == "textarea") {
                            parameterOptions["type"] = "textarea";
                            parameterOptions["cols"] = 20;
                            apiJson.resources[resource].methods[method].parameters[parameter].type = "string";
                        }

                        if (apiJson.resources[resource].methods[method].parameters[parameter].type == "boolean") {
                            parameterOptions["type"] = "select";
                            apiJson.resources[resource].methods[method].parameters[parameter].enum = (apiJson.resources[resource].methods[method].parameters[parameter].booleanValues) ? apiJson.resources[resource].methods[method].parameters[parameter].booleanValues : [true, false];
                            parameterOptions["size"] = null;
                        }

                        if (apiJson.resources[resource].methods[method].parameters[parameter].enum && apiJson.resources[resource].methods[method].parameters[parameter].type != "boolean") {
                                parameterOptions["type"] = "select";
                                parameterOptions["optionLabels"] = apiJson.resources[resource].methods[method].parameters[parameter].enumDescription;
                                parameterOptions["size"] = null;
                            }

                        //Default parameter location is query
                        if (!apiJson.resources[resource].methods[method].parameters[parameter].location) {
                            apiJson.resources[resource].methods[method].parameters[parameter].location = "query";
                        }
                    }
                    //Stores the options for each parameter
                    optionsFields[parameter] = parameterOptions
                }

                apiJson.resources[resource].methods[method]["definitions"] = apiJson.schemas;
                apiJson.resources[resource].methods[method].properties = apiJson.resources[resource].methods[method].parameters;
                apiJson.resources[resource].methods[method].parameters = null;

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
                            "controlFieldContainer": '<div class="col-parameter body"><input type="hidden" name="keys[${this.data.options.number}]" value=${this.data.schema.title}><input type="hidden" name="locations[${this.data.options.number}]" value=${this.data.schema.location}></div>{{html this.html}}',
                            "controlField": '<div class="required row">{{html Alpaca.fieldTemplate(this,"controlFieldHelper")}}{{html Alpaca.fieldTemplate(this,"controlFieldLocation")}}{{html Alpaca.fieldTemplate(this,"controlFieldType")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldContainer",true)}}{{/wrap}}{{html Alpaca.fieldTemplate(this,"controlFieldLabel")}}{{wrap(null, {}) Alpaca.fieldTemplate(this,"controlFieldOuterEl",true)}}{{/wrap}}</div>',
                            "fieldSetHelper": '{{if options.helper}}<div class="{{if options.helperClass}}${options.helperClass}{{/if}}"></div>{{/if}}',
                            "fieldSetItemContainer": '<div class="container"></div>'
                        }
                    }
                });
            }
        }
    }
});