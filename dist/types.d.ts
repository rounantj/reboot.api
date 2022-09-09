import express, { Router, Response } from "express";
interface AppRouter {
    index?: () => AppRouter;
    show?: () => AppRouter;
    store?: () => AppRouter;
    update?: () => AppRouter;
    delete?: () => AppRouter;
    router: Router;
}
interface Module {
    moduleName: string;
    router: AppRouter;
    isPublic: boolean;
}
export interface ResponseError extends Error {
    get status(): number;
}
export class NotFoundError extends Error implements ResponseError {
    constructor(message: string);
    get status(): number;
}
export class BadRequestError extends Error implements ResponseError {
    constructor(message: string);
    get status(): number;
}
export class AuthenticationError extends Error implements ResponseError {
    constructor(message: string);
    get status(): number;
}
export class UnprocessableEntityError extends Error implements ResponseError {
    constructor(message: string);
    get status(): number;
}
export class ForbiddenError extends Error implements ResponseError {
    constructor(message: string);
    get status(): number;
}
export function onError(response: Response, error: ResponseError): void;
export function onSuccess(response: Response, statusCode: number, data: Object): void;
export interface Bootstrap {
    modules: Array<Module>;
    context: string;
    version: string;
}
export class PullupModules implements Bootstrap {
    modules: Array<Module>;
    context: string;
    version: string;
    constructor(modules: Array<Module>);
    bootstrap(): express.Application;
}
export class StartModules {
    modules: Array<string>;
    folderName: string;
    constructor(modules: Array<string>, folderName?: string);
    createModules(srcDirName: string): Promise<void>;
    removeModule(srcDirName: string, name: string): void;
}

//# sourceMappingURL=types.d.ts.map
