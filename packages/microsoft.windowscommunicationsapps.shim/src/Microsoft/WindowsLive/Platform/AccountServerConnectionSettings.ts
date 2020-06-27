import { Uri } from "winrt-node/Windows.Foundation";
import { WindowsLive } from "../Enums";
import { uuidv4 } from "winrt-node/util";

export class AccountServerConnectionSettings {
    constructor(uri: Uri, port: string, serverType: WindowsLive.Platform.ServerType) {
        this.serverType = serverType;
        this.server = uri.host;
        this.port = parseInt(uri.port && uri.port != "" ? uri.port : port);
        this.userId = uuidv4();
        this.domain = uri.domain;
    }

    serverType: WindowsLive.Platform.ServerType;
    server: string;
    port: number;
    userId: string;
    domain: string;
    hasPasswordCookie: boolean = false;
    supportsAdvancedProperties: boolean = false;
    supportsOauth: boolean = true;
    useSsl: boolean = true;
    ignoreServerCertificateUnknownCA: boolean = false;
    ignoreServerCertificateExpired: boolean = false;
    ignoreServerCertificateMismatchedDomain: boolean = false;
    
    setPasswordCookie(cookie: string) {

    }
}