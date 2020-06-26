(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.toCcBcc = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <div class="addressWellError compose-errorMessage" aria-live="assertive" aria-role="alert"></div>    <div id="addressbarToDescription" class="compose-describedby-label" role="note"></div>	<div id="addressbarToErrorDescription" class="compose-describedby-label" role="note"></div>    <button id="addressbarToFieldLabel" class="typeSizeNormal compose-address-label toElement" data-win-res="innerText:composeTo" type="button" tabindex="4">WToL</button>    <div id="addressbarToField" class="compose-address-editbox typeSizeNormal toElement">' + to + '</div>    <div id="addressbarCcDescription" class="compose-describedby-label" role="note"></div>	<div id="addressbarCcErrorDescription" class="compose-describedby-label" role="note"></div>    <button id="addressbarCcFieldLabel" class="typeSizeNormal compose-address-label ccElement" data-win-res="innerText:composeCc" type="button" tabindex="3">WCcL</button>    <div id="addressbarCcField" class="compose-address-editbox typeSizeNormal ccElement">' + cc + '</div>    <div id="addressbarBccDescription" class="compose-describedby-label" role="note"></div>	<div id="addressbarBccErrorDescription" class="compose-describedby-label" role="note"></div>    <button id="addressbarBccFieldLabel" class="typeSizeNormal compose-address-label bccElement" data-win-res="innerText:composeBcc" type="button" tabindex="2">WBccL</button>    <div id="addressbarBccField" class="compose-address-editbox typeSizeNormal bccElement">' + bcc + '</div>';
            return $_;
        }
    };
})();
