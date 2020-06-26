Jx.delayDefine(Mail, "Validators", function() {
    "use strict";
    var n = null;
    Mail.Validators = {
        hasPropertyChanged: function(n, t) {
            return Array.prototype.indexOf.call(n, t) !== -1
        },
        havePropertiesChanged: function(n, t) {
            return t.some(function(t) {
                return Mail.Validators.hasPropertyChanged(n, t)
            })
        },
        areEqual: function(n, t) {
            return n === t ? true : Jx.isObject(n) && Jx.isObject(t) && Jx.isNonEmptyString(n.objectId) && n.objectId === t.objectId
        },
        clamp: function(n, t, i) {
            return Math.min(Math.max(n, t), i)
        },
        hashString: function(t) {
            Mail.writeProfilerMark("Validators.hashString", Mail.LogEvent.start);

            var cryptography = Windows.Security.Cryptography;
            var cryptoBuffer = cryptography.CryptographicBuffer;
            var core = cryptography.Core;

            var algo = core.HashAlgorithmProvider.openAlgorithm(core.HashAlgorithmNames.sha1);
            var binary = cryptoBuffer.convertStringToBinary(t); // should be UTF16 but i can't :)
            var hash = algo.hashData(binary);
            var base64 = cryptoBuffer.encodeToBase64String(hash);

            Mail.writeProfilerMark("Validators.hashString", Mail.LogEvent.stop);
            
            return base64;
        },
        isDocumentReady: function(n) {
            try {
                var t = n.readyState;
                return t === "complete" || t === "interactive"
            } catch (i) {}
            return false
        }
    }
})
