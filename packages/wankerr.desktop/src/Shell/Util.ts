
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

function easeOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function cubicEase(t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
}

export function circularEase(t, b, c, d) {
    // t /= d;
    // t--;
    // return c * Math.sqrt(1 - t * t) + b;

    return c * easeOutCirc(t) + b;
}

export function getRGBFromString(str) {
    if (str[0] == "#") {
        str = str.slice(1);
    }

    var num = parseInt(str, 16);
    return [(num >> 16), ((num >> 8) & 0x00FF), (num & 0x0000FF)];
}

export function lightenDarkenColour(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');

}