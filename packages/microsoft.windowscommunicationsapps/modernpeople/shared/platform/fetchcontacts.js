﻿Jx.delayDefine(People,"FetchContacts",function(){var i=People,t=Microsoft.WindowsLive.Platform,n=i.FetchContacts=function(n,t){this._platform=n;this._jobSet=t.createChild();this._items=null;this._position=0;this._collection=null;this._listener=this._onCollectionChanged.bind(this);var i=Jx.activation;i.addListener(i.suspending,this._suspend,this);i.addListener(i.resuming,this._resume,this);this._queued=false;this._enqueue()},r,u;n.prototype.dispose=function(){this._reset();Jx.dispose(this._jobSet)};n.prototype._suspend=function(){this._reset()};n.prototype._resume=function(){this._enqueue()};n.prototype._reset=function(){this._items=null;this._position=0;var n=this._collection;if(n!==null){this._collection=null;try{n.removeEventListener("collectionchanged",this._listener);n.dispose()}catch(t){Jx.log.exception("Fetch contacts cleanup failed",t)}}this._queued=false;this._jobSet.cancelJobs()};n.prototype._backgroundFetch=function(){var n,i;if(msWriteProfilerMark("prefetch_start"),this._items)for(i=u;i--;)this._fetchOneItem();else n=this._collection=this._platform.peopleManager.getPeopleNameBetween(t.OnlineStatusFilter.all,"",true,"",true),this._items=Array(n.count),this._position=0,n.addEventListener("collectionchanged",this._listener),n.unlock();msWriteProfilerMark("prefetch_stop");this._queued=false;this._enqueue()};n.prototype._fetchOneItem=function(){var t,i=this._items,n,r;if(i){for(n=this._position,r=i.length;n<r&&i[n];)n++;n<r&&(t=this._collection.item(n),i[n++]=t);this._position=n}if(t)try{t.onlineStatus}catch(u){}};n.prototype._enqueue=function(){!this._queued&&this._position<r&&(!this._items||this._position<this._items.length)&&(this._queued=true,this._jobSet.addUIJob(this,this._backgroundFetch,null,i.Priority.fetchContacts))};n.prototype._onCollectionChanged=function(n){(t.CollectionChangeType.itemRemoved!==n.eType||n.index<this._position)&&(this._position=i.DeferredCollection.updateIndex([n],this._position));switch(n.eType){case t.CollectionChangeType.itemAdded:this._items.splice(n.index,0,null);n.index<this._position&&(this._position=n.index);break;case t.CollectionChangeType.itemChanged:var r=this._items.splice(n.previousIndex,1)[0];this._items.splice(n.index,0,r);!r&&n.index<this._position&&(this._position=n.index);break;case t.CollectionChangeType.itemRemoved:this._items.splice(n.index,1);break;case t.CollectionChangeType.reset:this._reset()}this._enqueue()};r=2e3;u=5})