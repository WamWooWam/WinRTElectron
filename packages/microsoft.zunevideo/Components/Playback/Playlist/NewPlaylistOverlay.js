/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NewPlaylistOverlay: MS.Entertainment.UI.Framework.defineUserControl("/Components/Playback/Playlist/NewPlaylistOverlay.html#newPlaylistDialogTemplate", null, {
            _dialog: null, initialize: function initialize() {
                    this._playlistEdit.value = MS.Entertainment.UI.Controls.NewPlaylistOverlay.getNextDefaultPlaylistName();
                    this._playlistEdit.setValue();
                    this._playlistEdit.keyUp = this.onKeyUp.bind(this);
                    WinJS.Promise.timeout(150).then(function() {
                        var inputControl = WinJS.Utilities.getMember("_playlistEdit.inputControl", this);
                        if (inputControl)
                            inputControl.select()
                    }.bind(this))
                }, setOverlay: function setOverlay(overlay) {
                    this._dialog = overlay
                }, onKeyUp: function onKeyUp(e) {
                    var inputValue = WinJS.Utilities.getMember("_playlistEdit.inputControl.value", this);
                    this._dialog.buttons[0].isDisabled = !inputValue;
                    if (this.duplicateMessageVisible) {
                        this.duplicateMessageVisible = false;
                        this._dialog.buttons[0].title = String.load(String.id.IDS_OK_BUTTON)
                    }
                }, submit: function submit(dataSource) {
                    var that = this;
                    var overwrite = this.duplicateMessageVisible;
                    MS.Entertainment.UI.Controls.NewPlaylistOverlay.save(this._playlistEdit.value, dataSource || [], overwrite).then(function save_success() {
                        that._dialog.hide()
                    }, function save_failure(e) {
                        if (e.number === MS.Entertainment.UI.Actions.Playlists.ERROR_PLAYLIST_ALREADY_EXISTS) {
                            that._duplicateMessage.text = String.load(String.id.IDS_PLAYLIST_CREATE_DUPLICATE_MESSAGE).format(that._playlistEdit.value);
                            that.duplicateMessageVisible = true;
                            that._dialog.buttons[0].title = String.load(String.id.IDS_PLAYLIST_CREATE_REPLACE)
                        }
                    })
                }
        }, {duplicateMessageVisible: false}, {
            show: function show(dataSource) {
                return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_PLAYLIST_NAME_TITLE), "MS.Entertainment.UI.Controls.NewPlaylistOverlay", {
                        width: "30%", height: "210px", buttons: [WinJS.Binding.as({
                                    title: String.load(String.id.IDS_OK_BUTTON), execute: function execute_submit(dialog) {
                                            dialog.userControlInstance.submit(dataSource)
                                        }
                                }), WinJS.Binding.as({
                                    title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function execute_cancel(dialog) {
                                            dialog.hide()
                                        }
                                })], defaultButtonIndex: 0, cancelButtonIndex: 1
                    })
            }, getNextDefaultPlaylistName: function getNextDefaultPlaylistName() {
                    return String.load(String.id.IDS_PLAYLIST_DEFAULT_NAME)
                }, save: function save(playlistName, playlistDataSource, overwrite) {
                    var isDuplicate = false;
                    var session = null;
                    var playlist = new MS.Entertainment.Platform.Playback.Playlist.PlaylistCore;
                    return playlist.setDataSource(playlistDataSource).then(function(mediaCollection) {
                            return playlist.savePlaylist(playlistName, overwrite).then(function save_succeeded(playlistId) {
                                    return WinJS.Promise.wrap(playlistId)
                                }, function save_failed(e) {
                                    return WinJS.Promise.wrapError(e)
                                })
                        })
                }, addToPlaylist: function addToPlaylist(playlist, album) {
                    if (!playlist || !playlist.name)
                        throw"NewPlaylistOverlay: Cannot add to invalid playlist";
                    if (!album)
                        throw"NewPlaylistOverlay: Album is invalid and cannot be added to a playlist";
                    var playlistQuery = new MS.Entertainment.Data.Query.libraryPlaylistMediaItems;
                    playlistQuery.playlistId = playlist.libraryId;
                    var playlistCore = new MS.Entertainment.Platform.Playback.Playlist.PlaylistCore;
                    return playlistCore.setDataSource(playlistQuery).then(function(mediaCollection) {
                            return playlistCore.insertAtEnd(null, album)
                        }).then(function(value) {
                            return playlistCore.savePlaylist(playlist.name, true)
                        })
                }
        })})
})()
