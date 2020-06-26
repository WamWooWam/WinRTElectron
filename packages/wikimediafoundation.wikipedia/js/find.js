function findInElement(element, query) {
    var range = document.createRange();
    if (query !== '') {
        if (range.findText(query)) {
            try {
                range.select();
            } catch (e) {
                console.log(e);
            }
        }
    }
}
