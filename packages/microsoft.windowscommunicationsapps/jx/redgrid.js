
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,document*/



(function () {

    var _lines = [
            { t: "top", y: 20 },
            { t: "top", y: 10 },
            { t: "topSet", y: 0 },
            { t: "top", y: 90 },

            { t: "left", x: 30 },
            { t: "left", x: 12 },

            { t: "end" }
        ];

    var _lines2 = [
            //{ t: "top", y: 30 },
            //{ t: "top", y: 5, w: 70 },
            //{ t: "top", y: 30, w: 70 },
            //{ t: "top", y: 5 },
            //{ t: "top", y: 21 },
            //{ t: "top", id: "LocationDescrip", w: 500 },
            //{ t: "top", y: 7, w: 500 },
            //{ t: "top", id: "LocationTextbox", w: 500 },
            //{ t: "top", y: 21, w: 500 },
            //{ t: "top", id: "GuestsCombo", w: 500 },
            //{ t: "top", y: 21, w: 500 },
            //{ t: "top", id: "cedTitle", w: 0 },

            { t: "left", x: 40 },
            { t: "left", x: 30 },
            //{ t: "left", x: 10 },
            //{ t: "left", x: 380 },
            //{ t: "left", x: 40 },
            //{ t: "left", x: 60 },

            //{ t: "right", x: 66 },
            //{ t: "right", x: 40, h: 70 },
            //{ t: "right", x: 20, h: 70 },
            //{ t: "right", x: 40, h: 70 },
            //{ t: "right", x: 10, h: 70 },
                
            // { t: "bottom", y: 10 },

            //{ t: "width", sel: ".win-timepicker-hour" },
            //{ t: "width", sel: ".win-timepicker-minute" },
            //{ t: "width", sel: ".win-timepicker-period" },
            //{ t: "width", sel: ".win-datepicker-month" },
            //{ t: "width", sel: ".win-datepicker-date" },
            //{ t: "width", sel: ".win-datepicker-year" },

            { t: "end" }
        ];

    var _lines3 = [
            //{ t: "top", y: 70, w: 320 },
            //{ t: "top", y: 5, w: 50 },
            //{ t: "top", y: 30, w: 50 },
            //{ t: "top", y: 5, w: 320 },
            //{ t: "top", y: 21, w: 320 },
            //{ t: "top", id: "EventTitleDescrip", w: 320 },
            //{ t: "top", y: 7, w: 320 },
            ///*
            //{ t: "top", id: "EventTitleTextbox", w: 320 },
            //{ t: "top", y: 21, w: 320 },
            //{ t: "top", id: "LocationDescrip", w: 320 },
            //{ t: "top", y: 7, w: 320 },
            //{ t: "top", id: "LocationTextbox", w: 320 },
            //{ t: "top", y: 21, w: 320 },
            //*/
            //{ t: "left", x: 20 },
            //{ t: "left", x: 30, h: 110 },
            //{ t: "left", x: 10, h: 110 },
                
            //{ t: "right", x: 20 },
            //{ t: "right", x: 30, h: 110 },
            //{ t: "right", x: 20, h: 110 },
            //{ t: "right", x: 30, h: 110 },
            //{ t: "right", x: 20, h: 110 },

            //{ t: "width", sel: "#LocationTextbox" },
            //{ t: "width", sel: ".win-timepicker-hour" },
            //{ t: "width", sel: ".win-timepicker-minute" },
            //{ t: "width", sel: ".win-timepicker-period" },
            //{ t: "width", sel: ".win-datepicker-month" },
            //{ t: "width", sel: ".win-datepicker-date" },
            //{ t: "width", sel: ".win-datepicker-year" },
                
            { t: "end" }
        ];

    var _gridOn = false;

    function rect(id) {
        return document.getElementById(id).getBoundingClientRect();
    }
    
    function getRect(e) {
        var rc = e.getBoundingClientRect();
        return { l: rc.left,  t: rc.top, w: rc.width, h: rc.height };
    }

    function getLeft(id) {
        return rect(id).left;
    }

    function getTop(id) {
        return rect(id).top;
    }
    
    function getRight(id) {
        var rc = rect(id);
        return rc.left + rc.width;
    }

    function getBottom(id) {
        var rc = rect(id);
        return rc.top + rc.height;
    }

    function drawLine(ctx, x1, y1, x2, y2) {
        // To get 1px lines add 0.5 to coordinates, see
        // https://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors#section_8
        ctx.moveTo(x1 + 0.5, y1 + 0.5);
        ctx.lineTo(x2 + 0.5, y2 + 0.5);
    }

    function drawHorz(ctx, top, left, right, txt, txtAlign) {
        drawLine(ctx, left, top, right, top);
        if (txtAlign === "left") {
            ctx.fillText(txt, 0, top); // text, x, y
        } else if (txtAlign === "right") {
            ctx.fillText(txt, right - ctx.measureText(txt).width, top); // text, x, y
        }
    }

    function drawWidth(e) {
        var rc = getRect(e);
        ctx.fillText(rc.w, rc.l, rc.t + 3);
    }

    function getBottomEx(id) {
        var e = document.getElementById(id);
        var v = e.offsetHeight;
        while (e) {
            v += e.offsetTop;
            e = e.offsetParent;
        }
        return v;
    }

    function showGrid() {
    
        var w = window.innerWidth;
        var h = window.innerHeight;


        var htm = "" +
            "<span id='jxGridHost'>" +
                "<canvas id='jxGridCanvas' width='" + w + "' height='" + h + "' style='left:0;top:0;z-index:1800;position:absolute'></canvas>" +
                "<span id='jxGridInfo' style='left:0;top:" + (h - 20) + "px;z-index:1001;position:absolute;font-size:10pt'></span>" +
            "</span>";

        document.body.insertAdjacentHTML("beforeEnd", htm);

        var grid = document.getElementById("jxGridCanvas");
        var info = document.getElementById("jxGridInfo");

        var ctx = grid.getContext("2d");

        ctx.strokeStyle = "rgba(255,0,0,0.3)";
        ctx.fillStyle = "yellow";
        ctx.font = "6pt Lucida Sans";

        ctx.beginPath();

        var top = 0, left = 0, right = 0, bottom = 0;

        for (var i = 0; i < _lines.length; i++) {
            var line = _lines[i], txt;
        
            if (line.t === "top") {
                if (line.y) {
                    top += line.y;
                    ctx.fillText(line.y, 0, top);
                } else {
                    top = getBottom(line.id);
                }
                drawLine(ctx, 0, top, line.w || w, top);
            } else if (line.t === "topSet") {
                top = line.y;
            } else if (line.t === "left") {
                left += line.x;
                txt = String(line.x);
                ctx.fillText(txt, left - ctx.measureText(txt).width, 8);
                drawLine(ctx, left, 0, left, line.h || h);
            } else if (line.t === "right") {
                right += line.x;
                ctx.fillText(line.x, w - right, 8);
                drawLine(ctx, w - right, 0, w - right, line.h || h);
            } else if (line.t === "bottom") {
                bottom += line.y;
                // $TODO draw text
                drawLine(ctx, 0, h - bottom, line.w || w, h - bottom);
            } else if (line.t === "width") {
                var nodes = document.querySelectorAll(line.sel);
                for (var j = 0; j < nodes.length; j++) {
                    drawWidth(nodes[j]);
                }
            }
        }
    
        ctx.stroke();

        grid.addEventListener("mousemove", function (e) {
            var x = e.pageX - grid.offsetLeft;
            var y = e.pageY - grid.offsetTop;
            var str = "l:" + Math.round(x) + ",t:" + Math.round(y) + ",r:" + Math.round(w - x) + ",b:" + Math.round(h - y);
            info.innerText = str;
        }, false);
     
        _gridOn = true;
    }

    function hideGrid() {
        var e = document.getElementById("jxGridHost");
        if (e) {
            e.outerText = "";
        }
        _gridOn = false;
    }

    function toggleGrid() {
        if (_gridOn) {
            hideGrid();
        } else {
            showGrid();
        }
    }

    window.RedGrid = { toggle: toggleGrid };

})();


