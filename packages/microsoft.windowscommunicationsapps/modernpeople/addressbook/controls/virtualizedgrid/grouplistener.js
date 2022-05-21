
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <reference path="../Collections/BaseCollection.js" />
/// <reference path="VirtualizedGrid.js" />

Jx.delayDefine(People.Grid, "GroupListener", function () {
    
     "use strict";
     var P = window.People,
         G = P.Grid;

     var GroupListener = G.GroupListener = /*@constructor*/function (index, group, virtualizedGrid) {
         /// <summary> GroupListener is a helper object to keep track of a group's index in the top-level collection.</summary>
         /// <param name="index" type="Number"></param>
         /// <param name="group" type="P.Collection"></param>
         /// <param name="virtualizedGrid" type="G.VirtualizedGrid"></param>
         this.index = index;
         this._virtualizedGrid = virtualizedGrid;
         this._group = group;
         this._jobSet = /*@static_cast(P.JobSet)*/null;

         group.addListener("load",           this._onLoaded,         this);         
         group.addListener("changesPending", this._onChangesPending, this);

         Debug.only(Object.seal(this));
     };

     GroupListener.prototype.dispose = function () {
         /// <summary> Cleans up this object </summary>
         this._group.removeListener("load",           this._onLoaded,         this);         
         this._group.removeListener("changesPending", this._onChangesPending, this);
         if (this._jobSet) {
             this._jobSet.dispose();
         }
     };

     GroupListener.prototype.isLoaded = function () { 
         /// <returns type="Boolean"> True if the group is loaded (queried) </returns>
         return this._group.isLoaded;
     };

     GroupListener.prototype.load = function (isVisible, jobSet) {
         /// <summary> Loads (queries) the group contents </summary>
         /// <param name="isVisible" type="Boolean"> True if the group's contents will be visible on-screen, for prioritization </param>
         /// <param name="jobSet" type="P.JobSet"/>
         if (!this._jobSet) {
             jobSet = this._jobSet = jobSet.createChild();
             jobSet.setOrder(this.index);
             jobSet.setVisibility(isVisible);
             this._group.load(jobSet);
        } else {
             this._jobSet.setVisibility(isVisible);
        }
     };

     GroupListener.prototype._onLoaded = function (/*@dynamic*/ev) {
         /// <summary> Forwards the 'load' event to the VirtualizedGrid with the group index </summary>
         /// <param name="ev"></param>
         this._virtualizedGrid.onGroupLoaded(this.index, ev.target, ev.length);
     };

     GroupListener.prototype._onChangesPending = function (ev) {
         /// <summary> Forwards the 'changesPending' event to the VirtualizedGrid with the group index </summary>
         /// <param name="ev" type="Event"></param>
         this._virtualizedGrid.onChangesPending();
     };

});

