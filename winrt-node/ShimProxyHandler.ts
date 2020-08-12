export class ShimProxyHandler<T extends Object> implements ProxyHandler<T> {

    name: string;

    constructor(name?: string) {
        this.name = name;
    }

    get(target: T, key: any) {
        let f = target[key];

        if (key === "addEventListener" || key === "targetElement")
            return f;

        (f === undefined ? console.error : console.warn)(`shim: ${this.name ?? target.constructor?.name}.${key}`);

        return f;
    }
}
