(function() {
    var ShareTarget = this.ShareTarget || (this.ShareTarget = {}),
        Templates = ShareTarget.Templates || (ShareTarget.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.shareButton = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '<button id="shareButton" data-win-res="title:/shareanythingstrings/shareButton;aria-label:/shareanythingstrings/shareButton" type="button">	<span class="win-commandicon win-commandring">		<span class="win-commandimage">&#xE122;</span>	</span></button>';
            return $_;
        }
    };
})();
