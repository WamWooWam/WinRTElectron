
// 
// Copyright (C) Microsoft. All rights reserved.
//

/// <disable>JS2027.PunctuateCommentsCorrectly,JS2029.MinimizeVerticalSpaceInComments,JS2026.CapitalizeComments</disable> comments
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="../../../Shared/JSUtil/Callback.js" />
/// <reference path="Pool.js" />
/// <reference path="CellCreator.js" />
/// <reference path="../../UnitTest/MockNode.js" />

Jx.delayDefine(People.Grid, "PooledCells", function () {
    
    "use strict";
    var P = window.People;
    var G = P.Grid;

    var PooledCells = G.PooledCells = /* @constructor */ function (cellCreator, factories) {
        /// <summary> Mostly a map of pools to node factories with some extra functionality.  Handles the intricate
        /// dance we do with the DOM for cell creation.  This class also handles the new creation of cells as that
        /// functionality is inherently tied to the pools.  </summary>
        /// <param name="cellCreator" type="G.CellCreator" />
        /// <param name="factories" type="Object">Map of node factories</param>
        this._cellCreator = cellCreator;
        this._pools = {};
        for (var k in factories) {
            Debug.assert(!Jx.isObject(factories[k].args));
            var pool = new G.Pool(G.Cell.bucket);
            pool.setFactory(new P.Callback(this._cellCreator.createCell, this._cellCreator, [factories[k], pool]));
            this._pools[k] = pool;
        }

        Debug.only(Object.seal(this));
    };

    PooledCells.prototype.elementIsInPools = function (element) {
        var pools = this._pools;
        for (var k in pools) {
            if (pools[k].findItem(G.Cell.cellElementEqual, element) !== null) {
                return true;
            }
        }
        return false;
    };

    PooledCells.prototype.getPool = function (type) {
        Debug.assert(Jx.isObject(this._pools[type]));
        return this._pools[type];
    };

    PooledCells.prototype.getCell = function (type, bucket) {
        /// <summary> Given an item type and a desired cell bucket, retrieve a cell from the pool </summary>
        /// <returns type="G.Cell" />
        var /*@type(G.Cell)*/cell = this._pools[type].get(bucket);

        // We cancel any jobs scheduled between returning to the pool and retrieving (e.g. hiding).
        cell.jobSet.cancelJobs();

        return cell;
    };

    PooledCells.prototype.forEach = function (cellFunction) {
        var pools = this._pools;
        for (var k in pools) {
            pools[k].forEach(cellFunction);
        }
    };
});
