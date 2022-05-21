
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="..\..\common\common.js" />

/*global document,Jx,Calendar*/

Jx.delayDefine(Calendar.Templates, 'Agenda', function () {

    //
    // Agenda View Templates
    //

    Calendar.Templates.Agenda = {

        host: function (data) {
            var html =
                '<div id="' + data.id + '" class="agendaview">' +
                    data.background.html +
                    '<div class="agendacontainer">' +
                        '<div class="herocontainer">' +
                            '<div class="date" role="button" tabindex="0"></div>' +
                            '<div class="allday"></div>' +
                        '</div>' +
                        '<div class="timeline peekBarSpace"></div>' +
                    '</div>' +
                '</div>';

            return html;
        },

        backgroundContainer: function (data) {
            var html =
                '<div id="' + data.id + '" class="backgroundcontainer">' +
                    '<progress class="backgroundprogress win-ring win-medium"></progress>' +
                '</div>';

            return html;
        },

        background: function () {
            var element = document.createElement('div');
            element.className = 'background';
            element.innerHTML = '<div class="backgroundoverlay"></div>';

            return element;
        },

        item: function (data) {
            var item = data.item;
            var container = document.createElement('div');
            container.className = 'event';

            var innerHtml = '';

            if (item.textContainer) {
                container.className += ' textcontainer';
                innerHtml ='<div class="info">' + item.infoHtml + '</div>';
            } else if (item.allDayContainer) {
                container.className += ' alldaycontainer';

                // Get the non-hidden items
                var allDayItems = item.items.filter(function (item) {
                    return !item.isPast;
                });

                var len = allDayItems.length;
                var maxAllDay = data.maxAllDay;

                var maxToShow = len <= maxAllDay ? maxAllDay : (maxAllDay - 1);
                var numMore = len - maxToShow;

                var itemLabels = [];
                innerHtml = '<div class="alldayinfo">';

                for (var i = 0; i < len && i < maxToShow; i++) {
                    var allDayItem = allDayItems[i];
                    itemLabels.push(allDayItem.label);

                    innerHtml += '<div class="alldayevent" data-handle="' + allDayItem.handleHtml + '">';

                    var startHtml = allDayItem.timeRange.startHtml;
                    if (startHtml) {
                        innerHtml += '<div class="starttime">' + startHtml + '</div>';
                    }

                    innerHtml += '<div class="subject">' + allDayItem.subjectHtml + '</div>';

                    var endHtml = allDayItem.timeRange.endHtml;
                    if (endHtml) {
                        innerHtml += '<div class="endtime">' + endHtml + '</div>';
                    }

                    innerHtml += '</div>';
                }

                if (numMore > 0) {
                    itemLabels.push(item.allDayMoreLabel);
                    innerHtml += '<div class="morealldayevents" role="listitem">' + Jx.escapeHtml(item.allDayMoreFormat.format(numMore)) + '</div>';
                }

                // Calculate the aria label for the item
                var label = item.allDayLabelFormat.format(item.label, itemLabels[0] || '', itemLabels[1] || '', itemLabels[2] || '', itemLabels[3] || '', itemLabels[4] || '');
                container.setAttribute('aria-label', label);
            } else {
                container.setAttribute('aria-label', item.label);
                container.setAttribute('data-handle', item.handle);
                container.setAttribute('data-status', item.busyStatusClass);

                innerHtml =
                    '<div class="glyph" style="background-color: ' + item.colorHtml + '"><div class="glyphinner"></div></div>' +
                    '<div class="eventinfo">' +
                        '<div class="subject" style="color: ' + item.colorHtml + '">' +
                            '<div class="subjectinner">' +
                                item.subjectHtml +
                            '</div>' +
                        '</div>' +
                        '<div class="location">' + item.locationHtml + '</div>' +
                        '<div class="timespan">' + 
                            item.timeRange.fullHtml;

                if (item.conflict) {
                    innerHtml += '<span class="conflict">\u2197\u2199</span>';
                }

                innerHtml +=
                        '</div>' +
                        '<div class="herotext" style="color: ' + item.colorHtml + '">' + item.heroTextHtml + '</div>' +
                    '</div>';
            }

            container.innerHTML = innerHtml;
            return container;
        },

        groupHeader: function (data) {
            var container = document.createElement('div');
            container.className = 'agendaheader';
            container.setAttribute('data-key', data.key);
            container.textContent = data.data.text;

            return container;
        },

    };

});
