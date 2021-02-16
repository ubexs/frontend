const errorTransform = (errCode) => {
    switch (errCode) {
        case 'InternalServerError': {
            return 'An internal server error has ocurred.';
        }
        case 'LogoutRequired': {
            return 'You must be logged out to perform this action.';
        }
        case 'InvalidUsernameOrPassword': {
            return 'The username or password specified is invalid.';
        }
        case 'LoginRequired': {
            return 'You must be logged in to perform this action.';
        }
        case 'InvalidBirthDate': {
            return 'The birth-date you entered is invalid. Please try again.';
        }
        case 'InvalidUsername': {
            return 'The username you entered is invalid. Please try again.';
        }
        case 'InvalidPassword': {
            return 'The password you entered is invalid. Please try again.';
        }
        case 'UsernameConstraint1Space1Period1Underscore': {
            return 'Your username can only contain 1 space, 1 period, and 1 underscore.';
        }
        case 'UsernameConstriantCannotEndOrStartWithSpace': {
            return 'Your username cannot start or end with a space.';
        }
        case 'UsernameConstraintInvalidCharacters': {
            return 'Your username does not contain valid characters. Please try again.';
        }
        case 'UsernameConstriantTooLong': {
            return 'Your username exceeds the maximum length of 18 characters.';
        }
        case 'UsernameConstrintTooShort': {
            return 'Your username must be at least 3 characters.';
        }
        case 'OneAccountPerIP': {
            return 'Sorry! You can\'t signup right now. Please try again later. Error Code: OneAccountPerIP';
        }
        case 'RequestDisallowed': {
            return 'Sorry! You can\'t do this right now. Error Code: RequestDisallowed';
        }
        case 'CannotSendRequest': {
            return 'You cannot send this request right now.';
        }
        case 'InvalidPrice': {
            return 'The price specified is invalid.';
        }
        case 'CannotBeSold': {
            return 'This item cannot be sold.';
        }
        case 'CannotTradeWithUser': {
            return 'You cannot trade with this user right now.';
        }
        case 'NotEnoughCurrency': {
            return 'You do not have enough currency for this transaction.';
        }
        case 'InvalidAmount': {
            return 'The amount specified is invalid.';
        }
        case 'NoLongerForSale': {
            return 'This item is no longer for sale.';
        }
        case 'SellerHasChanged': {
            return 'This item is no longer for sale.';
        }
        case 'CurrencyHasChanged': {
            return 'This item is no longer for sale.';
        }
        case 'PriceHasChanged': {
            return 'The price for this item has changed. Please reload this page to see the latest price.';
        }
        case 'AlreadyOwns': {
            return 'You already own this item.';
        }
        case 'ItemStillForSale': {
            return 'You cannot buy this item right now.';
        }
        case 'ItemNoLongerForSale': {
            return 'This item is no longer for sale.';
        }
        case 'OneOrMoreItemsNotAvailable': {
            return 'One or more of the items in this trade are no longer available. This trade cannot be completed.';
        }
        case 'AvatarCooldown': {
            return 'You cannot update your avatar right now. Try again in a few minutes.';
        }
        case 'EmailVerificationRequired': {
            return 'You must verify your account\'s email address before you can perform this action.';
        }
        case 'BlurbTooLarge': {
            return 'Your blurb is too large.';
        }
        case 'InvalidOldPassword': {
            return 'The old password specified does not match your current password. Please try again.';
        }
        case 'InalidPassword': {
            return 'THe password specified is invalid. Please try again.';
        }
        case 'InvalidCode': {
            return 'The code specified is invalid.';
        }
        case 'FloodCheck': {
            return 'You cannot complete this action right now. Please try again in a few minutes.';
        }
        case 'InvalidEmail': {
            return 'The email specified does not seem to be valid.';
        }
        case 'InvalidTheme': {
            return 'The theme specified is invalid.';
        }
        case 'InvalidOption': {
            return 'The option specified is invalid.';
        }
        case 'CaptchaValidationFailed': {
            return 'Captcha Validation Failed. Please fill out the captcha. Code: CaptchaValidationFailed';
        }
        case 'InvalidGroupPermissions': {
            return 'You do not have permission to perform this action.';
        }
        case 'AlreadyGroupMember': {
            return 'You are already a member of this group.';
        }
        case 'TooManyGroups': {
            return 'You are in the maximum amount of groups. Please leave a group and try again.';
        }
        case 'InvalidGroupRank': {
            return 'The rank name specified must be between 1 and 254.';
        }
        case 'InvalidRolesetName': {
            return 'The roleset name is invalid.';
        }
        case 'InvalidRolesetDescription': {
            return 'The roleset description is invalid.';
        }
        case 'InvalidRolesetPermissions': {
            return 'The roleset permissions are invalid.';
        }
        case 'RankIdIsTaken': {
            return 'The rank specified is invalid or currently in use by another roleset.';
        }
        case 'TooManyRolesets': {
            return 'This group has reached the maximum amount of rolesets.';
        }
        case 'RolesetHasMembers': {
            return 'You cannot delete a roleset that currently has members. Re-rank all existing members to a new role, then try again.';
        }
        case 'CannotDeleteFirstRoleInGroup': {
            return 'You cannot delete the first role in a group.';
        }
        case 'UserNotInGroup': {
            return 'The user specified is not a member of this group.';
        }
        case 'CannotRankUser': {
            return 'You are not authorized to rank this user.';
        }
        case 'ShoutCooldown': {
            return 'You cannot perform this action right now. Please try again later.';
        }
        case 'InvalidFileType': {
            return 'The file type provided is invalid. Please try again.';
        }
        case 'InvalidGroupName': {
            return 'The group name specified is invalid.';
        }
        case 'InvalidGroupDescription': {
            return 'The group description specified is invalid.';
        }
        case 'GroupNameTaken': {
            return 'The group name specified is already in use by another group. Please try another name.';
        }
        case 'InvalidReason': {
            return 'The reason specified is invalid.';
        }
        case 'InvalidPrivateReason': {
            return 'The private reason specified is invalid.';
        }
        case 'ConstraintIfDeletedUserMustAlsoBeTerminated': {
            return 'If a user is deleted, the "Terminated" option must also be selected. Please try again.';
        }
        case 'CommentTooLarge': {
            return 'Your comment is too large. Please try again.';
        }
        case 'InvalidCurrencyAmount': {
            return 'The currency amount specified is invalid.';
        }
        case 'InvalidCatalogIdOrState': {
            return 'The state or catalogId is invalid.';
        }
        case 'InvalidBannerText': {
            return 'The banner text specified is invalid.';
        }
        case 'InvalidRank': {
            return 'The rank specified is invalid.';
        }
        case 'RankCannotBeAboveCurrentUser': {
            return 'The rank specified cannot be above your rank.';
        }
        case 'InvalidSubCategoryId': {
            return 'The subCategoryId specified is invalid.';
        }
        case 'InvalidTitle': {
            return 'The title specified is invalid.';
        }
        case 'InvalidBody': {
            return 'The body specified is invalid.';
        }
        case 'ThreadLocked': {
            return 'This thread is locked, so you are unable to reply to it.';
        }
        case 'InvalidCatalogName': {
            return 'The catalog name specified is invalid.';
        }
        case 'InvalidModerationStatus': {
            return 'The moderation status specified is invalid.';
        }
        case 'InvalidCatalogDescription': {
            return 'The description specified is invalid.';
        }
        case 'InvalidIsForSaleOption': {
            return 'The isForSale option specified is invalid.';
        }
        case 'ConstraintPriceTooHigh': {
            return 'The price specified is too high.';
        }
        case 'InvalidComment': {
            return 'The comment specified is invalid.';
        }
        case 'InvalidOBJSpecified': {
            return 'The OBJ file specified is invalid.';
        }
        case 'InvalidMTLSpecified': {
            return 'The MTL file specified is invalid.';
        }
        case 'TooManyRequests': {
            return 'You have been making too many requests. Try again later.';
        }
        case 'GroupJoinRequestPending': {
            return 'You are already awaiting approval by an admin. Check back later.';
        }
        case 'RankAlreadyExists': {
            return 'Each roleset must have a unique rank, and this rank is already in use by another roleset.';
        }
        case 'InvalidMaxPlayers': {
            return 'The maximum amount of players you can have in a game server at once is 10.';
        }
        case 'InvalidGenre': {
            return 'The genre specified is invalid.';
        }
        case 'InvalidNameOrDescription': {
            return 'Please specify a valid name and description.';
        }
        case 'TooManyGames': {
            return 'You cannot create any more games.';
        }
        case 'NoFileSpecified': {
            return 'Please specify at least one file.';
        }
        case 'ModerationStatusConflict': {
            return 'You cannot perform this action right now due to a moderation status conflict. Try again later.';
        }
        case 'ConstraintEmailVerificationRequired': {
            return 'In order to perform this action, your account must have a verified email. Go to your settings to add & verify your email address.';
        }
        case 'EmailAlreadyInUse': {
            return 'Sorry, this email is already in use. Please use a different email.';
        }
        case 'AvatarRenderRequired': {
            return 'Sorry, you cannot create an outfit while your current avatar is pending. Try again later.';
        }
        case 'MaximumOutfitsReached': {
            return 'You have reached the maximum amount of outfits. Delete an outfit, and try agian.';
        }
        case 'InvalidOutfitId': {
            return 'This outfit can\'t be modified right now. Refresh the page, and try again.';
        }
        case 'Cooldown': {
            return 'You cannot perform this action right now. Try again later.';
        }
        case 'ItemCannotBeDeleted': {
            return 'This item cannot be deleted.'
        }
        case 'RateTooSmall': {
            return 'The rate specified is too small.';
        }
        case 'RateTooLarge': {
            return 'The rate specified is too large.';
        }
        case 'BalanceTooSmall': {
            return 'The balance amount specified is too small.';
        }
        case 'ReachedMaximumOpenPositions': {
            return 'You have reached the maximum amount of open positions.';
        }
        case 'NotEnoughInPositionBalance': {
            return 'There is not enough in this positions balance to complete your transaction. You have not been charged.';
        }
        case 'PurchaseAmountTooLow': {
            return 'The purchase amount specified is too low. You have not been charged.';
        }
        case 'CannotPurchaseOwnedPosition': {
            return 'You cannot purchase from your own position.';
        }
    }
    return 'An unknown error has occurred. Please try again later, or contact support.';
}
