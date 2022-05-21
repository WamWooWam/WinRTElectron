const DEBUG = true;
function GenerateFunctionShim(thisVal, name, handler) {
    let original = thisVal[name];
    if (original) {
        thisVal[name] = (...args) => {
            let retVal = original.call(thisVal, ...args);
            handler(name, retVal, args);
            return retVal;
        };
    }
}
export function GenerateShim(name) {
    return function (RuntimeClass) {
        if (DEBUG) {
            // this absolute shitshow provides:
            // - console output of property accessors (static and instance)
            // - console output of event subscription (static and instance)
            // - console output of dictionary lookup
            // - console output of vector getAt/setAt
            // - custom toString implementation that prints the object type
            // obviously this is slow, so production builds should set DEBUG to false
            // and rebuild all shims
            let ReturnClass = new Proxy(class extends RuntimeClass {
                constructor(...args) {
                    super(...args);
                    let t = this;
                    GenerateFunctionShim(this, "lookup", (propName, retVal, args) => console.info(`lookup: ${name} ${args[0]} -> `, retVal));
                    GenerateFunctionShim(this, "getAt", (propName, retVal, args) => console.info(`lookup: ${name} ${args[0]} -> `, retVal));
                    GenerateFunctionShim(this, "setAt", (propName, retVal, args) => console.info(`setAt: ${name} ${args[0]} -> `, args[1]));
                    GenerateFunctionShim(this, "addEventListener", (propName, retVal, args) => console.info(`addEventListener: ${name} on${args[0]} += %O`, args[1]));
                    GenerateFunctionShim(this, "removeEventListener", (propName, retVal, args) => console.info(`removeEventListener: ${name} on${args[0]} -= %O`, args[1]));
                    GenerateFunctionShim(RuntimeClass, "addEventListener", (propName, retVal, args) => console.info(`static addEventListener: ${name} on${args[0]} += %O`, args[1]));
                    GenerateFunctionShim(RuntimeClass, "removeEventListener", (propName, retVal, args) => console.info(`static removeEventListener: ${name} on${args[0]} -= %O`, args[1]));
                    if (!this.toString) {
                        this.toString = () => `[proxy ${name}]`;
                    }
                    return new Proxy(this, new ShimProxyHandler(name));
                }
            }, new ShimProxyHandler(name, true));
            return ReturnClass;
        }
        // meanwhile this replicates actual WinRT functionality, if not implemented
        // toString returns [object <namespace qualified type name>] (i.e. [object Windows.Foundation.Uri])
        return class extends RuntimeClass {
            constructor(...args) {
                super(...args);
                if (!this.toString) {
                    this.toString = () => `[object ${name}]`;
                }
            }
        };
    };
}
const disallowedKeys = [
    "addEventListener",
    "removeEventListener",
    "then",
    "toString",
    "lookup",
    "values",
    "prototype",
    "dispose",
    Symbol.toStringTag,
    Symbol.toPrimitive
];
const filterKey = (key) => {
    return !disallowedKeys.includes(key) && !(String(key)[0] == '_') && !(key instanceof Symbol);
};
export class ShimProxyHandler {
    constructor(name, isStatic = false) {
        this._name = name;
        this._static = isStatic;
    }
    construct(target, argArray, newTarget) {
        console.info(`ctor: ${this._name}(${[...argArray].fill("%O", 0, argArray.length).join(', ')})`, ...argArray);
        return new target(...argArray);
    }
    get(target, key, reciever) {
        let f = Reflect.get(target, key, reciever);
        let name = `${this._name}.${String(key)}`;
        let value = f;
        if (!filterKey(key))
            return f;
        if (typeof f == 'function') {
            return function (...args) {
                console.info((this._static ? "static " : "") + `call: ${name}(${[...args].fill("%O", 0, args.length).join(', ')})`, ...args);
                return f.call(this, ...args);
            };
        }
        (f === undefined ? console.error : f === null ? console.warn : console.info)((this._static ? "static " : "") + `get: ${name} -> `, value);
        return f;
    }
    set(target, key, value, reciever) {
        if (filterKey(key))
            console.info((this._static ? "static " : "") + `set: ${this._name}.${String(key)} -> `, value);
        target[key] = value;
        return true;
    }
}
