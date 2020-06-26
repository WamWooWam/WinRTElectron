(function() {
    var Compose = this.Compose || (this.Compose = {}),
        Templates = Compose.Templates || (Compose.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.replyHeader = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '';
            {
                function str(name) {
                    return Jx.escapeHtml(Jx.res.getString(name));
                }
            }
            $_ += '<div style="border-top:solid #E5E5E5 1px;padding-top:5px;"><div><font face="' + authoringFontFamily + '" style="font-family:' + authoringFontFamily + ';' + fontSizeNormal + '"><b>' + str("composeReplyInfoFrom") + '</b>&nbsp;' + sender;
            if (sentDate) {
                $_ += '<br><b>' + str("composeReplyInfoSent") + '</b>&nbsp;' + sentDate;
            }
            if (recipientsTo) {
                $_ += '<br><b>' + str("composeReplyInfoTo") + '</b>&nbsp;' + recipientsTo;
            }
            if (recipientsCc) {
                $_ += '<br><b>' + str("composeReplyInfoCc") + '</b>&nbsp;' + recipientsCc;
            }
            if (when) {
                $_ += '<br><b>' + str("composeReplyInfoWhen") + '</b>&nbsp;' + when;
                if (recurring) {
                    $_ += '<font face="' + primaryFontFamily + '" style="font-family:' + primaryFontFamily + '"> &#x1f503;</font>';
                }
                $_ += '<br><b>' + str("composeReplyInfoWhere") + '</b>&nbsp;' + where;
            }
            $_ += '</font></div></div><div><br></div>';
            return $_;
        }
    };
})();
