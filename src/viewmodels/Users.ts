import {Moment} from "moment";

export class Profile {
    userId: number;
    username: string;
    blurb: string;
    forumPostCount: number;
    status: string|null;
    tradingEnabled: number;
    staff: number;
    usernameChanges: string[];
    deleted: boolean;
    joinDate: Moment;
    lastOnline: Moment;
    online: boolean;
}