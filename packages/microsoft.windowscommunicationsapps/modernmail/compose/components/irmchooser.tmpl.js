(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.irmChooser = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div id="composeIrmFieldLabelExternal" class="typeSizeNormal composeFieldLabel composeExternalFieldLabel irmElement" data-win-res="innerText:composePermissionLabel" role="note"></div>    <div class="composeIrmChooser irmElement">        <div id="composeIrmFieldLabel" class="typeSizeNormal composeFieldLabel" data-win-res="innerText:composePermissionLabel" role="note"></div>        <select id="composeIrmFieldChooser" class="composeIrmField composeField" aria-labelledby="composeIrmFieldLabel"></select>    </div>    <div class="composeIrmDescription typeSizeSmall irmElement"></div>';
            return $_;
        }
    };
})();
