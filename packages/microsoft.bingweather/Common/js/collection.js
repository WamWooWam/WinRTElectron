/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexCommonControlsECCollectionInit() {
"use strict";
WinJS.Namespace.define("CommonJS.EntityCollection", {Collection: WinJS.Class.define(function collection_ctor(options){}, {
Initialize: function Initialize(config) {
throw"Method Must be implemented by derived classes";
}, onEntityClick: function onEntityClick(entity) {
console.log("entity was clicked")
}, UIConfig: {
get: function get() {
if (!this._UI) {
throw"UIConfig configuration must be set during initialization";
}
return this._UI
}, set: function set(v) {
this._UI = v
}
}, DataConfig: {
get: function get() {
if (!this._Data) {
throw"Data configuration must be set during initialization";
}
return this._Data
}, set: function set(v) {
this._Data = v
}
}, copy: function copy(nativeObjects) {
if (!nativeObjects || nativeObjects.length === 0) {
return []
}
var jsObjArr=[];
for (var i=0; i < nativeObjects.length; i++) {
var obj=nativeObjects[i];
var jsobj={};
for (var p in obj) {
var val=null;
if (p === "attributes") {
continue
}
try {
val = obj[p]
}
catch(e) {}
jsobj[p] = val
}
var attrib=obj.attributes;
if (attrib) {
var count=0;
var len=attrib.size;
while (count++ < len) {
var item=attrib.first().current;
jsobj[item.key] = item.value;
attrib.remove(attrib.first().current.key)
}
}
jsObjArr.push(jsobj)
}
return jsObjArr
}, GetFilters: function GetFilters() {
return WinJS.Promise.wrap(this.Filters)
}, GetEntities: function GetEntities() {
return WinJS.Promise.wrap(this.Entities)
}, ClearEntities: function ClearEntities() {
this.Entities = null
}, GetSorts: function GetSorts() {
return WinJS.Promise.wrap(this.Sorts)
}, showProgress: function showProgress(progressType) {
CommonJS.Progress.showProgress(progressType)
}, resetProgress: function resetProgress(progressType) {
CommonJS.Progress.resetProgress(progressType)
}, hideProgress: function hideProgress(progressType) {
CommonJS.Progress.hideProgress(progressType)
}, onBeforeQuery: function onBeforeQuery(query) {
return WinJS.Promise.wrap(null)
}, onQueryReturned: function onQueryReturned(entities, sorts, groups, filters) {
return WinJS.Promise.wrap(null)
}, Query: function Query(sort, filters) {
var that=this;
var isQueryComplete=false;
var logStr="Query(): Selected Sort: " + (sort ? sort.identifier : " none") + ", Selected Filters: ";
var p=new WinJS.Promise(function collection_queryPromiseInit(complete, error, progress) {
var onQueryUpdate=function(jsonStr) {
var result={};
var dataset=null;
try {
dataset = JSON.parse(jsonStr);
jsonStr = null
}
catch(e) {
error(e);
return
}
var e=dataset.entities;
that.Sorts = dataset.sorts;
var g=that.Groups = dataset.groups;
that.Filters = dataset.filters;
var groupsDictionary={};
for (var i=0; i < g.length; i++) {
var key=g[i].identifier;
groupsDictionary[key] = g[i].count
}
for (var j=0; j < e.length; j++) {
e[j].groupCount = groupsDictionary[e[j].group]
}
try {
that.onQueryReturned(e, that.Sorts, that.Groups, that.Filters).done(function collection_onQueryReturnedComplete() {
that.Entities = e;
if (isQueryComplete) {
if (that.onQueryComplete) {
that.onQueryComplete(e)
}
complete()
}
else {
progress()
}
})
}
catch(e) {
error(e)
}
};
var onQueryProgress=function(dataset) {
isQueryComplete = false;
onQueryUpdate(dataset)
};
var onQueryComplete=function(dataset) {
isQueryComplete = true;
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:e");
onQueryUpdate(dataset)
};
var q=new AppEx.Common.EntityCollection.Query.EntityQuery;
if (filters) {
for (var ii=0; ii < filters.length; ii++) {
q.filters.append(filters[ii]);
logStr += "[" + filters[ii].attribute + ":";
for (var jj=0; jj < filters[ii].value.length; jj++) {
var val=filters[ii].value[jj];
logStr += val + ";"
}
logStr += "] "
}
}
if (sort && sort.identifier) {
q.sortIdentifier = sort.identifier;
q.sortDirection = sort.sortDirection
}
that.onBeforeQuery(q).done(function collection_onBeforeQueryComplete() {
var jsonShim=new AppEx.Common.EntityCollection.JSONCollectionProvider(that.Provider);
msWriteProfilerMark("CommonControls:EntityCollection:providerQuery:s");
jsonShim.queryAsync(q).done(onQueryComplete, error, onQueryProgress)
})
});
return WinJS.Promise.wrap(p)
}, QueryFromState: function QueryFromState(config) {
var that=this;
var p=new WinJS.Promise(function collection_queryFromStatePromiseInit(complete) {
that.getPageData(config).then(function collection_getPageDataComplete(result) {
if (!result || result.error) {
throw"Error Retrieving data " + result;
}
var nativeObjects=result.listSource[0];
that.Filters = that.copy(result.dataset.filters);
var jsObjArr=that.copy(nativeObjects);
that.Entities = jsObjArr;
that.Groups = result.Groups;
complete()
})
});
return p
}, getPageData: function getPageData(themes) {
var that=this;
var p=new WinJS.Promise(function collection_getPageDataPromiseInit(complete) {
var ds={title: that.options.label};
var onQueryComplete=function(dataset) {
ds.dataset = dataset;
that._data.push(dataset.entities);
ds.listSource = that._data;
complete(ds)
};
var queryForTheme=function() {
var provider=that.Provider;
var q=new AppEx.Common.EntityCollection.Query.Query;
var config=PlatformJS.Collections.createStringDictionary();
config.insert("collection", that.options.collection);
config.insert("theme", that.options.theme);
provider.queryAsync(q).then(onQueryComplete)
}
});
return p
}
})})
})()