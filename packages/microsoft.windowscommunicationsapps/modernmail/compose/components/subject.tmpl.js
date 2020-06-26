(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.subject = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div id="composeSubjectLineDescribedBy" class="compose-describedby-label" data-win-res="innerText:composeSubjectDescription" role="note"></div>    <div class="composeSubjectParent typeSize16pt">        <div class="composeDraftText" data-win-res="innerText:mailMessageListDraftPrefix"></div>        <input class="composeSubjectLine" aria-describedby="composeSubjectLineDescribedBy" data-win-res="aria-label:composeSubjectLabel;placeholder:composeSubjectPlaceholder" maxlength="255" placeholder="WSubjectL" spellcheck="true" type="text" />    </div>';
            return $_;
        }
    };
})();
