Jx.delayDefine(People, "AddressBookCollections", function() {
    var n = window.People;
    n.AddressBookCollections = {};
    n.AddressBookCollections.getAlphabets = function(n, t, i) {
        var o = new Windows.Globalization.Collation.CharacterGroupings, s = Array.prototype.reduce.call(o, function(n, t) {
            return i.push({
                start: n.first,
                end: t.first,
                label: n.label
            }),
            t
        }, {
            first: "",
            label: ""
        }), f, r, u, e;
        for (i.push({
            start: s.first,
            end: "",
            label: ""
        }),
        f = [],
        i.forEach(function(i) {
            i.label === "" || i.start === "" || i.end === "" || i.start.localeCompare("!") === -1 && i.end.localeCompare("!") === 1 || i.start.localeCompare("1") === -1 && i.end.localeCompare("1") === 1 ? (f.length > 0 && (t.push(f),
            f = []),
            n.push(i)) : f.push(i)
        }),
        r = null,
        u = 0,
        e = t.length; u < e; ++u)
            if (t[u].length === 26 && t[u].every(function(n) {
                return n.start >= "a" && n.start <= "z"
            })) {
                if (r !== null) {
                    r = null;
                    break
                }
                r = u
            }
        r !== null && t.push(t.splice(r, 1)[0])
    }
    ;
    n.AddressBookCollections.appendAlphabeticCollection = function(t, i, r) {
        var u = []
          , f = []
          , e = [];
        this.getAlphabets(u, f, e);
        e.forEach(function(i) {
            var u = i.start || "start";
            i.collection = new n.QueryCollection("person",r(t, i.start, i.end),u)
        });
        f.forEach(function(n) {
            n.forEach(function(n) {
                i.appendItem({
                    header: {
                        type: "nameGrouping",
                        data: {
                            label: n.label,
                            start: n.start,
                            end: n.end
                        }
                    },
                    collection: n.collection
                })
            })
        });
        i.appendItem({
            header: {
                type: "otherGrouping",
                data: u.map(function(n) {
                    return {
                        start: n.start,
                        end: n.end
                    }
                })
            },
            collection: new n.ConcatenatedCollection(u.map(function(n) {
                return n.collection
            }),"other")
        })
    }
    ;
    n.AddressBookCollections.replaceAlphabeticCollection = function(n, t, i, r) {
        for (var e = [], f = 0, o = t.length; f < o; f++) {
            var s = t.getItem(f)
              , u = s.header
              , h = s.collection;
            u.type === "nameGrouping" ? e.push(h.replace(i(n, u.data.start, u.data.end), r)) : u.type === "otherGrouping" && e.push(h.replace(u.data.map(function(t) {
                return i(n, t.start, t.end)
            }), r))
        }
        return WinJS.Promise.join(e)
    }
    ;
    n.AddressBookCollections.makeFavoritesCollection = function(t) {
        var i = new n.ArrayCollection("favorites"), r;
        return i.appendItem({
            header: null,
            collection: new n.QueryCollection("person",new n.Callback(t.getFavoritePeople,t),"favorites")
        }),
        r = new n.StaticCollection([{
            data: {
                title: "Add favorite",
                text: ""
            },
            type: "addFavoritesButton"
        }],"addButton"),
        i.appendItem({
            header: null,
            collection: r
        }),
        i.loadComplete(),
        r.loadComplete(),
        i
    }
    ;
    n.AddressBookCollections.makeAlphabetsCollection = function() {
        var u = new n.ArrayCollection("alphabets"), f = [], t, e, i, o, r, s, h, c;
        for (this.getAlphabets([], f, []),
        t = [],
        e = 0,
        i = 0; i < f.length; i++)
            for (o = f[i],
            r = 0; r < o.length; r++)
                s = o[r],
                t.push({
                    data: {
                        title: s.label,
                        text: s.label,
                        alphabetIndex: e++
                    },
                    type: "alphabetButton"
                });
        return h = Jx.res.getString("/strings/abOtherGroupingHeader"),
        t.push({
            data: {
                title: h,
                text: h,
                alphabetIndex: e++
            },
            type: "alphabetButton"
        }),
        c = new n.StaticCollection(t,"alphabetCollection"),
        u.appendItem({
            header: null,
            collection: c
        }),
        u.loadComplete(),
        c.loadComplete(),
        u
    }
})
