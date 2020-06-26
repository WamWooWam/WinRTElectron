(function () {

    var CTR_TITLE_ID = 0x5A511B59;

    // leaderboard ids for each of the boxes in order (from xbl.spa.h)
    var LeaderboardIds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    // score column ids for each leaderboard in order (from xbl.spa.h)
    var ScoreColumnIds = [22, 23, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102];

    WinJS.Namespace.define("ZL", {
        Leaderboards: {
            getBoxScores: function (boxIndex, maxScores, callback) {
                var service = new Microsoft.Xbox.Leaderboards.LeaderboardService(CTR_TITLE_ID);
                service.getLeaderboardAsync(
                        0,
                        maxScores,  // maxItems
                        LeaderboardIds[boxIndex],
                        true, // title view
                        [65535, 65533, 65534], // rank, gamertag, score
                        null) // previous leaderboard
                    .then(
                        function (leaderboard) {

                            var scores = [],
                                userList = leaderboard.userList,
                                numScores = userList.size,
                                score, i;

                            // extract list of usernames and scores
                            for (i = 0; i < numScores; i++) {
                                score = userList.getAt(i);
                                scores.push({
                                    username: score.gamertag,
                                    score: parseInt(score.rating, 10)
                                });
                            }

                            callback(scores);
                        },
                        function (error) {
                            Debug.write(error);
                            callback(null);
                        });
            },
            getAllScores: function (callback) {
                var numBoxes = LeaderboardIds.length,
                    remaining = 1, // TODO: re-enable all numBoxes,
                    allScores = [],
                    getSingleBox = function (boxIndex) {
                        ZL.Leaderboards.getBoxScores(boxIndex, function (scores) {
                            if (scores) {
                                allScores[boxIndex] = scores;
                                remaining--;
                            }

                            if (remaining === 0) {
                                callback(allScores);
                            }
                        });
                    }

                for (var i = 0; i < numBoxes; i++) {
                    getSingleBox(i);
                }
            },
            postScore: function (boxIndex, score) {
                var service = new Microsoft.Xbox.Leaderboards.LeaderboardService(CTR_TITLE_ID);
                service.postResultAsync(
                        LeaderboardIds[boxIndex],
                        Microsoft.Xbox.Leaderboards.LeaderboardAggregation.max,
                        score)
                    .then(
                        function onSuccess() {
                            Debug.write('posted box score: ' + score);
                        },
                        function onError(error) {
                            Debug.write(error);
                        });
            }
        }
    });
    
})();
