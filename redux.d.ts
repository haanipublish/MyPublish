declare const Redux: any
declare interface myState {
    apps: myAppInfo[]
    selectedAppId: string | undefined
    error: any
    errorText: string
    page: 'front' | 'detail' | 'error'
}
declare type versionFileInfo = { version: string | undefined, path: string | undefined }