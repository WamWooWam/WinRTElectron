(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.body = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div id="composeCanvasDescribedBy" class="compose-describedby-label" data-win-res="innerText:composeCanvasDescription" role="note"></div>    <div class="composeCanvas" aria-describedby="composeCanvasDescribedBy" data-win-res="aria-label:composeCanvasLabel"></div>';
            return $_;
        }
    };
})();
