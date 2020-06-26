(function () {

    var CTR_TITLE_ID = 0x5A511B59;

    WinJS.Namespace.define("ZL", {
        Achievements: {

            getUnlockedIds: function (callback) {

                // user must be signed in to retrieve achievements
                var user = ZL.Player.user;
                if (!user) {
                    callback(null);
                    return;
                }

                user.getAchievementsAsync(0, 20, false, null).then(
                    function recievedAchievementIds(achievements) {
                        var earnedIds = [],
                            len = achievements.totalRecords,
                            i, a;

                        // extract the ids for achievements that have been earned
                        for (i = 0; i < len; i++) {
                            a = achievements.items.getAt(i);
                            if (a && a.isEarned) {
                                earnedIds.push(a.id);
                            }
                        }

                        callback(earnedIds);
                    },
                    function achievementError(error) {
                        callback(null);
                    });
            },

            // Unlocks an achievement and executes a callback upon completion.
            // The callback parameter will indicate whether the achievement was
            // successfully unlocked
            unlock: function (achievementId, callback) {

                // user must be signed in
                var user = ZL.Player.user;
                if (!user) {
                    callback(false);
                }

                user.unlockAchievementAsync(achievementId).then(
                    function onSuccess() {
                        callback(true);
                    },
                    function onError(error) {
                        callback(false);
                    });
            }
        }
    });
})();
