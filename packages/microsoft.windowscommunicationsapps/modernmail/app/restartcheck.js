﻿Jx.delayDefine(Mail,"RestartCheck",function(){Mail.RestartCheck=function(){this._restartChecks=[];this.addRestartCheck("Days since app start check",this._canRestart,this)};var n=Mail.RestartCheck.prototype;Mail.daysSinceAppStart=function(){return(Date.now()-window.performance.timing.navigationStart)/Mail.Utilities.msInOneDay};n.addRestartCheck=function(n,t,i){this._restartChecks.push({desc:n,check:t,context:i})};n._canRestart=function(){return Mail.daysSinceAppStart()>3};n.onAppVisible=function(){this._restartChecks.every(function(n){return n.check.call(n.context)})&&Jx.root.restart()}})