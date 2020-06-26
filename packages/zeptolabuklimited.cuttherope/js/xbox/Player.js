(function () {

    // cache sign-in related controls
    var $message, $signIn, $signOut, $gamerPicture,
        PENDING_CLASS = 'pending',
        setMessage = ZeptoLab.ctr.setSignInMessage,
        setGamertag = ZeptoLab.ctr.setSignInGamertag;
    
    WinJS.Namespace.define("ZL", {
        Player: {
            user: null,
            identity: null,
            profile: null,
            init: function () {

                $message = $('#signInMessage');
                $signIn = $('#signInButton').click($.proxy(this.signIn, this));
                $signOut = $('#signOutButton').click($.proxy(this.signOut, this)).hide();
                $gamerPicture = $('#gamerPicture');

                this.user = new Microsoft.Xbox.User();

                Microsoft.Xbox.XboxLIVEService.serviceClient.addEventListener(
                    "signedout",
                    this.onSignedOut);
            },
            signInPending: false,
            signIn: function () {
                if (this.signInPending) {
                    return;
                }

                this.signInPending = true;
                var signInCompleted = function () {
                    $signIn.removeClass(PENDING_CLASS);
                    this.signInPending = false;
                }.bind(this);

                $signIn.addClass(PENDING_CLASS);
                $signOut.hide();

                setMessage(XboxStringId.SIGNING_IN);

                Microsoft.Xbox.XboxLIVEService.signInAsync().then(
                    function signInSucceeded(identity) {
                        this.identity = identity;

                        // get user profile
                        this.user.getProfileAsync().then(
                            function getProfileSucceeded(profile) {
                                this.profile = profile;

                                $gamerPicture.css('background-image', 'url(' + profile.gamerPictureUrl + ')');

                                // Test max length gamertag
                                //setGamertag('WWWWWMMMMMWWWWW');

                                setGamertag(profile.gamertag);

                                $signIn.hide();
                                $signOut.show();
                                signInCompleted();
                                ZeptoLab.ctr.onUserIdChanged(identity.xuid);
                                ZeptoLab.ctr.onSignIn();
                            }.bind(this),
                            function getProfileFailed(e) {
                                setMessage(XboxStringId.PROFILE_NOT_FOUND);
                                signInCompleted();
                            }.bind(this)
                        );
                    }.bind(this),
                    function signInFailed(e) {
                        setMessage(XboxStringId.CANNOT_SIGN_IN);
                        signInCompleted();
                        ZeptoLab.ctr.setPaidBoxes(true);
                    }
                );
            },
            signOut: function () {
                Microsoft.Xbox.XboxLIVEService.signOutAsync();
                this.onSignedOut();
            },
            onSignedOut: function () {
                this.identity = null;
                this.profile = null;

                // reset sign in controls
                $gamerPicture.css('background-image', '');
                setMessage(XboxStringId.XBOX_LIVE);
                $signIn.show();
                $signOut.hide();
                ZeptoLab.ctr.onUserIdChanged(null);
                ZeptoLab.ctr.onSignOut();
            }
        }
    });
}());