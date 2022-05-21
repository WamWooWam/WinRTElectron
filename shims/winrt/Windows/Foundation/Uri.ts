
import { IStringable } from "./IStringable";
import { GenerateShim } from "./Interop/GenerateShim";
import { WwwFormUrlDecoder } from "./WwwFormUrlDecoder";
import { URL } from "url"
const path = require("path");

export class Uri implements IStringable {
    private _url: URL;
    private _rawUri: string;

    constructor(url: string, baseUrl?: string) {
        this._url = new URL(url, baseUrl);
        this._rawUri = url;
    }

    get absoluteCanonicalUri(): string { return this._url.toString(); }
    get absoluteUri(): string { return this._url.toString(); }
    get displayIri(): string { return decodeURI(this._url.toString()); }
    get displayUri(): string { return decodeURI(this._url.toString()); }
    get domain(): string { return this._url.hostname; }
    get extension(): string { return path.extname(this._url.pathname); }
    get fragment(): string { return this._url.hash; }
    get host(): string { return this._url.host; }
    get password(): string { return this._url.password; }
    get path(): string { return this._url.pathname; }
    get port(): string { return this._url.port; }
    get query(): string { return this._url.search; }
    set query(value: string) { this._url.search = value; }
    get rawUri(): string { return this._rawUri; }
    get schemeName(): string {
        // URL returns the : at the end of the scheme, WinRT does not.
        return this._url.protocol.substr(0, this._url.protocol.length - 1);
    }
    get suspicious(): boolean { return false; }
    get userName(): string { return this._url.username; }
    get queryParsed(): WwwFormUrlDecoder { return new WwwFormUrlDecoder(this._url.search); }

    equals(pUri: Uri): boolean {
        return pUri._url == this._url;
    }

    combineUri(relativeUri: string): Uri {
        return new Uri(relativeUri, this.toString());
    }

    toString(): string {
        return this._url.toString();
    }

    static unescapeComponent(toUnescape: string): string {
        return decodeURIComponent(toUnescape);
    }

    static escapeComponent(toEscape: string): string {
        return encodeURIComponent(toEscape);
    }
}
