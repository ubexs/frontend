import * as Users from './Users';
export enum Permission {
    /**
     * Ban a user
     */
    'BanUser' = 1,
    /**
     * Unban a user
     */
    'UnbanUser',
    /**
     * Lock/unlock groups
     */
    'ManageGroup',
    /**
     * View emails for multiple users at once
     */
    'ViewEmail',
    /**
     * View payment information for all users
     */
    'ViewPaymentInformation',
    /**
     * Manage other staff
     */
    'ManageStaff',
    /**
     * Impersonate users
     */
    'ImpersonateUser',
    /**
     * Manage support tickets
     */
    'ManageSupportTickets',
    /**
     * Review and manage items awaiting staff review
     */
    'ReviewPendingItems',
    /**
     * Review and manage abuse reports
     */
    'ReviewAbuseReports',
    /**
     * Review information of all users, such as through the search functions
     */
    'ReviewUserInformation',
    /**
     * Upload staff assets to the system account, such as hats
     */
    'UploadStaffAssets',
    /**
     * Allows user to manage other staff, as well as their self
     */
    'ManageSelf',
    /**
     * Reset the password for a user
     */
    'ResetPassword',
    /**
     * Give item(s) to a user
     */
    'GiveItemToUser',
    /**
     * Give currency to a user
     */
    'GiveCurrencyToUser',
    /**
     * Take item(s) from a user
     */
    'TakeItemFromUser',
    /**
     * Take currency from a user
     */
    'TakeCurrencyFromUser',
    /**
     * Manage assets not owned by the current user
     */
    'ManageAssets',
    /**
     * Force a thumbnail to be regenerated
     */
    'RegenerateThumbnails',
    /**
     * Enable, edit, and disable the banner
     */
    'ManageBanner',
    /**
     * Manage/view public user information, such as the username, trades, transactions, etc
     */
    'ManagePublicUserInfo',
    /**
     * Manage/view private user information, such as emails, two factor enable/disable, etc
     */
    'ManagePrivateUserInfo',
    /**
     * Manage/view web services like secrets, system status, reload servers, logs, deploy stuff
     */
    'ManageWeb',
    'ManageGameServer',
    'ManageGameClient',
    /**
     * Enable, disable, create, update, and delete forum categories
     */
    'ManageForumCategories',
    /**
     * Create, update, and delete currency products
     */
    'ManageCurrencyProducts',
}

export interface ModerationHistory {
    userId: number;
    reason: string;
    date: string;
    untilUnbanned: string;
    isTerminated: 0 | 1;
    privateReason: string;
    actorUserId: number;
}

export interface EmailModel {
    id: number;
    userId: number;
    email: string | null;
    verificationCode: string;
    status: Users.emailVerificationType;
    date: Record<string, any>;
}
