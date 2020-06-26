(function() {
    var ShareTarget = this.ShareTarget || (this.ShareTarget = {}),
        Templates = ShareTarget.Templates || (ShareTarget.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.shareProgress = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '<div class="share-progress">	<progress class="win-ring"></progress>	<span class="share-progressTxt" aria-live="polite" data-win-res="innerText:/sharetargetstrings/progressText"></span>	<br />	<button id="shareCancel" data-win-res="innerText:/sharetargetstrings/cancelButton"></button></div><div id="shareProgressHidden"></div>';
            return $_;
        }
    };
})();
