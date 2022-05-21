
// patch Identity.getMeId() so we don't access the platform in UTs.
People.RecentActivity.Identity._getMeId = function() {
    return null;
}