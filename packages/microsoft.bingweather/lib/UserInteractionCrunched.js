/*  © Microsoft. All rights reserved. */
window.$MapsNamespace = window.$MapsNamespace || "Microsoft",
window[$MapsNamespace] = window[$MapsNamespace] || {},
window[$MapsNamespace].Maps = window[$MapsNamespace].Maps || {},
window[$MapsNamespace].Maps.UserInteraction = function(n, t) {
function ai() {
for (var t, i=st.length, r=ft(n.getRootElement()); i--; )
t = st[i],
r.add_event(t[0], t[1], !1);
for (i = ot.length; i--; )
t = ot[i],
t[2] || (t[2] = kt.addHandler(n, t[0], t[1]))
}
function vi() {
for (var t, i=st.length, r=ft(n.getRootElement()); i--; )
t = st[i],
r.remove_event(t[0], t[1], !1);
for (i = ot.length; i--; )
t = ot[i],
t[2] && (kt.removeHandler(t[2]), t[2] = null)
}
function ui(t) {
t = t || {},
n.setOptions({
disablePanning: !1, disableZooming: !1
}),
v = 1,
s = 21,
g = -90,
nt = 90,
tt = -180,
it = 179.999999,
rt = .9,
t.disable !== !0 ? (n.setOptions({
disablePanning: !0, disableZooming: !0
}), v = t.minZoom || v, s = t.maxZoom || s, g = t.minLatitude || -90, nt = t.maxLatitude || 90, tt = t.minLongitude || -180, it = t.maxLongitude || 179.999999, rt = t.inertiaIntensity || .9, ai()) : (vi(), h && l.cancelDispatch(h)),
n.restrictZoom(v, s);
var i=n.getZoomRange();
v = i.min,
s = i.max
}
function at() {
return f != null && (f.x != 0 || f.y != 0)
}
function yi() {
rt && at() && (f.x *= rt, f.y *= rt, Math.abs(f.x) < 5 && Math.abs(f.y) < 5 && (f.x = 0, f.y = 0))
}
function fi(n, t, r) {
if (n && t && r) {
var u=r.x - t.x,
e=r.y - t.y;
u != 0 || e != 0 ? (p += n, f ? (f.x = .3 * f.x + .7 * u * 1e3 / p, f.y = .3 * f.y + .7 * e * 1e3 / p) : f = new i(u * 1e3 / p, e * 1e3 / p), p = 0) : p += n
}
}
function y() {
a = null,
f = null
}
function h() {
var o,
nt,
g,
st,
lt,
pt;
l.cancelDispatch(h),
o = new Date,
nt = ut ? o - ut : null,
ut = o;
var tt=0,
it=0,
ot=0,
p=0;
if (d && (y(), ot = d < 0 ? -1 : 1, p = Math.ceil(n.getZoom() + d), (p > s || p < v) && (ot = 0)), (r.x || r.y) && (y(), tt = r.x * gt, it = r.y * gt, Math.abs(r.x) > .9 && Math.abs(r.x) < 3 && (r.x = r.x * 1.01), Math.abs(r.y) > .9 && Math.abs(r.y) < 3 && (r.y = r.y * 1.01)), ot ? (k = !1, o = new Date, (ut - ht) / 1e3 > .1 && (n.setView(p < n.getZoom() ? yt(p, n.getCenter(), new i(0, 0)) : {zoom: p}), ht = o)) : (tt || it) && (o = new Date, (ut - ht) / 1e3 > .1 && ((tt || it) && vt(new i(0, 0), new i(-tt, -it)), ht = o)), b)
vt(b, w),
ni === !0 && fi(nt, b, w),
b = w;
else if (e.length > 0) {
if (k = !0, g = e.length, u.length >= g) {
switch (g) {
case 1:
n.getZoom() != Math.round(n.getZoom()) ? ei(new i(u[0].x - n.getViewportX(), u[0].y - n.getViewportY())) : (vt(e[0], u[0]), fi(nt, e[0], u[0]));
break;
case 2:
if (!u[0] || !u[1] || !e[0] || !e[1])
return;
var t={},
c=e[0],
rt=u[0],
ft=0,
et=0;
c && rt && !i.areEqual(c, rt) && (ft = rt.x - c.x, et = rt.y - c.y, st = bt(ft, et), ft = st.x, et = st.y),
t.center = n.tryPixelToLocation(c, dt.page),
t.centerOffset = new i(c.x - n.getViewportX() + ft, c.y - n.getViewportY() + et),
lt = i.distance(e[0], e[1]) / i.distance(u[0], u[1]),
pt = Math.log(1 / lt) / hi,
t.zoom = n.getZoom() + pt,
t = yt(t.zoom, t.center, t.centerOffset),
t.animate = !1,
t.suspend = !0,
n.getMode().enableOrDisableZoomLevelSnap(!1),
n.setView(t),
n.getMode().enableOrDisableZoomLevelSnap(!0)
}
while (g--)
e[g] = u[g]
}
}
else if (at()) {
if (a) {
var ct=new i(a.x + f.x * nt / 1e3, a.y + f.y * nt / 1e3),
wt=new i(Math.round(a.x), Math.round(a.y)),
kt=new i(Math.round(ct.x), Math.round(ct.y));
vt(wt, kt),
a = ct
}
yi(),
at() ? l.dispatch(h) : n.setView({suspend: !1})
}
else
k && ei(new i(0, 0))
}
function ei(t) {
var i=n.getZoom(),
f=i - ct,
r,
u;
if (ct = 0, r = Math.abs(f), r -= Math.floor(r), u = r >= .1 && r < .5 ? f > 0 ? Math.ceil(i) : Math.floor(i) : Math.round(i), u != i) {
var o=n.tryPixelToLocation(t),
s=t,
e=yt(u, o, s);
e.suspend = !1,
n.setView(e)
}
else
n.setView({suspend: !1})
}
function pi(n) {
if (!n.ctrlKey)
switch (n.keyCode) {
case 37:
r.x > -1 && (r.x = -1);
break;
case 39:
r.x < 1 && (r.x = 1);
break;
case 38:
r.y > -1 && (r.y = -1);
break;
case 40:
r.y < 1 && (r.y = 1);
break;
case 109:
case 189:
k = !1,
d = -1;
break;
case 107:
case 187:
case 61:
k = !1,
d = 1
}
l.dispatch(h)
}
function wi(n) {
switch (n.keyCode) {
case 37:
case 39:
r.x = 0;
break;
case 38:
case 40:
r.y = 0;
break;
case 109:
case 189:
case 107:
case 187:
case 61:
d = 0
}
l.dispatch(h)
}
function oi() {
r.x = 0,
r.y = 0
}
function bi(t) {
wt = !0;
var u=-t.getX(),
f=-t.getY(),
r=bt(u, f),
e=n.tryPixelToLocation(new o.Point(-r.x, -r.y), o.PixelReference.viewport),
i=Math.ceil(n.getZoom() + 1);
i > s && (i = s),
n.setView({
zoom: i, center: e
})
}
function ki(){}
function di(t) {
var h=t.getX(),
c=t.getY(),
f=new i(h, c),
e=n.tryPixelToLocation(f, o.PixelReference.viewport),
u=n.getZoom(),
r=t.wheelDelta > 0 ? Math.round(u + 1) : Math.round(u - 1);
r > s && (r = s),
r < v && (r = v),
y(),
n.setView(r < u ? yt(r, e, f) : {
zoom: r, center: e, centerOffset: f
});
return
}
function gi(n) {
n.isTouchEvent ? (pt = new i(n.pageX, n.pageY), n.handled = !0) : (oi(), y(), w = ft.Screen.get_mouse_pos(n), ci = b = w)
}
function nr(n) {
n.isTouchEvent || b && (w = ft.Screen.get_mouse_pos(n), l.dispatch(h), ti = new Date)
}
function tr(t) {
if (t.isTouchEvent)
t.handled = !0,
wt = !1,
lt = t,
setTimeout(function() {
u.length == 1 && lt.originalEvent.x == pt.x && lt.originalEvent.y == pt.y && wt == !1 && o.Events.invoke(n, "click", lt)
}, 200);
else {
var i=new Date,
r=i - ti;
r < ri ? a = w : y(),
l.dispatch(h),
b = null
}
}
function ir(t) {
k = !0,
oi(),
n.setView({suspend: !1}),
y(),
u = [];
var r=Math.min(2, t.touches.length);
for (ct === 0 && r === 2 && (ct = n.getZoom()); r--; )
u[r] = new i(t.touches[r].pageX, t.touches[r].pageY),
e[r] = u[r],
li[r] = u[r]
}
function rr(n) {
var t=e.length;
if (t)
for (t = n.touches.length; t--; )
u[t] = new i(n.touches[t].pageX, n.touches[t].pageY);
l.dispatch(h),
ii = new Date
}
function si(t) {
if (e.length === 1 && ni === !0) {
var r=new Date,
f=r - ii;
f < ri ? a = u[0] : y()
}
e.length = 0,
t.touches.length && (y(), u[0] = e[0] = new i(t.touches[0].pageX, t.touches[0].pageY)),
at() ? l.dispatch(h) : n.setView({suspend: !1})
}
function vt(t, r) {
if (t && r && !i.areEqual(t, r)) {
var f=r.x - t.x,
e=r.y - t.y,
u=bt(f, e);
(u.x != 0 || u.y != 0) && n.setView({
center: n.getCenter(), centerOffset: u, animate: !1
})
}
}
function bt(t, r) {
var o,
s;
s = t > 0 ? tt : it,
o = r > 0 ? nt : g;
var u=n.tryLocationToPixel(new et(o, s), dt.viewport),
h=n.getWidth() / 2,
c=n.getHeight() / 2,
f,
e;
return t > 0 ? (f = u.x + h, t = Math.min(-f, t)) : t < 0 && (f = u.x - h, t = Math.max(-f, t)), r > 0 ? (e = u.y + c, r = Math.min(-e, r)) : r < 0 && (e = u.y - c, r = Math.max(-e, r)), new i(t, r)
}
function yt(t, i, r) {
var f=n.getWidth(),
e=n.getHeight(),
u=c.viewToBounds(t, i, r, f, e);
return u.center.longitude - u.width / 2 < tt ? (i.longitude = tt, r.x = -f / 2) : u.center.longitude + u.width / 2 > it && (i.longitude = it, r.x = f / 2), u.getNorth() > nt ? (i.latitude = nt, r.y = -e / 2) : u.getSouth() < g && (i.latitude = g, r.y = e / 2), {
zoom: t, center: i, centerOffset: r
}
}
var o=window[$MapsNamespace].Maps,
kt=o.Events,
i=o.Point,
ft=o.Gimme,
dt=o.PixelReference,
et=o.Location,
l=o.InternalNamespaceForDelay.Dispatcher,
hi=Math.log(2),
v,
s,
g,
nt,
tt,
it,
gt=n.getWidth() * .05,
ni=!0,
rt=.9,
f=null,
ut=null,
a=null,
k=!1,
ti=new Date(0),
ii=new Date(0),
ri=100,
p=0,
ot=[["dblclick", bi, null], ["mousewheel", di, null], ["mousedown", gi, null], ["mousemove", nr, null], ["mouseup", tr, null], ["keydown", pi, null], ["keyup", wi, null], ["click", ki, null], ],
st=[["touchstart", ir], ["touchmove", rr], ["touchend", si], ["touchcancel", si]],
r=new i(0, 0),
d=0,
ht=new Date(0),
w,
b,
ci,
u=[],
li=[],
e=[],
ct=0,
pt,
wt=!0,
lt;
this.setOptions = ui,
ui(t);
var ur=o.LocationRect,
et=o.Location,
i=o.Point,
c={
latitudeLimit: 85.051128, invFourPi: 1 / (4 * Math.PI), degreesPerRadian: 180 / Math.PI, radiansPerDegree: Math.PI / 180, viewToBounds: function(n, t, r, u, f) {
var e=c.fromLocation(t),
o=Math.pow(2, n) * 256,
l=new i(e.x - (u / 2 + r.x) / o, e.y - (f / 2 + r.y) / o),
a=new i(e.x + (u / 2 - r.x) / o, e.y + (f / 2 - r.y) / o),
s=c.toLocation(l),
h=c.toLocation(a);
return new ur(new et((s.latitude + h.latitude) / 2, (s.longitude + h.longitude) / 2), h.longitude - s.longitude, s.latitude - h.latitude)
}, toLocation: function(n) {
var t=c.yToLatitude(n.y);
return new et(t, (n.x - .5) * 360)
}, fromLocation: function(n) {
return new i(n.longitude / 360 + .5, c.latitudeToY(n.latitude))
}, yToLatitude: function(n) {
return 90 - 2 * Math.atan(Math.exp((n * 2 - 1) * Math.PI)) * c.degreesPerRadian
}, latitudeToY: function(n) {
if (n >= c.latitudeLimit)
return 0;
if (n <= -c.latitudeLimit)
return 1;
var t=Math.sin(n * c.radiansPerDegree);
return .5 - Math.log((1 + t) / (1 - t)) * this.invFourPi
}
}
}