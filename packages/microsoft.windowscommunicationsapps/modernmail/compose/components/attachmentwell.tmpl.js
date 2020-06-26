(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.attachmentWellProgressBar = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <progress class="compose-progress-bar" aria-hidden="true"></progress>';
            return $_;
        }
    };
    __Tmpl__.attachmentWellArea = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div class="composeAttachmentArea"></div>';
            return $_;
        }
    };
})();
