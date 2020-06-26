﻿Jx.delayDefine(People,"Settings",function(){function r(n){for(var f="<div class='win-settings-section'><div id='nameSortTitle' class='primaryFontSemibold'>"+Jx.res.getString("/strings/nameSortTitle")+"<\/div><div id='nameSortDescription'><\/div><\/div>",r=[],i,u,t=0,e=n.count;t<e;t++)i=n.item(t),i.isDefault||(u=Jx.escapeHtml(i.displayName),r.push("<label><input id='filter-"+u+"' type='checkbox' value='"+String(t)+"' "+(i.filterContactsFromView?">":"checked>")+u+"<\/label>"));return r.length>0&&(f+="<div class='win-settings-section'><div id='accountFilterTitle' class='primaryFontSemibold'>"+Jx.res.getString("/strings/accountFilterTitle")+"<\/div><div id='accountFilterDescription'>"+Jx.res.getString("/strings/accountFilterDescription")+"<\/div>"+r.join("")+"<\/div>"),f}var n=window.People,t=Microsoft.WindowsLive.Platform,i=Windows.UI.ApplicationSettings;n.Settings=function(n,t){this._platform=n;this._jobSet=t;this.initComponent();$include("$(cssResources)/SettingsFlyout.css");this._onCommandsRequested=this._onCommandsRequested.bind(this);this._pane=i.SettingsPane.getForCurrentView();this._pane.addEventListener("commandsrequested",this._onCommandsRequested)};Jx.augment(n.Settings,Jx.Component);n.Settings.prototype.shutdownComponent=function(){this._pane.removeEventListener("commandsrequested",this._onCommandsRequested);this._pane=null};n.Settings.prototype._onCommandsRequested=function(n){var t=n.request.applicationCommands,r=i.SettingsCommand,u;this._platform&&(t.append(new r("settings.accounts",Jx.res.getString("/accountsStrings/actSettingEntryPoint"),this._onAccounts.bind(this))),t.append(new r("settings.options",Jx.res.getString("/Jx/Options"),this._onOptions.bind(this))));t.append(new r("settings.help",Jx.res.getString("/Jx/Help"),this._onHelp.bind(this)));t.append(new r("settings.about",Jx.res.getString("/Jx/About"),this._onAbout.bind(this)));this._platform&&window.SasManager&&SasManager.addSettingsEntry()&&(u=SasManager.getSettingsCommand(),t.append(u))};n.Settings.prototype._onAbout=function(){Jx.SettingsFlyout.showAbout(document.title)};n.Settings.prototype._onAccounts=function(){var i=n.Accounts;i.showAccountSettingsPage(this._platform,t.ApplicationScenario.people,i.AccountSettingsPage.connectedAccounts,{jobSet:this._jobSet})};n.Settings.prototype._onHelp=function(){Jx.help("people")};n.Settings.prototype._onOptions=function(){var f=new Jx.SettingsFlyout(Jx.res.getString("/Jx/Options")),n=f.getContentElement(),i=this._platform,e=i.accountManager.getConnectedAccountsByScenario(t.ApplicationScenario.people,t.ConnectedFilter.normal,t.AccountSort.name),o,u,s;n.innerHTML=r(e);o=n.querySelector("#nameSortDescription");u=new WinJS.UI.ToggleSwitch(o,{checked:i.peopleManager.nameSortOrder,labelOn:Jx.res.getString("/strings/yes"),labelOff:Jx.res.getString("/strings/no")});u.addEventListener("change",function(){i.peopleManager.nameSortOrder=u.checked;setTimeout(function(){Jx.EventManager.broadcast("personSortChanged")},200)});s=n.querySelectorAll("input[type=checkbox]");Array.prototype.forEach.call(s,function(n){n.addEventListener("change",function(){var t=e.item(n.value);t.filterContactsFromView=!n.checked;t.commit()},false)});f.show()}})