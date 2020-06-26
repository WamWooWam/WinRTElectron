window.share = function() {

  // List of all of the URL element attributes
  var URLElements = {
    "a": "href",
    "applet": ["archive", "code", "codebase"],
    "area": "href",
    "audio": "src",
    "base": "href",
    "blockquote": ["cite"],
    "body": "background",
    "button": "formaction",
    "command": "icon",
    "del": ["cite"],
    "embed": "src",
    "form": "action",
    "frame": ["longdesc", "src"],
    "iframe": ["longdesc", "src"],
    "img": ["longdesc", "src"],
    "input": ["formaction", "src"],
    "ins": ["cite"],
    "link": "href",
    "object": ["archive", "codebase", "data"],
    "q": ["cite"],
    "script": "src",
    "source": "src",
  };

  // Expands URL element attributes
  function expandAttribute(node, attrName, baseURL, pageURL) {
    var attrValue = node.getAttribute(attrName);
    if (!attrValue)
      return;

    try {
      var url = node.getAttribute(attrName)
      // Resolve protocol absolute, domain absolute and relative URLs
      if (url && url.length > 1 && url[0] == '/' && url[1] == '/') {
        url = 'http:' + url;
      } else if (url && url.length > 0 && url[0] == '/') {
        url = baseURL + url;
      } else if (url.indexOf('://') == -1) {
        url = pageURL + url;
      }
      node.setAttribute(attrName, url);
    } catch (e) {
    }
  }

  // Expands all URLs recursively from parent n
  function expandURLs(n, baseURL, pageURL) {
    for (var i = 0; i < n.children.length; i++) {
      var child = n.children[i];
      var childTagName = child.tagName.toLowerCase();
      for (var tagName in URLElements) {
        if (tagName === childTagName) {
          if (URLElements[tagName] instanceof Array) {
            URLElements[tagName].forEach(function (attrName) {
              expandAttribute(child, attrName, baseURL, pageURL);
            }, this);
          } else {
            expandAttribute(child, URLElements[tagName], baseURL, pageURL);
          }
        }
      }

      expandURLs(child, baseURL, pageURL);
    }
  }

  return {
    expandURLs: expandURLs
  };

}();
