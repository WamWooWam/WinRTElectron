

(function() {
    var P = People;
    P.MockSection = function () {
        P.Section.call(this, "MockSection");
    };
    P.MockSection.prototype.setCurrentItem = function (x,y) {
        this.position = {
            x : x,
            y : y
        };
    };
    P.MockSection.prototype.getCurrentItem = function (item) {
        item.groupIndex = 1;
        item.itemOffset = 0;
    };
    P.MockSection.prototype.positionItem = function (item, position) {
        this.item = item;
    };
    P.MockSection.prototype.getCurrentPosition = function() {
       return this.position;
    }; 

})();
