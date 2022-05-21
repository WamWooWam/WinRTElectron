
function openUri(uri) {
    var uriObject = new Windows.Foundation.Uri(uri);
    Windows.System.Launcher.launchUriAsync(uriObject).done();
}

function openUriFromInput() {
    openUri(document.getElementById('uriInput').value);
}
