(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.warningMessage = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div class="warningMessage" aria-live="polite" role="note">    </div>';
            return $_;
        }
    };
})();
