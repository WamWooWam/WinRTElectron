(function() {
    var ModernCanvas = this.ModernCanvas || (this.ModernCanvas = {}),
        Templates = ModernCanvas.Templates || (ModernCanvas.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.hyperlinkControl = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '    <label id="' + idWebAddressDescription + '" aria-hidden="true">' + webAddressDescription + '</label>    <label id="' + idWebAddressLabel + '">' + labelWebAddress + '</label>	<input id="' + idWebAddress + '" type="url" aria-describedby="' + idWebAddressDescription + '" aria-labelledby="' + idWebAddressLabel + '" />	<label id="' + idTextDescription + '" aria-hidden="true">' + textDescription + '</label>	<label id="' + idTextLabel + '">' + labelTextToBeDisplayed + '</label>	<input id="' + idText + '" type="text" aria-describedby="' + idTextDescription + '" aria-labelledby="' + idTextLabel + '" />	<label id="' + idCompletionButtonDescription + '" aria-hidden="true">' + completionButtonDescription + '</label>	<button id="' + idCompletionButton + '" type="button" aria-describedby="' + idCompletionButtonDescription + '">' + labelCompletionButton + '</button>';
            return $_;
        }
    };
})();
