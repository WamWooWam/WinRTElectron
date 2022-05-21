
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Calendar,setImmediate,Jx*/

Jx.delayDefine(Calendar, "Scheduler", function() {

    var Scheduler = Calendar.Scheduler = function(timeSlice) {
        // set our initial state
        this._scheduled = false;
        this._timeSlice = timeSlice || Scheduler.timeSlice;
        this.reset();

        // bind callbacks
        this._runJobs = this._runJobs.bind(this);
    };

    Scheduler.timeSlice = 20;

    var proto = Scheduler.prototype;

    proto.schedule = function(fn, ctx, args, isVisible) {
        var id = this._nextId++;
        this._jobs[id] = { fn: fn, ctx: ctx, args: args, isVisible: isVisible };

        if (isVisible) {
            this._visibleJobs++;
        }

        if (!this._scheduled) {
            setImmediate(this._runJobs);
            this._scheduled = true;
        }

        Debug.call(function () {
            if (Scheduler.RUN_SYNC) {
                while (this._currentId < this._nextId) {
                    this._runJobs();
                }
                this.reset();
            }
        }, this);

        return id;
    };

    proto.setVisible = function(id, isVisible) {
        var job = this._jobs[id];

        if (job) {
            if (job.isVisible !== isVisible) {
                var adjust = isVisible ? 1 : -1;
                this._visibleJobs += adjust;

                job.isVisible = isVisible;
            }
        }
    };

    proto.cancel = function(id) {
        var job = this._jobs[id];

        if (job) {
            if (job.isVisible) {
                this._visibleJobs--;
            }

            delete this._jobs[id];
        }
    };

    proto.reset = function() {
        this._jobs = {};
        this._nextId    = 0;
        this._currentId = 0;
        this._visibleJobs = 0;
    };

    proto._runJobs = function() {
        var start = Date.now(),
            id    = this._currentId,
            job;

        // if we have visible jobs, run them first
        while (this._visibleJobs && (Date.now() - start < this._timeSlice)) {
            job = this._jobs[id];

            if (job) {
                if (job.isVisible) {
                    this._visibleJobs--;
                    delete this._jobs[id];
                    job.fn.apply(job.ctx, job.args);
                }
            }

            id++;
        }

        // do remaining jobs next
        while ((this._currentId < this._nextId) && (Date.now() - start < this._timeSlice)) {
            id  = this._currentId++;
            job = this._jobs[id];

            if (job) {
                delete this._jobs[id];
                job.fn.apply(job.ctx, job.args);
            }
        }

        if (this._currentId < this._nextId) {
            setImmediate(this._runJobs);
        } else {
            this._scheduled = false;
            // TODO: currently the worker has no access to the activation kind, pass 0 for now
            Jx.ptStopLaunch(Jx.TimePoint.responsive, 0); 
        }
    };
});
