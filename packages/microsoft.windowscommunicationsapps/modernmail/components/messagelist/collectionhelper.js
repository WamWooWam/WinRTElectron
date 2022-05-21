
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
Jx.delayDefine(Mail, "CollectionHelper", function () {

    Mail.CollectionHelper = {
        indexOf: function (/*@dynamic*/collection, objectId, indexHint) {
            ///<summary>
            /// Given an objectId, finds the index of that object in the collection.
            /// To avoid looping the whole collection, search out linearly from hint.
            /// </summary>
            ///<param name="collection" type="Object"></param>
            ///<param name="objectId" type="String" optional="true">object Id of the object to look up</param>
            ///<param name="indexHint" type="Number" optional="true">The hint of the starting index to look up the object.</param>
            Debug.assert(Jx.isObject(collection));
            Debug.assert(Jx.isNumber(collection.count));
            Debug.assert(Jx.isFunction(collection.item));

            var count = collection.count,
                result = -1;

            if (!Jx.isNonEmptyString(objectId)) {
                return result;
            }

            Mail.writeProfilerMark("Mail.Collection.indexOf", Mail.LogEvent.start);
            /// If the hint is invalid use the start, since more often than not
            /// we select messages near the top of the list
            if (!Jx.isNumber(indexHint) || indexHint < 0 || indexHint >= count) {
                indexHint = 0;
            }

            function checkItem(index) {
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                return index >= 0 && index < count && collection.item(index).objectId === objectId;
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            }

            /// Compute the index of the selected message using the hint
            for (var head = indexHint, tail = indexHint + 1; (head >= 0) || (tail < count); head--, tail++) {
                if (checkItem(head)) {
                    result = head;
                    break;
                }
                if (checkItem(tail)) {
                    result = tail;
                    break;
                }
            }

            if (!result) {
                Jx.log.warning("Mail.CollectionHelper.indexOf failed to find object ID: " + objectId);
            }

            Mail.writeProfilerMark("Mail.Collection.indexOf", Mail.LogEvent.stop);
            return result;
        }

    };

});

