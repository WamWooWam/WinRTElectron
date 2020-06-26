(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.priority = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div id="composePriorityFieldLabelExternal" class="typeSizeNormal composeFieldLabel composeExternalFieldLabel priorityElement" data-win-res="innerText:composePriorityLabel" role="note">WPriorityL</div>    <div class="composePriority priorityElement">        <div id="composePriorityFieldLabel" class="typeSizeNormal composeFieldLabel" data-win-res="innerText:composePriorityLabel" role="note">WPriorityL</div>        <select id="composePrioritySelector" class="composePriorityField composeField" aria-labelledby="composePriorityFieldLabel">            <option class="composeFieldOption" data-win-res="innerText:composeAppBarPriorityHighButton" value="3">WHighL</option>            <option class="composeFieldOption" data-win-res="innerText:composeAppBarPriorityNormalButton" selected="selected" value="1">WNormalL</option>            <option class="composeFieldOption" data-win-res="innerText:composeAppBarPriorityLowButton" value="2">WLowL</option>        </select>    </div>';
            return $_;
        }
    };
})();
