(function() {
    var anchor = window.location.hash;
    // Find the resource or method being referenced.

    if (/PUT|POST|GET|DELETE/.test(anchor)){
        // Opens up a particular method.
        var div_node = $('div.clickable').has('a[href="'+anchor+'"]');
        div_node.closest('li.resource').children('ul.methods').slideToggle();
        div_node.closest('li.resource').toggleClass('expanded');
        div_node.siblings('form').slideToggle();
    }
    else {
        // Opens up an resource.
        var span_node = $('span.name').has('a[href="'+anchor+'"]');
        span_node.closest('li.resource').children('ul.methods').slideToggle();
        span_node.closest('li.resource').toggleClass('expanded');
    }
})();
