import {Required} from "@tsed/common";

export enum postDeleted {
    false = 0,
    true = 1,
    'moderated',
}
export enum threadDeleted {
    false = 0,
    true = 1,
    'moderated',
}
export enum threadLocked {
    false = 0,
    true = 1,
}
export enum threadPinned {
    false = 0,
    true = 1,
}

export class UserForumsInfo {
    userId: number;
    postCount: number;
    signature: string|null;
}
export interface SubCategories {
    subCategoryId: number;
    categoryId: number;
    title: string;
    description: string;
    permissions: {
        read: number;
        post: number;
    };
    weight: number;
}

export interface Categories {
    categoryId: number;
    title: string;
    description: string;
    weight: number;
}

export interface Thread {
    threadId: number;
    categoryId: number;
    subCategoryId: number;
    title: string;
    userId: number;
    dateCreated: string;
    dateEdited: string;
    threadLocked: threadLocked;
    threadDeleted: threadDeleted;
    threadPinned: threadPinned;
}

export class PostSnippet {
    @Required()
    threadId: number;
    @Required()
    userId: number;
    @Required()
    dateCreated: string;
}