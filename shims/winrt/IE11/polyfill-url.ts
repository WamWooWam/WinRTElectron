let orig_createObjectURL = URL.createObjectURL;
URL.createObjectURL = function (...args) {
    // quick and dirty hack to check for StorageFiles
    if ((args[0] as any).path !== undefined) {
        return (args[0] as any).path;
    }

    return orig_createObjectURL(args[0]);
};