
//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global Jx,TestHook*/

(function () {

    var T = TestHook;

    T.scrollToContact = function TestHook_scrollToContact(contactName) {

        var query = contactName.toLocaleUpperCase(),
            groupings = privates.groupings,
            grouping, iGrouping, iContact = -1;

        for (iGrouping = 0; iGrouping < groupings.length; iGrouping++) {
            grouping = groupings.getItem(iGrouping);
            var data = resolve(grouping, "header.data"),
                start = data ? data.start : "",
                end = data ? data.end : "";

            if (start && end && start.localeCompare(query) <= 0 && end.localeCompare(query) > 0) {
                // Found the groupinging that should contain the contact
                iContact = binarySearch(grouping.collection, query);
                break;
            }
        }

        if (iContact === -1) {
            // Check the other grouping if we didn't find it in any of the letter buckets
            iGrouping = groupings.length - 1;
            iContact = binarySearch(groupings.getItem(iGrouping).collection, query);
        }

        // Scroll them into view
        if (iContact !== -1) {
            privates.grid.scrollItemIntoView(iGrouping, iContact);
        } else {
            Jx.log.warning("TestHook.scrollToContact not found: " + contactName);
        }
    };

    function binarySearch(collection, query) {
        var lo = 0, hi = collection.length;

        while (lo < hi) {
            var mid = lo + ((hi - lo) >>> 1),
                name = collection.getItem(mid).data.calculatedUIName || "",
                delta = query.localeCompare(name.toLocaleUpperCase());

            if (delta > 0) {
                lo = mid + 1;
            } else {
                hi = delta === 0 ? mid : mid - 1;
            }
        }
        return hi >= collection.length ? -1 : hi;
    }

    // Do our best to abstract away the fact that we reach into the apps privates. Also if things change
    // we'll only have one place to update rather than have all the test hooks reaching into them.
    var privates = {
        get root() {
            return resolve(window, "Jx.root");
        },
        get content() {
            return resolve(this.root, "_content");
        },
        get currentControlName() {
            return resolve(this.content, "_currentControlName");
        },
        get addressBook() {
            return this.currentControlName === "allcontactsctrl" ? resolve(this.content, "_control") : null;
        },
        get allSection() {
            var sections = resolve(this.addressBook, "_viewport._child._children");
            if (sections) {
                return sections.reduce(function (previous, section) {
                    return resolve(section, "name") === "allSection" ? resolve(section, "_child") : previous;
                }, null);
            }
            return null;
        },
        get search() {
            return this.currentControlName === "search" ? resolve(this.content, "_control") : null;
        },
        get searchSection() {
            return resolve(this.search, "_viewport._child");
        },
        get picker() {
            return resolve(this.root, "name") === "PeopleProvider" ? this.root : null;
        },
        get pickerSection() {
            return resolve(this.picker, "_viewport._child");
        },
        get grid() {
            return null == this.allSection ? resolve(this.allSection, "_child._grid") : resolve(this.allSection || this.searchSection || this.pickerSection, "_grid");
        },
        get groupings() {
            return resolve(this.grid, "_items");
        }
    };

    function resolve(obj, chain) {
        var props = chain.split(".");
        while (obj && props.length > 0) {
            obj = obj[props.shift()];
        }
        return obj;
    }

})();

