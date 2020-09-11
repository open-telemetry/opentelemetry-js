declare module 'require-in-the-middle' {
    namespace hook {
        type Options = {
            internals?: boolean;
        };
        type OnRequireFn = <T>(exports: T, name: string, basedir?: string) => T;
        type Hooked = { unhook(): void };
    }
    function hook(
        modules: string[] | null,
        options: hook.Options | null,
        onRequire: hook.OnRequireFn
    ): hook.Hooked;
    function hook(modules: string[] | null, onRequire: hook.OnRequireFn): hook.Hooked;
    function hook(onRequire: hook.OnRequireFn): hook.Hooked;
    export = hook;
}