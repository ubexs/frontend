import {AllowTypes, Required} from "@tsed/common";

export enum banned {
    'true' = 1,
    'false' = 0,
}

export enum theme {
    'light' = 0,
    'dark' = 1,
}

export enum staff {
    'false' = 0,
    'true' = 1,
}

export class Info {
    @Required()
    userId: number;
    @Required()
    username: string;
    @Required()
    @AllowTypes('string','null')
    status: string|null;
    @Required()
    joinDate: string;
    @Required()
    @AllowTypes('string', 'null')
    blurb: string|null;
    @Required()
    banned: 0|1;
    @Required()
    lastOnline: string;
    @Required()
    tradingEnabled: 0|1;
    @Required()
    staff: 0|1;
    @Required()
    accountStatus: 0;
}

export class AuthenticatedInfo {
    userId: number;
    username: string;
    passwordChanged: number;
    banned: 0|1;
    theme: number;
    primaryBalance: number;
    secondaryBalance: number;
    staff: number;
    dailyAward: string;
}