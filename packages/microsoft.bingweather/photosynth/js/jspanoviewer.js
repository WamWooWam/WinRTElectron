/*  © Microsoft. All rights reserved. */
"use strict";
var quirks=new function() {
var _ua=navigator.userAgent;
var _isSafari=(navigator.vendor === 'Apple Computer, Inc.');
var _isWebkit=_ua.indexOf('Webkit');
var _chromeIndex=_ua.indexOf('Chrome');
var _isChrome=_chromeIndex !== -1;
var _firefoxIndex=_ua.indexOf('Firefox');
var _isFirefox=_firefoxIndex !== -1;
var _chromeVersion=_isChrome ? parseInt(_ua.substring(_chromeIndex + 7)) : -1;
var _firefoxVersion=_isFirefox ? parseInt(_ua.substring(_firefoxIndex + 8)) : -1;
var _isTrident=_ua.indexOf('Trident') !== -1;
this.isWebGLCORSSupported = (_isChrome && _chromeVersion >= 13) || (_isFirefox && _firefoxVersion >= 8);
this.failsToRenderItemsNearContainerBorder = (_isChrome && _chromeVersion <= 19);
this.isWebGLCORSRequired = (_isFirefox && _firefoxVersion > 4) || (_isChrome && _chromeVersion >= 13);
this.useImageDisposer = _isSafari;
this.supportsPreserve3D = !_isTrident && !_isFirefox
};
"use strict";
var RendererCheckCSS3D={};
RendererCheckCSS3D.isValidBrowser = function() {
var CSSMatrix=window.CSSMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix || window.MozCSSMatrix;
if (CSSMatrix == null || quirks.failsToRenderItemsNearContainerBorder) {
RendererCheckCSS3D.isValidBrowser = function() {
return false
};
return false
}
var matrix=new CSSMatrix;
if (!matrix) {
RendererCheckCSS3D.isValidBrowser = function() {
return false
};
return false
}
var div=document.createElement('div');
var style=div.style;
if ((style.webkitTransform === undefined) && (style.msTransform === undefined) && (style.mozTransform === undefined)) {
RendererCheckCSS3D.isValidBrowser = function() {
return false
};
return false
}
if (quirks.supportsPreserve3D) {
var testElem=document.createElement('div');
var testElemStyle=testElem.style;
testElemStyle.width = '0px';
testElemStyle.height = '0px';
testElemStyle.position = 'absolute';
testElemStyle.overflowX = 'hidden';
testElemStyle.overflowY = 'hidden';
testElemStyle.backgroundColor = 'rgb(0, 0, 0)';
testElem.innerHTML = '<div style="position: absolute; z-index: -10; -webkit-transform: matrix3d(772.413793, 0, 0, 0, 0, 772.413793, 0, 0, -537600, -315000, -1050.021, -1050, -772.413793, -112072.413793, 525.0085, 525); -ms-transform: matrix3d(772.413793, 0, 0, 0, 0, 772.413793, 0, 0, -537600, -315000, -1050.021, -1050, -772.413793, -112072.413793, 525.0085, 525); -moz-transform: matrix3d(772.413793, 0, 0, 0, 0, 772.413793, 0, 0, -537600, -315000, -1050.021, -1050, -772.413793, -112072.413793, 525.0085, 525); transform: matrix3d(772.413793, 0, 0, 0, 0, 772.413793, 0, 0, -537600, -315000, -1050.021, -1050, -772.413793, -112072.413793, 525.0085, 525); "><div id="_rwwviewer_cssrenderer_test_id" style="width: 256px; height: 256px;"></div></div>';
document.body.appendChild(testElem);
var size=document.getElementById('_rwwviewer_cssrenderer_test_id').getClientRects()[0];
document.body.removeChild(testElem);
if (Math.abs(size.width - 377) <= 1 && Math.abs(size.height - 377) <= 1) {
RendererCheckCSS3D.isValidBrowser = function() {
return true
};
return true
}
else {
RendererCheckCSS3D.isValidBrowser = function() {
return false
};
return false
}
}
else {
RendererCheckCSS3D.isValidBrowser = function() {
return true
};
return true
}
};
"use strict";
var RendererCheckWebGL={};
RendererCheckWebGL.getWebGLContext = function(win) {
if (win.getContext) {
var possibleNames=["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
for (var i=0; i < possibleNames.length; ++i) {
try {
var context=win.getContext(possibleNames[i], {antialias: true});
if (context != null)
return context
}
catch(ex) {}
}
}
return null
};
RendererCheckWebGL.isValidBrowser = function() {
var canvas=document.createElement('canvas');
var gl=RendererCheckWebGL.getWebGLContext(canvas);
if (!gl) {
console.log("WebGL is not supported.");
RendererCheckWebGL.isValidBrowser = function() {
return false
};
return false
}
else if (quirks.isWebGLCORSRequired && !quirks.isWebGLCORSSupported) {
console.log('CORS image textures are not supported in this browser');
RendererCheckWebGL.isValidBrowser = function() {
return false
};
return false
}
RendererCheckWebGL.isValidBrowser = function() {
return true
};
return true
};
var convexPolygonClipper={
clip: function clip(lowerClipBound, upperClipBound, polygon) {
if (upperClipBound.x < lowerClipBound.x || upperClipBound.y < lowerClipBound.y || upperClipBound.z < lowerClipBound.z) {
throw'clip bounds should have positive volume';
}
var options={
clipBounds: {
x: lowerClipBound.x, y: lowerClipBound.y, z: lowerClipBound.z, sizeX: upperClipBound.x - lowerClipBound.x, sizeY: upperClipBound.y - lowerClipBound.y, sizeZ: upperClipBound.z - lowerClipBound.z
}, poly: polygon, polyTextureCoords: null, polyVertexCount: polygon.length, clippedPoly: new Array(polygon.length + 6), clippedPolyTextureCoords: null, clippedPolyVertexCount: 0, tempVertexBuffer: new Array(polygon.length + 6), tempTextureCoordBuffer: null
};
convexPolygonClipper.clipConvexPolygonGeneral(options);
options.clippedPoly.length = options.clippedPolyVertexCount;
return options.clippedPoly
}, clipConvexPolygonGeneral: function clipConvexPolygonGeneral(options) {
if (!options.clipBounds) {
throw'expected clip bounds option';
}
if (options.polyVertexCount < 3 || options.poly == null || options.poly.length < options.polyVertexCount || options.clippedPoly == null || options.clippedPoly.length < options.polyVertexCount + 6 || options.tempVertexBuffer == null || options.tempVertexBuffer.length < options.polyVertexCount + 6) {
throw'polygon arrays must have sufficient capacity';
}
if (options.polyTextureCoords != null) {
if (options.polyTextureCoords.Length < options.polyVertexCount || options.clippedPolyTextureCoords == null || options.clippedPolyTextureCoords.Length < options.polyVertexCount + 6 || options.tempTextureCoordBuffer == null || options.tempTextureCoordBuffer.Length < options.polyVertexCount + 6) {
throw'polygon arrays must have sufficient capacity';
}
}
var t;
t = options.tempVertexBuffer;
options.tempVertexBuffer = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = options.tempTextureCoordBuffer;
options.tempTextureCoordBuffer = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
var clippedPolyCurrent=options.tempVertexBuffer;
var clippedPolyTextureCoordsCurrent=options.tempTextureCoordBuffer;
var clippedPolyVertexCountCurrent=options.polyVertexCount;
var p0Idx,
p1Idx,
BC0,
BC1;
var clipBounds=options.clipBounds;
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = options.poly[p0Idx].x - clipBounds.x * options.poly[p0Idx].w;
BC1 = options.poly[p1Idx].x - clipBounds.x * options.poly[p1Idx].w;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = options.poly;
options.clippedPolyTextureCoordsCurrent = options.polyTextureCoords;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
if (options.clippedPolyVertexCount == 0) {
return
}
t = clippedPolyCurrent;
clippedPolyCurrent = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = clippedPolyTextureCoordsCurrent;
clippedPolyTextureCoordsCurrent = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
clippedPolyVertexCountCurrent = options.clippedPolyVertexCount
}
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = (clipBounds.x + clipBounds.sizeX) * clippedPolyCurrent[p0Idx].w - clippedPolyCurrent[p0Idx].x;
BC1 = (clipBounds.x + clipBounds.sizeX) * clippedPolyCurrent[p1Idx].w - clippedPolyCurrent[p1Idx].x;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = clippedPolyCurrent;
options.clippedPolyTextureCoordsCurrent = clippedPolyTextureCoordsCurrent;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
if (options.clippedPolyVertexCount == 0) {
return
}
t = clippedPolyCurrent;
clippedPolyCurrent = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = clippedPolyTextureCoordsCurrent;
clippedPolyTextureCoordsCurrent = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
clippedPolyVertexCountCurrent = options.clippedPolyVertexCount
}
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = clippedPolyCurrent[p0Idx].y - clipBounds.y * clippedPolyCurrent[p0Idx].w;
BC1 = clippedPolyCurrent[p1Idx].y - clipBounds.y * clippedPolyCurrent[p1Idx].w;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = clippedPolyCurrent;
options.clippedPolyTextureCoordsCurrent = clippedPolyTextureCoordsCurrent;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
if (options.clippedPolyVertexCount == 0) {
return
}
t = clippedPolyCurrent;
clippedPolyCurrent = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = clippedPolyTextureCoordsCurrent;
clippedPolyTextureCoordsCurrent = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
clippedPolyVertexCountCurrent = options.clippedPolyVertexCount
}
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = (options.clipBounds.y + clipBounds.sizeY) * clippedPolyCurrent[p0Idx].w - clippedPolyCurrent[p0Idx].y;
BC1 = (options.clipBounds.y + clipBounds.sizeY) * clippedPolyCurrent[p1Idx].w - clippedPolyCurrent[p1Idx].y;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = clippedPolyCurrent;
options.clippedPolyTextureCoordsCurrent = clippedPolyTextureCoordsCurrent;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
if (options.clippedPolyVertexCount == 0) {
return
}
t = clippedPolyCurrent;
clippedPolyCurrent = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = clippedPolyTextureCoordsCurrent;
clippedPolyTextureCoordsCurrent = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
clippedPolyVertexCountCurrent = options.clippedPolyVertexCount
}
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = clippedPolyCurrent[p0Idx].z - clipBounds.z * clippedPolyCurrent[p0Idx].w;
BC1 = clippedPolyCurrent[p1Idx].z - clipBounds.z * clippedPolyCurrent[p1Idx].w;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = clippedPolyCurrent;
options.clippedPolyTextureCoordsCurrent = clippedPolyTextureCoordsCurrent;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
if (options.clippedPolyVertexCount == 0) {
return
}
t = clippedPolyCurrent;
clippedPolyCurrent = options.clippedPoly;
options.clippedPoly = t;
t = null;
t = clippedPolyTextureCoordsCurrent;
clippedPolyTextureCoordsCurrent = options.clippedPolyTextureCoords;
options.clippedPolyTextureCoords = t;
t = null;
clippedPolyVertexCountCurrent = options.clippedPolyVertexCount
}
{
options.clippedPolyVertexCount = 0;
p0Idx = clippedPolyVertexCountCurrent - 1;
for (p1Idx = 0; p1Idx < clippedPolyVertexCountCurrent; p1Idx++) {
BC0 = (options.clipBounds.z + clipBounds.sizeZ) * clippedPolyCurrent[p0Idx].w - clippedPolyCurrent[p0Idx].z;
BC1 = (options.clipBounds.z + clipBounds.sizeZ) * clippedPolyCurrent[p1Idx].w - clippedPolyCurrent[p1Idx].z;
options.BC0 = BC0;
options.BC1 = BC1;
options.p0Idx = p0Idx;
options.p1Idx = p1Idx;
options.clippedPolyCurrent = clippedPolyCurrent;
options.clippedPolyTextureCoordsCurrent = clippedPolyTextureCoordsCurrent;
convexPolygonClipper.genericClipAgainstPlane(options);
p0Idx = p1Idx
}
options.clippedPolyCurrent = null;
options.clippedPolyTextureCurrent = null
}
}, genericClipAgainstPlane: function genericClipAgainstPlane(options) {
var alpha;
if (options.BC1 >= 0) {
if (options.BC0 < 0) {
alpha = options.BC0 / (options.BC0 - options.BC1);
options.clippedPoly[options.clippedPolyVertexCount] = options.clippedPolyCurrent[options.p0Idx].lerp(options.clippedPolyCurrent[options.p1Idx], alpha);
if (options.clippedPolyTextureCoords != null) {
options.clippedPolyTextureCoords[options.clippedPolyVertexCount] = options.clippedPolyTextureCoordsCurrent[options.p0Idx].lerp(options.clippedPolyTextureCoordsCurrent[options.p1Idx], alpha)
}
options.clippedPolyVertexCount++
}
options.clippedPoly[options.clippedPolyVertexCount] = options.clippedPolyCurrent[options.p1Idx];
if (options.clippedPolyTextureCoords != null) {
options.clippedPolyTextureCoords[options.clippedPolyVertexCount] = options.clippedPolyTextureCoordsCurrent[options.p1Idx]
}
options.clippedPolyVertexCount++
}
else if (options.BC0 >= 0) {
alpha = options.BC0 / (options.BC0 - options.BC1);
options.clippedPoly[options.clippedPolyVertexCount] = options.clippedPolyCurrent[options.p0Idx].lerp(options.clippedPolyCurrent[options.p1Idx], alpha);
if (options.clippedPolyTextureCoords != null) {
options.clippedPolyTextureCoords[options.clippedPolyVertexCount] = options.clippedPolyTextureCoordsCurrent[options.p0Idx].lerp(options.clippedPolyTextureCoordsCurrent[options.p1Idx], alpha)
}
options.clippedPolyVertexCount++
}
}
};
var GraphicsHelper={};
GraphicsHelper.createLookAtRH = function(position, look, up) {
var rotatedPos,
viewSide,
viewUp,
result;
look = look.normalize();
up = up.normalize();
viewUp = up.subtract(look.multiplyScalar(up.dot(look))).normalize();
viewSide = look.cross(viewUp);
result = Matrix4x4.createIdentity();
result.m11 = viewSide.x;
result.m12 = viewSide.y;
result.m13 = viewSide.z;
result.m21 = viewUp.x;
result.m22 = viewUp.y;
result.m23 = viewUp.z;
result.m31 = -look.x;
result.m32 = -look.y;
result.m33 = -look.z;
rotatedPos = result.transformVector3(position);
result.m14 = -rotatedPos.x;
result.m24 = -rotatedPos.y;
result.m34 = -rotatedPos.z;
return result
};
GraphicsHelper.createPerspective = function(verticalFov, aspectRatio, near, far, digitalPan) {
var d;
d = 1.0 / Math.tan(verticalFov * 0.5);
var projection=new Matrix4x4(d / aspectRatio, 0, digitalPan.x * 2, 0, 0, d, digitalPan.y * 2, 0, 0, 0, far / (far - near), -(near * far) / (far - near), 0, 0, -1, 0);
return projection
};
GraphicsHelper.createPerspectiveFromFrustum = function(l, r, b, t, n, f) {
return new Matrix4x4((2.0 * n) / (r - l), 0.0, (r + l) / (r - l), 0.0, 0.0, (2.0 * n) / (t - b), (t + b) / (t - b), 0.0, 0.0, 0.0, (-1.0 * (f + n)) / (f - n), (-2.0 * f * n) / (f - n), 0.0, 0.0, -1.0, 0.0)
};
GraphicsHelper.createPerspectiveOGL = function(verticalFov, aspectRatio, near, far) {
var yMax=near * Math.tan(verticalFov * 0.5),
yMin=-yMax,
xMin=yMin * aspectRatio,
xMax=yMax * aspectRatio,
zMin=near,
zMax=far;
return GraphicsHelper.createPerspectiveFromFrustum(xMin, xMax, yMin, yMax, zMin, zMax)
};
GraphicsHelper.projectOntoPlane = function(position, plane) {
var l=position;
var n=plane.normal;
var d=plane.d;
var nDotL=n.dot(l);
var m11=nDotL + d - l.x * n.x;
var m12=-l.x * n.y;
var m13=-l.x * n.z;
var m14=-l.x * d;
var m21=-l.y * n.x;
var m22=nDotL + d - l.y * n.y;
var m23=-l.y * n.z;
var m24=-l.y * d;
var m31=-l.z * n.x;
var m32=-l.z * n.y;
var m33=nDotL + d - l.z * n.z;
var m34=-l.z * d;
var m41=-n.x;
var m42=-n.y;
var m43=-n.z;
var m44=nDotL;
return new Matrix4x4(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
};
GraphicsHelper.createViewportToScreen = function(width, height) {
var n=Matrix4x4.createIdentity();
n.m11 = width * 0.5;
n.m12 = 0;
n.m13 = 0;
n.m14 = 0;
n.m21 = 0;
n.m22 = -1 * height * 0.5;
n.m23 = 0;
n.m24 = 0;
n.m31 = 0;
n.m32 = 0;
n.m33 = 1;
n.m34 = 0;
n.m41 = width * 0.5;
n.m42 = height * 0.5;
n.m43 = 0;
n.m44 = 1;
n = n.transpose();
return n
};
var MathHelper={};
MathHelper.zeroTolerance = 1e-12;
MathHelper.halfPI = Math.PI * 0.5;
MathHelper.twoPI = 2 * Math.PI;
MathHelper.oneEightyOverPI = 180.0 / Math.PI;
MathHelper.piOverOneEighty = Math.PI / 180.0;
MathHelper.isZero = function(value) {
return Math.abs(value) < MathHelper.zeroTolerance
};
MathHelper.degreesToRadians = function(angle) {
return angle * MathHelper.piOverOneEighty
};
MathHelper.radiansToDegrees = function(angle) {
return angle * MathHelper.oneEightyOverPI
};
MathHelper.normalizeRadian = function(angle) {
while (angle < 0) {
angle += MathHelper.twoPI
}
while (angle >= MathHelper.twoPI) {
angle -= MathHelper.twoPI
}
return angle
};
MathHelper.pickStartHeadingToTakeShortestPath = function(source, target) {
if (Math.abs(target - source) > Math.PI) {
if (source < target) {
return source + MathHelper.twoPI
}
else {
return source - MathHelper.twoPI
}
}
else {
return source
}
};
MathHelper.invSqrt = function(v) {
return 1.0 / Math.sqrt(v)
};
MathHelper.isFinite = function(v) {
return v > Number.NEGATIVE_INFINITY && v < Number.POSITIVE_INFINITY
};
MathHelper.clamp = function(v, min, max) {
return (Math.min(Math.max(v, min), max))
};
MathHelper.logBase = function(x, base) {
return Math.log(x) / Math.log(base)
};
MathHelper.ceilLog2 = function(value) {
return Math.ceil(MathHelper.logBase(value, 2))
};
MathHelper.compareTo = function(v1, v2) {
if (v1 < v2) {
return -1
}
else if (v1 === v2) {
return 0
}
else {
return 1
}
};
MathHelper.divPow2RoundUp = function(value, power) {
return MathHelper.divRoundUp(value, 1 << power)
};
MathHelper.divRoundUp = function(value, denominator) {
return Math.ceil(value / denominator)
};
function Matrix4x4(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
this.m11 = m11;
this.m12 = m12;
this.m13 = m13;
this.m14 = m14;
this.m21 = m21;
this.m22 = m22;
this.m23 = m23;
this.m24 = m24;
this.m31 = m31;
this.m32 = m32;
this.m33 = m33;
this.m34 = m34;
this.m41 = m41;
this.m42 = m42;
this.m43 = m43;
this.m44 = m44
}
Matrix4x4.createCopy = function(m) {
return new Matrix4x4(m.m11, m.m12, m.m13, m.m14, m.m21, m.m22, m.m23, m.m24, m.m31, m.m32, m.m33, m.m34, m.m41, m.m42, m.m43, m.m44)
};
Matrix4x4.createIdentity = function() {
return new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
};
Matrix4x4.createScale = function(sx, sy, sz) {
return new Matrix4x4(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1)
};
Matrix4x4.createTranslation = function(tx, ty, tz) {
return new Matrix4x4(1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1)
};
Matrix4x4.createRotationX = function(angle) {
return new Matrix4x4(1, 0, 0, 0, 0, Math.cos(angle), -Math.sin(angle), 0, 0, Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1)
};
Matrix4x4.createRotationY = function(angle) {
return new Matrix4x4(Math.cos(angle), 0, Math.sin(angle), 0, 0, 1, 0, 0, -Math.sin(angle), 0, Math.cos(angle), 0, 0, 0, 0, 1)
};
Matrix4x4.createRotationZ = function(angle) {
return new Matrix4x4(Math.cos(angle), -Math.sin(angle), 0, 0, Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
};
Matrix4x4.prototype = {
add: function add(m) {
return new Matrix4x4(this.m11 + m.m11, this.m12 + m.m12, this.m13 + m.m13, this.m14 + m.m14, this.m21 + m.m21, this.m22 + m.m22, this.m23 + m.m23, this.m24 + m.m24, this.m31 + m.m31, this.m32 + m.m32, this.m33 + m.m33, this.m34 + m.m34, this.m41 + m.m41, this.m42 + m.m42, this.m43 + m.m43, this.m44 + m.m44)
}, subtract: function subtract(m) {
return new Matrix4x4(this.m11 - m.m11, this.m12 - m.m12, this.m13 - m.m13, this.m14 - m.m14, this.m21 - m.m21, this.m22 - m.m22, this.m23 - m.m23, this.m24 - m.m24, this.m31 - m.m31, this.m32 - m.m32, this.m33 - m.m33, this.m34 - m.m34, this.m41 - m.m41, this.m42 - m.m42, this.m43 - m.m43, this.m44 - m.m44)
}, multiply: function multiply(m) {
return new Matrix4x4(this.m11 * m.m11 + this.m12 * m.m21 + this.m13 * m.m31 + this.m14 * m.m41, this.m11 * m.m12 + this.m12 * m.m22 + this.m13 * m.m32 + this.m14 * m.m42, this.m11 * m.m13 + this.m12 * m.m23 + this.m13 * m.m33 + this.m14 * m.m43, this.m11 * m.m14 + this.m12 * m.m24 + this.m13 * m.m34 + this.m14 * m.m44, this.m21 * m.m11 + this.m22 * m.m21 + this.m23 * m.m31 + this.m24 * m.m41, this.m21 * m.m12 + this.m22 * m.m22 + this.m23 * m.m32 + this.m24 * m.m42, this.m21 * m.m13 + this.m22 * m.m23 + this.m23 * m.m33 + this.m24 * m.m43, this.m21 * m.m14 + this.m22 * m.m24 + this.m23 * m.m34 + this.m24 * m.m44, this.m31 * m.m11 + this.m32 * m.m21 + this.m33 * m.m31 + this.m34 * m.m41, this.m31 * m.m12 + this.m32 * m.m22 + this.m33 * m.m32 + this.m34 * m.m42, this.m31 * m.m13 + this.m32 * m.m23 + this.m33 * m.m33 + this.m34 * m.m43, this.m31 * m.m14 + this.m32 * m.m24 + this.m33 * m.m34 + this.m34 * m.m44, this.m41 * m.m11 + this.m42 * m.m21 + this.m43 * m.m31 + this.m44 * m.m41, this.m41 * m.m12 + this.m42 * m.m22 + this.m43 * m.m32 + this.m44 * m.m42, this.m41 * m.m13 + this.m42 * m.m23 + this.m43 * m.m33 + this.m44 * m.m43, this.m41 * m.m14 + this.m42 * m.m24 + this.m43 * m.m34 + this.m44 * m.m44)
}, multiplyScalar: function multiplyScalar(f) {
return new Matrix4x4(this.m11 * f, this.m12 * f, this.m13 * f, this.m14 * f, this.m21 * f, this.m22 * f, this.m23 * f, this.m24 * f, this.m31 * f, this.m32 * f, this.m33 * f, this.m34 * f, this.m41 * f, this.m42 * f, this.m43 * f, this.m44 * f)
}, transpose: function transpose() {
return new Matrix4x4(this.m11, this.m21, this.m31, this.m41, this.m12, this.m22, this.m32, this.m42, this.m13, this.m23, this.m33, this.m43, this.m14, this.m24, this.m34, this.m44)
}, transformVector4: function transformVector4(v) {
return new Vector4(this.m11 * v.x + this.m12 * v.y + this.m13 * v.z + this.m14 * v.w, this.m21 * v.x + this.m22 * v.y + this.m23 * v.z + this.m24 * v.w, this.m31 * v.x + this.m32 * v.y + this.m33 * v.z + this.m34 * v.w, this.m41 * v.x + this.m42 * v.y + this.m43 * v.z + this.m44 * v.w)
}, transformVector3: function transformVector3(v) {
return new Vector3(this.m11 * v.x + this.m12 * v.y + this.m13 * v.z, this.m21 * v.x + this.m22 * v.y + this.m23 * v.z, this.m31 * v.x + this.m32 * v.y + this.m33 * v.z)
}, determinant: function determinant() {
var a,
b,
c,
d,
e,
f,
g,
h,
i,
j,
k,
l;
a = this.m11 * this.m22 - this.m12 * this.m21;
b = this.m11 * this.m23 - this.m13 * this.m21;
c = this.m11 * this.m24 - this.m14 * this.m21;
d = this.m12 * this.m23 - this.m13 * this.m22;
e = this.m12 * this.m24 - this.m14 * this.m22;
f = this.m13 * this.m24 - this.m14 * this.m23;
g = this.m31 * this.m42 - this.m32 * this.m41;
h = this.m31 * this.m43 - this.m33 * this.m41;
i = this.m31 * this.m44 - this.m34 * this.m41;
j = this.m32 * this.m43 - this.m33 * this.m42;
k = this.m32 * this.m44 - this.m34 * this.m42;
l = this.m33 * this.m44 - this.m34 * this.m43;
return a * l - b * k + c * j + d * i - e * h + f * g
}, inverse: function inverse() {
var a,
b,
c,
d,
e,
f,
g,
h,
i,
j,
k,
l,
determinant,
invD,
m11,
m12,
m13,
m14,
m21,
m22,
m23,
m24,
m31,
m32,
m33,
m34,
m41,
m42,
m43,
m44;
a = this.m11 * this.m22 - this.m12 * this.m21;
b = this.m11 * this.m23 - this.m13 * this.m21;
c = this.m11 * this.m24 - this.m14 * this.m21;
d = this.m12 * this.m23 - this.m13 * this.m22;
e = this.m12 * this.m24 - this.m14 * this.m22;
f = this.m13 * this.m24 - this.m14 * this.m23;
g = this.m31 * this.m42 - this.m32 * this.m41;
h = this.m31 * this.m43 - this.m33 * this.m41;
i = this.m31 * this.m44 - this.m34 * this.m41;
j = this.m32 * this.m43 - this.m33 * this.m42;
k = this.m32 * this.m44 - this.m34 * this.m42;
l = this.m33 * this.m44 - this.m34 * this.m43;
determinant = a * l - b * k + c * j + d * i - e * h + f * g;
if (Math.abs(determinant) < MathHelper.zeroTolerance) {
return Matrix4x4.createIdentity()
}
m11 = this.m22 * l - this.m23 * k + this.m24 * j;
m12 = -this.m12 * l + this.m13 * k - this.m14 * j;
m13 = this.m42 * f - this.m43 * e + this.m44 * d;
m14 = -this.m32 * f + this.m33 * e - this.m34 * d;
m21 = -this.m21 * l + this.m23 * i - this.m24 * h;
m22 = this.m11 * l - this.m13 * i + this.m14 * h;
m23 = -this.m41 * f + this.m43 * c - this.m44 * b;
m24 = this.m31 * f - this.m33 * c + this.m34 * b;
m31 = this.m21 * k - this.m22 * i + this.m24 * g;
m32 = -this.m11 * k + this.m12 * i - this.m14 * g;
m33 = this.m41 * e - this.m42 * c + this.m44 * a;
m34 = -this.m31 * e + this.m32 * c - this.m34 * a;
m41 = -this.m21 * j + this.m22 * h - this.m23 * g;
m42 = this.m11 * j - this.m12 * h + this.m13 * g;
m43 = -this.m41 * d + this.m42 * b - this.m43 * a;
m44 = this.m31 * d - this.m32 * b + this.m33 * a;
invD = 1.0 / determinant;
return new Matrix4x4(m11 * invD, m12 * invD, m13 * invD, m14 * invD, m21 * invD, m22 * invD, m23 * invD, m24 * invD, m31 * invD, m32 * invD, m33 * invD, m34 * invD, m41 * invD, m42 * invD, m43 * invD, m44 * invD)
}, toString: function toString() {
return this.m11 + ", " + this.m12 + ", " + this.m13 + ", " + this.m14 + "\n" + this.m21 + ", " + this.m22 + ", " + this.m23 + ", " + this.m24 + "\n" + this.m31 + ", " + this.m32 + ", " + this.m33 + ", " + this.m34 + "\n" + this.m41 + ", " + this.m42 + ", " + this.m43 + ", " + this.m44 + "\n"
}, pullToZero: function pullToZero() {
if (Math.abs(this.m11) < MathHelper.zeroTolerance) {
this.m11 = 0.0
}
if (Math.abs(this.m12) < MathHelper.zeroTolerance) {
this.m12 = 0.0
}
if (Math.abs(this.m13) < MathHelper.zeroTolerance) {
this.m13 = 0.0
}
if (Math.abs(this.m14) < MathHelper.zeroTolerance) {
this.m14 = 0.0
}
if (Math.abs(this.m21) < MathHelper.zeroTolerance) {
this.m21 = 0.0
}
if (Math.abs(this.m22) < MathHelper.zeroTolerance) {
this.m22 = 0.0
}
if (Math.abs(this.m23) < MathHelper.zeroTolerance) {
this.m23 = 0.0
}
if (Math.abs(this.m24) < MathHelper.zeroTolerance) {
this.m24 = 0.0
}
if (Math.abs(this.m31) < MathHelper.zeroTolerance) {
this.m31 = 0.0
}
if (Math.abs(this.m32) < MathHelper.zeroTolerance) {
this.m32 = 0.0
}
if (Math.abs(this.m33) < MathHelper.zeroTolerance) {
this.m33 = 0.0
}
if (Math.abs(this.m34) < MathHelper.zeroTolerance) {
this.m34 = 0.0
}
if (Math.abs(this.m41) < MathHelper.zeroTolerance) {
this.m41 = 0.0
}
if (Math.abs(this.m42) < MathHelper.zeroTolerance) {
this.m42 = 0.0
}
if (Math.abs(this.m43) < MathHelper.zeroTolerance) {
this.m43 = 0.0
}
if (Math.abs(this.m44) < MathHelper.zeroTolerance) {
this.m44 = 0.0
}
}, flattenColumnMajor: function flattenColumnMajor() {
return [this.m11, this.m21, this.m31, this.m41, this.m12, this.m22, this.m32, this.m42, this.m13, this.m23, this.m33, this.m43, this.m14, this.m24, this.m34, this.m44]
}, flattenRowMajor: function flattenRowMajor() {
return [this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44]
}
};
function Plane(a, b, c, d, point) {
this.a = a;
this.b = b;
this.c = c;
this.d = d;
this.normal = new Vector3(this.a, this.b, this.c);
this.point = point
}
;
Plane.createFromPoints = function(p0, p1, p2) {
var u=p1.subtract(p0);
var v=p2.subtract(p0);
var n=u.cross(v);
n = n.normalize();
var d=-1 * (n.x * p0.x + n.y * p0.y + n.z * p0.z);
return new Plane(n.x, n.y, n.z, d, null)
};
Plane.createFromPointAndNormal = function(point, normal) {
var d=-1 * (normal.x * point.x + normal.y * point.y + normal.z * point.z);
return new Plane(normal.x, normal.y, normal.z, d, point)
};
Plane.intersectWithRay = function(ray, plane) {
if (plane.point === null) {
throw'requires plane.point to not equal null';
}
var dDotn=ray.direction.dot(plane.normal);
if (MathHelper.isZero(dDotn)) {
return null
}
var distance=plane.point.subtract(ray.origin).dot(plane.normal) / ray.direction.dot(plane.normal);
if (distance <= 0) {
return null
}
return ray.origin.add(ray.direction.multiplyScalar(distance))
};
Plane.prototype = {
transformNormal: function transformNormal(transform) {
var m=transform.inverse().transpose();
var n=m.transformVector3(this.normal);
return new Vector3(n.x, n.y, n.z)
}, toString: function toString() {
return 'A:' + this.a + ', B:' + this.b + ', C:' + this.c + ', D:' + this.d
}
};
function Quaternion(w, x, y, z) {
this.w = w;
this.x = x;
this.y = y;
this.z = z
}
Quaternion.createIdentity = function() {
return new Quaternion(1, 0, 0, 0)
};
Quaternion.fromRotationMatrix = function(m) {
var trace;
var temp;
var result;
var largestIndex;
result = new Quaternion(0, 0, 0, 0);
trace = m.m11 + m.m22 + m.m33;
if (trace > MathHelper.zeroTolerance) {
result.w = Math.sqrt(trace + 1) * 0.5;
temp = 1.0 / (4 * result.w);
result.x = (m.m32 - m.m23) * temp;
result.y = (m.m13 - m.m31) * temp;
result.z = (m.m21 - m.m12) * temp
}
else {
largestIndex = 0;
if (m.m22 > m.m11) {
largestIndex = 1;
if (m.m33 > m.m22) {
largestIndex = 2
}
}
else if (m.m33 > m.m11) {
largestIndex = 2
}
switch (largestIndex) {
case 0:
result.x = 0.5 * Math.sqrt(m.m11 - m.m22 - m.m33 + 1);
temp = 1.0 / (4 * result.x);
result.w = (m.m32 - m.m23) * temp;
result.y = (m.m12 + m.m21) * temp;
result.z = (m.m13 + m.m31) * temp;
break;
case 1:
result.y = 0.5 * Math.sqrt(m.m22 - m.m11 - m.m33 + 1);
temp = 1.0 / (4 * result.y);
result.w = (m.m13 - m.m31) * temp;
result.x = (m.m12 + m.m21) * temp;
result.z = (m.m23 + m.m32) * temp;
break;
case 2:
result.z = 0.5 * Math.sqrt(m.m33 - m.m11 - m.m22 + 1);
temp = 1.0 / (4 * result.z);
result.w = (m.m21 - m.m12) * temp;
result.x = (m.m13 + m.m31) * temp;
result.y = (m.m32 + m.m23) * temp;
break
}
}
return result
};
Quaternion.fromAxisAngle = function(axis, angle) {
var halfAngle,
s;
halfAngle = 0.5 * angle;
s = Math.sin(halfAngle);
return new Quaternion(Math.cos(halfAngle), axis.x * s, axis.y * s, axis.z * s)
};
Quaternion.slerp = function(t, source, target) {
var cos,
angle,
sin,
invSin,
a,
b;
if (t === 0.0) {
return source
}
if (t >= 1.0) {
return target
}
cos = source.dot(target);
angle = Math.acos(cos);
if (Math.abs(angle) >= MathHelper.zeroTolerance) {
sin = Math.sin(angle);
invSin = 1.0 / sin;
a = Math.sin((1.0 - t) * angle) * invSin;
b = Math.sin(t * angle) * invSin;
return source.multiplyScalar(a).add(target.multiplyScalar(b))
}
return source
};
Quaternion.prototype = {
dot: function dot(q) {
return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z
}, length: function length() {
return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z)
}, normalize: function normalize() {
var length,
inverseLength;
length = this.length();
if (length < MathHelper.zeroTolerance) {
return new Quaternion(0.0, 0.0, 0.0, 0.0)
}
inverseLength = 1.0 / length;
return new Quaternion(this.w * inverseLength, this.x * inverseLength, this.y * inverseLength, this.z * inverseLength)
}, inverse: function inverse() {
var norm,
invNorm;
norm = this.w * this.w + this.x * this.x + this.y * this.y * this.z * this.z;
if (Math.abs(norm) > MathHelper.zeroTolerance) {
invNorm = 1.0 / norm;
return new Quaternion(this.w * invNorm, -this.x * invNorm, -this.y * invNorm, -this.z * invNorm)
}
return new Quaternion(0.0, 0.0, 0.0, 0.0)
}, conjugate: function conjugate() {
return new Quaternion(this.w, -this.x, -this.y, -this.z)
}, transform: function transform(v) {
var p,
d,
c;
d = 2.0 * (this.x * v.x + this.y * v.y + this.z * v.z);
c = 2.0 * this.w;
p = c * this.w - 1.0;
return new Vector3(p * v.x + d * this.x + c * (this.y * v.z - this.z * v.y), p * v.y + d * this.y + c * (this.z * v.x - this.x * v.z), p * v.z + d * this.z + c * (this.x * v.y - this.y * v.x))
}, add: function add(q) {
return new Quaternion(this.w + q.w, this.x + q.x, this.y + q.y, this.z + q.z)
}, multiply: function multiply(q) {
return new Quaternion(this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z, this.y * q.z - this.z * q.y + this.w * q.x + q.w * this.x, this.z * q.x - this.x * q.z + this.w * q.y + q.w * this.y, this.x * q.y - this.y * q.x + this.w * q.z + q.w * this.z)
}, multiplyScalar: function multiplyScalar(f) {
return new Quaternion(this.w * f, this.x * f, this.y * f, this.z * f)
}, toRotationMatrix: function toRotationMatrix() {
var x,
y,
z,
wx,
wy,
wz,
xx,
xy,
xz,
yy,
yz,
zz;
x = 2.0 * this.x;
y = 2.0 * this.y;
z = 2.0 * this.z;
wx = x * this.w;
wy = y * this.w;
wz = z * this.w;
xx = x * this.x;
xy = y * this.x;
xz = z * this.x;
yy = y * this.y;
yz = z * this.y;
zz = z * this.z;
return new Matrix4x4(1.0 - (yy + zz), xy - wz, xz + wy, 0, xy + wz, 1.0 - (xx + zz), yz - wx, 0, xz - wy, yz + wx, 1.0 - (xx + yy), 0, 0, 0, 0, 1)
}, toAxisAngle: function toAxisAngle() {
var lengthSquared,
inverseLength;
lengthSquared = this.x * this.x + this.y * this.y + this.z * this.z;
if (lengthSquared > MathHelper.zeroTolerance) {
inverseLength = MathHelper.invSqrt(lengthSquared);
return new Vector4(this.x * inverseLength, this.y * inverseLength, this.z * inverseLength, 2.0 * Math.acos(this.w))
}
return new Vector4(1, 0, 0, 0)
}, toString: function toString() {
return '[' + this.w + ', ' + this.x + ', ' + this.y + ', ' + this.z + ']'
}
};
function Ray(origin, direction) {
this.origin = origin;
this.direction = direction
}
;
function Rectangle(x, y, width, height) {
this.x = x;
this.y = y;
this.width = width;
this.height = height
}
Rectangle.prototype = {
intersect: function intersect(rect) {
if (!this.intersectsWith(rect)) {
this.x = this.y = this.width = this.height = 0
}
else {
var num=Math.max(this.x, rect.x);
var num2=Math.max(this.y, rect.y);
this.width = Math.max((Math.min((this.x + this.width), (rect.x + rect.width)) - num), 0.0);
this.height = Math.max((Math.min((this.y + this.height), (rect.y + rect.height)) - num2), 0.0);
this.x = num;
this.y = num2
}
}, intersectsWith: function intersectsWith(rect) {
if ((this.width < 0.0) || (rect.width < 0.0)) {
return false
}
return ((((rect.x <= (this.x + this.width)) && ((rect.x + rect.width) >= this.x)) && (rect.y <= (this.y + this.height))) && ((rect.y + rect.height) >= this.y))
}, getLeft: function getLeft() {
return this.x
}, getRight: function getRight() {
return this.x + this.width
}, getTop: function getTop() {
return this.y
}, getBottom: function getBottom() {
return this.y + this.height
}
};
function Vector2(x, y) {
this.x = x;
this.y = y
}
Vector2.clone = function(v) {
return new Vector2(v.x, v.y)
};
Vector2.prototype = {
dot: function dot(v) {
return this.x * v.x + this.y * v.y
}, perp: function perp() {
return new Vector2(this.y, -this.x)
}, normalize: function normalize() {
var length,
inverseLength;
length = this.length();
if (length < MathHelper.zeroTolerance) {
return new Vector2(0.0, 0.0)
}
inverseLength = 1.0 / length;
return new Vector2(this.x * inverseLength, this.y * inverseLength)
}, length: function length() {
return Math.sqrt(this.x * this.x + this.y * this.y)
}, lengthSquared: function lengthSquared() {
return this.x * this.x + this.y * this.y
}, add: function add(v) {
return new Vector2(this.x + v.x, this.y + v.y)
}, subtract: function subtract(v) {
return new Vector2(this.x - v.x, this.y - v.y)
}, multiplyScalar: function multiplyScalar(f) {
return new Vector2(this.x * f, this.y * f)
}, equals: function equals(v) {
return this.x === v.x && this.y === v.y
}, lerp: function lerp(other, alpha) {
return new Vector2(this.x + alpha * (other.x - this.x), this.y + alpha * (other.y - this.y))
}, toString: function toString() {
return '[' + this.x + ', ' + this.y + ']'
}
};
function Vector3(x, y, z) {
this.x = x;
this.y = y;
this.z = z
}
Vector3.createFromVector2 = function(v, z) {
return new Vector3(v.x, v.y, z)
};
Vector3.clone = function(v) {
return new Vector3(v.x, v.y, v.z)
};
Vector3.prototype = {
dot: function dot(v) {
return this.x * v.x + this.y * v.y + this.z * v.z
}, normalize: function normalize() {
var length,
inverseLength;
length = this.length();
if (length < MathHelper.zeroTolerance) {
return new Vector3(0.0, 0.0, 0.0)
}
inverseLength = 1.0 / length;
return new Vector3(this.x * inverseLength, this.y * inverseLength, this.z * inverseLength)
}, cross: function cross(v) {
return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
}, length: function length() {
return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
}, lengthSquared: function lengthSquared() {
return this.x * this.x + this.y * this.y + this.z * this.z
}, add: function add(v) {
return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
}, subtract: function subtract(v) {
return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
}, multiplyScalar: function multiplyScalar(f) {
return new Vector3(this.x * f, this.y * f, this.z * f)
}, equals: function equals(v) {
return this.x === v.x && this.y === v.y && this.z === v.z
}, lerp: function lerp(other, alpha) {
return new Vector3(this.x + alpha * (other.x - this.x), this.y + alpha * (other.y - this.y), this.z + alpha * (other.z - this.z))
}, toString: function toString() {
return '[' + this.x + ', ' + this.y + ', ' + this.z + ']'
}
};
function Vector4(x, y, z, w) {
this.x = x;
this.y = y;
this.z = z;
this.w = w
}
Vector4.createFromVector3 = function(v) {
return new Vector4(v.x, v.y, v.z, 1)
};
Vector4.prototype = {
dot: function dot(v) {
return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w
}, normalize: function normalize() {
var length,
inverseLength;
length = this.length();
if (length < MathHelper.zeroTolerance) {
return new Vector4(0.0, 0.0, 0.0, 0.0)
}
inverseLength = 1.0 / length;
return new Vector4(this.x * inverseLength, this.y * inverseLength, this.z * inverseLength, this.w * inverseLength)
}, length: function length() {
return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
}, lengthSquared: function lengthSquared() {
return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
}, add: function add(v) {
return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w)
}, subtract: function subtract(v) {
return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w)
}, multiplyScalar: function multiplyScalar(f) {
return new Vector4(this.x * f, this.y * f, this.z * f, this.w * f)
}, equals: function equals(v) {
return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w
}, lerp: function lerp(other, alpha) {
return new Vector4(this.x + alpha * (other.x - this.x), this.y + alpha * (other.y - this.y), this.z + alpha * (other.z - this.z), this.w + alpha * (other.w - this.w))
}, toString: function toString() {
return '[' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ']'
}
};
"use strict";
var Config={
debug: false, forceIERenderPath: true, outputMultiLODTiles: true, scanConvertSize: 40, polyInflate: 0.05
};
"use strict";
var Utils={
log: function log() {
if (window.console && Config.debug) {
console.log.apply(console, arguments)
}
}, extend: function extend(derived, base) {
function Inheritance(){}
Inheritance.prototype = base.prototype;
derived.prototype = new Inheritance;
derived.prototype.constructor = derived;
derived.baseConstructor = base;
derived.superClass = base.prototype
}, _eventListeners: {}, bind: function bind(element, eventName, handler, useCapture) {
var i,
eventNames=eventName.split(' ');
for (i = 0; i < eventNames.length; ++i) {
eventName = eventNames[i];
if (!Utils._eventListeners[element]) {
Utils._eventListeners[element] = {}
}
if (!Utils._eventListeners[element][eventName]) {
Utils._eventListeners[element][eventName] = []
}
if (element.addEventListener) {
if (eventName == 'mousewheel') {
element.addEventListener('DOMMouseScroll', handler, useCapture)
}
element.addEventListener(eventName, handler, useCapture)
}
else if (element.attachEvent) {
element.attachEvent('on' + eventName, handler);
if (useCapture && element.setCapture) {
element.setCapture()
}
}
Utils._eventListeners[element][eventName].push([handler, useCapture])
}
}, _unbindAll: function _unbindAll(element) {
var k,
eventListeners,
i;
if (Utils._eventListeners[element]) {
for (k in Utils._eventListeners[element]) {
for (i = 0; i < Utils._eventListeners[element][k].length; ++i) {
Utils.unbind(element, k, Utils._eventListeners[element][k][i][0], Utils._eventListeners[element][k][i][1])
}
}
}
}, unbind: function unbind(element, eventName, handler, useCapture) {
if (element && !eventName) {
Utils._unbindAll(element)
}
else {
var i,
j,
k,
count,
eventNames=eventName.split(' ');
for (i = 0; i < eventNames.length; ++i) {
eventName = eventNames[i];
if (element.removeEventListener) {
if (eventName == 'mousewheel') {
element.removeEventListener('DOMMouseScroll', handler, useCapture)
}
element.removeEventListener(eventName, handler, useCapture)
}
else if (element.detachEvent) {
element.detachEvent('on' + eventName, handler);
if (useCapture && element.releaseCapture) {
element.releaseCapture()
}
}
if (Utils._eventListeners[element] && Utils._eventListeners[element][eventName]) {
for (j = 0; j < Utils._eventListeners[element][eventName].length; ++j) {
if (Utils._eventListeners[element][eventName][j][0] === handler) {
Utils._eventListeners[element][eventName][j].splice(j, 1)
}
}
if (Utils._eventListeners[element][eventName].length === 0) {
delete Utils._eventListeners[element][eventName]
}
}
}
count = 0;
if (Utils._eventListeners[element]) {
for (k in Utils._eventListeners[element]) {
++count
}
if (count === 0) {
delete Utils._eventListeners[element]
}
}
}
}, setOpacity: function setOpacity() {
function w3c(elem, opacity) {
elem.style.opacity = opacity
}
function ie(elem, opacity) {
opacity *= 100;
var filter;
try {
filter = elem.filters.item('DXImageTransform.Microsoft.Alpha');
if (opacity < 100) {
filter.Opacity = opacity;
if (!filter.enabled) {
filter.enabled = true
}
}
else {
filter.enabled = false
}
}
catch(ex) {
if (opacity < 100) {
elem.style.filter = (elem.currentStyle || elem.runtimeStyle).filter + ' progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')'
}
}
}
var d=document.createElement('div');
return typeof d.style.opacity !== 'undefined' && w3c || typeof d.style.filter !== 'undefined' && ie || function(){}
}(), css: function css(element, obj) {
var k;
for (k in obj) {
if (obj.hasOwnProperty(k)) {
if (k === 'opacity') {
Utils.setOpacity(element, obj[k])
}
else {
element.style[k] = obj[k]
}
}
}
}, getWheelDelta: function getWheelDelta(e) {
return e.detail ? e.detail * -1 : e.wheelDelta / 40
}, isDataUrl: function isDataUrl(url) {
return /^data:/.test(url)
}, isRelativeUrl: function isRelativeUrl(url) {
var hasProtocol=/^ftp:\/\//.test(url) || /^http:\/\//.test(url) || /^https:\/\//.test(url) || /^file:\/\//.test(url);
return !hasProtocol
}, hostnameRegexp: new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'), filehostnameRegexp: new RegExp('^file\://([^/]+)', 'im'), getHostname: function getHostname(url) {
var result=Utils.hostnameRegexp.exec(url);
if (!result || result.length !== 2) {
result = Utils.filehostnameRegexp.exec(url)
}
if (!result || result.length !== 2) {
return ''
}
else {
return result[1].toString()
}
}, areSameDomain: function areSameDomain(url1, url2) {
var host1=Utils.getHostname(url1).toLowerCase(),
host2=Utils.getHostname(url2).toLowerCase();
return host1 === host2
}
};
"use strict";
function extend(subclass, base) {
function f(){}
f.prototype = base.prototype;
subclass.prototype = new f;
subclass.prototype.constructor = subclass;
subclass.__super = base
}
;
function Geometry(params) {
Geometry.__super.call(this);
this._isDirty = true;
this._vertices = params.vertices || [];
this._vertexSize = params.vertexSize || 0;
this._texCoords = params.texCoords || [];
this._texCoordSize = params.texCoordSize || 0;
this._indices = params.indices || [];
this._primitiveType = params.primType || "invalid";
this._primitiveLength = params.primLength || 0
}
Geometry.QUADS = 1;
Geometry.TRIANGLES = 2;
extend(Geometry, Object);
function Texture(url, loadCallback, loadCallbackInfo, wrapS, wrapT, minFilter, magFilter, offsetX, offsetY, width, height) {
Texture.__super.call(this);
this._url = url;
this._loadCallback = loadCallback;
this._loadCallbackInfo = loadCallbackInfo;
this._image = null;
this._offsetX = offsetX;
this._offsetY = offsetY;
this._width = width;
this._height = height;
this._wrapS = wrapS != null ? wrapS : Texture.Wrap.CLAMP_TO_EDGE;
this._wrapT = wrapT != null ? wrapT : Texture.Wrap.CLAMP_TO_EDGE;
this._minFilter = minFilter != null ? minFilter : Texture.Filter.LINEAR_MIPMAP_LINEAR;
this._magFilter = magFilter != null ? magFilter : Texture.Filter.LINEAR;
this._isReady = false;
this._isDirty = false
}
Texture.Wrap = {
CLAMP_TO_EDGE: 1, REPEAT: 2
};
Texture.Filter = {
NEAREST: 0, LINEAR: 1, LINEAR_MIPMAP_LINEAR: 2
};
extend(Texture, Object);
Texture.prototype.loadImageInDOM = function() {
this._image = new Image;
var tex=this;
this._image.onload = function() {
if (tex._loadCallback) {
tex._loadCallback(tex._url, tex._loadCallbackInfo, tex)
}
tex._isReady = true;
tex._isDirty = true
};
this._image.crossOrigin = '';
this._image.src = this._url
};
function AnimationBeginEndValues(begin, end) {
this.begin = begin;
this.end = end;
AnimationBeginEndValues.__super.call(this)
}
extend(AnimationBeginEndValues, Object);
function Animation() {
Animation.__super.call(this);
this.opacity = new AnimationBeginEndValues(1, 1);
this.x = new AnimationBeginEndValues(0, 0);
this.y = new AnimationBeginEndValues(0, 0);
this.sx = new AnimationBeginEndValues(1, 1);
this.sy = new AnimationBeginEndValues(1, 1);
this.rotate = new AnimationBeginEndValues(0, 0);
this._duration = 0;
this._startT = 0;
this._easingMode = "linear";
this._ended = false;
this._endCallbackInfo = null;
this._endCallback = null
}
extend(Animation, Object);
Animation.prototype.initStates = function(params) {
for (var prop in params) {
this[prop] = [params[prop], params[prop]]
}
};
Animation.prototype.getEndStates = function() {
var ret={};
for (var prop in this) {
if (this[prop] instanceof AnimationBeginEndValues)
ret[prop] = this[prop].end
}
return ret
};
function Material() {
Material.__super.call(this);
Material._animation = null;
Material._animationEndStates = null
}
extend(Material, Object);
Material.prototype.apply = function(context) {
throw"You should not have reached base Material.apply().";
};
function SingleTextureMaterial(tex) {
this._texture = tex;
SingleTextureMaterial.__super.call(this)
}
extend(SingleTextureMaterial, Material);
function Transform() {
this._rotX = this._rotY = this._rotZ = 0;
this._translateX = this._translateY = this._translateZ = 0;
this._scaleX = this._scaleY = this._scaleZ = 0;
Transform.__super.call(this)
}
extend(Transform, Matrix4x4);
Transform.prototype.apply = function(context) {
throw"You should not have reached base Transform.apply().";
};
function Renderable(params) {
this._geometry = params.geometry || null;
this._material = params.material || null;
this._transform = params.transform || null
}
extend(Renderable, Object);
var uniqueId=(function() {
var count=(new Date).getTime();
return function() {
++count;
return count
}
})();
function Renderer(win) {
Renderer.__super.constructor.call(this);
this._name = 'BaseRenderer';
this._renderables = {};
this._removedRenderables = {};
this._nodes = {};
this._window = win;
this._rootElement = null;
this._viewProjMatrix = Matrix4x4.createIdentity();
this._clearColor = {
r: 0.0, g: 0.0, b: 0.0, a: 1.0
}
}
extend(Renderer, Object);
Renderer.prototype.render = function() {
throw'The renderer you are using does not implement the render() method.';
};
Renderer.prototype.addRenderable = function(renderableArray, idArray) {
var i,
uid,
ids=[];
for (i = 0; i < renderableArray.length; ++i) {
uid = (idArray != undefined && idArray[i] != undefined) ? idArray[i] : uniqueId();
if (!renderableArray[i]) {
throw'Expected valid renderable';
}
this._renderables[uid] = renderableArray[i];
ids.push(uid)
}
return ids
};
Renderer.prototype._checkClearColor = function(color) {
if (!color || color.r == null || color.g == null || color.b == null || color.a == null) {
throw'Color must include r,g,b,a numeric properties.';
}
};
Renderer.prototype.setClearColor = function(color) {
throw'setClearColor is not implemented';
};
Renderer.prototype._error = function(msg) {
if (Config.debug) {
throw new Error(msg);
debugger
}
};
Renderer.prototype.remove = function(idArray) {
var i,
id;
for (i = 0; i < idArray.length; ++i) {
id = idArray[i];
if (this._renderables[id] != undefined) {
this._removedRenderables[id] = this._renderables[id];
delete this._renderables[id]
}
else if (this._nodes[id] != undefined) {
delete this._nodes[id]
}
else {
this._error('Object ' + id + ' not found.')
}
}
};
Renderer.prototype.animate = function(renderable, startProperties, endProperties, duration, easing, completeCallback, completeCallbackInfo) {
throw'The renderer does not implement animate function';
};
Renderer.prototype.setViewProjectionMatrix = function(mat) {
this._viewProjMatrix = mat
};
"use strict";
function GridGeometry(width, height, nSegX, nSegY, useTris) {
GridGeometry.__super.call(this, {});
var x,
y,
w2=width * 0.5,
h2=height * 0.5,
gridX=nSegX || 1,
gridY=nSegY || 1,
gridX1=gridX + 1,
gridY1=gridY + 1,
stepX=width / gridX,
stepY=height / gridY;
for (y = 0; y < gridY1; y++) {
for (x = 0; x < gridX1; x++) {
var xx=x * stepX;
var yy=y * stepY;
this._vertices.push(xx, yy, 0)
}
}
for (y = 0; y < gridY; y++) {
for (x = 0; x < gridX; x++) {
var a=x + gridX1 * y,
b=x + gridX1 * (y + 1),
c=(x + 1) + gridX1 * (y + 1),
d=(x + 1) + gridX1 * y;
if (!useTris) {
this._indices.push(a, b, c, d);
this._texCoords.push(x / gridX, y / gridY, x / gridX, (y + 1) / gridY, (x + 1) / gridX, (y + 1) / gridY, (x + 1) / gridX, y / gridY)
}
else {
this._indices.push(a, b, c);
this._indices.push(a, c, d);
this._texCoords.push(x / gridX, y / gridY, x / gridX, (y + 1) / gridY, (x + 1) / gridX, (y + 1) / gridY);
this._texCoords.push(x / gridX, y / gridY, (x + 1) / gridX, (y + 1) / gridY, (x + 1) / gridX, y / gridY)
}
}
}
this._texCoordSize = 2;
this._primitiveType = useTris ? Geometry.TRIANGLES : Geometry.QUADS;
this._primitiveLength = gridX * gridY * (useTris ? 2 : 1);
this._isDirty = true
}
;
extend(GridGeometry, Geometry);
function QuadGeometry(width, height) {
this._vertices = [width, height, 0, 0, height, 0, 0, 0, 0, width, 0, 0];
this._texCoords = [1, 1, 0, 1, 0, 0, 1, 0];
this._indices = [0, 1, 2, 0, 2, 3];
this._texCoordSize = 2;
this._primitiveType = Geometry.TRIANGLES;
this._primitiveLength = 2;
this._isDirty = true
}
function QuadGeometryWireframe(width, height) {
this._vertices = [width, height, 0, 0, height, 0, 0, 0, 0, width, 0, 0];
this._texCoords = [1, 1, 0, 1, 0, 0, 1, 0];
this._indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 2, 1, 3];
this._texCoordSize = 2;
this._primitiveType = Geometry.TRIANGLES;
this._primitiveLength = 2;
this._isDirty = true
}
extend(QuadGeometry, Geometry);
function TexturedQuadRenderable(width, height, transform, textureURL, loadCallback, loadCallbackInfo, loadTextureInDOM, offsetX, offsetY) {
TexturedQuadRenderable.__super.call(this, {});
var self=this;
this._geometry = new QuadGeometry(width, height);
this._transform = transform ? transform : Matrix4x4.createIdentity();
if (textureURL) {
var texture=new Texture(textureURL, null, loadCallbackInfo, null, null, null, null, offsetX, offsetY, width, height);
this._material = new SingleTextureMaterial(texture);
if (loadTextureInDOM) {
texture.loadImageInDOM()
}
}
}
extend(TexturedQuadRenderable, Renderable);
function UntexturedQuadRenderable(width, height, transform, textureURL, loadCallback, loadCallbackInfo, loadTextureInDOM) {
UntexturedQuadRenderable.__super.call(this, {});
var self=this;
this._geometry = new QuadGeometry(width, height);
this._material = null;
this._transform = transform ? transform : Matrix4x4.createIdentity()
}
extend(UntexturedQuadRenderable, Renderable);
function TestQuadRenderable(width, height, transform, backgroundColor, text, loadTexture) {
TexturedQuadRenderable.__super.call(this, {});
var self=this;
var buffer=document.createElement('canvas');
buffer.width = width;
buffer.height = height;
var context=buffer.getContext('2d');
context.clearRect(0, 0, width, height);
context.fillStyle = backgroundColor || 'gray';
context.fillRect(0, 0, width, height);
context.fillStyle = 'black';
context.font = '12pt Segoe UI,sans-serif';
context.fillText(text, width * 0.3, height * 0.3);
var textureURL=buffer.toDataURL();
var texture=new Texture(textureURL);
if (loadTexture) {
texture.loadImageInDOM()
}
self._material = new SingleTextureMaterial(texture);
self._transform = transform ? transform : Matrix4x4.createIdentity();
self._geometry = new QuadGeometry(width, height)
}
extend(TexturedQuadRenderable, Renderable);
"use strict";
var MemoryCache=function(minEntries) {
var self=this;
var attributePrefix='$$';
var Debug={};
Debug.assert = function(a, b){};
var _maxEntries=minEntries;
var _maxHashtables=3;
var _countKey=attributePrefix + 'count';
var _cache=[{}];
_cache[0][_countKey] = 0;
var _disposer;
self.get = function(key, refresh) {
Debug.assert(typeof key === 'string', 'Argument: key');
var value;
var i=_cache.length;
var latest=true;
while (i--) {
value = _cache[i][key];
if (value !== undefined) {
if (refresh && !latest) {
self.insert(key, value)
}
return value
}
latest = false
}
};
self.insert = function(key, value) {
Debug.assert(typeof key === 'string', 'Argument: key');
Debug.assert(value !== undefined, 'Argument: value');
var hashtable=_cache[_cache.length - 1];
if (hashtable[key] === undefined) {
if (hashtable[_countKey] < _maxEntries) {
hashtable[_countKey]++
}
else {
hashtable = {};
hashtable[_countKey] = 1;
_cache.push(hashtable);
if (_cache.length > _maxHashtables) {
var oldHashtable=_cache.shift();
if (_disposer) {
for (var k in oldHashtable) {
if (k !== _countKey && oldHashtable.hasOwnProperty(k)) {
var oldObject=oldHashtable[k];
if (oldObject !== self.get(k)) {
_disposer(oldObject)
}
}
}
}
}
}
}
hashtable[key] = value
};
self.useDisposer = function(disposer) {
_disposer = disposer
};
self.size = function() {
var i,
k,
count=0;
for (i = 0; i < _cache.length; ++i) {
if (_cache[i]) {
for (k in _cache[i]) {
if (_cache[i].hasOwnProperty(k) && k !== _countKey) {
++count
}
}
}
}
return count
}
};
"use strict";
var PriorityNetworkDownloader=function(useCORS, tileDownloadFailedCallback, tileDownloadSucceededCallback, tileCacheId) {
var self=this;
self.useCORS = (useCORS || false);
var _spacerImageUrl='data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
var _downloadTimeout=10000;
var _maxConcurrentTileDownloads=6;
var _queue=[];
var _activeDownloadsCount=0;
var _activeDownloads={};
var _downloaded=new MemoryCache(8);
var _failed=new MemoryCache(1);
var _allDownloadedUrls=new MemoryCache(200);
var _succeedCount=0;
var _failCount=0;
tileDownloadFailedCallback = tileDownloadFailedCallback || function(){};
tileDownloadSucceededCallback = tileDownloadSucceededCallback || function(){};
if (quirks.useImageDisposer) {
_downloaded.useDisposer(function(o) {
if (o && o.src) {
o.src = _spacerImageUrl
}
})
}
var attributePrefix='$$';
var _downloadRequestKey=attributePrefix + 'downloadRequest';
var _timeoutIdKey=attributePrefix + 'timeoutid';
var _processedKey=attributePrefix + 'processed';
var _tokenKey='token';
self.completed = [];
self.getState = function(url) {
if (_downloaded.get(url)) {
return TileDownloadState.ready
}
if (_allDownloadedUrls.get(url)) {
return TileDownloadState.cacheExpired
}
var failedState=_failed.get(url);
if (failedState !== undefined) {
return failedState
}
if (_activeDownloads[url]) {
return TileDownloadState.downloading
}
return TileDownloadState.none
};
self.downloadImage = function(url, priority, token) {
if (self.getState(url) === TileDownloadState.ready) {
self.completed.push(_downloaded.get(url))
}
else {
_queue.push({
url: url, priority: priority, token: token
})
}
};
self.updatePriority = function(url, priority) {
var i,
found=false;
for (i = 0; i < _queue.length; ++i) {
if (_queue.url === url) {
found = true;
_queue.priority = priority;
break
}
}
if (!found) {
throw'Expected item to be in queue.';
}
};
self.cancel = function(url) {
var i;
if (_activeDownloads[url]) {
_endDownload(_activeDownloads[url], url)
}
i = self.completed.length;
while (i--) {
if (self.completed[i].src === url) {
self.completed[i].splice(i, 1)
}
}
};
self.getCacheSize = function() {
return _downloaded.size()
};
self.currentlyDownloading = function() {
return _activeDownloadsCount != 0
};
self.update = function() {
self.completed = [];
_queue.sort(function(l, r) {
return r.priority - l.priority
});
for (var i=0; i < _queue.length; i++) {
var downloadRequest=_queue[i];
var url=downloadRequest.url;
var downloadState=self.getState(url);
switch (downloadState) {
case TileDownloadState.none:
case TileDownloadState.timedout:
case TileDownloadState.cacheExpired:
if (_activeDownloadsCount < _maxConcurrentTileDownloads) {
if (!_activeDownloads[url]) {
_activeDownloadsCount++;
var img=document.createElement('img');
_activeDownloads[url] = img;
img[_downloadRequestKey] = downloadRequest;
if (tileCacheId && PlatformJS && PlatformJS.Utilities) {
(function(img) {
var onDownloadFailedBinding=_onDownloadFailed.bind(img);
PlatformJS.Utilities.fetchImage(tileCacheId, url, null).then(function jspanoviewer_fetchImageComplete(url) {
if (url) {
img.src = url;
img.onload = _onDownloadComplete;
img.onerror = _onDownloadFailed;
img.onabort = _onDownloadFailed
}
else {
onDownloadFailedBinding()
}
}, onDownloadFailedBinding)
})(img)
}
else {
img.src = url;
img.onload = _onDownloadComplete;
img.onerror = _onDownloadFailed;
img.onabort = _onDownloadFailed
}
img[_timeoutIdKey] = window.setTimeout((function() {
var closureImg=img;
return function() {
_onDownloadTimeout.call(closureImg)
}
})(), _downloadTimeout);
var useCORS=false;
if (self.useCORS) {
useCORS = !Utils.isDataUrl(url) && !Utils.isRelativeUrl(url) && !Utils.areSameDomain(url, window.location.toString())
}
if (useCORS) {
img.crossOrigin = ''
}
}
}
break;
case TileDownloadState.downloading:
break;
default:
break
}
}
};
function _onDownloadComplete() {
if (!this[_processedKey]) {
var url=this[_downloadRequestKey].url;
_endDownload(this, url);
_allDownloadedUrls.insert(url, true);
self.completed.push(this);
this[_tokenKey] = this[_downloadRequestKey].token;
_downloaded.insert(url, this);
_succeedCount++;
tileDownloadSucceededCallback(_failCount, _succeedCount)
}
}
function _onDownloadFailed() {
if (!this[_processedKey]) {
var url=this[_downloadRequestKey].url;
_endDownload(this, url);
if (quirks.useImageDisposer) {
this.src = _spacerImageUrl
}
_failed.insert(url, TileDownloadState.failed);
_failCount++;
tileDownloadFailedCallback(_failCount, _succeedCount)
}
}
function _onDownloadTimeout() {
if (!this[_processedKey]) {
var url=this[_downloadRequestKey].url;
_endDownload(this, url);
if (quirks.useImageDisposer) {
this.src = _spacerImageUrl
}
_failed.insert(url, TileDownloadState.timedout);
_failCount++;
tileDownloadFailedCallback(_failCount, _succeedCount)
}
}
function _endDownload(img, url) {
img[_processedKey] = true;
img.onload = null;
img.onerror = null;
img.onabort = null;
window.clearTimeout(img[_timeoutIdKey]);
var downloadRequest=img[_downloadRequestKey];
var i=_queue.length;
while (i--) {
if (_queue[i] === downloadRequest) {
_queue.splice(i, 1)
}
}
_activeDownloadsCount--;
delete _activeDownloads[url];
i = self.completed.length
}
};
var TileDownloadState={
none: 0, downloading: 1, ready: 2, failed: 3, timedout: 4, cacheExpired: 5
};
"use strict";
var PolygonTileFloodFiller={
floodFill: function floodFill(gridWidth, gridHeight, polygon, startingTile) {
this.cachedCrossings = {};
if (startingTile == null) {
if (polygon.length == 0) {
return []
}
startingTile = this.calculateStartingTile(gridWidth, gridHeight, polygon)
}
var tileQueue=[startingTile];
var tilesEnqueued=new Array(gridWidth * gridHeight);
tilesEnqueued[startingTile.y * gridWidth + startingTile.x] = true;
var result=[];
while (tileQueue.length > 0) {
var tile=tileQueue.shift();
result.push(tile);
var neighbors=[];
if (this.tileCenterInPolygon(tile, polygon) || this.gridCrossesPolygon(tile, polygon)) {
neighbors.push(this.getLeftNeighbor(tile));
neighbors.push(this.getRightNeighbor(tile));
neighbors.push(this.getTopNeighbor(tile));
neighbors.push(this.getBottomNeighbor(tile))
}
for (var i=0; i < neighbors.length; i++) {
var neighbor=neighbors[i];
if (this.isValidTile(neighbor, gridWidth, gridHeight) && !tilesEnqueued[neighbor.y * gridWidth + neighbor.x]) {
tileQueue.push(neighbor);
tilesEnqueued[neighbor.y * gridWidth + neighbor.x] = true
}
}
}
this.cachedCrossings = null;
return result
}, calculateStartingTile: function calculateStartingTile(gridWidth, gridHeight, polygon) {
var center={
x: 0, y: 0
};
for (var i=0; i < polygon.length; i++) {
center.x += polygon[i].x;
center.y += polygon[i].y
}
var invLength=1.0 / polygon.length;
center.x *= invLength;
center.y *= invLength;
center.x = Math.floor(center.x);
center.y = Math.floor(center.y);
center.x = Math.max(0, center.x);
center.y = Math.max(0, center.y);
center.x = Math.min(gridWidth - 1, center.x);
center.y = Math.min(gridHeight - 1, center.y);
return center
}, getLeftNeighbor: function getLeftNeighbor(tile) {
return {
x: tile.x - 1, y: tile.y
}
}, getRightNeighbor: function getRightNeighbor(tile) {
return {
x: tile.x + 1, y: tile.y
}
}, getTopNeighbor: function getTopNeighbor(tile) {
return {
x: tile.x, y: tile.y - 1
}
}, getBottomNeighbor: function getBottomNeighbor(tile) {
return {
x: tile.x, y: tile.y + 1
}
}, tileCenterInPolygon: function tileCenterInPolygon(tile, polygon) {
return this.pointInPolygon({
x: tile.x + 0.5, y: tile.y + 0.5
}, polygon)
}, isValidTile: function isValidTile(tile, gridWidth, gridHeight) {
if (isNaN(tile.x) || isNaN(tile.y) || tile.x < 0 || tile.y < 0 || tile.x >= gridWidth || tile.y >= gridHeight) {
return false
}
return true
}, normalizeNumber: function normalizeNumber(number) {
if (number >= 0) {
return 1
}
return -1
}, gridCrossesPolygon: function gridCrossesPolygon(gridUpperLeftPoint, polygon) {
var gridUpperRightPoint={
x: gridUpperLeftPoint.x + 1, y: gridUpperLeftPoint.y
};
var gridLowerRightPoint={
x: gridUpperLeftPoint.x + 1, y: gridUpperLeftPoint.y + 1
};
var gridLowerLeftPoint={
x: gridUpperLeftPoint.x, y: gridUpperLeftPoint.y + 1
};
if (this.countCrossings(gridUpperLeftPoint, polygon) !== this.countCrossings(gridUpperRightPoint, polygon)) {
return true
}
else if (this.countCrossings(gridLowerLeftPoint, polygon) !== this.countCrossings(gridLowerRightPoint, polygon)) {
return true
}
else if (this.countCrossings(gridUpperLeftPoint, polygon, true) !== this.countCrossings(gridLowerLeftPoint, polygon, true)) {
return true
}
else if (this.countCrossings(gridUpperRightPoint, polygon, true) !== this.countCrossings(gridLowerRightPoint, polygon, true)) {
return true
}
else {
return false
}
}, pointInPolygon: function pointInPolygon(point, polygon) {
var crossCount=this.countCrossings(point, polygon);
return (crossCount % 2 === 1)
}, cachedCrossings: {}, countCrossings: function countCrossings(point, polygon, castRayDown) {
var adjustedPolygon=[];
var i,
j;
var crossCount=0;
var hash=point.x + ',' + point.y + ((castRayDown) ? ',down' : ',right');
if (this.cachedCrossings[hash] != null) {
return this.cachedCrossings[hash]
}
if (castRayDown) {
for (i = 0; i < polygon.length; i++) {
adjustedPolygon.push({
x: polygon[i].y - point.y, y: polygon[i].x - point.x
})
}
}
else {
for (i = 0; i < polygon.length; i++) {
adjustedPolygon.push({
x: polygon[i].x - point.x, y: polygon[i].y - point.y
})
}
}
for (i = 0; i < adjustedPolygon.length; i++) {
j = i + 1;
if (j >= adjustedPolygon.length) {
j = 0
}
var y0=adjustedPolygon[i].y;
var y1=adjustedPolygon[j].y;
var x0=adjustedPolygon[i].x;
var x1=adjustedPolygon[j].x;
var ySign0=this.normalizeNumber(y0);
var ySign1=this.normalizeNumber(y1);
var xSign0=this.normalizeNumber(x0);
var xSign1=this.normalizeNumber(x1);
if (ySign0 != ySign1) {
if (xSign0 === 1 && xSign1 === 1) {
crossCount++
}
else if (xSign0 !== xSign1) {
var m=(y0 - y1) / (x0 - x1);
var b=y0 - (m * x0);
if (b >= 0) {
crossCount++
}
}
}
}
this.cachedCrossings[hash] = crossCount;
return crossCount
}
};
"use strict";
var CSSMatrix=window.CSSMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix || window.MozCSSMatrix;
function RendererCSS3D(win, width, height) {
RendererCSS3D.__super.call(this, win);
this._width = width;
this._height = height;
if (!RendererCheckCSS3D.isValidBrowser()) {
throw'css3d is not supported';
}
this._rootElement = document.createElement('div');
this._rootElement.width = this._width;
this._rootElement.height = this._height;
this._flatten3D = document.createElement('div');
this._flatten3D.style.width = this._width + 'px';
this._flatten3D.style.height = this._height + 'px';
this._flatten3D.style.position = 'absolute';
this._flatten3D.style.webkitTransformStyle = 'flat';
this._flatten3D.style.msTransformStyle = 'flat';
this._flatten3D.style.mozTransformStyle = 'flat';
this._flatten3D.style.backgroundColor = 'rgba(' + this._clearColor.r * 255.0 + ',' + this._clearColor.g * 255.0 + ',' + this._clearColor.b * 255.0 + ',' + this._clearColor.a + ')';
this._3dViewportDiv = document.createElement('div');
this._3dViewportDiv.width = this._width;
this._3dViewportDiv.height = this._height;
this._3dViewportDiv.style.position = 'absolute';
this._flatten3D.appendChild(this._3dViewportDiv);
this._rootElement.appendChild(this._flatten3D);
if (quirks.supportsPreserve3D && !Config.forceIERenderPath) {
this._3dViewportDiv.style.webkitTransformStyle = 'preserve-3d';
this._3dViewportDiv.style.webkitTransform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
this._3dViewportDiv.style.mozTransformStyle = 'preserve-3d';
this._3dViewportDiv.style.mozTransform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)'
}
win.appendChild(this._rootElement)
}
;
extend(RendererCSS3D, Renderer);
RendererCSS3D.prototype.ignoreEvent = function() {
return false
};
RendererCSS3D.prototype.setStyleProperties = function(element) {
if (quirks.supportsPreserve3D && !Config.forceIERenderPath) {
element.style.webkitTransformStyle = 'preserve-3d';
element.style.mozTransformStyle = 'preserve-3d'
}
element.style.position = 'absolute'
};
RendererCSS3D.prototype.clearStyleProperties = function(element) {
element.style.webkitTransformStyle = '';
element.style.msTransformStyle = '';
element.style.mozTransformStyle = '';
element.style.position = ''
};
RendererCSS3D.prototype.setViewportSize = function(width, height) {
this._width = width;
this._height = height;
this._rootElement.width = this._width;
this._rootElement.height = this._height;
this._flatten3D.style.width = this._width;
this._flatten3D.style.height = this._height;
this._3dViewportDiv.width = this._width;
this._3dViewportDiv.height = this._height
};
var updateCSS=function(e, t) {
e.style.webkitTransform = t;
e.style.msTransform = t;
e.style.mozTransform = t
};
RendererCSS3D.prototype.updateTransforms = function(node, transform) {
var node,
current,
transform,
i,
identity,
q=[];
identity = new CSSMatrix;
identity.m11 = 1.0;
identity.m12 = 0.0;
identity.m13 = 0.0;
identity.m14 = 0.0;
identity.m21 = 0.0;
identity.m22 = 1.0;
identity.m23 = 0.0;
identity.m24 = 0.0;
identity.m31 = 0.0;
identity.m32 = 0.0;
identity.m33 = 1.0;
identity.m34 = 0.0;
identity.m41 = 0.0;
identity.m42 = 0.0;
identity.m43 = 0.0;
identity.m44 = 1.0;
if (!node) {
node = this._rootElement
}
if (!transform) {
transform = identity
}
if (node['$$matrixTransform']) {
transform = transform.multiply(node['$$matrixTransform'])
}
if (node.childNodes.length === 0 || node['$$isLeaf']) {
updateCSS(node, transform)
}
else {
updateCSS(node, identity);
for (i = 0; i < node.childNodes.length; ++i) {
this.updateTransforms(node.childNodes[i], transform)
}
}
};
RendererCSS3D.prototype.render = function() {
var invertYAxisMatrix=Matrix4x4.createScale(1, -1, 1);
var viewportToScreenTransform=GraphicsHelper.createViewportToScreen(this._width, this._height);
var cssScreenSpaceViewProjectionTransform=viewportToScreenTransform.multiply(this._viewProjMatrix.multiply(invertYAxisMatrix));
this.setCSS3DViewProjection(cssScreenSpaceViewProjectionTransform);
var i,
j,
added;
var imageElement,
texture;
for (var id in this._removedRenderables) {
var imgElement,
divElement=document.getElementById(id);
if (divElement) {
imgElement = divElement.firstChild;
if (imgElement) {
this.clearStyleProperties(imgElement);
if (imgElement.parentNode) {
imgElement.parentNode.removeChild(imgElement)
}
}
else {
this._error('Expected imgElement')
}
if (divElement.parentNode) {
divElement.parentNode.removeChild(divElement)
}
}
else {
Utils.log('Cannot find and remove element')
}
}
this._removedRenderables = {};
for (var renderableId in this._renderables) {
if (this._renderables.hasOwnProperty(renderableId)) {
var renderable=this._renderables[renderableId];
added = false;
imageElement = null;
texture = null;
if (renderable._material && renderable._material._texture) {
texture = renderable._material._texture;
if (texture._isReady && texture._isDirty) {
imageElement = renderable._material._texture._image
}
else if (renderable.transformUpdated) {
var img=renderable._material._texture._image;
if (img.parentNode) {
this.setCSS3DTransform(img.parentNode, img, renderable._transform, renderable._order);
renderable.transformUpdated = false
}
}
}
if (imageElement == null) {
continue
}
imageElement._order = renderable._order;
imageElement.style.zIndex = renderable._order;
if (imageElement.parentNode) {
this._error('Expected imageElement with no parent')
}
this.setStyleProperties(imageElement);
var xformNode=document.createElement('div');
xformNode.id = renderableId;
xformNode.style.position = 'absolute';
xformNode.style.zIndex = imageElement.style.zIndex;
if (quirks.supportsPreserve3D && !Config.forceIERenderPath) {
xformNode.style.webkitTransformOrigin = '0px 0px 0';
xformNode.style.webkitTransformStyle = 'preserve-3d';
xformNode.style.mozTransformOrigin = '0px 0px 0';
xformNode.style.mozTransformStyle = 'preserve-3d'
}
else {
xformNode['$$isLeaf'] = true
}
xformNode.appendChild(imageElement);
this.setCSS3DTransform(xformNode, imageElement, renderable._transform, renderable._order);
for (j = 0; j < this._3dViewportDiv.childNodes.length; ++j) {
var img=this._3dViewportDiv.childNodes[j].childNodes[0];
if (img == undefined || img == imageElement) {
this._error('object state inconsistency')
}
if (img && imageElement._order && img._order > imageElement._order) {
added = true;
this._3dViewportDiv.insertBefore(xformNode, this._3dViewportDiv.childNodes[j]);
texture._isDirty = false;
break
}
}
if (!added) {
this._3dViewportDiv.appendChild(xformNode);
texture._isDirty = false
}
}
}
if (!quirks.supportsPreserve3D || Config.forceIERenderPath) {
this.updateTransforms()
}
var callbackRemaining=false;
if (this._frameCallbacks) {
for (var i=0; i < this._frameCallbacks.length; i++) {
if (this._frameCallbacks[i].count > 0) {
callbackRemaining = true
}
else if (this._frameCallbacks[i].count == 0) {
this._frameCallbacks[i].cb()
}
this._frameCallbacks[i].count--
}
if (!callbackRemaining) {
this._frameCallbacks = []
}
}
};
function createKeyFrames(name, keyframeprefix) {
var keyframes='@' + keyframeprefix + 'keyframes ' + name + ' { ' + 'from {' + printObj(startProps) + ' } ';
'to {' + printObj(endProps) + ' } ' + '}';
if (document.styleSheets && document.styleSheets.length) {
document.styleSheets[0].insertRule(keyframes, 0)
}
else {
this._error('Page must have style sheet')
}
}
;
RendererCSS3D.prototype.transitionEndCallback = function(event) {
if (this.completeCallback) {
this.completeCallback(this.material, this.callbackInfo)
}
this.material._animation = {_ended: true};
delete this.material;
delete this.completeCallback;
delete this.callbackInfo;
this.removeEventListener('webkitTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false);
this.removeEventListener('mozTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false);
this.removeEventListener('MSTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false)
};
RendererCSS3D.prototype.animate = function(renderable, startProperties, endProperties, duration, easing, completeCallback, completeCallbackInfo) {
function FrameCallback(cb, count) {
this.cb = cb;
this.count = count
}
if (renderable && renderable._material && renderable._material._texture && renderable._material._texture._image) {
var material=renderable._material;
var cssStartProps={},
cssEndProps={};
for (var j=0; j < 2; j++) {
var fromProps=j == 0 ? startProperties : endProperties;
var toProps=j == 0 ? cssStartProps : cssEndProps;
var transformStr='';
for (var prop in fromProps) {
if (fromProps.hasOwnProperty(prop)) {
switch (prop) {
case'opacity':
toProps['opacity'] = fromProps['opacity'];
break;
case'x':
transformStr += 'translateX(-' + fromProps['x'] + 'px) ';
break;
case'y':
transformStr += 'translateY(' + fromProps['y'] + 'px) ';
break;
case'sx':
transformStr += 'scaleX(' + fromProps['sx'] + ') ';
break;
case'sy':
transformStr += 'scaleY(' + fromProps['sy'] + ') ';
break;
case'rotate':
transformStr += 'rotate(-' + fromProps['rotate'] + 'deg) ';
break
}
}
}
if (transformStr != '') {
toProps['-webkit-transform'] = transformStr;
toProps['-ms-transform'] = transformStr;
toProps['-moz-transform'] = transformStr
}
}
if (startProperties) {
Utils.css(material._texture._image, {
'-webkit-transition-duration': duration + 'ms', '-webkit-transition-timing-function': easing, '-ms-transition-duration': duration + 'ms', '-ms-transition-timing-function': easing, '-moz-transition-duration': duration + 'ms', '-moz-transition-timing-function': easing
});
Utils.css(material._texture._image, cssStartProps)
}
material._texture._image.material = material;
material._texture._image.callbackInfo = completeCallbackInfo;
material._texture._image.completeCallback = completeCallback;
material._texture._image.addEventListener('webkitTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false);
material._texture._image.addEventListener('MSTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false);
material._texture._image.addEventListener('mozTransitionEnd', RendererCSS3D.prototype.transitionEndCallback, false);
var renderer=this;
var startTransition=function() {
Utils.css(material._texture._image, cssEndProps)
};
if (this._frameCallbacks == undefined) {
this._frameCallbacks = []
}
this._frameCallbacks.push(new FrameCallback(startTransition, 1));
material._animation = {_ended: false}
}
};
RendererCSS3D.prototype.setCSS3DTransform = function(elem, image, transform, order) {
var invertY=Matrix4x4.createScale(1, -1, 1);
var height=Math.max(image.height || 0, image.naturalHeight || 0);
var t=Matrix4x4.createTranslation(0, -height, 0);
var preTransform=invertY.multiply(t);
var postTransform=invertY;
var invertY=Matrix4x4.createScale(1, -1, 1);
var t=Matrix4x4.createTranslation(0, -height, 0);
var m=invertY.multiply(transform.multiply(invertY.multiply(t)));
m = postTransform.multiply(transform.multiply(preTransform));
m = m.transpose();
var mCss=new CSSMatrix;
mCss.m11 = m.m11;
mCss.m12 = m.m12;
mCss.m13 = m.m13;
mCss.m14 = m.m14;
mCss.m21 = m.m21;
mCss.m22 = m.m22;
mCss.m23 = m.m23;
mCss.m24 = m.m24;
mCss.m31 = m.m31;
mCss.m32 = m.m32;
mCss.m33 = m.m33;
mCss.m34 = m.m34;
mCss.m41 = m.m41;
mCss.m42 = m.m42;
mCss.m43 = m.m43;
mCss.m44 = m.m44;
if (quirks.supportsPreserve3D && !Config.forceIERenderPath) {
elem.style.webkitTransform = mCss;
elem.style.mozTransform = mCss;
elem.style.msTransform = mCss
}
else {
elem['$$matrixTransform'] = mCss
}
};
RendererCSS3D.prototype.setCSS3DViewProjection = function(viewProjection) {
var m=viewProjection.transpose();
var mCss=new CSSMatrix;
mCss.m11 = m.m11;
mCss.m12 = m.m12;
mCss.m13 = m.m13;
mCss.m14 = m.m14;
mCss.m21 = m.m21;
mCss.m22 = m.m22;
mCss.m23 = m.m23;
mCss.m24 = m.m24;
mCss.m31 = m.m31;
mCss.m32 = m.m32;
mCss.m33 = m.m33;
mCss.m34 = m.m34;
mCss.m41 = m.m41;
mCss.m42 = m.m42;
mCss.m43 = m.m43;
mCss.m44 = m.m44;
if (quirks.supportsPreserve3D && !Config.forceIERenderPath) {
this._3dViewportDiv.style.webkitTransform = mCss;
this._3dViewportDiv.style.mozTransform = mCss;
this._3dViewportDiv.style.msTransform = mCss
}
else {
this._3dViewportDiv['$$matrixTransform'] = mCss
}
};
RendererCSS3D.prototype.setCSS3DOpacity = function(elem, opacity, duration) {
elem.style.webkitTransition = 'opacity ' + duration + 's linear';
elem.style.mozTransition = 'opacity ' + duration + 's linear';
elem.style.msTransition = 'opacity ' + duration + 's linear';
elem.style.opacity = opacity
};
RendererCSS3D.prototype.setClearColor = function(color) {
this._checkClearColor(color);
this._clearColor = color;
this._flatten3D.style.backgroundColor = 'rgba(' + this._clearColor.r * 255.0 + ',' + this._clearColor.g * 255.0 + ',' + this._clearColor.b * 255.0 + ',' + this._clearColor.a + ')'
};
"use strict";
function RendererWebGL(win, width, height) {
RendererWebGL.__super.call(this, win);
this._width = width;
this._height = height;
var canvas=document.createElement('canvas');
this._rootElement = canvas;
this._rootElement.width = this._width;
this._rootElement.height = this._height;
this._textureCache = new MemoryCache(300);
this._gl = RendererCheckWebGL.getWebGLContext(this._rootElement);
if (!this._gl) {
throw"WebGL is not supported.";
}
else if (quirks.isWebGLCORSRequired && !quirks.isWebGLCORSSupported) {
throw'CORS image textures are not supported in this browser';
}
function throwOnGLError(err, funcName, args) {
throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" + funcName;
}
;
var gl=this._gl;
gl.viewportWidth = this._width;
gl.viewportHeight = this._height;
gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight);
gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
this._gl.clearDepth(1.0);
gl.disable(gl.DEPTH_TEST);
gl.disable(gl.CULL_FACE);
this._textureFilterTypeMap = [];
this._textureFilterTypeMap[Texture.Filter.NEAREST] = gl.NEAREST;
this._textureFilterTypeMap[Texture.Filter.LINEAR] = gl.LINEAR;
this._textureFilterTypeMap[Texture.Filter.LINEAR_MIPMAP_LINEAR] = gl.LINEAR_MIPMAP_LINEAR;
this._textureWrapTypeMap = [];
this._textureWrapTypeMap[Texture.Wrap.CLAMP_TO_EDGE] = gl.CLAMP_TO_EDGE;
this._textureWrapTypeMap[Texture.Wrap.REPEAT] = gl.REPEAT;
this.init();
win.appendChild(this._rootElement)
}
extend(RendererWebGL, Renderer);
function createShader(gl, shaderType, shaderText) {
var shader;
shader = gl.createShader(shaderType);
gl.shaderSource(shader, shaderText);
gl.compileShader(shader);
if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
error = gl.getShaderInfoLog(shader);
Utils.log("Shader compiling error: " + error);
gl.deleteShader(shader);
return null
}
return shader
}
RendererWebGL.prototype.init = function() {
var vsText='\
				 uniform mat4 u_modelViewProjMat; \
				 uniform mat4 u_localMat; \
				 uniform float u_t, u_duration; \
				 /* the following can be optimized into one vec4 */ \
				 uniform vec2 u_opacityBE, u_xBE, u_yBE, u_rotateBE; \
				 uniform vec2 u_sxBE, u_syBE; \
				 uniform float u_texW, u_texH; \
				 attribute vec4 a_pos; \
				 attribute vec4 a_texCoord; \
				 varying vec2 v_texCoord; \
				 varying float v_opacity; \
				 mat4 ident = mat4( \
					1,0,0,0, \
					0,1,0,0, \
					0,0,1,0, \
					0,0,0,1 \
				 ); \
				 void main() \
				 { \
				 	float opacity, x, y, rotate; \
					mat4 finalMat; \
					float a; \
					if (u_t >= 0.0 && u_t <= 1.0/*u_duration*/) { \
						a = u_t;/* /u_duration;*/ \
						opacity = mix(u_opacityBE[0], u_opacityBE[1], a); \
						float x = mix(u_xBE[0], u_xBE[1], a); \
						float y = mix(u_yBE[0], u_yBE[1], a); \
						float sx = mix(u_sxBE[0], u_sxBE[1], a); \
						float sy = mix(u_syBE[0], u_syBE[1], a); \
						float rotate = mix(u_rotateBE[0], u_rotateBE[1], a); \
						mat4 rotM = ident; \
						float radianRot = radians(rotate); \
						float s = sin(radianRot), c = cos(radianRot); \
						rotM[0][0] = c * sx; rotM[0][1] = s * sy; \
						rotM[1][0] = -s * sx; rotM[1][1] = c * sy; \
						mat4 preT = ident; \
						preT[3][0] = -u_texW * 0.5; \
						preT[3][1] = -u_texH * 0.5; \
						mat4 postT = ident; \
						postT[3][0] = -preT[3][0]; \
						postT[3][1] = -preT[3][1]; \
						mat4 transM = ident; \
						transM[3][0] = x; transM[3][1] = y; \
						finalMat = u_modelViewProjMat * transM * postT * rotM * preT; \
					} else { \
						finalMat = u_modelViewProjMat; \
						opacity = u_opacityBE[0]; \
					} \
					vec4 pos = finalMat * a_pos; \
					v_texCoord = a_texCoord.xy; \
					v_opacity = opacity; \
					gl_Position = pos; \
				 }';
var psText='\
precision mediump float; \n\
#define KERNEL_SIZE 9 \n\
uniform sampler2D u_diffuseTex; \n\
uniform vec4 u_colorMult; \n\
uniform vec2 u_kernelOffsets[9]; \n\
uniform float u_kernel[9]; \n\
varying float v_opacity; \n\
varying vec2 v_texCoord; \n\
void main() { \n\
	vec2 texCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y); \n\
	/*vec4 color = texture2D(u_diffuseTex, texCoord); */\n\
	vec4 color = vec4(0); \n\
	for(int i=0; i<9; i++ ) { \n\
		vec4 tmp = texture2D(u_diffuseTex, texCoord.st + u_kernelOffsets[i]); \n\
		color += tmp * u_kernel[i]; \n\
	} \n\
	gl_FragColor = color * vec4(1,1,1,v_opacity); \n\
}';
var gl=this._gl;
this._vs = createShader(gl, gl.VERTEX_SHADER, vsText);
this._ps = createShader(gl, gl.FRAGMENT_SHADER, psText);
if (this._vs == null || this._ps == null)
throw"Failure initializing webgl: shader";
this._shaderProgram = gl.createProgram();
gl.attachShader(this._shaderProgram, this._vs);
gl.attachShader(this._shaderProgram, this._ps);
gl.linkProgram(this._shaderProgram);
if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
gl.deleteProgram(this._shaderProgram);
gl.deleteShader(this._vs);
gl.deleteShader(this._ps);
return null
}
var numAttribs=gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
this._attribs = new Array(numAttribs);
this._attribLocations = {};
for (var i=0; i < numAttribs; i++) {
var activeattrib=gl.getActiveAttrib(this._shaderProgram, i);
this._attribs[i] = activeattrib;
this._attribLocations[activeattrib.name] = gl.getAttribLocation(this._shaderProgram, activeattrib.name)
}
var numUniforms=gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
this._uniforms = new Array(numUniforms);
this._uniformLocations = {};
for (var j=0; j < numUniforms; j++) {
var activeuniform=gl.getActiveUniform(this._shaderProgram, j);
this._uniforms[j] = activeuniform;
this._uniformLocations[activeuniform.name] = gl.getUniformLocation(this._shaderProgram, activeuniform.name)
}
};
RendererWebGL.prototype.isPowerOfTwo = function(x) {
return (x & (x - 1)) == 0
};
RendererWebGL.prototype.nextHighestPowerOfTwo = function(x) {
--x;
for (var i=1; i < 32; i <<= 1) {
x = x | x >> i
}
return x + 1
};
RendererWebGL.prototype.setViewportSize = function(width, height) {
this._width = width;
this._height = height;
this._rootElement.width = this._width;
this._rootElement.height = this._height;
this._gl.viewportWidth = this._width;
this._gl.viewportHeight = this._height;
this._gl.viewport(0, 0, this._gl.viewportWidth, this._gl.viewportHeight)
};
var prevOrderedRenderables;
RendererWebGL.prototype.render = function() {
var imageElement,
material,
texture;
var gl=this._gl;
var glIdentityMat=Matrix4x4.createIdentity().flattenColumnMajor();
var self=this;
for (var id in this._removedRenderables) {
var r=this._removedRenderables[id];
if (r._geometry.__gl_posBuffer)
gl.deleteBuffer(r._geometry.__gl_posBuffer);
if (r._geometry.__gl_indexBuffer)
gl.deleteBuffer(r._geometry.__gl_indexBuffer);
if (r._material._texture.__gl_texture)
gl.deleteTexture(r._material._texture.__gl_texture);
if (r._geometry.__gl_texCoordBuffer)
gl.deleteBuffer(r._geometry.__gl_texCoordBuffer)
}
this._removedRenderables = {};
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.useProgram(this._shaderProgram);
var _kernel=[0, 0, 0, 0, 1, 0, 0, 0, 0];
var kernel=new Float32Array(_kernel);
var orderedRenderables=[];
for (var renderableId in this._renderables) {
orderedRenderables.push(this._renderables[renderableId])
}
orderedRenderables.sort(function(a, b) {
if (a._order && b._order)
return a._order - b._order;
else if (!a._order && !b._order)
return 0;
else if (!a._order)
return -1;
else
return 1
});
if (prevOrderedRenderables) {
if (prevOrderedRenderables.length != orderedRenderables.length) {
for (var i=0; i < prevOrderedRenderables.length; i++) {
var j;
for (j = 0; j < orderedRenderables.length; j++) {
if (prevOrderedRenderables[i].entityId == orderedRenderables[j].entityId)
break
}
}
for (var i=0; i < orderedRenderables.length; i++) {
var j;
for (j = 0; j < prevOrderedRenderables.length; j++) {
if (orderedRenderables[i].entityId == prevOrderedRenderables[j].entityId)
break
}
}
}
else
for (var i=0; i < orderedRenderables.length; i++) {}
}
prevOrderedRenderables = orderedRenderables;
for (var pass=0; pass < 2; pass++) {
if (pass == 1) {
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
}
else
gl.disable(gl.BLEND);
for (var i=0; i < orderedRenderables.length; i++) {
var renderable=orderedRenderables[i];
imageElement = null;
texture = null;
if (renderable._material && renderable._material._texture && renderable._material._texture) {
material = renderable._material;
texture = renderable._material._texture;
if (texture._isReady)
imageElement = renderable._material._texture._image
}
if (imageElement == null || renderable._geometry == null)
continue;
var isOpaque=true;
if (material._animation && !material._animation._ended) {
var opq=material._animation.opacity;
if ((opq.begin != 1 || opq.end != 1))
isOpaque = false
}
else if (material._animatableStates) {
if (material._animatableStates.opacity < 1)
isOpaque = false
}
if (pass == 0 && !isOpaque)
continue;
if (pass == 1 && isOpaque)
continue;
if (renderable._geometry._isDirty) {
if (renderable._geometry.__gl_posBuffer)
gl.deleteBuffer(renderable._geometry.__gl_posBuffer);
renderable._geometry.__gl_posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, renderable._geometry.__gl_posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(renderable._geometry._vertices), gl.STATIC_DRAW);
if (renderable._geometry.__gl_texCoordBuffer)
gl.deleteBuffer(renderable._geometry.__gl_texCoordBuffer);
renderable._geometry.__gl_texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, renderable._geometry.__gl_texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(renderable._geometry._texCoords), gl.STATIC_DRAW);
if (renderable._geometry._indices) {
if (renderable._geometry.__gl_indexBuffer)
gl.deleteBuffer(renderable._geometry.__gl_indexBuffer);
renderable._geometry.__gl_indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderable._geometry.__gl_indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(renderable._geometry._indices), gl.STATIC_DRAW)
}
renderable._geometry._isDirty = false
}
if (renderable._material._texture._isDirty) {
if (renderable._material._texture.__gl_texture)
gl.deleteTexture(renderable._material._texture.__gl_texture);
renderable._material._texture.__gl_texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, renderable._material._texture.__gl_texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._textureFilterTypeMap[renderable._material._texture._magFilter]);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._textureFilterTypeMap[renderable._material._texture._minFilter]);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._textureWrapTypeMap[renderable._material._texture._wrapS]);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._textureWrapTypeMap[renderable._material._texture._wrapT]);
try {
if (!this.isPowerOfTwo(imageElement.width) || !this.isPowerOfTwo(imageElement.height)) {
var canvas=this._textureCache.get(renderable.entityId);
if (canvas == null) {
canvas = document.createElement("canvas");
canvas.width = this.nextHighestPowerOfTwo(imageElement.width);
canvas.height = this.nextHighestPowerOfTwo(imageElement.height);
var ctx=canvas.getContext("2d");
ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height, 0, 0, canvas.width, canvas.height);
this._textureCache.insert(renderable.entityId, canvas)
}
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
}
else {
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageElement)
}
}
catch(e) {
continue
}
gl.generateMipmap(gl.TEXTURE_2D);
renderable._material._texture._isDirty = false
}
var finalMat=this._viewProjMatrix.multiply(renderable._transform);
var glFinalMat=new Float32Array(finalMat.flattenColumnMajor());
gl.uniformMatrix4fv(this._uniformLocations["u_modelViewProjMat"], false, glFinalMat);
var stepW=1.0 / imageElement.width;
var stepH=1.0 / imageElement.height;
var _offsets=[-stepW, -stepH, 0.0, -stepH, stepW, -stepH, -stepW, 0.0, 0.0, 0.0, stepW, 0.0, -stepW, stepH, 0.0, stepH, stepW, stepH];
var offsets=new Float32Array(_offsets);
gl.uniform2fv(this._uniformLocations["u_kernelOffsets[0]"], offsets);
gl.uniform1fv(this._uniformLocations["u_kernel[0]"], kernel);
if (material._animation && !material._animation._ended) {
var anim=material._animation;
gl.uniform2f(this._uniformLocations["u_opacityBE"], anim["opacity"].begin, anim["opacity"].end);
gl.uniform2f(this._uniformLocations["u_xBE"], anim["x"].begin, anim["x"].end);
gl.uniform2f(this._uniformLocations["u_yBE"], anim["y"].begin, anim["y"].end);
gl.uniform2f(this._uniformLocations["u_sxBE"], anim["sx"].begin, anim["sx"].end);
gl.uniform2f(this._uniformLocations["u_syBE"], anim["sy"].begin, anim["sy"].end);
gl.uniform2f(this._uniformLocations["u_rotateBE"], anim["rotate"].begin, anim["rotate"].end);
gl.uniform1f(this._uniformLocations["u_texW"], imageElement.width);
gl.uniform1f(this._uniformLocations["u_texH"], imageElement.height);
var d=new Date;
if (anim._startT == -1)
anim._startT = d.getTime();
var t=d.getTime() - anim._startT;
if (t >= anim._duration) {
t = anim._duration;
material._animatableStates = anim.getEndStates();
if (anim._endCallback) {
anim._endCallback(material, anim._endCallbackInfo)
}
material._animation._ended = true
}
var t_ease=t / anim._duration;
gl.uniform1f(this._uniformLocations["u_t"], t_ease)
}
else if (material._animatableStates) {
var as=material._animatableStates;
gl.uniform2f(this._uniformLocations["u_opacityBE"], as["opacity"], as["opacity"]);
gl.uniform2f(this._uniformLocations["u_xBE"], as["x"], as["x"]);
gl.uniform2f(this._uniformLocations["u_yBE"], as["y"], as["y"]);
gl.uniform2f(this._uniformLocations["u_sxBE"], as["sx"], as["sx"]);
gl.uniform2f(this._uniformLocations["u_syBE"], as["sy"], as["sy"]);
gl.uniform2f(this._uniformLocations["u_rotateBE"], as["rotate"], as["rotate"]);
gl.uniform1f(this._uniformLocations["u_texW"], imageElement.width);
gl.uniform1f(this._uniformLocations["u_texH"], imageElement.height);
gl.uniform1f(this._uniformLocations["u_t"], 1)
}
else {
var as=material._animatableStates || {opacity: 1.0};
var o=as["opacity"];
gl.uniform2f(this._uniformLocations["u_opacityBE"], o, o);
gl.uniform1f(this._uniformLocations["u_t"], -1)
}
gl.enableVertexAttribArray(this._attribLocations["a_pos"]);
gl.enableVertexAttribArray(this._attribLocations["a_texCoord"]);
gl.bindBuffer(gl.ARRAY_BUFFER, renderable._geometry.__gl_posBuffer);
gl.vertexAttribPointer(this._attribLocations["a_pos"], 3, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, renderable._geometry.__gl_texCoordBuffer);
gl.vertexAttribPointer(this._attribLocations["a_texCoord"], renderable._geometry._texCoordSize, gl.FLOAT, false, 0, 0);
if (renderable._geometry._indices)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderable._geometry.__gl_indexBuffer);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, renderable._material._texture.__gl_texture);
gl.uniform1i(this._uniformLocations["u_diffuseTex"], 0);
gl.drawElements(gl.TRIANGLES, renderable._geometry._indices.length, gl.UNSIGNED_SHORT, 0)
}
}
};
var reqAnimStep=(function() {
return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
window.setTimeout(callback, 1000 / 60)
}
})();
function requestAnimation(duration, callback, element) {
var startTime;
if (window.mozAnimationStartTime) {
startTime = window.mozAnimationStartTime
}
else if (window.webkitAnimationStartTime) {
startTime = window.webkitAnimationStartTime
}
else {
startTime = (new Date).getTime()
}
var lastTimestamp=startTime;
function timerProc(timestamp) {
if (!timestamp) {
timestamp = (new Date).getTime()
}
if (callback({
startTime: startTime, curTime: timestamp, duration: duration
}) !== false) {
window.setTimeout(timerProc, 1000 / 60)
}
}
;
timerProc(startTime)
}
;
RendererWebGL.prototype.animate1 = function(material, startProperties, endProperties, duration, easing) {
function step(params) {
x = (params.curTime - params.startTime) / params.duration;
x = x > 1 ? 1 : (x < 0 ? 0 : x);
material._opacity = startProperties.opacity * (1 - x) + endProperties.opacity * x;
if (x >= 1)
return false;
else
return true
}
if (material && material._texture && material._texture._image) {
material._opacity = startProperties.opacity;
requestAnimation(duration, step, material._texture._image)
}
};
RendererWebGL.prototype.animate = function(renderable, startProperties, endProperties, duration, easing, endCallback, endCallbackInfo) {
if (renderable && renderable._material && renderable._material._texture && renderable._material._texture._image) {
var material=renderable._material;
var anim=material._animation = new Animation;
if (material._animatableStates)
anim.initStates(material._animatableStates);
else
material._animatableStates = anim.getEndStates();
for (var prop in startProperties) {
if (startProperties.hasOwnProperty(prop)) {
if (prop in anim) {
anim[prop].begin = startProperties[prop]
}
}
}
for (var prop in endProperties) {
if (endProperties.hasOwnProperty(prop)) {
if (prop in anim) {
anim[prop].end = endProperties[prop]
}
}
}
var d=new Date;
if (material._texture._isReady)
anim._startT = d.getTime();
else
anim._startT = -1;
anim._duration = duration;
anim._easingMode = easing;
if (endCallback)
anim._endCallback = endCallback;
if (endCallbackInfo)
anim._endCallbackInfo = endCallbackInfo
}
};
RendererWebGL.prototype.CSSMatrixToMatrix4x4 = function(cssMat, image) {
var m=new Matrix4x4(cssMat.m11, cssMat.m12, cssMat.m13, cssMat.m14, cssMat.m21, cssMat.m22, cssMat.m23, cssMat.m24, cssMat.m31, cssMat.m32, cssMat.m33, cssMat.m34, cssMat.m41, cssMat.m42, cssMat.m43, cssMat.m44);
var invertY_inv=Matrix4x4.createScale(1, -1, 1);
var t_inv=Matrix4x4.createTranslation(0, image.height, 0);
var preTransform_inv=t_inv.multiply(invertY_inv);
var postTransform_inv=invertY_inv;
var m4x4=postTransform_inv.multiply(m.transpose()).multiply(preTransform_inv);
return m4x4
};
RendererWebGL.prototype.setClearColor = function(color) {
this._checkClearColor(color);
this._clearColor = color;
this._gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a)
};
"use strict";
function Viewport(width, height, nearDistance, farDistance) {
this._width = width;
this._height = height;
this._aspectRatio = this._width / this._height;
this._nearDistance = nearDistance;
this._farDistance = farDistance
}
Viewport.convertHorizontalToVerticalFieldOfView = function(aspectRatio, fov) {
var focalLength=0.5 / Math.tan(fov * 0.5);
return 2 * Math.atan((0.5 * 1.0 / aspectRatio) / focalLength)
};
Viewport.convertVerticalToHorizontalFieldOfView = function(aspectRatio, fov) {
var focalLength=(0.5 * 1.0 / aspectRatio) / Math.tan(fov * 0.5);
return 2 * Math.atan(0.5 / focalLength)
};
Viewport.prototype = {
getWidth: function getWidth() {
return this._width
}, getHeight: function getHeight() {
return this._height
}, getAspectRatio: function getAspectRatio() {
return this._aspectRatio
}, getNearDistance: function getNearDistance() {
return this._nearDistance
}, getFarDistance: function getFarDistance() {
return this._farDistance
}
};
"use strict";
function PerspectiveCameraPose(viewport, digitalPan, position, up, look, fieldOfView) {
this.width = (viewport) ? viewport.getWidth() : 0;
this.height = (viewport) ? viewport.getHeight() : 0;
this.up = Vector3.clone(up);
this.look = Vector3.clone(look);
this.fieldOfView = fieldOfView;
var fuzzyEquals=function(v1, v2, tolerance) {
var dotProduct=v1.dot(v2);
if (dotProduct > 1.0) {
dotProduct = 1.0
}
else if (dotProduct < -1.0) {
dotProduct = -1.0
}
var difference=Math.acos(dotProduct);
return difference < tolerance
};
this.isFuzzyEqualTo = function(pose, toleranceInPixels) {
if (this.width !== pose.width || this.height !== pose.height) {
return false
}
var tolerance=toleranceInPixels * this.fieldOfView / this.height;
if (Math.abs(this.fieldOfView - pose.fieldOfView) > tolerance) {
return false
}
if (!fuzzyEquals(this.up, pose.up, tolerance)) {
return false
}
if (!fuzzyEquals(this.look, pose.look, tolerance)) {
return false
}
return true
}
}
function PerspectiveCamera() {
this._viewport = null;
this._digitalPan = new Vector2(0, 0);
this._position = new Vector3(0, 0, 0);
this._up = new Vector3(0, 1, 0);
this._look = new Vector3(0, 0, -1);
this._fieldOfView = Math.PI * 0.5;
this._focalLength = -1;
this._viewTransform = Matrix4x4.createIdentity();
this._projectionTransform = Matrix4x4.createIdentity();
this._isDirty = true
}
PerspectiveCamera.prototype = {
getPose: function getPose() {
return new PerspectiveCameraPose(this._viewport, this._digitalPan, this._position, this._up, this._look, this._fieldOfView)
}, _setDirty: function _setDirty() {
this._isDirty = true
}, setViewport: function setViewport(viewport) {
this._viewport = viewport;
this._setDirty()
}, getViewport: function getViewport() {
return this._viewport
}, setPosition: function setPosition(position) {
this._position = position;
this._setDirty()
}, getPosition: function getPosition() {
return this._position
}, setVerticalFov: function setVerticalFov(fieldOfView) {
this._fieldOfView = fieldOfView;
this._setDirty()
}, getVerticalFov: function getVerticalFov() {
return this._fieldOfView
}, getFocalLength: function getFocalLength() {
if (this._isDirty) {
this._updateTransforms()
}
return this._focalLength
}, setLook: function setLook(look) {
this._look = look;
this._setDirty()
}, getLook: function getLook() {
return this._look
}, setUp: function setUp(up) {
this._up = up;
this._setDirty()
}, getUp: function getUp() {
return this._up
}, setDigitalPan: function setDigitalPan(pan) {
this._digitalPan = pan;
this._setDirty()
}, getDigitalPan: function getDigitalPan() {
return this._digitalPan
}, getViewTransform: function getViewTransform() {
if (this._isDirty) {
this._updateTransforms()
}
return this._viewTransform
}, getProjectionTransform: function getProjectionTransform() {
if (this._isDirty) {
this._updateTransforms()
}
return this._projectionTransform
}, getViewProjectionTransform: function getViewProjectionTransform() {
if (this._isDirty) {
this._updateTransforms()
}
return this._projectionTransform.multiply(this._viewTransform)
}, projectTo2D: function projectTo2D(point) {
if (this._isDirty) {
this._updateTransforms()
}
var halfWidth=this._viewport.getWidth() * 0.5;
var halfHeight=this._viewport.getHeight() * 0.5;
var projected=this._projectionTransform.multiply(this._viewTransform).transformVector4(Vector4.createFromVector3(point));
var invW=1.0 / projected.w;
projected.x *= invW;
projected.y *= invW;
projected.z = projected.w = 1;
return (new Matrix4x4(halfWidth, 0, halfWidth, 0, 0, -halfHeight, halfHeight, 0, 0, 0, 1, 0, 0, 0, 0, 1)).transformVector4(projected)
}, _updateTransforms: function _updateTransforms() {
var denom=Math.tan(0.5 * this._fieldOfView);
if (denom === 0.0) {
this._focalLength = 1.0
}
else {
this._focalLength = 1.0 / denom
}
this._viewTransform = GraphicsHelper.createLookAtRH(this._position, this._look, this._up);
this._projectionTransform = GraphicsHelper.createPerspectiveOGL(this._fieldOfView, this._viewport.getAspectRatio(), this._viewport.getNearDistance(), this._viewport.getFarDistance(), this._digitalPan);
this._isDirty = false
}
};
"use strict";
function ClassicSpring(springConstant, damperConstant, allowOvershoot) {
this._springConstant = springConstant;
this._damperConstant = damperConstant;
this._allowOvershoot = allowOvershoot;
this._current = 0;
this._target = 0;
this._velocity = 0;
this._t = -1;
this._isSettled = false
}
ClassicSpring.prototype = {
step: function step(elapsedMilliseconds) {
if (this._isSettled) {
return true
}
var delta=0.0,
curTargDiff,
isSettled,
dt,
maxDelta,
epsilon;
if (this._t >= 0) {
dt = elapsedMilliseconds - this._t;
if (dt > 0) {
curTargDiff = this._current - this._target;
this._velocity += -this._springConstant * curTargDiff - this._damperConstant * this._velocity;
delta = this._velocity * dt;
if (!this._allowOvershoot) {
maxDelta = -curTargDiff;
if ((delta > 0.0 && maxDelta > 0.0 && maxDelta < delta) || (delta < 0.0 && maxDelta < 0.0 && maxDelta > delta)) {
delta = maxDelta;
this._velocity = 0.0
}
}
this._current += delta
}
}
curTargDiff = this._current - this._target;
epsilon = 0.0000001;
if ((curTargDiff < epsilon && curTargDiff > -epsilon) && (delta < epsilon && delta > -epsilon)) {
isSettled = true;
this.setCurrentToTarget()
}
else {
isSettled = false;
this._t = elapsedMilliseconds
}
this._isSettled = isSettled;
return isSettled
}, isSettled: function isSettled() {
return this._isSettled
}, setTarget: function setTarget(target) {
if (this.target == target) {
return
}
this._target = target;
this._isSettled = false
}, setCurrent: function setCurrent(current) {
this._current = current;
this._isSettled = false
}, setCurrentAndTarget: function setCurrentAndTarget(target) {
this._target = target;
this.setCurrentToTarget()
}, setCurrentToTarget: function setCurrentToTarget() {
this._current = this._target;
this._velocity = 0.0;
this._isSettled = true;
this._t = -1
}, getTarget: function getTarget() {
return this._target
}, getCurrent: function getCurrent() {
return this._current
}
};
"use strict";
function SimpleSpline(x1, x2, y1, y2, k1, k2) {
var x2MinusX1=x2 - x1;
var y2MinusY1=y2 - y1;
var a=(k1 * x2MinusX1) - y2MinusY1;
var b=y2MinusY1 - (k2 * x2MinusX1);
this.getValue = function(x) {
var t=(x - x1) / x2MinusX1;
var oneMinusT=1 - t;
var result=(oneMinusT * y1) + (t * y2) + (t * oneMinusT * ((a * oneMinusT) + (b * t)));
return result
}
}
function CompositeSpline(xArray, yArray, kArray) {
if (xArray.length !== yArray.length || xArray.length !== kArray.length || xArray.length < 2) {
throw"CompositeSpline constructor requires three arrays of identical length of 2 or greater.";
}
var splines=[];
var i;
for (i = 0; i < xArray.length - 1; i++) {
var iPlusOne=i + 1;
splines.push(new SimpleSpline(xArray[i], xArray[iPlusOne], yArray[i], yArray[iPlusOne], kArray[i], kArray[iPlusOne]))
}
this.getValue = function(x) {
i = 0;
while (i < xArray.length - 2 && x > xArray[i + 1]) {
i++
}
return splines[i].getValue(x)
}
}
"use strict";
var objectCollection={
loop: function loop(obj, propertyName, keyCollectionFunction) {
var k;
for (k in obj[propertyName]) {
if (obj[propertyName].hasOwnProperty(k)) {
keyCollectionFunction(k, obj[propertyName][k])
}
}
}, loopByType: function loopByType(obj, keyCollectionFunction) {
objectCollection.loop(obj, 'byType', keyCollectionFunction)
}
};
var RMLStore=function() {
var self=this;
self.byId = {};
self.byType = {};
self.add = function(itemToAdd) {
if (itemToAdd.id == null) {
throw'expected id property on the item';
}
if (!itemToAdd.type) {
throw'expected type property on the item';
}
self.byId[itemToAdd.id] = itemToAdd;
self.byType[itemToAdd.type] = self.byType[itemToAdd.type] || [];
self.byType[itemToAdd.type].push(itemToAdd)
};
self.remove = function(itemToRemoveId) {
var obj;
if (typeof(item) === 'number') {
obj = self.byId[itemToRemoveId];
self.byType[obj.type].remove(obj);
if (self.byType[obj.type].length === 0) {
delete self.byType[obj.type]
}
delete self.byId[itemToRemoveId]
}
else {
throw'Expected a single ID';
}
};
self.update = function(delta) {
var i;
if (delta.added) {
for (i = 0; i < delta.added.length; ++i) {
self.add(delta.added[i])
}
}
if (delta.removed) {
for (i = 0; i < delta.removed.length; ++i) {
self.remove(delta.removed[i])
}
}
}
};
"use strict";
function BallisticPath(pitch1, heading1, fov1, pitch2, heading2, fov2, maxAllowedFov) {
var middleFov=Math.abs(pitch1 - pitch2) + Math.abs(heading1 - heading2);
var minFov=Math.min(fov1, fov2);
var maxFov=Math.max(fov1, fov2);
var minDuration=0.5;
var pitchSpline,
headingSpline,
fovSpline;
if (middleFov > maxFov) {
middleFov = Math.min(middleFov, maxAllowedFov);
var fovDelta=(middleFov / maxFov) + (middleFov / minFov);
var duration=(minDuration + Math.log(fovDelta)) * 700;
pitchSpline = new SimpleSpline(0, duration, pitch1, pitch2, 0, 0);
headingSpline = new SimpleSpline(0, duration, heading1, heading2, 0, 0);
fovSpline = new CompositeSpline([0, duration / 2, duration], [fov1, middleFov, fov2], [0, 0, 0])
}
else {
var fovDelta=maxFov / minFov;
var duration=(minDuration + Math.log(fovDelta)) * 700;
pitchSpline = new SimpleSpline(0, duration, pitch1, pitch2, 0, 0);
headingSpline = new SimpleSpline(0, duration, heading1, heading2, 0, 0);
fovSpline = new SimpleSpline(0, duration, fov1, fov2, 0, 0)
}
this.getDuration = function() {
return duration
};
this.getCurrentPitch = function(time) {
return pitchSpline.getValue(time)
};
this.getCurrentHeading = function(time) {
return headingSpline.getValue(time)
};
this.getCurrentFov = function(time) {
return fovSpline.getValue(time)
}
}
"use strict";
function RotationalFixedPositionCameraController(camera, upperPitchLimit, lowerPitchLimit, upperHeadingLimit, lowerHeadingLimit, dimension) {
this._camera = camera;
this._upperPitchLimit = (upperPitchLimit == null) ? MathHelper.degreesToRadians(90) : upperPitchLimit;
this._lowerPitchLimit = (lowerPitchLimit == null) ? MathHelper.degreesToRadians(-90) : lowerPitchLimit;
this._upperHeadingLimit = (upperHeadingLimit == null) ? MathHelper.degreesToRadians(360) : MathHelper.normalizeRadian(upperHeadingLimit);
this._lowerHeadingLimit = (lowerHeadingLimit == null) ? MathHelper.degreesToRadians(0) : MathHelper.normalizeRadian(lowerHeadingLimit);
this._pitchSpring = new ClassicSpring(0.01, 0.6, false);
this._headingSpring = new ClassicSpring(0.01, 0.6, false);
this._fieldOfViewSpring = new ClassicSpring(0.0033, 0.6, false);
this._sourcePitch = 0;
this._sourceHeading = 0;
this._targetPitch = 0;
this._targetHeading = 0;
this.panoramaWorldTransform = Matrix4x4.createIdentity();
this.panoramaLocalTransform = Matrix4x4.createIdentity();
this.deviceRotation = Matrix4x4.createIdentity();
this.initInverseDeviceRotation = Matrix4x4.createIdentity();
this._targetUp = new Vector3(0, 1, 0);
var pitchAndHeading=this.getPitchAndHeading();
this._pitchSpring.setCurrentAndTarget(pitchAndHeading[0]);
this._headingSpring.setCurrentAndTarget(pitchAndHeading[1]);
this._fieldOfViewSpring.setCurrentAndTarget(this._camera.getVerticalFov());
this._maxPixelScaleFactor = 2;
this._dimension = dimension;
this._minFieldOfView = MathHelper.degreesToRadians(20);
this._maxFieldOfView = MathHelper.degreesToRadians(80);
this.setViewportSize(this._camera.getViewport().getWidth(), this._camera.getViewport().getHeight());
this._startingPitchandHeading = null;
this._startingPosition = null;
this._isRotating = false;
this._lastMovePoint = null;
this._lastGestureScale = null
}
RotationalFixedPositionCameraController.calculatePitchAndHeading = function(currentLook, worldToLocalTransform) {
var transformedLook=worldToLocalTransform.transformVector3(currentLook);
var pitch=this._pitchSpring.getCurrent();
var heading=MathHelper.normalizeRadian(this._headingSpring.getCurrent());
return [pitch, heading]
};
RotationalFixedPositionCameraController.prototype = {
hasCompleted: function hasCompleted() {
return this._pitchSpring.isSettled() && this._headingSpring.isSettled() && this._fieldOfViewSpring.isSettled() && this._ballisticPath == null
}, calculatePitchAndHeadingDelta: function calculatePitchAndHeadingDelta(dx, dy, viewportWidth, viewportHeight, focalLength) {
var pitch,
heading;
var aspectRatio=viewportWidth / viewportHeight;
if (dx === 0) {
heading = 0
}
else {
heading = 2 * Math.atan((aspectRatio * (dx / viewportWidth)) / focalLength)
}
if (dy === 0) {
pitch = 0
}
else {
pitch = 2 * Math.atan((-dy / viewportHeight) / focalLength)
}
return [pitch, heading]
}, animateToPose: function animateToPose(pitch, heading, fov, callback) {
if (this._ballisticPathCallback) {
this._ballisticPathCallback(false)
}
var sourceHeading=MathHelper.pickStartHeadingToTakeShortestPath(this._headingSpring.getCurrent(), heading);
this._ballisticPath = new BallisticPath(this._pitchSpring.getCurrent(), sourceHeading, this._fieldOfViewSpring.getCurrent(), pitch, heading, fov, this._maxFieldOfView);
this._ballisticStartTime = (new Date).getTime();
this._ballisticDuration = this._ballisticPath.getDuration();
this._ballisticEasingSpline = new SimpleSpline(0, this._ballisticDuration, 0, this._ballisticDuration, 0.5, 0);
this._ballisticPathCallback = callback
}, _cancelBallisticPath: function _cancelBallisticPath(reachedDestination) {
if (this._ballisticPathCallback) {
this._ballisticPathCallback(reachedDestination)
}
this._ballisticPath = null;
this._ballisticStartTime = null;
this._ballisticDuration = null;
this._ballisticEasingSpline = null;
this._ballisticPathCallback = null
}, _constrainHeading: function _constrainHeading(heading) {
var constrainedHeading=MathHelper.normalizeRadian(heading);
if (MathHelper.isZero(this._upperHeadingLimit - this._lowerHeadingLimit)) {
return constrainedHeading
}
var distToLower,
distToUpper;
if (this._lowerHeadingLimit > this._upperHeadingLimit) {
if (constrainedHeading >= this._lowerHeadingLimit || constrainedHeading <= this._upperHeadingLimit) {
return constrainedHeading
}
else {
distToLower = this._lowerHeadingLimit - constrainedHeading;
distToUpper = constrainedHeading - this._upperHeadingLimit
}
}
else {
if (constrainedHeading >= this._lowerHeadingLimit && constrainedHeading <= this._upperHeadingLimit) {
return constrainedHeading
}
else if (constrainedHeading < this._lowerHeadingLimit) {
distToLower = this._lowerHeadingLimit - constrainedHeading;
distToUpper = constrainedHeading + MathHelper.twoPI - this._upperHeadingLimit
}
else {
distToLower = this._lowerHeadingLimit - (constrainedHeading + MathHelper.twoPI);
distToUpper = constrainedHeading - this._upperHeadingLimit
}
}
return (distToLower < distToUpper) ? this._lowerHeadingLimit : this._upperHeadingLimit
}, setPitchAndHeading: function setPitchAndHeading(pitch, heading, animate) {
this._cancelBallisticPath(false);
var constrainedPitch=pitch;
if (constrainedPitch > this._upperPitchLimit) {
constrainedPitch = this._upperPitchLimit - 0.0001
}
if (constrainedPitch < this._lowerPitchLimit) {
constrainedPitch = this._lowerPitchLimit + 0.0001
}
var constrainedHeading=this._constrainHeading(heading);
if (animate) {
this._pitchSpring.setTarget(constrainedPitch);
var currentHeading=this._headingSpring.getCurrent();
currentHeading = MathHelper.pickStartHeadingToTakeShortestPath(currentHeading, constrainedHeading);
this._headingSpring.setCurrent(currentHeading);
this._headingSpring.setTarget(constrainedHeading)
}
else {
this._pitchSpring.setCurrentAndTarget(constrainedPitch);
this._headingSpring.setCurrentAndTarget(constrainedHeading);
this.updateCameraProperties()
}
}, getPitchAndHeading: function getPitchAndHeading() {
var pitchAndHeading=[this._pitchSpring.getCurrent(), this._headingSpring.getCurrent()];
return pitchAndHeading
}, getTargetPitchAndHeading: function getTargetPitchAndHeading() {
return [this._pitchSpring.getTarget(), this._headingSpring.getTarget()]
}, getVerticalFovLimits: function getVerticalFovLimits() {
return {
minimum: this._minFieldOfView, maximum: this._maxFieldOfView
}
}, setVerticalFov: function setVerticalFov(fov, animate) {
this._cancelBallisticPath(false);
var clampedFov=MathHelper.clamp(fov, this._minFieldOfView, this._maxFieldOfView);
if (animate) {
this._fieldOfViewSpring.setTarget(clampedFov)
}
else {
this._fieldOfViewSpring.setCurrentAndTarget(clampedFov)
}
this.updateCameraProperties()
}, getVerticalFov: function getVerticalFov() {
return this._fieldOfViewSpring.getCurrent()
}, getRelativeTarget: function getRelativeTarget(startingPitch, startingHeading, dx, dy, viewportWidth, viewportHeight, deltaMultiplier) {
dx *= deltaMultiplier;
dy *= deltaMultiplier;
var focalLength=this._camera.getFocalLength();
var relativePitch;
var relativeHeading;
var pitchAndHeading=this.calculatePitchAndHeadingDelta(dx, dy, viewportWidth, viewportHeight, focalLength);
relativePitch = pitchAndHeading[0];
relativeHeading = pitchAndHeading[1];
var targetHeading=MathHelper.normalizeRadian(startingHeading - relativeHeading);
var targetPitch=startingPitch - relativePitch;
var worldToLocalTransform=this.deviceRotation.inverse().multiply(this.panoramaLocalTransform.multiply(this.panoramaWorldTransform.inverse()));
var sourcePitchAndHeading=[this._pitchSpring.getCurrent(), this._headingSpring.getCurrent()];
var sourceHeading=sourcePitchAndHeading[1];
sourceHeading = MathHelper.pickStartHeadingToTakeShortestPath(sourceHeading, targetHeading);
return {
fromPitch: sourcePitchAndHeading[0], fromHeading: sourceHeading, toPitch: targetPitch, toHeading: targetHeading
}
}, setRelativeTarget: function setRelativeTarget(startingPitch, startingHeading, dx, dy, viewportWidth, viewportHeight, deltaMultiplier) {
dx *= deltaMultiplier;
dy *= deltaMultiplier;
var focalLength=this._camera.getFocalLength();
var relativePitch;
var relativeHeading;
var pitchAndHeading=this.calculatePitchAndHeadingDelta(dx, dy, viewportWidth, viewportHeight, focalLength);
relativePitch = pitchAndHeading[0];
relativeHeading = pitchAndHeading[1];
this._targetHeading = this._constrainHeading(startingHeading - relativeHeading);
this._targetPitch = startingPitch - relativePitch;
if (this._targetPitch > this._upperPitchLimit) {
this._targetPitch = this._upperPitchLimit - 0.0001
}
if (this._targetPitch < this._lowerPitchLimit) {
this._targetPitch = this._lowerPitchLimit + 0.0001
}
var worldToLocalTransform=this.deviceRotation.inverse().multiply(this.panoramaLocalTransform.multiply(this.panoramaWorldTransform.inverse()));
var sourcePitchAndHeading=[this._pitchSpring.getCurrent(), this._headingSpring.getCurrent()];
this._sourcePitch = sourcePitchAndHeading[0];
this._sourceHeading = sourcePitchAndHeading[1];
this._sourceHeading = MathHelper.pickStartHeadingToTakeShortestPath(this._sourceHeading, this._targetHeading);
this._pitchSpring.setCurrent(this._sourcePitch);
this._pitchSpring.setTarget(this._targetPitch);
this._headingSpring.setCurrent(this._sourceHeading);
this._headingSpring.setTarget(this._targetHeading)
}, calculateLookFromPitchAndHeading: function calculateLookFromPitchAndHeading(pitch, heading, worldLook, worldUp, worldSide, applyHeadingBeforePitch) {
var pitchRotation=Quaternion.fromAxisAngle(worldSide, pitch);
var headingRotation=Quaternion.fromAxisAngle(worldUp, -heading);
if (applyHeadingBeforePitch) {
return pitchRotation.multiply(headingRotation).transform(worldLook)
}
else {
return headingRotation.multiply(pitchRotation).transform(worldLook)
}
}, tryPitchHeadingToPixel: function tryPitchHeadingToPixel(pitch, heading) {
var look=this.calculateLookFromPitchAndHeading(pitch, heading, this._worldLook, this._worldUp, this._worldSide);
if (this._camera.getLook().dot(look) <= 0) {
return null
}
var projectedPoint=this._camera.projectTo2D(look);
return new Vector2(projectedPoint.x, projectedPoint.y)
}, tryPixelToPitchHeading: function tryPixelToPitchHeading(pixel) {
var viewport=this._camera.getViewport();
var focalLength=this._camera.getFocalLength();
var halfWidth=viewport.getWidth() * 0.5;
var halfHeight=viewport.getHeight() * 0.5;
var adjustedFocalLength=focalLength * halfHeight;
var x=pixel.x - halfWidth;
var y=pixel.y - halfHeight;
var pitchDelta=-Math.atan2(y, adjustedFocalLength);
var headingDelta=Math.atan2(x, adjustedFocalLength);
var look=this.calculateLookFromPitchAndHeading(pitchDelta, headingDelta, this._look, this._up, this._side, true);
var upComponent=look.dot(this._worldUp);
var sideComponent=look.dot(this._worldSide);
var forwardComponent=look.dot(this._worldLook);
var pitch=Math.atan2(upComponent, Math.max(0, Math.sqrt(1 - upComponent * upComponent)));
var heading=MathHelper.normalizeRadian(Math.atan2(sideComponent, forwardComponent));
if (isNaN(pitch) || isNaN(heading)) {
return null
}
return {
pitch: pitch, heading: heading
}
}, update: function update() {
if (this.hasCompleted()) {
return
}
var t=(new Date).getTime();
if (this._ballisticPath) {
var timeDelta=t - this._ballisticStartTime;
if (timeDelta > this._ballisticDuration) {
this._cancelBallisticPath(true)
}
else {
var easedTimeDelta=this._ballisticEasingSpline.getValue(timeDelta);
this._pitchSpring.setCurrentAndTarget(this._ballisticPath.getCurrentPitch(easedTimeDelta));
this._headingSpring.setCurrentAndTarget(this._ballisticPath.getCurrentHeading(easedTimeDelta));
this._fieldOfViewSpring.setCurrentAndTarget(Math.min(this._ballisticPath.getCurrentFov(easedTimeDelta), this._maxFieldOfView))
}
}
this._pitchSpring.step(t);
this._headingSpring.step(t);
this._fieldOfViewSpring.step(t);
this.updateCameraProperties()
}, zoom: function zoom(scaleFactor, fromTarget) {
this._cancelBallisticPath(false);
var proposedFov=(fromTarget) ? this._fieldOfViewSpring.getTarget() : this._fieldOfViewSpring.getCurrent();
proposedFov *= scaleFactor;
var targetFov=MathHelper.clamp(proposedFov, this._minFieldOfView, this._maxFieldOfView);
this._fieldOfViewSpring.setTarget(targetFov)
}, zoomToggle: function zoomToggle() {
var mid=(this._minFieldOfView + this._maxFieldOfView) * 0.5;
if (this._camera.getVerticalFov() > mid) {
this._fieldOfViewSpring.setTarget(this._minFieldOfView)
}
else {
this._fieldOfViewSpring.setTarget(this._maxFieldOfView)
}
}, discreteZoomFactor: 0.7, zoomIn: function zoomIn() {
this._cancelBallisticPath(false);
this._fieldOfViewSpring.setTarget(Math.max(this._minFieldOfView, this._camera.getVerticalFov() * this.discreteZoomFactor))
}, zoomOut: function zoomOut() {
this._cancelBallisticPath(false);
this._fieldOfViewSpring.setTarget(Math.min(this._maxFieldOfView, this._camera.getVerticalFov() / this.discreteZoomFactor))
}, updateCameraProperties: function updateCameraProperties() {
var pitch=this._pitchSpring.getCurrent();
if (pitch > this._upperPitchLimit) {
pitch = this._upperPitchLimit - 0.0001
}
if (pitch < this._lowerPitchLimit) {
pitch = this._lowerPitchLimit + 0.0001
}
var heading=this._constrainHeading(this._headingSpring.getCurrent());
var pitchRotation;
var headingRotation;
var bubbleLook=new Vector3(0, 0, -1);
var bubbleUp=new Vector3(0, 1, 0);
var bubbleSide=new Vector3(1, 0, 0);
var worldTransform=Matrix4x4.createIdentity();
this._worldLook = worldTransform.transformVector3(bubbleLook);
this._worldUp = worldTransform.transformVector3(bubbleUp);
this._worldSide = worldTransform.transformVector3(bubbleSide);
pitchRotation = Matrix4x4.createRotationX(pitch);
headingRotation = Matrix4x4.createRotationY(-heading);
var rotation=headingRotation.multiply(pitchRotation);
this._look = rotation.transformVector3(this._worldLook);
this._up = rotation.transformVector3(this._worldUp);
this._side = rotation.transformVector3(this._worldSide);
var bubbleOrigin=new Vector3(0, 0, 0);
var worldPosition=bubbleOrigin;
this._camera.setPosition(worldPosition);
this._camera.setLook(this._look);
this._camera.setUp(this._up);
this._camera.setVerticalFov(this._fieldOfViewSpring.getCurrent());
if (this.viewChangeCallback != null) {
this.viewChangeCallback()
}
}, onDiscreteZoom: function onDiscreteZoom(e) {
var zoomPoint=new Vector2(this._camera.getViewport().getWidth() * 0.5, this._camera.getViewport().getHeight() * 0.5);
if (e.direction > 0) {
this.zoomIn(zoomPoint)
}
else {
this.zoomOut(zoomPoint)
}
}, onGestureStart: function onGestureStart(e) {
this._lastGestureScale = 1;
this.beginRotation(e.screenX, e.screenY);
this._gestureChanged = false
}, onGestureEnd: function onGestureEnd(e) {
if (this._isRotating) {
this._lastGestureScale = null;
this.endRotation();
if (!this._gestureChanged || (this._startingPosition[0] == e.screenX && this._startingPosition[1] == e.screenY)) {
this.pick(e)
}
}
}, onGestureChange: function onGestureChange(e) {
if (this._isRotating) {
this._gestureChanged = true;
var scaleDelta=this._lastGestureScale / e.scale;
if (scaleDelta !== 1) {
this.zoom(scaleDelta, true)
}
this._lastGestureScale = e.scale;
this._lastMovePoint = new Vector2(this._startingPosition[0] + e.translationX, this._startingPosition[1] + e.translationY)
}
}, beginRotation: function beginRotation(x, y) {
this._isRotating = true;
this._startingPosition = [x, y];
this._startingPitchandHeading = this.getPitchAndHeading()
}, endRotation: function endRotation() {
this._isRotating = false;
this._lastMovePoint = null
}, updateRotation: function updateRotation() {
if (this._camera === null) {
return
}
if (this._lastMovePoint == null) {
return
}
if (!this._isRotating) {
return
}
var sx=this._lastMovePoint.x;
var sy=this._lastMovePoint.y;
var viewport=this._camera.getViewport();
var deltaMultiplier=1.1;
var dx=sx - this._startingPosition[0];
var dy=sy - this._startingPosition[1];
this.setRelativeTarget(this._startingPitchandHeading[0], this._startingPitchandHeading[1], dx, dy, viewport.getWidth(), viewport.getHeight(), deltaMultiplier)
}, pick: function pick(e) {
var w=this._camera.getViewport().getWidth(),
h=this._camera.getViewport().getHeight(),
camFov=this._camera.getVerticalFov(),
camAspect=this._camera.getViewport().getAspectRatio();
var w2=w / 2,
h2=h / 2;
e.clientX -= 8;
e.clientY -= 8;
if (e.clientX < 0 || e.clientY < 0)
console.log("bad");
var dx=e.clientX - w * 0.5,
dy=(h - 1 - e.clientY) - h * 0.5;
var deltaPitch=Math.atan(dy / h2 * Math.tan(camFov * 0.5));
var deltaHeading=Math.atan(dx / w2 * Math.tan(camFov * 0.5 * camAspect));
var targetPitch=this._pitchSpring.getCurrent() + deltaPitch;
var targetHeading=MathHelper.normalizeRadian(this._headingSpring.getCurrent() + deltaHeading);
var ph=this.getRelativeTarget(this._startingPitchandHeading[0], this._startingPitchandHeading[1], -(e.clientX - w * 0.5), (h - 1 - e.clientY) - h * 0.5, w, h, 1);
ph.toHeading = MathHelper.normalizeRadian(ph.toHeading)
}, deltaAngles: function deltaAngles(a1, a2) {
var value=a1 - a2;
while (value < -Math.PI) {
value += 2 * Math.PI
}
while (value >= Math.PI) {
value -= 2 * Math.PI
}
return value
}, deltaThreshold: 0.01 * 0.01 + 0.01 * 0.01, isLargeChange: function isLargeChange(d1, d2) {
return d1 * d1 + d2 * d2 > this.deltaThreshold
}, userInputing: false, _userInteracted: function _userInteracted() {
if (this.userInteractionCallback) {
this.userInteractionCallback()
}
}, control: function control(originalCamera, unprocessedEvents) {
var now=new Date;
var i,
e;
for (i = 0; i < unprocessedEvents.length; ++i) {
e = unprocessedEvents[i];
switch (e.type) {
case'gestureStart':
this.userInputing = true;
this._cancelBallisticPath(false);
this._userInteracted();
this.stopMovingCamera();
this.onGestureStart(e);
break;
case'gestureChange':
this.onGestureChange(e);
break;
case'gestureEnd':
this.userInputing = false;
this.onGestureEnd(e);
break;
case'discreteZoom':
this._cancelBallisticPath(false);
this._userInteracted();
this.onDiscreteZoom(e);
break;
case'keydown':
this.userInputing = true;
this._cancelBallisticPath(false);
this._userInteracted();
this.onKeyDown(e);
break;
case'keyup':
this.userInputing = false;
this.onKeyUp(e);
break;
default:
break
}
}
if (this._gyrometer) {
var gyroReading=this._gyrometer.getCurrentReading();
if (gyroReading && this.prevGyroReading && gyroReading.timestamp != this.prevGyroReading.timestamp && !this.userInputing && this._ballisticPath == null && this.prevFrameTime) {
var pitchHeadingDelta=this.processGyrometerReading(gyroReading, now - this.prevFrameTime);
if (pitchHeadingDelta[0] !== 0 || pitchHeadingDelta[1] !== 0) {
var pitchHeadingTarget=this.getTargetPitchAndHeading();
var pitch=pitchHeadingTarget[0] + pitchHeadingDelta[0];
var heading=pitchHeadingTarget[1] - pitchHeadingDelta[1];
this.setPitchAndHeading(pitch, heading, true)
}
}
this.prevGyroReading = gyroReading
}
this.update();
this.updateRotation();
this.prevFrameTime = now;
return this._camera
}, setGyrometer: function setGyrometer(gyrometer) {
this._gyrometer = gyrometer
}, processGyrometerReading: function processGyrometerReading(reading, timeDelta) {
var threshold=(this.prevGyrometerReadingNonZero) ? 1 : 2;
if (reading == null) {
this.prevGyrometerReadingNonZero = false;
return [0, 0]
}
if (Math.abs(reading.angularVelocityX) < threshold && Math.abs(reading.angularVelocityY) < threshold && Math.abs(reading.angularVelocityZ) < threshold) {
this.prevGyrometerReadingNonZero = false;
return [0, 0]
}
this.prevGyrometerReadingNonZero = true;
var multiplier=1.5 * MathHelper.degreesToRadians(timeDelta * 0.001) * Math.sin(this.getVerticalFov());
var headingDelta=reading.angularVelocityY * multiplier;
var pitchDelta=reading.angularVelocityX * multiplier;
var currentOrientation=null;
if (Windows && Windows.Graphics && Windows.Graphics.Display && Windows.Graphics.Display.DisplayProperties) {
currentOrientation = Windows.Graphics.Display.DisplayProperties.currentOrientation
}
if (Windows.Graphics.Display.DisplayProperties.nativeOrientation == Windows.Graphics.Display.DisplayOrientations.landscape) {
if (currentOrientation == null || currentOrientation === Windows.Graphics.Display.DisplayOrientations.none || currentOrientation === Windows.Graphics.Display.DisplayOrientations.landscape) {
return [pitchDelta, headingDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.portrait) {
return [headingDelta, -pitchDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.landscapeFlipped) {
return [-pitchDelta, -headingDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.portraitFlipped) {
return [-headingDelta, pitchDelta]
}
}
else {
if (currentOrientation == null || currentOrientation === Windows.Graphics.Display.DisplayOrientations.none || currentOrientation === Windows.Graphics.Display.DisplayOrientations.portrait) {
return [pitchDelta, headingDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.landscapeFlipped) {
return [headingDelta, -pitchDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.portraitFlipped) {
return [-pitchDelta, -headingDelta]
}
else if (currentOrientation === Windows.Graphics.Display.DisplayOrientations.landscape) {
return [-headingDelta, pitchDelta]
}
}
}, _updateMinFov: function _updateMinFov() {
if (this._dimension) {
this._minFieldOfView = this._height * MathHelper.degreesToRadians(90) / (this._dimension * this._maxPixelScaleFactor)
}
}, setMaxPixelScaleFactor: function setMaxPixelScaleFactor(factor) {
if (factor < 1) {
throw"Max pixel scale factor must be 1 or greater";
}
this._maxPixelScaleFactor = factor;
this._updateMinFov()
}, setViewportSize: function setViewportSize(width, height) {
this._height = height;
this._updateMinFov()
}, scrollSpeedX: 0, scrollSpeedY: 0, scrollAccX: 0, scrollAccY: 0, motionHandle: 0, onKeyDown: function onKeyDown(e) {
if (e.keyCode == '37')
this.startRotateHeading(-1);
else if (e.keyCode == '38')
this.startRotatePitch(1);
else if (e.keyCode == '39')
this.startRotateHeading(1);
else if (e.keyCode == '40')
this.startRotatePitch(-1);
else if (e.keyCode == '107' || e.keyCode == '187')
this.zoomIn();
else if (e.keyCode == '109' || e.keyCode == '189')
this.zoomOut()
}, onKeyUp: function onKeyUp(e) {
if (e.keyCode == '37' || e.keyCode == '39')
this.stopRotateHeading();
else if (e.keyCode == '38' || e.keyCode == '40')
this.stopRotatePitch()
}, startRotatePitch: function startRotatePitch(acc) {
this.scrollAccY = acc;
this.moveCamera()
}, stopRotatePitch: function stopRotatePitch() {
this.scrollAccY = 0
}, startRotateHeading: function startRotateHeading(acc) {
this.scrollAccX = acc;
this.moveCamera()
}, stopRotateHeading: function stopRotateHeading() {
this.scrollAccX = 0
}, moveCamera: function moveCamera() {
var that=this;
if (!this.motionHandle) {
this.motionHandle = setInterval(function() {
that.scrollSpeedX += that.scrollAccX;
that.scrollSpeedY += that.scrollAccY;
that.scrollSpeedX *= 0.9;
that.scrollSpeedY *= 0.9;
var ph=that.getPitchAndHeading();
ph[0] += that.scrollSpeedY * 0.005;
ph[1] += that.scrollSpeedX * 0.005;
that.setPitchAndHeading(ph[0], ph[1]);
if (Math.abs(that.scrollSpeedX) < 0.1 && Math.abs(that.scrollSpeedY) < 0.1) {
that.stopMovingCamera();
return
}
}, 33)
}
}, stopMovingCamera: function stopMovingCamera() {
if (this.motionHandle) {
clearInterval(this.motionHandle);
this.motionHandle = 0
}
}
};
"use strict";
var TileId=function(levelOfDetail, x, y) {
var self=this;
self.x = Math.floor(x);
self.y = Math.floor(y);
self.levelOfDetail = Math.floor(levelOfDetail)
};
TileId.prototype = {
hasParent: function hasParent() {
return this.levelOfDetail > 0
}, getParent: function getParent() {
if (!this.hasParent()) {
throw'0 level does not have a parent';
}
return new TileId(this.levelOfDetail - 1, this.x >> 1, this.y >> 1)
}, getChildren: function getChildren() {
var childX=this.x << 1,
childY=this.y << 1;
return [new TileId(this.levelOfDetail + 1, childX, childY), new TileId(this.levelOfDetail + 1, childX + 1, childY), new TileId(this.levelOfDetail + 1, childX, childY + 1), new TileId(this.levelOfDetail + 1, childX + 1, childY + 1)]
}, isChildOf: function isChildOf(other) {
if (this.levelOfDetail < other.levelOfDetail) {
return false
}
var lodDifference=this.levelOfDetail - other.levelOfDetail;
return (this.x >> this.levelOfDetail) === other.x && (this.y >> this.levelOfDetail) === other.y
}, equals: function equals(other) {
return this.x === other.x && this.y === other.y && this.levelOfDetail === this.levelOfDetail
}, toString: function toString() {
return '(' + this.x + ',' + this.y + ',' + this.levelOfDetail + ')'
}
};
var TiledImagePyramid=function(name, baseImageWidth, baseImageHeight, tileWidth, tileHeight, minimumLod, tileOverlap, tileBorder, atlasImage) {
if (!baseImageWidth || !baseImageHeight || !tileWidth || !tileHeight) {
throw'Expected baseImageWidth baseImageHeight tileWidth tileHeight as positive integer arguments';
}
this.baseImageWidth = baseImageWidth;
this.baseImageHeight = baseImageHeight;
this.tileWidth = tileWidth;
this.tileHeight = tileHeight;
this.minimumLod = minimumLod || 0;
this.finestLod = MathHelper.ceilLog2(Math.max(baseImageWidth, baseImageHeight));
this.tileOverlap = tileOverlap || 0;
this.tileBorder = tileBorder || 0;
this.atlasImage = atlasImage;
this.name = name;
this.lodHistory = {};
this.callCount = 0
};
var debugReturnedTiles=false;
var prevReturnedTiles={};
TiledImagePyramid.prototype = {
isAtlasTile: function isAtlasTile(tileId) {
return (this.atlasImage && tileId.levelOfDetail == this.minimumLod && tileId.x == 0 && tileId.y == 0)
}, getLodWidthInTiles: function getLodWidthInTiles(lod) {
return MathHelper.divRoundUp(MathHelper.divPow2RoundUp(this.baseImageWidth, this.finestLod - lod), this.tileWidth)
}, getLodHeightInTiles: function getLodHeightInTiles(lod) {
return MathHelper.divRoundUp(MathHelper.divPow2RoundUp(this.baseImageHeight, this.finestLod - lod), this.tileHeight)
}, getLodWidth: function getLodWidth(lod) {
return MathHelper.divPow2RoundUp(this.baseImageWidth, this.finestLod - lod)
}, getLodHeight: function getLodHeight(lod) {
return MathHelper.divPow2RoundUp(this.baseImageHeight, this.finestLod - lod)
}, getEdgeFlags: function getEdgeFlags(tileId) {
return {
isLeft: tileId.x === 0, isRight: tileId.x === this.getLodWidthInTiles(tileId.levelOfDetail) - 1, isTop: tileId.y === 0, isBottom: tileId.y === this.getLodHeightInTiles(tileId.levelOfDetail) - 1
}
}, getTileDimensions: function getTileDimensions(tileId) {
var lodWidth=this.getLodWidth(tileId.levelOfDetail);
var lodHeight=this.getLodHeight(tileId.levelOfDetail);
var width,
height;
if (this.isAtlasTile(tileId)) {
width = lodWidth + (2 * this.tileBorder);
height = lodHeight + (2 * this.tileBorder)
}
else {
var edgeFlags=this.getEdgeFlags(tileId);
var xMax=tileId.x * this.tileWidth + this.tileWidth - 1;
width = (xMax < lodWidth) ? this.tileWidth : this.tileWidth - (xMax - lodWidth);
if (edgeFlags.isLeft || edgeFlags.isRight) {
width += this.tileOverlap;
width += this.tileBorder
}
else {
width += 2 * this.tileOverlap
}
var yMax=tileId.y * this.tileHeight + this.tileHeight - 1;
height = (yMax < lodHeight) ? this.tileHeight : this.tileHeight - (yMax - lodHeight);
if (edgeFlags.isTop || edgeFlags.isBottom) {
height += this.tileOverlap;
height += this.tileBorder
}
else {
height += 2 * this.tileOverlap
}
}
var tileDimension=new Vector2(width, height);
return tileDimension
}, getTileTransform: function getTileTransform(tileId) {
var scale=1 << (this.finestLod - tileId.levelOfDetail);
var edgeFlags=this.getEdgeFlags(tileId);
var scaleTransform=Matrix4x4.createScale(scale, scale, 1.0);
var xPos=tileId.x * this.tileWidth;
var lodHeight=this.getLodHeight(tileId.levelOfDetail);
var yMax=tileId.y * this.tileHeight + this.tileHeight;
var height=(yMax < lodHeight) ? this.tileHeight : this.tileHeight - (yMax - lodHeight);
var yPos=lodHeight - (height + tileId.y * this.tileHeight);
var overlapTransform=Matrix4x4.createTranslation(edgeFlags.isLeft ? -this.tileBorder : -this.tileOverlap, edgeFlags.isTop ? -this.tileBorder : -this.tileOverlap, 0.0);
var translation=Matrix4x4.createTranslation(xPos, yPos, 0.0);
return scaleTransform.multiply(translation.multiply(overlapTransform))
}, getLodFromTexelToPixelRatio: function getLodFromTexelToPixelRatio(texelToPixelRatio) {
return this.finestLod - MathHelper.logBase(texelToPixelRatio, 2)
}, getDiscreteLod: function getDiscreteLod(lod) {
var renderLod=(lod - Math.floor(lod) < 0.5849625) ? Math.floor(lod) : Math.ceil(lod);
return MathHelper.clamp(renderLod, this.minimumLod, this.finestLod)
}, getTexelRatio: function getTexelRatio(screenSpacePolygon, textureSpacePolygon) {
if (screenSpacePolygon.length !== textureSpacePolygon.length) {
throw'expected two equal length arrays';
}
var v0Idx=screenSpacePolygon.length - 1;
var minTexelToPixelRatio=Number.MAX_VALUE;
var maxTexelToPixelRatio=-Number.MAX_VALUE;
var numberOfSegments=0;
var totalTexelToPixelRatio=0;
var texelLengths=[];
var pixelLengths=[];
for (var v1Idx=0; v1Idx < screenSpacePolygon.length; ++v1Idx) {
var baseImageSpaceV0X=textureSpacePolygon[v0Idx].x;
var baseImageSpaceV0Y=textureSpacePolygon[v0Idx].y;
var baseImageSpaceV1X=textureSpacePolygon[v1Idx].x;
var baseImageSpaceV1Y=textureSpacePolygon[v1Idx].y;
var screenSpaceV0X=screenSpacePolygon[v0Idx].x;
var screenSpaceV0Y=screenSpacePolygon[v0Idx].y;
var screenSpaceV1X=screenSpacePolygon[v1Idx].x;
var screenSpaceV1Y=screenSpacePolygon[v1Idx].y;
var dx=screenSpaceV1X - screenSpaceV0X;
var dy=screenSpaceV1Y - screenSpaceV0Y;
var du=baseImageSpaceV1X - baseImageSpaceV0X;
var dv=baseImageSpaceV1Y - baseImageSpaceV0Y;
var texelLength=Math.sqrt(du * du + dv * dv);
var pixelLength=Math.sqrt(dx * dx + dy * dy);
if (pixelLength != 0) {
var texelToPixelRatio=texelLength / pixelLength;
minTexelToPixelRatio = Math.min(minTexelToPixelRatio, texelToPixelRatio);
maxTexelToPixelRatio = Math.max(maxTexelToPixelRatio, texelToPixelRatio);
totalTexelToPixelRatio += texelToPixelRatio;
++numberOfSegments
}
texelLengths.push(texelLength);
pixelLengths.push(pixelLength);
v0Idx = v1Idx
}
return {
meanTexelToPixelRatio: totalTexelToPixelRatio / numberOfSegments, minTexelToPixelRatio: minTexelToPixelRatio, maxTexelToPixelRatio: maxTexelToPixelRatio, texelLengths: texelLengths, pixelLengths: pixelLengths
}
}, _isInvalidNdcSpacePolygon: function _isInvalidNdcSpacePolygon(poly) {
if (poly.length < 3) {
return true
}
if (!poly[0].equals) {
return true
}
for (var i=1; i < poly.length; i++) {
if (!poly[0].equals(poly[1])) {
return false
}
}
return true
}, getVisibleTiles: function getVisibleTiles(getModelTransform, viewProjectionTransform, viewportWidth, viewportHeight, textureSpaceClipRect, useLowerLod) {
var viewportTransform=GraphicsHelper.createViewportToScreen(viewportWidth, viewportHeight);
var visibleTiles=[];
var clippedPolygon=this.getClippedPolygon(getModelTransform, viewProjectionTransform);
if (this._isInvalidNdcSpacePolygon(clippedPolygon.ndcSpacePolygon)) {
return {
visibleTiles: visibleTiles, textureSpacePolygon: clippedPolygon.textureSpacePolygon
}
}
var textureSpacePolygon=[];
var screenSpacePolygon=[];
for (var i=0; i < clippedPolygon.ndcSpacePolygon.length; ++i) {
var invTextureW=1.0 / clippedPolygon.textureSpacePolygon[i].w;
clippedPolygon.textureSpacePolygon[i].x *= invTextureW;
clippedPolygon.textureSpacePolygon[i].y *= invTextureW;
clippedPolygon.textureSpacePolygon[i].z *= invTextureW;
clippedPolygon.textureSpacePolygon[i].z = 0.0;
clippedPolygon.textureSpacePolygon[i].w = 1.0;
textureSpacePolygon.push(new Vector2(clippedPolygon.textureSpacePolygon[i].x, clippedPolygon.textureSpacePolygon[i].y));
var invSpaceW=1.0 / clippedPolygon.ndcSpacePolygon[i].w;
clippedPolygon.ndcSpacePolygon[i].x *= invSpaceW;
clippedPolygon.ndcSpacePolygon[i].y *= invSpaceW;
clippedPolygon.ndcSpacePolygon[i].z *= invSpaceW;
clippedPolygon.ndcSpacePolygon[i].w = 1.0;
var screenSpacePoint=viewportTransform.transformVector4(clippedPolygon.ndcSpacePolygon[i]);
screenSpacePolygon.push(new Vector2(screenSpacePoint.x, screenSpacePoint.y))
}
if (textureSpaceClipRect) {
var poly=convexPolygonClipper.clip(new Vector4(textureSpaceClipRect.getLeft(), textureSpaceClipRect.getTop(), 0), new Vector4(textureSpaceClipRect.getRight(), textureSpaceClipRect.getBottom(), 0), clippedPolygon.textureSpacePolygon);
textureSpacePolygon = [];
for (var i=0; i < poly.length; ++i) {
textureSpacePolygon.push(poly[i])
}
}
else {
textureSpacePolygon = clippedPolygon.textureSpacePolygon
}
var texelRatio=this.getTexelRatio(screenSpacePolygon, clippedPolygon.textureSpacePolygon);
var preciseLod=this.getLodFromTexelToPixelRatio(texelRatio.meanTexelToPixelRatio);
if (useLowerLod) {
preciseLod -= 1.0
}
var renderedLod=this.getDiscreteLod(preciseLod);
var tileGridWidth=this.getLodWidthInTiles(renderedLod);
var tileGridHeight=this.getLodWidthInTiles(renderedLod);
if (tileGridWidth === 1 && tileGridHeight === 1) {
visibleTiles.push(new TileId(renderedLod, 0, 0))
}
else {
var modelTransform=getModelTransform(this.baseImageWidth, this.name);
var modelViewProjection=viewProjectionTransform.multiply(modelTransform);
var visibleTiles;
if (Config.outputMultiLODTiles) {
visibleTiles = this.intersectClippedPolyWithTileGrid_multiLOD2(modelViewProjection, viewportWidth, viewportHeight, textureSpacePolygon, screenSpacePolygon, tileGridWidth, tileGridHeight, this.tileWidth, this.tileHeight)
}
else {
visibleTiles = this.intersectClippedPolyWithTileGrid(modelViewProjection, textureSpacePolygon, textureSpacePolygon.length, this.finestLod, renderedLod, tileGridWidth, tileGridHeight, this.tileWidth, this.tileHeight)
}
}
return {
visibleTiles: visibleTiles, lod: renderedLod, preciseLod: preciseLod, finestRenderedLod: this.getLodFromTexelToPixelRatio(texelRatio.minTexelToPixelRatio), textureSpacePolygon: clippedPolygon.textureSpacePolygon
}
}, projectPolygonFromNDCToTexture: function projectPolygonFromNDCToTexture(imageSpaceEye, modelViewProjection, ndcPolygon, imageDim) {
var inverseModelViewProjection=modelViewProjection.inverse();
var polygonProjectedOntoImage=[];
for (var i=0; i < ndcPolygon.length; ++i) {
var vImageSpace=inverseModelViewProjection.transformVector4(ndcPolygon[i]);
var invImageSpaceW=1.0 / vImageSpace.w;
vImageSpace.x *= invImageSpaceW;
vImageSpace.y *= invImageSpaceW;
vImageSpace.z *= invImageSpaceW;
vImageSpace.w = 1.0;
vImageSpace.y = imageDim - 1 - vImageSpace.y;
polygonProjectedOntoImage.push(vImageSpace)
}
return polygonProjectedOntoImage
}, getClippedPolygon: function getClippedPolygon(getModelTransform, viewProjectionTransform) {
var clipDim=1024;
var clipModelTransform=getModelTransform(clipDim, this.name);
var ndcPolygon=[],
i,
clippedNDCPolygon,
backProjectedPolygon,
inverseModelTransform=clipModelTransform.inverse(),
projectorPosition=inverseModelTransform.transformVector4(new Vector4(0, 0, 0, 1)),
modelViewProjection=viewProjectionTransform.multiply(clipModelTransform),
imageCorners=[new Vector4(0, 0, 0, 1), new Vector4(0, clipDim, 0, 1), new Vector4(clipDim, clipDim, 0, 1), new Vector4(clipDim, 0, 0, 1), ];
for (i = 0; i < imageCorners.length; ++i) {
ndcPolygon.push(modelViewProjection.transformVector4(imageCorners[i]))
}
var clippedNDCPolygon=convexPolygonClipper.clip(new Vector4(-1, -1, -1), new Vector4(1, 1, 1), ndcPolygon);
var backProjectedPolygon=this.projectPolygonFromNDCToTexture(projectorPosition, modelViewProjection, clippedNDCPolygon, clipDim);
var ratio=this.baseImageHeight / clipDim;
for (var i=0; i < backProjectedPolygon.length; ++i) {
backProjectedPolygon[i].x *= ratio;
backProjectedPolygon[i].y = this.baseImageHeight - 1 - (clipDim - 1 - backProjectedPolygon[i].y) * ratio
}
return {
ndcSpacePolygon: clippedNDCPolygon, textureSpacePolygon: backProjectedPolygon
}
}, orientedBoundingBoxRectIntersecion: function orientedBoundingBoxRectIntersecion(orientedBBox0, orientedBBox1, orientedBBoxWidth, axisAlignedBBox) {
if (orientedBBoxWidth <= 0) {
throw'box must have positive width';
}
var norm=orientedBBox1.subtract(orientedBBox0).normalize();
norm = norm.multiplyScalar(orientedBBoxWidth * 0.5);
var perp=new Vector2(-norm.y, norm.x);
var boxCorners=[[orientedBBox0.add(perp).subtract(norm), orientedBBox1.add(perp).add(norm), orientedBBox1.subtract(perp).add(norm), orientedBBox0.subtract(perp).subtract(norm)], [new Vector2(axisAlignedBBox.getLeft(), axisAlignedBBox.getTop()), new Vector2(axisAlignedBBox.getRight(), axisAlignedBBox.getTop()), new Vector2(axisAlignedBBox.getRight(), axisAlignedBBox.getBottom()), new Vector2(axisAlignedBBox.getLeft(), axisAlignedBBox.getBottom())]];
var boxCorners0=boxCorners[0];
var boxCorners1=boxCorners[1];
for (var direction=0; direction < 1; direction++) {
var axis1=boxCorners0[1].subtract(boxCorners0[0]);
var axis2=boxCorners0[3].subtract(boxCorners0[0]);
axis1 = axis1.multiplyScalar((1.0 / axis1.lengthSquared()));
axis2 = axis2.multiplyScalar((1.0 / axis2.lengthSquared()));
var origin1=boxCorners0[0].dot(axis1);
var origin2=boxCorners0[0].dot(axis2);
for (var a=0; a < 2; a++) {
var axis=((a == 0) ? axis1 : axis2);
var origin=((a == 0) ? origin1 : origin2);
var tMin=Number.MAX_VALUE;
var tMax=Number.MIN_VALUE;
var t=boxCorners1[0].dot(axis);
if (t < tMin)
tMin = t;
if (t > tMax)
tMax = t;
t = boxCorners1[1].dot(axis);
if (t < tMin)
tMin = t;
if (t > tMax)
tMax = t;
t = boxCorners1[2].dot(axis);
if (t < tMin)
tMin = t;
if (t > tMax)
tMax = t;
t = boxCorners1[3].dot(axis);
if (t < tMin)
tMin = t;
if (t > tMax)
tMax = t;
if ((tMin - origin) > 1.0 || (tMax - origin) < 0.0)
return false
}
var tmp=boxCorners0;
boxCorners0 = boxCorners1;
boxCorners1 = tmp
}
return true
}, linePointDistanceSquared: function linePointDistanceSquared(line0, line1, point) {
var distanceSquared=line0.subtract(line1).lengthSquared();
var alpha=((point.x - line0.x) * (line1.x - line0.x) + (point.y - line0.y) * (line1.y - line0.y)) / distanceSquared;
var inLineSegment=alpha >= 0.0 && alpha <= 1.0;
var pIntersection=line0.lerp(line1, alpha);
return {
distanceSquared: pIntersection.subtract(point).lengthSquared(), inLineSegment: inLineSegment
}
}, pointInPoly: function pointInPoly(points, x, y) {
var i,
j,
c=false;
for (i = 0, j = points.length - 1; i < points.length; j = i++) {
if ((((points[i].y <= y) && (y < points[j].y)) || ((points[j].y <= y) && (y < points[i].y))) && (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x))
c = !c
}
return c
}, intersectClippedPolyWithTileGrid_multiLOD2: function intersectClippedPolyWithTileGrid_multiLOD2(modelViewProjection, viewportWidth, viewportHeight, texSpacePoly, scrSpacePoly) {
if (scrSpacePoly.length != texSpacePoly.length) {
scrSpacePoly = [];
for (var k=0; k < texSpacePoly.length; k++) {
var vert=new Vector4(texSpacePoly[k].x, this.baseImageHeight - 1 - texSpacePoly[k].y, 0, 1);
scrVert = modelViewProjection.transformVector4(vert);
scrVert.x /= scrVert.w;
scrVert.y /= scrVert.w;
scrVert.x = (scrVert.x + 1) * 0.5 * viewportWidth;
scrVert.y = (scrVert.y + 1) * 0.5 * viewportHeight;
scrSpacePoly.push(scrVert)
}
}
var texelRatio=this.getTexelRatio(scrSpacePoly, texSpacePoly);
var preciseLod=this.getLodFromTexelToPixelRatio(texelRatio.meanTexelToPixelRatio);
var renderedLod=this.getDiscreteLod(preciseLod);
var tileGridWidth=this.getLodWidthInTiles(renderedLod);
var tileGridHeight=this.getLodWidthInTiles(renderedLod);
var tiles=this.intersectClippedPolyWithTileGrid(modelViewProjection, texSpacePoly, texSpacePoly.length, this.finestLod, renderedLod, tileGridWidth, tileGridHeight, this.tileWidth, this.tileHeight);
var maxTexToPixRatio=MathHelper.logBase(this.baseImageWidth / viewportWidth);
var changed=true;
var newTiles;
while (changed) {
changed = false;
var newTiles=[];
for (var i=0; i < tiles.length; i++) {
var tileId=tiles[i];
var texSpaceClippedQuad;
lodDiff = this.finestLod - tileId.levelOfDetail;
texX = (tileId.x << lodDiff) * this.tileWidth;
texY = (tileId.y << lodDiff) * this.tileHeight;
width = this.tileWidth << lodDiff;
height = this.tileWidth << lodDiff;
texSpaceClippedQuad = convexPolygonClipper.clip(new Vector4(texX, texY, 0), new Vector4(texX + width, texY + height, 0), texSpacePoly);
if (!texSpaceClippedQuad.length) {
continue
}
if (tileId.noSubdiv || tileId.levelOfDetail == this.finestLod) {
newTiles.push(tileId);
continue
}
var children=tileId.getChildren();
var numNewLod=0,
numClippedOut=0;
for (var c=0; c < children.length; c++) {
var childTileId=children[c];
lodDiff = this.finestLod - childTileId.levelOfDetail;
texX = (childTileId.x << lodDiff) * this.tileWidth;
texY = (childTileId.y << lodDiff) * this.tileHeight;
width = this.tileWidth << lodDiff;
height = this.tileWidth << lodDiff;
var tolerance=0.01;
texX += tolerance;
texY += tolerance;
width -= tolerance;
height -= tolerance;
var w2=width / 2,
h2=height / 2;
var fullyContained=true;
for (var m=0; m <= 1 && fullyContained; m++)
for (var n=0; n <= 1 && fullyContained; n++) {
if (!this.pointInPoly(texSpacePoly, texX + m * width, texY + n * height))
fullyContained = false
}
texSpaceClippedQuad = [];
if (!fullyContained) {
texSpaceClippedQuad = convexPolygonClipper.clip(new Vector4(texX, texY, 0), new Vector4(texX + width, texY + height, 0), texSpacePoly)
}
else {
texSpaceClippedQuad.push(new Vector4(texX, texY, 0, 1));
texSpaceClippedQuad.push(new Vector4(texX + width, texY, 0, 1));
texSpaceClippedQuad.push(new Vector4(texX + width, texY + height, 0, 1));
texSpaceClippedQuad.push(new Vector4(texX, texY + height, 0, 1))
}
if (texSpaceClippedQuad.length > 0) {
var scrSpaceClippedQuad=[];
for (var v=0; v < texSpaceClippedQuad.length; v++) {
var vert=new Vector4(texSpaceClippedQuad[v].x, this.baseImageHeight - 1 - texSpaceClippedQuad[v].y, 0, 1);
scrVert = modelViewProjection.transformVector4(vert);
var tempW=1.0 / scrVert.w;
scrVert.x *= tempW;
scrVert.y *= tempW;
scrVert.x = (scrVert.x + 1) * 0.5 * viewportWidth;
scrVert.y = (scrVert.y + 1) * 0.5 * viewportHeight;
scrSpaceClippedQuad.push(scrVert)
}
var texelRatio=this.getTexelRatio(scrSpaceClippedQuad, texSpaceClippedQuad);
var preciseLod=this.getLodFromTexelToPixelRatio(texelRatio.meanTexelToPixelRatio);
var renderedLod=this.getDiscreteLod(preciseLod);
var maxPixelLengths=0;
for (var l=0; l < texelRatio.pixelLengths.length; l++) {
if (texelRatio.pixelLengths[l] > maxPixelLengths)
maxPixelLengths = texelRatio.pixelLengths[l]
}
if (renderedLod > tileId.levelOfDetail || maxPixelLengths > this.tileWidth) {
newTiles.push(childTileId);
numNewLod++;
changed = true
}
}
else
numClippedOut++
}
if (numNewLod < children.length - numClippedOut) {
tileId.noSubdiv = true;
newTiles.push(tileId)
}
}
if (changed)
tiles = newTiles
}
return tiles
}, intersectClippedPolyWithTileGrid: function intersectClippedPolyWithTileGrid(modelViewProjection, clippedVerticesSSTexCoords, nClippedVerticesSS, finestLod, lod, tileGridWidth, tileGridHeight, tileWidth, tileHeight) {
var xScale=(1.0 / ((1) << (finestLod - lod))) / tileWidth;
var yScale=(1.0 / ((1) << (finestLod - lod))) / tileHeight;
var tileIdCoords=new Array(nClippedVerticesSS);
for (var i=0; i < nClippedVerticesSS; i++) {
tileIdCoords[i] = {
x: clippedVerticesSSTexCoords[i].x * xScale, y: clippedVerticesSSTexCoords[i].y * yScale
}
}
var tileOffsets=PolygonTileFloodFiller.floodFill(tileGridWidth, tileGridHeight, tileIdCoords);
var tiles=[];
for (var i=0; i < tileOffsets.length; i++) {
tiles.push(new TileId(lod, tileOffsets[i].x, tileOffsets[i].y))
}
return tiles
}
};
"use strict";
var TiledImagePyramidCoverageMap=function(minimumLevelOfDetail, maximumLevelOfDetail) {
var self=this,
lod;
if (minimumLevelOfDetail < 0) {
throw'minimumLevelOfDetail needs to be non negative';
}
if (maximumLevelOfDetail < 0) {
throw'maximimLevelOfDetail needs to be non negative';
}
if (!(minimumLevelOfDetail <= maximumLevelOfDetail)) {
throw'min should be less than or equal max lod';
}
self.x0 = -1;
self.y0 = -1;
self.x1 = -1;
self.y1 = -1;
self.levelOfDetail = maximumLevelOfDetail;
self.minimumLevelOfDetail = minimumLevelOfDetail;
self.occluderFlags = [];
self.occludedFlags = [];
for (lod = 0; lod <= self.levelOfDetail; ++lod) {
self.occluderFlags.push({});
self.occludedFlags.push({})
}
};
TiledImagePyramidCoverageMap.prototype = {
initialize: function initialize(levelOfDetail, x0, y0, x1, y1) {
if (!(levelOfDetail >= 0)) {
throw'Expected ' + '(levelOfDetail >= 0)';
}
if (!(levelOfDetail <= this.occluderFlags.length - 1)) {
throw'Expected ' + '(levelOfDetail <= occluderFlags.length - 1)';
}
if (!(x0 < x1)) {
throw'Expected ' + '(x0 < x1)';
}
if (!(y0 < y1)) {
throw'Expected ' + '(y0 < y1)';
}
this.levelOfDetail = levelOfDetail;
this.x0 = x0;
this.y0 = y0;
this.x1 = x1;
this.y1 = y1
}, markAsOccluder: function markAsOccluder(tileId, occluder) {
this.setOccluderFlag(tileId.toString(), occluder)
}, calculateOcclusions: function calculateOcclusions() {
var lod,
x,
y,
bounds,
occluded,
tileId;
for (lod = this.levelOfDetail; lod >= this.minimumLevelOfDetail; lod--) {
if (lod != this.levelOfDetail) {
bounds = this.getTileBoundsAtLod(lod);
for (y = bounds.lodY0; y < bounds.lodY1; y++) {
for (x = bounds.lodX0; x < bounds.lodX1; x++) {
tileId = new TileId(lod, x, y);
if (this.getOccluderFlag(tileId) !== undefined) {
occluded = this.isChildIrrelevantOrOccluder(tileId, 0) && this.isChildIrrelevantOrOccluder(tileId, 1) && this.isChildIrrelevantOrOccluder(tileId, 2) && this.isChildIrrelevantOrOccluder(tileId, 3);
if (occluded) {
this.setOccludedFlag(tileId, true);
this.setOccluderFlag(tileId, true)
}
else {
this.setOccludedFlag(tileId, false);
this.setOccluderFlag(tileId, false)
}
}
}
}
}
}
}, isChildIrrelevantOrOccluder: function isChildIrrelevantOrOccluder(tileId, childIdx) {
if (!((childIdx >= 0 && childIdx < 4))) {
throw'Expected ' + '(childIdx >= 0 && childIdx < 4)';
}
var childTileId=new TileId(tileId.levelOfDetail + 1, (tileId.x << 1) + childIdx % 2, (tileId.y << 1) + childIdx / 2);
var bounds=this.getTileBoundsAtLod(childTileId.levelOfDetail);
if (childTileId.x >= bounds.lodX0 && childTileId.x < bounds.lodX1 && childTileId.y >= bounds.lodY0 && childTileId.y < bounds.lodY1) {
var occluderFlag=this.getOccluderFlag(childTileId);
return (occluderFlag === undefined) || occluderFlag
}
else {
return true
}
}, getOccluderFlag: function getOccluderFlag(tileId) {
return this.occluderFlags[tileId.levelOfDetail][tileId]
}, setOccluderFlag: function setOccluderFlag(tileId, occluderFlag) {
this.occluderFlags[tileId.levelOfDetail][tileId] = occluderFlag
}, getOccludedFlag: function getOccludedFlag(tileId) {
return this.occludedFlags[tileId.levelOfDetail][tileId]
}, setOccludedFlag: function setOccludedFlag(tileId, occludedFlag) {
this.occludedFlags[tileId.levelOfDetail][tileId] = occludedFlag
}, getTileBoundsAtLod: function getTileBoundsAtLod(lod) {
var lodDiff=this.levelOfDetail - lod;
return {
lodX0: this.x0 >> lodDiff, lodY0: this.y0 >> lodDiff, lodX1: MathHelper.divPow2RoundUp(this.x1, lodDiff), lodY1: MathHelper.divPow2RoundUp(this.y1, lodDiff)
}
}, getDescendents: function getDescendents(tileId, filter) {
var lod,
x,
y,
bounds,
occluded,
tileId,
result=[];
for (lod = tileId.levelOfDetail + 1; lod <= this.levelOfDetail; lod++) {
bounds = this.getTileBoundsAtLod(lod);
for (tileid in this.occluderFlags[lod]) {
if (bounds.lodX0 <= tileid.x && tileid.x <= bounds.lodX1 && bounds.lodY0 <= tileid.y && tileid.y <= bounds.lodY1)
result.push(tileId.toString())
}
}
return result
}
};
"use strict";
var TiledImagePyramidCuller=function(){};
var tileDebugPrint=false;
var prevVisibleTiles={};
TiledImagePyramidCuller.prototype = {cull: function cull(tilePyramid, tileCoverage, getModelTransform, viewProjection, viewportWidth, viewportHeight, clip, visibleSet, prefix, tileSource, isTileAvailable, frameCount, useLowerLod) {
var delta={
added: [], updated: [], removed: []
};
var tileResult=tilePyramid.getVisibleTiles(getModelTransform, viewProjection, viewportWidth, viewportHeight, clip, useLowerLod);
if (tileDebugPrint) {
if (prevVisibleTiles && prevVisibleTiles[prefix]) {
for (var i=0; i < prevVisibleTiles[prefix].length; i++) {
var j;
for (j = 0; j < tileResult.visibleTiles.length; j++)
if (tileResult.visibleTiles[j].toString() == prevVisibleTiles[prefix][i].toString())
break;
if (j == tileResult.visibleTiles.length)
Utils.log("frame=" + frameCount + " getVisibleTiles remove " + prefix + ":" + prevVisibleTiles[prefix][i])
}
for (var i=0; i < tileResult.visibleTiles.length; i++) {
var j;
for (j = 0; j < prevVisibleTiles[prefix].length; j++)
if (tileResult.visibleTiles[i].toString() == prevVisibleTiles[prefix][j].toString())
break;
if (j == prevVisibleTiles[prefix].length)
Utils.log("frame=" + frameCount + " getVisibleTiles added " + prefix + ":" + tileResult.visibleTiles[i])
}
}
prevVisibleTiles[prefix] = tileResult.visibleTiles.slice()
}
if (tileResult.visibleTiles.length === 0) {
for (var i=0; i < visibleSet.length; ++i) {
var tile=visibleSet[i];
if (tile.lastTouched !== frameCount && tile.tilePyramid === tilePyramid) {
delta.removed.push({id: visibleSet[i].id})
}
}
return delta
}
var viewportTransform=GraphicsHelper.createViewportToScreen(viewportWidth, viewportHeight);
var modelTransform=getModelTransform(tilePyramid.baseImageWidth, tilePyramid.name);
var modelToScreen=viewportTransform.multiply(viewProjection.multiply(modelTransform));
var visibleTiles=[];
visibleTiles.byId = {};
for (var i=0; i < tileResult.visibleTiles.length; ++i) {
var tileId=tileResult.visibleTiles[i];
tileId.isTemp = false;
tileId.isLowerLod = useLowerLod;
tileId.cached = isTileAvailable(tileId.x, tileId.y, tileId.levelOfDetail);
var priority=0;
visibleTiles.push(tileId);
visibleTiles[visibleTiles.length - 1].priority = priority;
visibleTiles.byId[tileId.toString()] = true;
if (!visibleSet.byId[prefix + tileId.toString()]) {
var ancestorId=tileId;
var maxDepth=1,
depth=1;
while (ancestorId.levelOfDetail > tilePyramid.minimumLod && depth++ <= maxDepth) {
ancestorId = ancestorId.getParent();
if (!visibleTiles.byId[ancestorId.toString()]) {
ancestorId.isTemp = true;
visibleTiles.push(ancestorId);
visibleTiles.byId[ancestorId.toString()] = true;
visibleTiles[visibleTiles.length - 1].priority = priority;
ancestorId.cached = isTileAvailable(ancestorId.x, ancestorId.y, ancestorId.levelOfDetail)
}
}
}
}
visibleTiles.byId = null;
for (var i=0; i < visibleTiles.length; ++i) {
var tileId=visibleTiles[i];
var id=prefix + tileId.toString();
if (!visibleSet.byId[id]) {
var tileDimension=tilePyramid.getTileDimensions(tileId);
var tileTransform=tilePyramid.getTileTransform(tileId);
var tileTransformModelSpace=modelTransform.multiply(tileTransform);
var tileUrl=tileSource(tileId.x, tileId.y, tileId.levelOfDetail);
delta.added.push({
type: 'tile', id: id, tileWidth: tileDimension.x, tileHeight: tileDimension.y, tileId: tileId, transform: tileTransformModelSpace, tilePyramid: tilePyramid, lastTouched: tileId.isTemp ? -1 : frameCount, face: prefix, priority: priority, url: tileUrl
})
}
else {
visibleSet.byId[id].lastTouched = tileId.isTemp ? -1 : frameCount;
visibleSet.byId[id].priority = Math.max(tileId.priority, visibleSet.byId[id].priority);
delta.updated.push(id)
}
}
var old_and_new=(delta.added || []).concat(visibleSet || []);
var boundAtLod=[];
var maxLOD=Number.MIN_VALUE;
var minLOD=Number.MAX_VALUE;
for (var i=0; i < old_and_new.length; ++i) {
if (old_and_new[i].tilePyramid === tilePyramid) {
var tileId=old_and_new[i].tileId;
var lod=tileId.levelOfDetail;
if (!boundAtLod[lod]) {
boundAtLod[lod] = {};
boundAtLod[lod].x0 = Number.MAX_VALUE;
boundAtLod[lod].y0 = Number.MAX_VALUE;
boundAtLod[lod].x1 = Number.MIN_VALUE;
boundAtLod[lod].y1 = Number.MIN_VALUE
}
var b=boundAtLod[lod];
b.x0 = Math.min(b.x0, tileId.x);
b.y0 = Math.min(b.y0, tileId.y);
b.x1 = Math.max(b.x1, tileId.x + 1);
b.y1 = Math.max(b.y1, tileId.y + 1);
maxLOD = Math.max(maxLOD, tileId.levelOfDetail);
minLOD = Math.min(minLOD, tileId.levelOfDetail);
if (Math.abs(b.x0 - b.x1) > 100)
debugger
}
}
var x0=Number.MAX_VALUE;
var y0=Number.MAX_VALUE;
var x1=Number.MIN_VALUE;
var y1=Number.MIN_VALUE;
for (var l=minLOD; l <= maxLOD; l++) {
if (boundAtLod[l]) {
var b=boundAtLod[l];
var diff=maxLOD - l;
x0 = Math.min(b.x0 << diff, x0);
y0 = Math.min(b.y0 << diff, y0);
x1 = Math.max(b.x1 << diff, x1);
y1 = Math.max(b.y1 << diff, y1)
}
}
tileCoverage.initialize(maxLOD, x0, y0, x1, y1);
for (var i=0; i < old_and_new.length; ++i) {
var tile=old_and_new[i];
if (tile.tilePyramid === tilePyramid && tile.lastTouched === frameCount) {
if (!tile.fullyOpaque && !tile.tileId.isTemp) {
var descendents=tileCoverage.getDescendents(tile.tileId, function(tileIdStr) {
return visibleSet.byId[prefix + tileIdStr] == undefined ? false : true
});
for (var k=0; k < descendents.length; k++) {
visibleSet.byId[prefix + descendents[k]].keep = true
}
var ancestorId=tile.tileId;
while (ancestorId.levelOfDetail > tilePyramid.minimumLod) {
ancestorId = ancestorId.getParent();
if (visibleSet.byId[prefix + ancestorId] != undefined) {
visibleSet.byId[prefix + ancestorId].keep = true
}
}
}
}
}
for (var idStr in visibleSet.byId) {
var tile=visibleSet.byId[idStr];
if (!tile.keep && tile.lastTouched !== frameCount && tile.tilePyramid === tilePyramid) {
var justAdded=false;
for (var j=0; j < delta.added.length; ++j) {
if (delta.added[j] === idStr) {
delete delta.added[j];
justAdded = true;
break
}
}
if (!justAdded) {
delta.removed.push({id: idStr});
for (var u=0; u < delta.updated.length; u++) {
if (idStr == delta.updated[i])
debugger
}
}
}
if (tile.keep) {
tile.keep = false
}
}
return delta
}};
"use strict";
function JsonDownloadFailedError(message, innerException) {
this.message = message;
this.innerException = innerException
}
function JsonMalformedError(message, innerException) {
this.message = message;
this.innerException = innerException
}
var PhotosynthTileSource=function(baseUrl, atlasImage) {
this.getTileUrl = function(x, y, lod) {
if (lod === 7 && x === 0 && y === 0) {
return atlasImage
}
return baseUrl + lod + '/' + x + '_' + y + '.jpg'
}
};
var PartnerPanoramaTileSource=function(tileImageUriFormatString, width, height, tileSize, finestLod, numberOfLods, atlasImage) {
var defaultFinestLod=Math.ceil(Math.log(Math.max(width, height)) / Math.LN2);
var lodDelta=defaultFinestLod - finestLod;
var singleTileLod=Math.ceil(Math.log(tileSize) / Math.LN2);
var minLod=finestLod - numberOfLods;
var tempFinestLodFactor=1.0 / Math.pow(2, defaultFinestLod);
var horizontalTileCountMultiplier=width * tempFinestLodFactor;
var verticalTileCountMultiplier=height * tempFinestLodFactor;
this.getTileUrl = function(x, y, lod) {
var normalizedLod=lod - lodDelta;
if (normalizedLod == minLod && atlasImage && x == 0 && y == 0) {
return atlasImage
}
if (normalizedLod > finestLod || normalizedLod <= minLod) {
return null
}
var numHorizontalTilesAtLod=Math.ceil(Math.pow(2, lod - singleTileLod) * horizontalTileCountMultiplier);
var numVerticalTilesAtLod=Math.ceil(Math.pow(2, lod - singleTileLod) * verticalTileCountMultiplier);
return PhotosynthRml.partialDotNetStringFormat(tileImageUriFormatString, normalizedLod, x, y)
}
};
var PhotosynthRml={
faceNames: ['front', 'right', 'back', 'left', 'top', 'bottom'], jsonWrapper: 'http://photosynthjsonpwrapper.cloudapp.net/Wrap.aspx?jsonUrl={0}', jsonWrapperCid: 'http://photosynthjsonpwrapper.cloudapp.net/Wrap.aspx?cid={0}', jsonpWrapperParam: '&jsCallback={0}', addScriptElement: function addScriptElement(url) {
var scriptElement=document.createElement('script');
scriptElement.type = 'text/javascript';
scriptElement.language = 'javascript';
scriptElement.src = url;
document.getElementsByTagName('head')[0].appendChild(scriptElement)
}, createFromCid: function createFromCid(cid, callback) {
throw"createFromCid() has been deprecated";
}, createFromJsonUri: function createFromJsonUri(jsonUri, callback, cacheId) {
if (window.WinJS) {
PhotosynthRml.createFromFullUrl(jsonUri, callback, null, cacheId)
}
else {
PhotosynthRml.createFromFullUrl(PhotosynthRml.jsonWrapper.replace('{0}', encodeURIComponent(jsonUri)), callback, jsonUri, cacheId)
}
}, createFromSameDomainJsonUri: function createFromSameDomainJsonUri(jsonUri, callback) {
var request=new XMLHttpRequest;
request.open("GET", jsonUri, true);
request.onreadystatechange = function() {
if (request.readyState == 4) {
if (request.status == 200) {
PhotosynthRml.createFromJsonString(request.responseText, callback, jsonUri)
}
else {
callback(null, new JsonDownloadFailedError("Response status is not 200"))
}
}
};
request.send()
}, createFromJsonString: function createFromJsonString(jsonString, callback, jsonUri) {
var json=null;
try {
json = JSON.parse(jsonString)
}
catch(ex) {
callback(null, new JsonMalformedError("The data returned for the pano is not valid json", ex));
return
}
var rml=PhotosynthRml.createFromJson(json, jsonUri);
if (rml == null) {
callback(null, new JsonMalformedError("The data returned for the pano is valid json but is not valid panorama data"))
}
else {
callback(rml)
}
}, createFromFullUrl: function createFromFullUrl(url, callback, originalJsonUri, cacheId) {
if (window.WinJS) {
var createFromFullUrlWinApp=function(url, callback, originalJsonUri) {
WinJS.xhr({url: url}).then(function(response) {
if (response.status === 200) {
PhotosynthRml.createFromJsonString(response.responseText, callback, originalJsonUri || url)
}
else {
callback(null, new JsonDownloadFailedError("Response status is not 200"))
}
}, function(error) {
callback(null, new JsonDownloadFailedError("The url specified for the pano json data did not return a 200 success", error))
})
};
if (!(cacheId && PlatformJS && PlatformJS.Utilities)) {
createFromFullUrlWinApp(url, callback, originalJsonUri)
}
else {
PlatformJS.Utilities.downloadFile(cacheId, url).then(function(response) {
createFromFullUrlWinApp(response, callback, url)
}, function(error) {
callback(null, new JsonDownloadFailedError("The url specified for the pano json data did not return a 200 success", error))
})
}
}
else {
var globalCallbackName='PhotosynthCallback';
var i=0;
while (window[globalCallbackName + i] != null) {
i++
}
globalCallbackName = globalCallbackName + i;
window[globalCallbackName] = function(json) {
callback(PhotosynthRml.createFromJson(json, originalJsonUri || url));
delete window[globalCallbackName]
};
PhotosynthRml.addScriptElement(url + PhotosynthRml.jsonpWrapperParam.replace('{0}', globalCallbackName))
}
}, createFromJson: function createFromJson(json, jsonUri) {
var rml;
try {
if (json._json_synth && json._json_synth >= 1.01) {
var root,
propertyName;
for (propertyName in json.l) {
if (json.l.hasOwnProperty(propertyName)) {
root = json.l[propertyName];
break
}
}
var coordSystem=root.x[0];
var cubemap=coordSystem.cubemaps[0];
var bounds=cubemap.field_of_view_bounds;
var projector=coordSystem.r[0];
var rotationNode=projector.j;
var startRotationNode=projector.start_relative_rotation;
var startingPitch=0;
var startingHeading=0;
var author=root.b;
var attributionUrl=root.attribution_url;
var licenseUrl=root.c;
if (startRotationNode != null) {
var lookVector=new Vector3(0, 0, 1);
var rotation=PhotosynthRml.parseQuaternion(rotationNode[4], rotationNode[5], rotationNode[6]);
var startRelativeRotation=PhotosynthRml.parseQuaternion(startRotationNode[0], startRotationNode[1], startRotationNode[2]);
var combinedRotations=rotation.multiply(startRelativeRotation);
var startVector=combinedRotations.transform(lookVector);
startingPitch = MathHelper.halfPI - Math.acos(startVector.y);
startingHeading = Math.atan2(startVector.z, startVector.x)
}
var highlights=null;
if (root.highlight_map && root.highlight_map.default_highlight) {
highlights = root.highlight_map.default_highlight
}
var atlasImage=null;
if (cubemap.u && jsonUri) {
var baseUrl=jsonUri.substring(0, jsonUri.length - 6);
atlasImage = baseUrl + cubemap.u
}
rml = {
id: 'panorama' + propertyName, type: 'panorama', source: {
attribution: {
author: author, attributionUrl: attributionUrl, licenseUrl: licenseUrl
}, dimension: 0, tileSize: 254, tileOverlap: 1, tileBorder: 1, minimumLod: (atlasImage != null) ? 7 : 8, bounds: {
left: MathHelper.degreesToRadians(bounds[0]), right: MathHelper.degreesToRadians(bounds[1]), top: MathHelper.degreesToRadians(bounds[2]), bottom: MathHelper.degreesToRadians(bounds[3])
}, startingPitch: startingPitch, startingHeading: startingHeading, projectorAspectRatio: 1, projectorFocalLength: 0.5, highlights: highlights, atlasImage: atlasImage
}
};
for (var i=0; i < PhotosynthRml.faceNames.length; i++) {
var faceName=PhotosynthRml.faceNames[i];
var face=cubemap[faceName];
if (face != null) {
rml.source[faceName + 'Face'] = {
tileSource: (new PhotosynthTileSource(face.u, atlasImage)).getTileUrl, clip: face.clip.vertices
};
rml.source.dimension = Math.max(rml.source.dimension, face.d[0], face.d[1])
}
}
}
else if (json.json_pano) {
var tileOverlap=(json.tile_overlap_borders === false) ? 0 : 1;
var author=json.author;
var attributionUrl=PhotosynthRml.partialDotNetStringFormat(json.attribution_uri_format_string, 0, 0);
var licenseUrl=null;
var publisher=json.publisher;
rml = {
id: 'panorama' + propertyName, type: 'panorama', source: {
attribution: {
author: author, attributionUrl: attributionUrl, licenseUrl: licenseUrl, publisher: publisher
}, dimension: 0, tileSize: json.tile_size, tileOverlap: tileOverlap, tileBorder: tileOverlap, minimumLod: Math.ceil(Math.log(json.tile_size / Math.LN2)), bounds: {
left: 0, right: MathHelper.twoPI, top: -MathHelper.halfPI, bottom: MathHelper.halfPI
}, startingPitch: 0, startingHeading: 0, projectorAspectRatio: 1, projectorFocalLength: 0.5, atlasImage: json.atlas_image
}
};
if (json.field_of_view_bounds) {
rml.source.bounds = {
left: MathHelper.degreesToRadians(json.field_of_view_bounds[0]), right: MathHelper.degreesToRadians(json.field_of_view_bounds[1]), top: MathHelper.degreesToRadians(json.field_of_view_bounds[2]), bottom: MathHelper.degreesToRadians(json.field_of_view_bounds[3])
}
}
if (json.initial_look_direction) {
rml.source.startingPitch = MathHelper.degreesToRadians(json.initial_look_direction[0]);
rml.source.startingHeading = MathHelper.degreesToRadians(json.initial_look_direction[1])
}
for (var i=0; i < PhotosynthRml.faceNames.length; i++) {
var faceName=PhotosynthRml.faceNames[i];
var face=json[faceName];
if (face != null) {
var clip;
if (face.clip && face.clip.vertices) {
clip = face.clip.vertices
}
else {
clip = [0, 0, 0, face.dimensions[1], face.dimensions[0], face.dimensions[1], face.dimensions[0], 0]
}
rml.source[faceName + 'Face'] = {
tileSource: (new PartnerPanoramaTileSource(face.tile_image_uri_format_string, face.dimensions[0], face.dimensions[1], json.tile_size, face.finest_lod, face.number_of_lods, rml.source.atlasImage)).getTileUrl, clip: clip
};
rml.source.dimension = Math.max(rml.source.dimension, face.dimensions[0], face.dimensions[1]);
if (face.finest_lod != null && face.number_of_lods != null) {
var defaultFinestLod=Math.ceil(Math.log(rml.source.dimension) / Math.LN2);
rml.source.minimumLod = defaultFinestLod - face.number_of_lods + 1
}
}
}
if (rml.source.atlasImage != null) {
rml.source.minimumLod--
}
}
else {
return null
}
}
catch(e) {
if (window.console) {
Utils.log(e)
}
return null
}
return rml
}, parseQuaternion: function parseQuaternion(qx, qy, qz) {
var wSquared=1.0 - (qx * qx + qy * qy + qz * qz);
if (wSquared < MathHelper.zeroTolerance) {
wSquared = 0.0
}
return new Quaternion(Math.sqrt(wSquared), qx, qy, qz)
}, partialDotNetStringFormat: function partialDotNetStringFormat(formatString) {
if (arguments.length === 0) {
return ""
}
if (arguments.length === 1) {
return formatString
}
var result="";
var i=0;
while (i < formatString.length) {
var leftBrace=formatString.indexOf('{');
if (leftBrace === -1) {
return result + formatString
}
result += formatString.substr(0, leftBrace);
formatString = formatString.substr(leftBrace);
var rightBrace=formatString.indexOf('}');
if (rightBrace < 2) {}
var numberFormat=formatString.substr(1, rightBrace - 1);
formatString = formatString.substr(rightBrace + 1);
var numberFormatParts=numberFormat.split(':');
var arg=arguments[parseInt(numberFormatParts[0]) + 1];
if (numberFormatParts.length === 1) {
result += arg.toString()
}
else if (numberFormatParts[1] === 'X') {
result += arg.toString(16).toUpperCase()
}
else {
var out=arg.toString();
while (out.length < numberFormatParts[1].length) {
out = '0' + out
}
result += out
}
}
return result
}
};
"use strict";
var Panorama=function() {
var self=this;
self.frameCount = 0;
self.culler = new TiledImagePyramidCuller;
self.outputMultiLODTiles = false;
self.scanConvertSize = 20;
self.prevViewTransform = null;
self.prevProjectionTransform = null
};
Panorama.prototype = {
animationDurationMS: 250, cullCubeTiles: function cullCubeTiles(cubeSource, camera, visibleSet, isCachedUrl, useLowerLod, requiresTileOverlap) {
var delta={
added: [], removed: []
},
faceDelta,
i,
propertyName,
faceNames=['front', 'left', 'right', 'back', 'bottom', 'top'];
for (i = 0; i < faceNames.length; ++i) {
propertyName = faceNames[i] + 'Face';
if (cubeSource[propertyName]) {
faceDelta = this.cullFace(cubeSource.dimension, cubeSource.tileSize, cubeSource.minimumLod, cubeSource.tileOverlap, cubeSource.tileBorder, cubeSource[propertyName], faceNames[i], camera, visibleSet, isCachedUrl, useLowerLod, requiresTileOverlap, cubeSource.atlasImage);
delta.added = delta.added.concat(faceDelta.added);
delta.removed = delta.removed.concat(faceDelta.removed)
}
}
return delta
}, cullFace: function cullFace(dimension, tileSize, minimumLod, tileOverlap, tileBorder, face, name, camera, visibleSet, isCachedUrl, useLowerLod, requiresTileOverlap, atlasImage) {
if (!face.tilePyramid) {
face.tilePyramid = new TiledImagePyramid(name, dimension, dimension, tileSize, tileSize, minimumLod, (requiresTileOverlap) ? 1 : tileOverlap, (requiresTileOverlap) ? 1 : tileBorder, atlasImage);
if (requiresTileOverlap && tileOverlap == 0) {
face.tilePyramid.fakeTileOverlaps = true
}
}
if (!face.tileCoverage) {
face.tileCoverage = new TiledImagePyramidCoverageMap(face.tilePyramid.minimumLod, face.tilePyramid.finestLod)
}
if (!face.tileSource) {
throw'rml cube face requires tile source per face';
}
if (!face.isCachedTile) {
face.isCachedTile = function(x, y, lod) {
return isCachedUrl(face.tileSource(x, y, lod))
}
}
var faceClipBounds=this.getClipBounds(face.clip);
var delta=this.culler.cull(face.tilePyramid, face.tileCoverage, this.getFaceTransform, camera.getViewProjectionTransform(), camera.getViewport().getWidth(), camera.getViewport().getHeight(), faceClipBounds, visibleSet, name, face.tileSource, face.isCachedTile, this.frameCount, useLowerLod);
this.removeRenderablesBeingProcessed(delta);
return delta
}, removeRenderablesBeingProcessed: function removeRenderablesBeingProcessed(delta) {
if (this._renderablesBeingLoaded) {
this.removeCancelled(this._renderablesBeingLoaded, delta)
}
if (this._renderablesBeingAnimated) {
this.removeCancelled(this._renderablesBeingAnimated, delta)
}
}, removeCancelled: function removeCancelled(list, delta) {
for (var i=0; i < delta.removed.length; i++) {
var id=delta.removed[i].id;
if (list[id]) {
delete list[id]
}
}
}, getFaceTransform: function getFaceTransform(dimension, name) {
var centerUnitImageBaseImageResolution=Matrix4x4.createTranslation(-0.5, -0.5, 0).multiply(Matrix4x4.createScale(1.0 / dimension, 1.0 / dimension, 1.0));
var distanceFromCenterOfBubble=0.5;
var faceTransformBaseImageResolution;
switch (name) {
case'front':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(0, 0, -distanceFromCenterOfBubble).multiply(centerUnitImageBaseImageResolution);
break;
case'back':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(0, 0, distanceFromCenterOfBubble).multiply(Matrix4x4.createRotationY(MathHelper.degreesToRadians(180)).multiply(centerUnitImageBaseImageResolution));
break;
case'left':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(-distanceFromCenterOfBubble, 0, 0).multiply(Matrix4x4.createRotationY(MathHelper.degreesToRadians(90)).multiply(centerUnitImageBaseImageResolution));
break;
case'right':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(distanceFromCenterOfBubble, 0, 0).multiply(Matrix4x4.createRotationY(MathHelper.degreesToRadians(-90)).multiply(centerUnitImageBaseImageResolution));
break;
case'top':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(0, distanceFromCenterOfBubble, 0).multiply(Matrix4x4.createRotationX(MathHelper.degreesToRadians(90)).multiply(centerUnitImageBaseImageResolution));
break;
case'bottom':
faceTransformBaseImageResolution = Matrix4x4.createTranslation(0, -distanceFromCenterOfBubble, 0).multiply(Matrix4x4.createRotationX(MathHelper.degreesToRadians(-90)).multiply(centerUnitImageBaseImageResolution));
break;
default:
throw'unexpected cube face name';
break
}
return faceTransformBaseImageResolution
}, getClipBounds: function getClipBounds(vertices) {
if (vertices == null) {
return null
}
var minX=999999;
var minY=999999;
var maxX=-9999999;
var maxY=-9999999;
for (var i=0; i < vertices.length; i += 2) {
var x=vertices[i];
var y=vertices[i + 1];
if (x < minX) {
minX = x
}
if (x > maxX) {
maxX = x
}
if (y < minY) {
minY = y
}
if (y > maxY) {
maxY = y
}
}
return new Rectangle(minX, minY, maxX - minX, maxY - minY)
}, createController: function createController(initialPanoramaEntities, camera, cameraParameters) {
var cameraController=new RotationalFixedPositionCameraController(camera);
if (initialPanoramaEntities && initialPanoramaEntities[0]) {
var cubeSource=initialPanoramaEntities[0].source;
if (cubeSource.startingPitch != undefined) {
cameraController.setPitchAndHeading(cubeSource.startingPitch, cubeSource.startingHeading)
}
var leftBound=cubeSource.bounds.left;
var rightBound=cubeSource.bounds.right;
var topBound=cubeSource.bounds.top;
var bottomBound=cubeSource.bounds.bottom;
var leftRightDelta=rightBound - leftBound;
while (leftRightDelta <= 0) {
leftRightDelta += 2 * MathHelper.PI
}
var borderBufferPercentage=1.05;
var maxAllowedFov=MathHelper.degreesToRadians(90);
var maxHorizontalFov=Math.min(maxAllowedFov, leftRightDelta * borderBufferPercentage);
var maxVerticalFov=Math.min(maxAllowedFov, (bottomBound - topBound) * borderBufferPercentage);
var finalFov=Math.max(maxVerticalFov, Math.min(maxAllowedFov, Viewport.convertHorizontalToVerticalFieldOfView(camera.getViewport().getAspectRatio(), maxHorizontalFov)));
var maxFovAsHorizontal=Viewport.convertVerticalToHorizontalFieldOfView(camera.getViewport().getAspectRatio(), finalFov);
finalFov = Viewport.convertHorizontalToVerticalFieldOfView(camera.getViewport().getAspectRatio(), Math.min(maxAllowedFov, maxFovAsHorizontal));
cameraController = new RotationalFixedPositionCameraController(camera, -topBound, -bottomBound, rightBound, leftBound, cubeSource.dimension);
cameraController.setVerticalFov(finalFov)
}
return cameraController
}, cull: function cull(panoramaEntities, camera, visibleSet, isCachedUrl, useLowerFidelity, requiresTileOverlap) {
var i,
j,
k,
panoramaTiles,
result={
added: [], removed: []
};
for (i = 0; i < panoramaEntities.length; ++i) {
panoramaTiles = this.cullCubeTiles(panoramaEntities[i].source, camera, visibleSet, isCachedUrl, useLowerFidelity, requiresTileOverlap);
result.added = result.added.concat(panoramaTiles.added);
result.removed = result.removed.concat(panoramaTiles.removed)
}
++this.frameCount;
return result
}, generateRenderables: function generateRenderables(visibleEntities, renderer) {
var self=this;
var i,
renderable,
renderables=[];
if (!this._renderablesBeingLoaded) {
this._renderablesBeingLoaded = {}
}
var faceAtlasOffsets={
front: 0, right: 1, back: 2, left: 3, bottom: 4, top: 5
};
for (i = 0; i < visibleEntities.length; ++i) {
(function() {
var entity=visibleEntities[i];
var callbackInfo={};
var offsetX=0;
var offsetY=0;
if (entity.tilePyramid.isAtlasTile(entity.tileId)) {
offsetX = faceAtlasOffsets[entity.face] * entity.tileWidth
}
renderable = new TexturedQuadRenderable(entity.tileWidth, entity.tileHeight, entity.transform, entity.url, null, null, false, offsetX, offsetY);
renderable._entity = entity;
renderable.entityId = entity.id;
renderable._order = entity.tileId.levelOfDetail;
if (entity.tileId.isTemp || entity.tileId.cached) {
entity.fullyOpaque = true
}
else {
entity.fullyOpaque = false
}
entity.loaded = false;
renderables.push(renderable);
self._renderablesBeingLoaded[entity.id] = renderable
}())
}
return renderables
}, updateRenderableStates: function updateRenderableStates(renderer) {
var animateTileEntry=true;
if (!this._renderablesBeingAnimated) {
this._renderablesBeingAnimated = {}
}
if (this._renderablesBeingLoaded) {
var toDelete=[];
for (var id in this._renderablesBeingLoaded) {
var r=this._renderablesBeingLoaded[id];
var entity=r._entity;
var tileId=entity.tileId;
if (r._material._texture._isReady) {
if (animateTileEntry && !tileId.isTemp && !tileId.isLowerLod) {
renderer.animate(r, {opacity: 0.0}, {opacity: 1.0}, this.animationDurationMS, 'ease-in-out');
entity.fullyOpaque = false;
this._renderablesBeingAnimated[id] = r
}
else {
entity.fullyOpaque = true
}
toDelete.push(id)
}
}
for (var i=0; i < toDelete.length; i++) {
delete this._renderablesBeingLoaded[toDelete[i]]
}
}
if (this._renderablesBeingAnimated) {
var toDelete=[];
for (var id in this._renderablesBeingAnimated) {
var r=this._renderablesBeingAnimated[id];
if (r._material._animation._ended) {
toDelete.push(id);
r._entity.fullyOpaque = true
}
}
for (var i=0; i < toDelete.length; i++) {
delete this._renderablesBeingAnimated[toDelete[i]]
}
}
}, fetch: function fetch(entities, downloader) {
var i;
if (entities.removed) {
for (i = 0; i < entities.removed.length; ++i) {
downloader.cancel(entities.removed[i].id)
}
}
if (entities.updated) {
for (i = 0; i < entities.updated.length; ++i) {
downloader.updatePriority(entities.updated[i].url, entities.added[i].priority)
}
}
if (entities.added) {
for (i = 0; i < entities.added.length; ++i) {
downloader.downloadImage(entities.added[i].url, entities.added[i].priority, entities.added[i].id)
}
}
}, _drawBorders: function _drawBorders(currentTileContext, currentImage, neighborTexture, xOffset, yOffset) {
var neighborSourceImage=neighborTexture._sourceImage;
var neighborCanvas=neighborTexture._image;
if (neighborSourceImage == null || neighborCanvas == null) {
return
}
var neighborContext=neighborCanvas.getContext('2d');
currentTileContext.drawImage(neighborSourceImage, 1 + xOffset, 1 + yOffset);
neighborContext.drawImage(currentImage, 1 - xOffset, 1 - yOffset)
}, _neighborOffsets: [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [-1, 0]], _processDownload: function _processDownload(img, renderable, entityIdToRenderable, renderer) {
var texture=renderable._material._texture;
var entity=renderable._entity;
var tilePyramid=entity.tilePyramid;
var tileId=entity.tileId;
if (texture._image != null) {
return
}
if (tilePyramid.isAtlasTile(tileId)) {
var dimensions=tilePyramid.getTileDimensions(tileId);
var canvas=document.createElement('canvas');
canvas.width = dimensions.x;
canvas.height = dimensions.y;
var context=canvas.getContext('2d');
var offsetX=texture._offsetX;
var offsetY=texture._offsetY;
var width=texture._width;
var height=texture._height;
context.drawImage(img, offsetX, offsetY, width, height, 0, 0, canvas.width, canvas.height);
if (tilePyramid.fakeTileOverlaps) {
context.drawImage(img, offsetX, offsetY, width, height, 1, 1, canvas.width - 1, canvas.height - 1)
}
texture._image = canvas;
texture._sourceImage = img
}
else if (tilePyramid.fakeTileOverlaps) {
var canvas=document.createElement('canvas');
canvas.width = tilePyramid.tileWidth + 2;
canvas.height = tilePyramid.tileHeight + 2;
var context=canvas.getContext('2d');
context.drawImage(img, 0, 0, tilePyramid.tileWidth + 2, tilePyramid.tileHeight + 2);
context.drawImage(img, 1, 1);
for (var j=0; j < this._neighborOffsets.length; j++) {
var neighborOffset=this._neighborOffsets[j];
var neighbor=new TileId(tileId.levelOfDetail, tileId.x + neighborOffset[0], tileId.y + neighborOffset[1]);
var neighborEntityId=entity.face + neighbor.toString();
var neighborRenderableId=entityIdToRenderable[neighborEntityId];
if (neighborRenderableId && renderer._renderables[neighborRenderableId]) {
var neighborTexture=renderer._renderables[neighborRenderableId]._material._texture;
this._drawBorders(context, img, neighborTexture, tilePyramid.tileWidth * neighborOffset[0], tilePyramid.tileHeight * neighborOffset[1])
}
}
texture._image = canvas;
texture._sourceImage = img
}
else {
texture._image = img
}
texture._isReady = true;
texture._isDirty = true
}, processDownloads: function processDownloads(completed, entityIdToRenderable, renderer) {
for (var i=0; i < completed.length; ++i) {
var img=completed[i];
var renderableId=entityIdToRenderable[img.token];
if (renderableId && renderer._renderables[renderableId]) {
var renderable=renderer._renderables[renderableId];
var entity=renderable._entity;
if (entity.tilePyramid.isAtlasTile(entity.tileId)) {
this.atlasImage = img
}
else {
this._processDownload(img, renderable, entityIdToRenderable, renderer)
}
}
else {
Utils.log('error renderableId : ' + renderableId + 'is not in the scene')
}
}
if (this.atlasImage) {
for (var entityId2 in entityIdToRenderable) {
var renderableId2=entityIdToRenderable[entityId2];
var renderable2=renderer._renderables[renderableId2];
if (renderable2 && renderable2._entity) {
var entity2=renderable2._entity;
if (entity2.tilePyramid.isAtlasTile(entity2.tileId)) {
this._processDownload(this.atlasImage, renderable2)
}
}
}
}
}, parseQuaternion: function parseQuaternion(qx, qy, qz) {
var wSquared=1.0 - (qx * qx + qy * qy + qz * qz);
if (wSquared < MathHelper.zeroTolerance) {
wSquared = 0.0
}
return new Quaternion(Math.sqrt(wSquared), qx, qy, qz)
}
};
Config.PanoramaExists = true;
"use strict";
var AttributionControl=function(parentDiv) {
var self=this;
self.lastAttribution = null;
var layout=['<div id="attributionControl" class="panoramaAttributionControl panoramaAttributionControlContainer" >', '<a id="icon_anchor" class="panoramaAttributionControl">', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="by_icon"></div>', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="nc_icon"></div>', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="nd_icon"></div>', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="sa_icon"></div>', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="pd_icon"></div></a>', '<div class="panoramaAttributionControl  panoramaAttributionControlIcon" id="copyright_icon"></div>', '<a class="panoramaAttributionControl" id="authorTextAnchor" href=""><span class="panoramaAttributionControl panoramaAttributionControlText"  id="authorText"></span></a>', '<span class="panoramaAttributionControl panoramaAttributionControlText"  id="authorTextNoAnchor"></span>', '<span class="panoramaAttributionControl panoramaAttributionControlText" id="attributionDash">&ndash;</span>', '<a class="panoramaAttributionControl" id="publisherTextAnchor" href=""><span id="publisherText"class="panoramaAttributionControl panoramaAttributionControlText" ></span></a>', '</div>'].join(' ');
var domAttributePrefix="$$$$";
var div=document.createElement('div');
parentDiv.appendChild(div);
if (typeof MSApp == 'object' && MSApp.execUnsafeLocalFunction) {
MSApp.execUnsafeLocalFunction(function() {
div.innerHTML = layout
})
}
else {
div.innerHTML = layout
}
parentDiv.removeChild(div);
var controlDiv=div.firstChild;
parentDiv.appendChild(controlDiv);
var hide=function(element) {
if (!element[domAttributePrefix + 'displayValue']) {
var oldValue=element.style.display || window.getComputedStyle(element, null).getPropertyValue('display');
element[domAttributePrefix + 'displayValue']
}
Utils.css(element, {display: 'none'})
};
var show=function(element) {
var originalValue=element[domAttributePrefix + 'displayValue'] || ((element.tagName === 'A' || element.tagName === 'SPAN') ? 'inline' : 'inline-block');
Utils.css(element, {display: originalValue})
};
var qs=function(id, rootElement) {
if (!rootElement) {
rootElement = document
}
return rootElement.querySelector(id)
};
var text=function(element, value) {
element.innerHTML = value
};
Utils.css(controlDiv, {display: 'block'});
hide(controlDiv);
var allIcons=['pd_icon', 'by_icon', 'sa_icon', 'nc_icon', 'nd_icon', 'copyright_icon'];
var ccAttributionType={
publicDomain: {
pattern: '/publicdomain/', text: 'This work is identified as Public Domain.', url: 'http://creativecommons.org/licenses/publicdomain/', iconsToShow: ['pd_icon']
}, by: {
pattern: '/by/', text: 'This work is licensed to the public under the Creative Commons Attribution license.', url: 'http://creativecommons.org/licenses/by/3.0/', iconsToShow: ['by_icon']
}, bySa: {
pattern: '/by-sa/', text: 'This work is licensed to the public under the Creative Commons Attribution-ShareAlike license.', url: 'http://creativecommons.org/licenses/by-sa/3.0/', iconsToShow: ['by_icon', 'sa_icon']
}, byNd: {
pattern: '/by-nd/', text: 'This work is licensed to the public under the Creative Commons Attribution-NoDerivatives license.', url: 'http://creativecommons.org/licenses/by-nd/3.0/', iconsToShow: ['by_icon', 'nd_icon']
}, byNc: {
pattern: '/by-nc/', text: 'This work is licensed to the public under the Creative Commons Attribution-Non-commercial license.', url: 'http://creativecommons.org/licenses/by-nc/3.0/', iconsToShow: ['by_icon', 'nc_icon']
}, byNcSa: {
pattern: '/by-nc-sa/', text: 'This work is licensed to the public under the Creative Commons Attribution-Non-commercial-ShareAlike license.', url: 'http://creativecommons.org/licenses/by-nc-sa/3.0/', iconsToShow: ['by_icon', 'nc_icon', 'sa_icon']
}, byNcNd: {
pattern: '/by-nc-nd/', text: 'This work is licensed to the public under the Creative Commons Attribution-Non-commercial-NoDerivatives license.', url: 'http://creativecommons.org/licenses/by-nc-nd/3.0/', iconsToShow: ['by_icon', 'nc_icon', 'nd_icon']
}, copyright: {
pattern: '', text: 'This work is copyrighted.', url: '', iconsToShow: ['copyright_icon']
}
};
var hideUI=function() {
hide(controlDiv)
};
var updateUI=function(attribution) {
var k,
i,
icon,
el,
attributionType=ccAttributionType.copyright;
hide(controlDiv);
el = qs('#publisherText', controlDiv);
hide(el);
text(el, '');
el = qs('#authorText', controlDiv);
hide(el);
text(el, '');
el = qs('#authorTextAnchor', controlDiv);
hide(el);
el.title = '';
el.href = '';
el = qs('#authorTextNoAnchor', controlDiv);
hide(el);
text(el, '');
el = qs('#attributionDash', controlDiv);
hide(el);
for (i = 0; i < allIcons.length; ++i) {
el = qs('#' + allIcons[i], controlDiv);
hide(el)
}
el = qs('#icon_anchor', controlDiv);
el.href = '';
el.title = '';
for (k in ccAttributionType)
if (ccAttributionType.hasOwnProperty(k)) {
if (attribution && attribution.licenseUrl && attribution.licenseUrl.indexOf(ccAttributionType[k].pattern) != -1) {
attributionType = ccAttributionType[k];
break
}
}
for (i = 0; i < attributionType.iconsToShow.length; ++i) {
icon = attributionType.iconsToShow[i];
el = qs('#' + icon, controlDiv);
show(el)
}
el = qs('#icon_anchor', controlDiv);
el.title = attributionType.text;
el.href = attributionType.url || attribution.attributionUrl;
if (!attribution.author && attribution.publisher) {
el = qs('#publisherText', controlDiv);
hide(el);
text(el, '');
el = qs('#publisherTextAnchor', controlDiv);
hide(el);
text(el, '');
if (attribution.attributionUrl) {
el = qs('#authorText', controlDiv);
show(el);
text(el, attribution.publisher);
el = qs('#authorTextAnchor', controlDiv);
show(el);
el.href = attribution.attributionUrl;
el.title = attribution.attributionUrl
}
else {
el = qs('#authorTextNoAnchor', controlDiv);
show(el);
text(el, attribution.publisher)
}
}
else {
if (attribution.publisher) {
el = qs('#publisherText', controlDiv);
show(el);
text(el, attribution.publisher);
el = qs('#publisherTextAnchor', controlDiv);
show(el);
el.href = attribution.attributionUrl;
el.title = attribution.attributionUrl;
el = qs('#attributionDash', controlDiv);
show(el)
}
else {
el = qs('#publisherText', controlDiv);
hide(el);
text(el, '')
}
if (attribution.author) {
if (attribution.attributionUrl) {
el = qs('#authorText', controlDiv);
show(el);
text(el, attribution.author);
el = qs('#authorTextAnchor', controlDiv);
show(el);
el.href = attribution.attributionUrl;
el.title = attribution.attributionUrl
}
else {
el = qs('#authorTextNoAnchor', controlDiv);
show(el);
text(el, attribution.author)
}
}
}
show(controlDiv)
};
self.setAttribution = function(attribution) {
if ((self.lastAttribution != null && attribution.author === self.lastAttribution.author && attribution.publisher === self.lastAttribution.publisher && attribution.attributionUrl === self.lastAttribution.attributionUrl && attribution.licenseUrl === self.lastAttribution.licenseUrl) || self.lastAttribution === null) {
updateUI(attribution);
self.lastAttribution = attribution
}
};
self.clearAttrubution = function() {
self.lastAttribution = null;
hideUI()
};
self.dispose = function() {
if (controlDiv && controlDiv.parentNode) {
controlDiv.parentNode.removeChild(controlDiv);
controlDiv = null
}
}
};
"use strict";
function GestureHelper(elem, options) {
var elem=elem;
var gestureStartCallback=options.gestureStart || function(){};
var gestureChangeCallback=options.gestureChange || function(){};
var gestureEndCallback=options.gestureEnd || function(){};
var discreteZoomCallback=options.discreteZoom || function(){};
var keyDownCallback=options.keyDown || function(){};
var keyUpCallback=options.keyUp || function(){};
var enabled=false;
var msGesture;
function onGestureStart(e) {
e.type = 'gestureStart';
gestureStartCallback(e)
}
function onGestureChange(e) {
e.type = 'gestureChange';
gestureChangeCallback(e)
}
function onGestureEnd(e) {
e.type = 'gestureEnd';
gestureEndCallback(e);
keyboardFocusElement.focus()
}
function onDiscreteZoom(e) {
e.type = 'discreteZoom';
discreteZoomCallback(e)
}
function onKeyDown(e) {
keyDownCallback(e)
}
function onKeyUp(e) {
keyUpCallback(e)
}
var msGestureGoing=false;
var msPointerCount=0;
function msPointerDown(e) {
try {
msGesture.addPointer(e.pointerId);
elem.msSetPointerCapture(e.pointerId);
if (msPointerCount === 0) {
msPointerCount = 1;
onGestureStart({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY
});
totalTranslationX = 0;
totalTranslationY = 0;
totalScale = 1
}
}
catch(e) {}
}
function msPointerUp(e) {
if (!msGestureGoing && msPointerCount === 1) {
onGestureEnd({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: totalTranslationX, translationY: totalTranslationY, scale: totalScale
})
}
msPointerCount--;
if (msPointerCount < 0) {
msPointerCount = 0
}
}
var totalTranslationX;
var totalTranslationY;
var totalScale;
function msGestureStart(e) {
msGestureGoing = true
}
function msGestureChange(e) {
if (msGestureGoing) {
totalTranslationX += e.translationX;
totalTranslationY += e.translationY;
totalScale *= e.scale;
if (e.detail & e.MSGESTURE_FLAG_INERTIA) {
onGestureEnd({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: totalTranslationX, translationY: totalTranslationY, scale: totalScale
});
msGestureGoing = false
}
else {
onGestureChange({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: totalTranslationX, translationY: totalTranslationY, scale: totalScale
})
}
}
}
function msGestureEnd(e) {
if (msGestureGoing) {
onGestureEnd({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: totalTranslationX, translationY: totalTranslationY, scale: totalScale
})
}
}
var mouseDownPos=null;
function mouseDown(e) {
onGestureStart({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY
});
mouseDownPos = {
x: e.clientX, y: e.clientY
};
e.preventDefault()
}
function mouseMove(e) {
if (mouseDownPos != null) {
onGestureChange({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: e.clientX - mouseDownPos.x, translationY: e.clientY - mouseDownPos.y, scale: 1
});
e.preventDefault()
}
}
function mouseUp(e) {
if (mouseDownPos != null) {
onGestureEnd({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, translationX: e.clientX - mouseDownPos.x, translationY: e.clientY - mouseDownPos.y, scale: 1
});
mouseDownPos = null;
e.preventDefault()
}
}
function mouseWheel(e) {
var wheelDelta=e.detail ? e.detail * -1 : e.wheelDelta * 0.025;
var direction;
if (wheelDelta > 0) {
direction = 1
}
else if (wheelDelta < 0) {
direction = -1
}
onDiscreteZoom({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, direction: direction
});
e.preventDefault()
}
function doubleClick(e) {
onDiscreteZoom({
clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, direction: 1
});
e.preventDefault()
}
function gestureStart(e){}
function gestureChange(e){}
function gestureEnd(e){}
var attachHandlers;
var detachHandlers;
if (window.navigator.msPointerEnabled) {
attachHandlers = function() {
msGesture = new MSGesture;
msGesture.target = elem;
elem.addEventListener("MSPointerDown", msPointerDown, false);
elem.addEventListener("MSPointerUp", msPointerUp, false);
elem.addEventListener('MSGestureStart', msGestureStart, true);
elem.addEventListener('MSGestureChange', msGestureChange, true);
elem.addEventListener('MSGestureEnd', msGestureEnd, true);
elem.addEventListener('dblclick', doubleClick, false);
elem.addEventListener('mousewheel', mouseWheel, false)
};
detachHandlers = function() {
elem.removeEventListener("MSPointerDown", msPointerDown, false);
elem.removeEventListener("MSPointerUp", msPointerUp, false);
elem.removeEventListener('MSGestureStart', msGestureStart, true);
elem.removeEventListener('MSGestureChange', msGestureChange, true);
elem.removeEventListener('MSGestureEnd', msGestureEnd, true);
elem.removeEventListener('dblclick', doubleClick, false);
elem.removeEventListener('mousewheel', mouseWheel, false);
msGesture = null
}
}
else if (window.ontouchstart) {}
else {
attachHandlers = function() {
elem.addEventListener('mousedown', mouseDown, false);
elem.addEventListener('mousemove', mouseMove, false);
elem.addEventListener('mouseup', mouseUp, false);
elem.addEventListener('mousewheel', mouseWheel, false);
elem.addEventListener('DOMMouseScroll', mouseWheel, false);
elem.addEventListener('dblclick', doubleClick, false);
document.addEventListener('mousemove', mouseMove, false);
document.addEventListener('mouseup', mouseUp, false)
};
detachHandlers = function() {
elem.removeEventListener('mousedown', mouseDown, false);
elem.removeEventListener('mousemove', mouseMove, false);
elem.removeEventListener('mouseup', mouseUp, false);
elem.removeEventListener('mousewheel', mouseWheel, false);
elem.removeEventListener('DOMMouseScroll', mouseWheel, false);
elem.removeEventListener('dblclick', doubleClick, false);
document.removeEventListener('mousemove', mouseMove, false);
document.removeEventListener('mouseup', mouseUp, false)
}
}
var keyboardFocusElement=document.createElement('input');
keyboardFocusElement.readOnly = true;
Utils.css(keyboardFocusElement, {
width: '0px', height: '0px', opacity: 0
});
var attachKeyboardHandlers=function() {
elem.appendChild(keyboardFocusElement);
keyboardFocusElement.addEventListener('keydown', onKeyDown, false);
keyboardFocusElement.addEventListener('keyup', onKeyUp, false);
keyboardFocusElement.focus()
};
var detachKeyboardHandlers=function() {
keyboardFocusElement.removeEventListener('keydown', onKeyDown, false);
keyboardFocusElement.removeEventListener('keyup', onKeyUp, false);
if (keyboardFocusElement.parentNode) {
keyboardFocusElement.parentNode.removeChild(keyboardFocusElement)
}
};
this.enable = function() {
attachHandlers();
attachKeyboardHandlers();
enabled = true
};
this.disable = function() {
detachHandlers();
detachKeyboardHandlers();
enabled = false
};
this.isEnabled = function() {
return enabled
};
this.userCurrentlyInteracting = function() {
return msPointerCount > 0
};
this.focusKeyboardElement = function() {
keyboardFocusElement.focus()
}
}
"use strict";
function QueuedGestureHelper(elem) {
var eventQueue=[];
function eventHandler(e) {
eventQueue.push(e)
}
var gestureHelper=new GestureHelper(elem, {
gestureStart: eventHandler, gestureChange: eventHandler, gestureEnd: eventHandler, discreteZoom: eventHandler, keyDown: eventHandler, keyUp: eventHandler
});
this.enable = function() {
gestureHelper.enable()
};
this.disable = function() {
gestureHelper.disable()
};
this.isEnabled = function() {
return gestureHelper.isEnabled()
};
this.getQueuedEvents = function() {
var temp=eventQueue;
eventQueue = [];
return temp
};
this.userCurrentlyInteracting = function() {
return gestureHelper.userCurrentlyInteracting()
};
this.focusKeyboardElement = function() {
gestureHelper.focusKeyboardElement()
}
}
"use strict";
var requestAnimationFrame=window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame || function(callback, element) {
window.setTimeout(callback, 1000 / 30)
};
var RwwViewer=function(parentDiv, options) {
var self=this,
options=options || {},
attributionChanged=options.attributionChanged || function(){},
animating=true,
rootElement=document.createElement('div'),
eventCapturingElement=document.createElement('div'),
scene=new RMLStore,
showDebugMessages=true,
unprocessedEvents=[],
tileCacheId=options.tileCacheId || null;
self.mediaType = {};
if (Config.PanoramaExists) {
self.mediaType['panorama'] = new Panorama
}
if (Config.StreetsidePanoramaExists) {
self.mediaType['streetsidePanorama'] = new StreetsidePanorama
}
if (Config.MapExists) {
self.mediaType['map'] = new Map
}
if (!parentDiv) {
throw'expected div argument';
}
if (options.url) {}
else if (options.rml) {
scene.add(options.rml)
}
else {
throw'expected either url or rml property passed in the options object';
}
var width=options.width || parentDiv.offsetWidth;
var height=options.height || parentDiv.offsetHeight;
Utils.css(parentDiv, {direction: 'ltr'});
Utils.css(rootElement, {
width: width + 'px', height: height + 'px', position: 'absolute', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,1)', direction: 'ltr', 'touch-action': 'none'
});
Utils.css(eventCapturingElement, {
width: width + 'px', height: height + 'px', position: 'absolute', backgroundColor: 'rgba(0,0,0,0)', webkitTapHighlightColor: 'rgba(0,0,0,1)', tabIndex: 0, opacity: 0, 'touch-action': 'none'
});
var renderer;
var near=0.00001;
var far=4;
var requiresCORS=false;
var requiresTileOverlap=false;
switch (options.renderer) {
case'css':
renderer = new RendererCSS3D(rootElement, width, height);
requiresTileOverlap = true;
break;
case'webgl':
renderer = new RendererWebGL(rootElement, width, height);
requiresCORS = true;
break;
case'flash':
renderer = new RendererFlash(rootElement, width, height);
requiresTileOverlap = true;
break;
default:
try {
renderer = new RendererWebGL(rootElement, width, height);
requiresCORS = true
}
catch(ex) {
try {
if (rootElement.parentNode) {
rootElement.parentNode.removeChild(rootElement)
}
requiresTileOverlap = true;
renderer = new RendererCSS3D(rootElement, width, height)
}
catch(ex2) {
if (rootElement.parentNode) {
rootElement.parentNode.removeChild(rootElement)
}
renderer = null
}
}
if (renderer == null) {
throw'Could not create CSS3 or webgl renderer' + options.renderer;
}
break
}
parentDiv.appendChild(rootElement);
parentDiv.appendChild(eventCapturingElement);
var gestureHelper=new QueuedGestureHelper(eventCapturingElement);
gestureHelper.enable();
if (options.backgroundColor) {
renderer.setClearColor(options.backgroundColor)
}
var attributionControl=null;
if (!options.hideAttribution && options.rml.source && options.rml.source.attribution) {
attributionControl = new AttributionControl(parentDiv);
attributionControl.setAttribution(options.rml.source.attribution)
}
if (options.rml.source && options.rml.source.attribution) {
attributionChanged(options.rml.source.attribution)
}
var tileDownloadFailed=function(failCount, successCount) {
if (downloader.customFailFunc)
downloader.customFailFunc();
if (options.tileDownloadFailed)
options.tileDownloadFailed(failCount, successCount);
if (Config.tileDownloadFailed)
Config.tileDownloadFailed()
};
var downloader=new PriorityNetworkDownloader(requiresCORS, tileDownloadFailed, options.tileDownloadSucceeded, tileCacheId);
var viewport=new Viewport(width, height, near, far);
var camera=new PerspectiveCamera;
camera.setViewport(viewport);
var cameraParameters=options.cameraParameters || {
verticalFov: MathHelper.degreesToRadians(80), position: new Vector3(0, 0, 0), look: new Vector3(0, 0, -1), up: new Vector3(0, 1, 0), side: new Vector3(1, 0, 0)
};
camera.setPosition(cameraParameters.position);
camera.setLook(cameraParameters.look);
camera.setUp(cameraParameters.up);
camera.setVerticalFov(cameraParameters.verticalFov);
var activeController;
objectCollection.loopByType(scene, function(k, entities) {
if (entities.length > 0 && self.mediaType[k] && self.mediaType[k].createController) {
activeController = self.mediaType[k].createController(entities, camera, cameraParameters);
if (self.mediaType[k].outputMultiLODTiles != null) {
Config.outputMultiLODTiles = self.mediaType[k].outputMultiLODTiles
}
if (self.mediaType[k].scanConvertSize != null) {
Config.scanConvertSize = self.mediaType[k].scanConvertSize
}
}
});
var entityIdToRenderable={};
var visibleSet={byType: {}};
var animatingOut=[];
var prevFrame=new Date;
var prevSmoothedFrame=new Date;
var smoothedFrameCount=0;
var smoothedFramerate=0;
var isCachedUrl=function(url) {
var state=downloader.getState(url);
return (state === TileDownloadState.ready)
};
var hasBlockingDownload=false;
var blockingDownloadTargetCount=-1,
blockingDownloadSuccessCount=0,
blockingDownloadFailureCount=0,
blockingDownloadProgressCallback=null,
blockingDownloadFinishCallback=null;
var prefetchedTiles={};
var updateFrame=function() {
if (hasBlockingDownload) {
blockingDownloadSuccessCount += downloader.completed.length;
downloader.update();
blockingDownloadProgressCallback(blockingDownloadSuccessCount);
if (blockingDownloadSuccessCount + blockingDownloadFailureCount == blockingDownloadTargetCount) {
blockingDownloadFinishCallback(blockingDownloadSuccessCount, blockingDownloadFailureCount);
self._resetDownloadAll()
}
else {
if (animating) {
++frameCount;
requestAnimationFrame(updateFrame)
}
return
}
}
var i,
j,
k,
frustum,
entity,
pendingFetch=[],
loaded=[],
deltaVisibleSet={byType: {}};
var networkUpdate={
added: [], removed: []
};
for (i = 0; i < networkUpdate.removed.length; ++i) {
var obj=scene.byId[networkUpdate.removed[i]];
deltaVisibleSet.byType[obj.type].removed = deltaVisibleSet.byType[obj.type].removed || [];
deltaVisibleSet.byType[obj.type].removed.push(obj.id)
}
;
camera = activeController.control(camera, gestureHelper.getQueuedEvents());
var pose=camera.getPose();
var toleranceInPixels=(self.prevCameraMoving) ? 0.1 : 1;
var userInteracting=gestureHelper.userCurrentlyInteracting();
var cameraMoving=(self.prevPose != null && !self.prevPose.isFuzzyEqualTo(pose, toleranceInPixels));
var userInteractingWaitTime=1000;
if (userInteracting) {
self.userInteractingTime = null
}
else if (self.prevUserInteracting) {
var now=(new Date).valueOf();
if (self.userInteractingTime == null) {
self.userInteractingTime = now + userInteractingWaitTime
}
if (self.userInteractingTime > now) {
userInteracting = true
}
else {
self.userInteractingTime = null
}
}
var useLowerFidelity=userInteracting || cameraMoving;
var fidelityChanged=(useLowerFidelity !== self.prevUseLowerFidelity);
var doWorkThisFrame=fidelityChanged || useLowerFidelity || downloader.currentlyDownloading() || !self.prevPose.isFuzzyEqualTo(pose, 0.0001);
var doWorkWaitTime=500;
if (doWorkThisFrame) {
self.doWorkTime = null
}
else if (self.prevDoWorkThisFrame) {
var now=(new Date).valueOf();
if (self.doWorkTime == null) {
self.doWorkTime = now + doWorkWaitTime
}
if (self.doWorkTime > now) {
doWorkThisFrame = true
}
else {
self.doWorkTime = null
}
}
self.prevPose = pose;
self.prevUserInteracting = userInteracting;
self.prevCameraMoving = cameraMoving;
self.prevUseLowerFidelity = useLowerFidelity;
self.prevDoWorkThisFrame = doWorkThisFrame;
if (doWorkThisFrame) {
objectCollection.loopByType(scene, function(k, entities) {
if (entities.length > 0 && self.mediaType[k] && self.mediaType[k].cull) {
visibleSet.byType[k] = visibleSet.byType[k] || [];
if (!visibleSet.byType[k].byId) {
visibleSet.byType[k].byId = {}
}
deltaVisibleSet.byType[k] = self.mediaType[k].cull(entities, camera, visibleSet.byType[k], isCachedUrl, useLowerFidelity, requiresTileOverlap)
}
});
objectCollection.loopByType(deltaVisibleSet, function(k, entities) {
if (self.mediaType[k] && self.mediaType[k].fetch) {
self.mediaType[k].fetch(entities, downloader)
}
});
var renderableToRemove=[];
var renderableToAdd=[];
var renderableEntityId=[];
objectCollection.loopByType(deltaVisibleSet, function(k, entities) {
var i=0,
id,
generatedRenderable;
if (entities.removed) {
for (i = 0; i < entities.removed.length; ++i) {
var id=entities.removed[i].id;
renderableToRemove.push(entityIdToRenderable[id])
}
}
if (entities.added && self.mediaType[k] && self.mediaType[k].generateRenderables) {
renderableToAdd = renderableToAdd.concat(self.mediaType[k].generateRenderables(entities.added, renderer))
}
});
var renderableId=renderer.addRenderable(renderableToAdd);
for (i = 0; i < renderableToAdd.length; ++i) {
entityIdToRenderable[renderableToAdd[i].entityId] = renderableId[i]
}
objectCollection.loopByType(deltaVisibleSet, function(k) {
if (self.mediaType[k] && self.mediaType[k].processDownloads) {
self.mediaType[k].processDownloads(downloader.completed, entityIdToRenderable, renderer)
}
});
downloader.update();
objectCollection.loopByType(deltaVisibleSet, function(k, entities) {
if (self.mediaType[k] && self.mediaType[k].updateRenderableStates) {
self.mediaType[k].updateRenderableStates(renderer)
}
});
for (i = 0; i < renderableToRemove.length; ++i) {
for (var k in entityIdToRenderable) {
if (entityIdToRenderable[k] === renderableToRemove[i]) {
delete entityIdToRenderable[renderableToRemove[i]]
}
}
}
renderer.remove(renderableToRemove);
renderer.setViewProjectionMatrix(camera.getViewProjectionTransform());
renderer.render(useLowerFidelity);
objectCollection.loopByType(deltaVisibleSet, function(k, entities) {
var i,
j,
element,
updatedSet=[];
visibleSet.byType[k] = visibleSet.byType[k] || [];
visibleSet.byType[k] = visibleSet.byType[k].concat(entities.added);
for (j = 0; j < visibleSet.byType[k].length; ++j) {
var removed=false;
for (i = 0; i < entities.removed.length; ++i) {
if (visibleSet.byType[k][j].id == entities.removed[i].id) {
removed = true;
break
}
}
if (!removed)
updatedSet.push(visibleSet.byType[k][j])
}
visibleSet.byType[k] = updatedSet;
visibleSet.byType[k].byId = {};
for (i = 0; i < visibleSet.byType[k].length; ++i) {
element = visibleSet.byType[k][i];
visibleSet.byType[k].byId[element.id] = element
}
});
if (showDebugMessages) {
var debugText=document.getElementById('debugText');
if (debugText) {
var numberOfRenderables=0;
for (var k in renderer._renderables) {
if (renderer._renderables.hasOwnProperty(k)) {
++numberOfRenderables
}
}
var now=new Date;
smoothedFrameCount++;
if ((now - prevSmoothedFrame) >= 500) {
smoothedFramerate = smoothedFrameCount * 2.0;
smoothedFrameCount = 0;
prevSmoothedFrame = now
}
var message=' frame count:' + frameCount + '  #renderables:' + numberOfRenderables + ' framerate:' + (1000 / (now - prevFrame)).toFixed(0) + ' smoothedFramerate:' + smoothedFramerate.toFixed(0);
debugText.innerHTML = message;
prevFrame = now
}
}
}
if (animating) {
++frameCount;
requestAnimationFrame(updateFrame)
}
};
var frameCount=0;
requestAnimationFrame(updateFrame);
self.dispose = function() {
gestureHelper.disable();
if (rootElement.parentNode) {
rootElement.parentNode.removeChild(rootElement)
}
if (eventCapturingElement.parentNode) {
eventCapturingElement.parentNode.removeChild(eventCapturingElement)
}
if (attributionControl) {
attributionControl.dispose()
}
animating = false
};
self.getActiveCameraController = function() {
return activeController
};
self.focusKeyboardElement = function() {
gestureHelper.focusKeyboardElement()
};
self.setViewportSize = function(width, height) {
Utils.css(rootElement, {
width: width + 'px', height: height + 'px'
});
Utils.css(eventCapturingElement, {
width: width + 'px', height: height + 'px'
});
renderer.setViewportSize(width, height);
camera.setViewport(new Viewport(width, height, camera.getViewport().getNearDistance(), camera.getViewport().getFarDistance()));
if (activeController.setViewportSize) {
activeController.setViewportSize(width, height)
}
};
self.getViewportSize = function() {
return new Vector2(camera.getViewport().getWidth(), camera.getViewport().getHeight())
};
self.getViewState = function() {
return {
verticalFov: camera.getVerticalFov(), position: camera.getPosition(), look: camera.getLook(), up: camera.getUp(), side: camera.getLook().cross(camera.getUp())
}
};
self.downloadAll = function(mediaTypeName, multiplierArray, progressCallback, finishCallback, atLowLod) {
hasBlockingDownload = true;
var multipliers=multiplierArray || [1.0];
var cameraLookAndUps=[{
look: new Vector3(0, 0, -1), up: new Vector3(0, 1, 0)
}, {
look: new Vector3(0, 0, 1), up: new Vector3(0, 1, 0)
}, {
look: new Vector3(0, -1, 0), up: new Vector3(0, 0, 1)
}, {
look: new Vector3(0, 1, 0), up: new Vector3(0, 0, 1)
}, {
look: new Vector3(-1, 0, 0), up: new Vector3(0, 1, 0)
}, {
look: new Vector3(1, 0, 0), up: new Vector3(0, 1, 0)
}];
var faceNames=["front", "back", "bottom", "top", "left", "right"];
var allTiles={};
for (var m=0; m < multipliers.length; m++) {
var scale=Math.tan(MathHelper.degreesToRadians(90) * 0.5) / Math.tan(camera.getVerticalFov() * 0.5) * multipliers[m];
var vp=new Viewport(Math.floor(viewport.getHeight() * scale), Math.floor(viewport.getHeight() * scale), near, far);
var cam=new PerspectiveCamera;
cam.setViewport(vp);
cam.setPosition(new Vector3(0, 0, 0));
cam.setVerticalFov(MathHelper.degreesToRadians(90));
var i,
j;
for (i = 0; i < cameraLookAndUps.length; i++) {
cam.setLook(cameraLookAndUps[i].look);
cam.setUp(cameraLookAndUps[i].up);
var visibleSet={byId: {}};
var tiles=self.mediaType[mediaTypeName].cull(scene.byType[mediaTypeName], cam, visibleSet, isCachedUrl, atLowLod, requiresTileOverlap);
if (tiles.added.length) {
var newTiles=tiles.added;
newTiles.sort(function(a, b) {
return b.tileId.levelOfDetail - a.tileId.levelOfDetail
});
var lod=newTiles[0].tileId.levelOfDetail;
for (j = 0; j < newTiles.length; j++) {
if (newTiles[j].tileId.levelOfDetail == lod)
allTiles[newTiles[j].id] = newTiles[j];
else
break
}
}
}
}
blockingDownloadSuccessCount = blockingDownloadFailureCount = 0;
downloader.customFailFunc = function(failCount, successCount) {
blockingDownloadFailureCount++
};
var count=0;
for (var i in allTiles) {
downloader.downloadImage(allTiles[i].url, allTiles[i].priority, allTiles[i].id);
count++
}
blockingDownloadTargetCount = count;
blockingDownloadProgressCallback = progressCallback;
blockingDownloadFinishCallback = finishCallback;
prefetchedTiles = allTiles;
return count
};
self.cancelDownloadAll = function() {
for (var t in prefetchedTiles) {
if (!isCachedUrl(prefetchedTiles[t].url))
downloader.cancel(prefetchedTiles[t].url)
}
self._resetDownloadAll()
};
self._resetDownloadAll = function() {
blockingDownloadTargetCount = 0;
blockingDownloadSuccessCount = blockingDownloadFailureCount = 0;
hasBlockingDownload = false;
downloader.customFailFunc = null;
blockingDownloadProgressCallback = null;
blockingDownloadFinishCallback = null
}
}