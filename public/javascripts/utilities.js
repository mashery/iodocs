// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});

function spaces(len) {
    var s = '',
    indent = len * 4;

    for (var i = 0; i < indent;i++) {
        s += " ";
    }

    return s;
}

function formatXML(str) {
    var xml = '';

    // add newlines
    str = str.replace(/(>)(<)(\/*)/g,"$1\r$2$3");

    // add indents
    var pad = 0,
        indent,
        node;

    // split the string
    var strArr = str.split("\r");

    // check the various tag states
    for (var i = 0, len = strArr.length; i < len; i++) {
        indent = 0;
        node = strArr[i];

        if (node.match(/.+<\/\w[^>]*>$/)) { //open and closing in the same line
            indent = 0;
        } else if (node.match(/^<\/\w/) && pad > 0) { // closing tag
            pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) { //opening tag
            indent = 1;
        } else {
            indent = 0;
        }

        xml += spaces(pad) + node + "\r";
        pad += indent;
    }

    return xml;

}

function formatJSON(jsonString) {
    return JSON.stringify(jsonString, null, '    ');
}

// Cause the browser to "select" all the text in an element
function selectElementText(el, win) {
    el.focus();
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}