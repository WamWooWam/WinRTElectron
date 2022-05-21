
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People*/

Include.initializeFileScope(function () {

    var P = People;

    Tx.test("searchTests.testHighlight", function (tc) {

        function fakePerson(name, first, last, email) {
            return {
                calculatedUIName: name,
                firstName: first,
                lastName: last,
                linkedContacts: [ { personalEmailAddress: email } ]
            };
        }

        var someone = fakePerson("Some One", "Some", "One", "someone@example.com");
        var nickname = fakePerson("Nickname", "John", "Doe", "nick@name.com");
        var lastfirst = fakePerson("Last, First", "First", "Last", "first@last.com");

        function expectation(prefix, highlight, suffix, name) {
            if (name) {
                return { primary: { prefix: name, highlight: "", suffix: "" },
                         secondary: { prefix: prefix, highlight: highlight, suffix: suffix } };
            } else {
                return { primary: { prefix: prefix, highlight: highlight, suffix: suffix },
                         secondary: { prefix: "", highlight: "", suffix: "" } };
            }
        }

        var tests = [
            { query: "some one", person: someone,
              expected: expectation("", "Some One", "")
            },
            { query: "ONE", person: someone,
              expected: expectation("Some ", "One", "")
            },
            { query: "o", person: someone,
              expected: expectation("Some ", "O", "ne")
            },
            { query: "s", person: someone,
              expected: expectation("", "S", "ome One")
            },
            { query: "some ", person: someone,
              expected: expectation("", "Some ", "One")
            },
            { query: "sOmEoNe", person: someone,
              expected: expectation("", "someone", "@example.com", "Some One")
            },
            { query: "nick", person: nickname,
              expected: expectation("", "Nick", "name")
            },
            { query: "Joh", person: nickname,
              expected: expectation("", "Joh", "n", "Nickname")
            },
            { query: "d", person: nickname,
              expected: expectation("", "D", "oe", "Nickname")
            },
            { query: "nick@", person: nickname,
              expected: expectation("", "nick@", "name.com", "Nickname")
            },
            { query: "last", person: lastfirst,
              expected: expectation("", "Last", ", First")
            },
            { query: "fir", person: lastfirst,
              expected: expectation("Last, ", "Fir", "st")
            }
        ];

        var parts;
        for (var i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];

            var highlighter = new P.Highlighter();
            highlighter.getUI(null, "ut", { query: test.query });

            parts = highlighter._split(test.person);

            tc.areEqual(parts.primary.prefix, test.expected.primary.prefix);
            tc.areEqual(parts.primary.highlight, test.expected.primary.highlight);
            tc.areEqual(parts.primary.suffix, test.expected.primary.suffix);
            tc.areEqual(parts.secondary.prefix, test.expected.secondary.prefix);
            tc.areEqual(parts.secondary.highlight, test.expected.secondary.highlight);
            tc.areEqual(parts.secondary.suffix, test.expected.secondary.suffix);
        }

    });
    //this.testHighlight["Owner"] = "neilpa";

});