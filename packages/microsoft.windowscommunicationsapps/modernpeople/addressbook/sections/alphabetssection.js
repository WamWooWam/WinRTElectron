Jx.delayDefine(People, "AlphabetsSection", function() {
    var n = window.People, t;
    A = n.Animation;
    n.AlphabetsSection = function(t) {
        n.ContactGridSection.call(this, "alphabetsSection", "/strings/alphabetsSectionTitle", t.getPlatform().peopleManager);
        this._platformCache = t
    }
    ;
    Jx.inherit(n.AlphabetsSection, n.ContactGridSection);
    t = n.ContactGridSection.prototype;
    n.AlphabetsSection.prototype.getContent = function() {
        var n = Jx.res.getString("/strings/alphabetsSectionTitle")
          , i = Jx.isRtl() ? "" : "";
        return "<div class='alphabetsSectionGrid'><div class='alphabetsSectionTitleContainer' tabindex='0' role='button'><a class='alphabetsSectionTitle'>" + n + "<\/a><a class='alphabetsSectionTitleChevron'>" + i + "<\/a><\/div>" + t.getContent.apply(this, arguments) + "<\/div>"
    }
    ;
    n.AlphabetsSection.prototype.activateUI = function() {
        this.titleContainer = document.querySelector(".alphabetsSectionTitleContainer");
        this.titleContainer.addEventListener("click", this._onTitleClicked, false);
        this.titleContainer.addEventListener("keyup", this._onTitleKeyUp, false);
        this.addedClickHandler = true;
        A.addTapAnimation(this.titleContainer);
        t.activateUI.apply(this, arguments)
    }
    ;
    n.AlphabetsSection.prototype.contentReadyAsync = function() {
        return this.isInView() ? [this.titleContainer, this._contentElement.querySelector(".gridContainer")] : []
    }
    ;
    n.AlphabetsSection.prototype._getCollection = function() {
        var t = this;
        return this._platformCache.getCollection(this.name, function(i) {
            return n.AddressBookCollections.makeAlphabetsCollection(i.peopleManager, t.getJobSet())
        })
    }
    ;
    n.AlphabetsSection.prototype._getFactories = function() {
        var t = new n.Callback(this.alphabetButtonClicked,this);
        return {
            alphabetButton: new n.Callback(function() {
                return new n.VirtualizableButton(t)
            }
            )
        }
    }
    ;
    n.AlphabetsSection.prototype._getCanonicalType = function() {
        return "alphabetButton"
    }
    ;
    n.AlphabetsSection.prototype.alphabetButtonClicked = function(t) {
        n.Nav.removePageLastScrollPosition("AllContactsScrollPosition");
        n.Nav.navigate(People.Nav.getAllContactsUri({
            alphabetIndex: t.alphabetIndex
        }))
    }
    ;
    n.AlphabetsSection.prototype._onTitleKeyUp = function(n) {
        (n.keyCode === WinJS.Utilities.Key.enter || n.keyCode === WinJS.Utilities.Key.space) && People.Nav.navigate(People.Nav.getAllContactsUri(null))
    }
    ;
    n.AlphabetsSection.prototype._onTitleClicked = function() {
        People.Nav.navigate(People.Nav.getAllContactsUri(null))
    }
    ;
    n.AlphabetsSection.prototype.shutdownComponent = function() {
        n.ContactGridSection.prototype.shutdownComponent.call(this);
        this.addedClickHandler && (this.titleContainer.removeEventListener("click", this._onTitleClicked, false),
        this.addedClickHandler = false)
    }
})
