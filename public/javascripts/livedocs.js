var livedocs = (function() {

    var ld = {};

    /**
     * Convert ugly data into pretty data based on the content-type.
     * @param {string} data The data, presumably of a certain content-type (JSON/XML/HTML)
     * @param {String} contentType The content type of the data
     */
    ld.formatData = function(data, contentType) {
        if (!contentType || typeof contentType != 'string') {
            return data;
        }

        switch (true) {
            case /application\/javascript/.test(contentType):
            case /application\/json/.test(contentType):
                // If result is JSON in string format, objectify it so we can format it.
                if (typeof data == 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch(e) {
                        console.log('Response said it was JSON, but it\'s not. :(');
                    }
                }

                data = formatJSON(data);

                break;
            case /application\/xml/.test(contentType):
            case /text\/xml/.test(contentType):
            case /html/.test(contentType):
                data = formatXML(data);

                break;
        }

        return data;
    };

    /**
     * Handle OAuth success callback
     */
    ld.authSuccess = function(token) {
        $('#oauthAuthenticated').show();
        $('section.credentials').addClass('authed');
        if (token) {
            $('#accessToken').val(token.match(/access_token\=([^&]+)[&]?/)[1]);
        }
    };

    return ld;
}());

