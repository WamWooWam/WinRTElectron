(function() {
    var ShareAnything = this.ShareAnything || (this.ShareAnything = {}),
        Templates = ShareAnything.Templates || (ShareAnything.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.sharePreview = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '<div id="sharePreview" class="share-pvLoading">	<progress class="win-ring"></progress>	<div data-win-res="innerText:/shareanythingstrings/previewLoadingText"></div>	<div class="share-pvClose">		<a id="sharePVClose" data-win-res="innerText:/shareanythingstrings/previewCancel" href="#"></a>	</div>	<div id="hiddenSharePreview" class="hiddenShare-preview" aria-hidden="true"></div></div>';
            return $_;
        }
    };
})();
