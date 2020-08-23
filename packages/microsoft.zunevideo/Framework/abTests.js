/* Copyright (C) Microsoft Corporation. All rights reserved. */
this.scriptValidator("/Framework/debug.js");
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Utilities) {
            var ABGroup = (function() {
                    function ABGroup(abGroupName, percentage) {
                        this.abGroupName = abGroupName;
                        this.percentage = percentage
                    }
                    return ABGroup
                })();
            Utilities.ABGroup = ABGroup
        })(Entertainment.Utilities || (Entertainment.Utilities = {}));
        var Utilities = Entertainment.Utilities
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Utilities) {
            var ABTestsEnum = (function() {
                    function ABTestsEnum(){}
                    ABTestsEnum.testABTests = "testABTests";
                    ABTestsEnum.musicUpsellBannerMessage = "musicUpsellBannerMessage";
                    ABTestsEnum.musicUpsellBannerAction = "musicUpsellBannerAction";
                    ABTestsEnum.videoPostRoll = "videoPostRoll";
                    ABTestsEnum.videoPostRollNoMovieMarketplace = "videoPostRollNoMovieMarketplace";
                    ABTestsEnum.videoPostRollNoTvMarketplace = "videoPostRollNoTvMarketplace";
                    return ABTestsEnum
                })();
            Utilities.ABTestsEnum = ABTestsEnum;
            (function(ABGroupNames) {
                var MusicUpsellBannerMessage = (function() {
                        function MusicUpsellBannerMessage(){}
                        MusicUpsellBannerMessage.option1 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT";
                        MusicUpsellBannerMessage.option2 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT2";
                        MusicUpsellBannerMessage.option3 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT3";
                        MusicUpsellBannerMessage.option4 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT4";
                        return MusicUpsellBannerMessage
                    })();
                ABGroupNames.MusicUpsellBannerMessage = MusicUpsellBannerMessage;
                var MusicUpsellBannerAction = (function() {
                        function MusicUpsellBannerAction(){}
                        MusicUpsellBannerAction.option1 = "IDS_MUSIC_UPSELL_BANNER_SIGN_{0}_ACTION";
                        MusicUpsellBannerAction.option2 = "IDS_MUSIC_UPSELL_BANNER_SIGN_{0}_ACTION2";
                        return MusicUpsellBannerAction
                    })();
                ABGroupNames.MusicUpsellBannerAction = MusicUpsellBannerAction;
                var VideoPostRoll = (function() {
                        function VideoPostRoll(){}
                        VideoPostRoll.Control = "Control";
                        VideoPostRoll.MovieStore = "MovieStore";
                        VideoPostRoll.TvStore = "TvStore";
                        return VideoPostRoll
                    })();
                ABGroupNames.VideoPostRoll = VideoPostRoll;
                var VideoPostRollNoMovieMarketplace = (function() {
                        function VideoPostRollNoMovieMarketplace(){}
                        VideoPostRollNoMovieMarketplace.Control = "Control";
                        VideoPostRollNoMovieMarketplace.TvStore = "TvStore";
                        return VideoPostRollNoMovieMarketplace
                    })();
                ABGroupNames.VideoPostRollNoMovieMarketplace = VideoPostRollNoMovieMarketplace;
                var VideoPostRollNoTvMarketplace = (function() {
                        function VideoPostRollNoTvMarketplace(){}
                        VideoPostRollNoTvMarketplace.Control = "Control";
                        VideoPostRollNoTvMarketplace.MovieStore = "MovieStore";
                        return VideoPostRollNoTvMarketplace
                    })();
                ABGroupNames.VideoPostRollNoTvMarketplace = VideoPostRollNoTvMarketplace
            })(Utilities.ABGroupNames || (Utilities.ABGroupNames = {}));
            var ABGroupNames = Utilities.ABGroupNames
        })(Entertainment.Utilities || (Entertainment.Utilities = {}));
        var Utilities = Entertainment.Utilities
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
