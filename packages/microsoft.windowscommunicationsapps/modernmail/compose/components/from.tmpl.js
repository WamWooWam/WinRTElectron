(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.from = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div id="addressbarFromDescription" class="compose-describedby-label" data-win-res="innerText:composeFromDescription" role="note"></div>                           <div class="addressbarFromField typeSizeNormal" aria-describedby="addressbarFromDescription" data-win-res="aria-label:composeFrom">' + from + '</div>';
            return $_;
        }
    };
})();
