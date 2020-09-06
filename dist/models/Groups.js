"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupJoinRequest = exports.GroupOwnershipChangeEntry = exports.GroupOwnershipChangeType = exports.groupShout = exports.roleInfo = exports.MultiGetNames = exports.groupDetails = exports.groupStatus = exports.GroupMemberApprovalStatus = exports.groupPermissions = exports.GroupCreationFee = exports.GROUP_CREATION_COST = exports.ROLE_DESCRIPTION_MIN_LENGTH = exports.ROLE_DESCRIPTION_MAX_LENGTH = exports.ROLE_NAME_MIN_LENGTH = exports.ROLE_NAME_MAX_LENGTH = exports.MIN_RANK_VALUE = exports.MAX_RANK_VALUE = exports.MAX_GROUP_ROLES = exports.MAX_GROUPS = void 0;
const common_1 = require("@tsed/common");
const swagger_1 = require("@tsed/swagger");
exports.MAX_GROUPS = 100;
exports.MAX_GROUP_ROLES = 22;
exports.MAX_RANK_VALUE = 255;
exports.MIN_RANK_VALUE = 1;
exports.ROLE_NAME_MAX_LENGTH = 32;
exports.ROLE_NAME_MIN_LENGTH = 1;
exports.ROLE_DESCRIPTION_MAX_LENGTH = 255;
exports.ROLE_DESCRIPTION_MIN_LENGTH = 0;
exports.GROUP_CREATION_COST = 50;
class GroupCreationFee {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], GroupCreationFee.prototype, "cost", void 0);
exports.GroupCreationFee = GroupCreationFee;
class groupPermissions {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], groupPermissions.prototype, "getWall", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], groupPermissions.prototype, "postWall", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], groupPermissions.prototype, "getShout", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], groupPermissions.prototype, "postShout", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], groupPermissions.prototype, "manage", void 0);
exports.groupPermissions = groupPermissions;
var GroupMemberApprovalStatus;
(function (GroupMemberApprovalStatus) {
    GroupMemberApprovalStatus[GroupMemberApprovalStatus["true"] = 1] = "true";
    GroupMemberApprovalStatus[GroupMemberApprovalStatus["false"] = 0] = "false";
})(GroupMemberApprovalStatus = exports.GroupMemberApprovalStatus || (exports.GroupMemberApprovalStatus = {}));
var groupStatus;
(function (groupStatus) {
    groupStatus[groupStatus["locked"] = 1] = "locked";
    groupStatus[groupStatus["ok"] = 0] = "ok";
})(groupStatus = exports.groupStatus || (exports.groupStatus = {}));
class groupDetails {
}
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupId", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", String)
], groupDetails.prototype, "groupName", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], groupDetails.prototype, "groupDescription", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupOwnerUserId", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupIconCatalogId", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupMemberCount", void 0);
__decorate([
    common_1.Required(),
    common_1.Enum(groupStatus),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupStatus", void 0);
__decorate([
    common_1.Enum(GroupMemberApprovalStatus),
    __metadata("design:type", Number)
], groupDetails.prototype, "groupMembershipApprovalRequired", void 0);
exports.groupDetails = groupDetails;
class MultiGetNames {
}
__decorate([
    common_1.Required(),
    swagger_1.Description('The groups ID'),
    __metadata("design:type", Number)
], MultiGetNames.prototype, "groupId", void 0);
__decorate([
    common_1.Required(),
    swagger_1.Description('The groups name'),
    __metadata("design:type", String)
], MultiGetNames.prototype, "groupName", void 0);
exports.MultiGetNames = MultiGetNames;
class roleInfo {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], roleInfo.prototype, "roleSetId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], roleInfo.prototype, "name", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], roleInfo.prototype, "description", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], roleInfo.prototype, "groupId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], roleInfo.prototype, "rank", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", groupPermissions)
], roleInfo.prototype, "permissions", void 0);
exports.roleInfo = roleInfo;
class groupShout {
}
__decorate([
    swagger_1.Description('UserId that made the shout'),
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupShout.prototype, "userId", void 0);
__decorate([
    swagger_1.Description('groupId that made the shout'),
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupShout.prototype, "groupId", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], groupShout.prototype, "shout", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], groupShout.prototype, "date", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], groupShout.prototype, "thumbnailCatalogId", void 0);
exports.groupShout = groupShout;
var GroupOwnershipChangeType;
(function (GroupOwnershipChangeType) {
    GroupOwnershipChangeType[GroupOwnershipChangeType["LeaveGroup"] = 1] = "LeaveGroup";
    GroupOwnershipChangeType[GroupOwnershipChangeType["ClaimOwnership"] = 2] = "ClaimOwnership";
    GroupOwnershipChangeType[GroupOwnershipChangeType["TransferOwnership"] = 3] = "TransferOwnership";
})(GroupOwnershipChangeType = exports.GroupOwnershipChangeType || (exports.GroupOwnershipChangeType = {}));
class GroupOwnershipChangeEntry {
}
__decorate([
    common_1.Required(),
    swagger_1.Description('userId who was affected by the change'),
    __metadata("design:type", Number)
], GroupOwnershipChangeEntry.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    swagger_1.Description('userId who performed the change'),
    __metadata("design:type", Number)
], GroupOwnershipChangeEntry.prototype, "actorUserId", void 0);
__decorate([
    common_1.Required(),
    swagger_1.Description('groupId affected'),
    __metadata("design:type", Number)
], GroupOwnershipChangeEntry.prototype, "groupId", void 0);
__decorate([
    common_1.Required(),
    swagger_1.Description('The type of ownership change'),
    __metadata("design:type", Number)
], GroupOwnershipChangeEntry.prototype, "type", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], GroupOwnershipChangeEntry.prototype, "createdAt", void 0);
exports.GroupOwnershipChangeEntry = GroupOwnershipChangeEntry;
class GroupJoinRequest {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], GroupJoinRequest.prototype, "groupId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], GroupJoinRequest.prototype, "userId", void 0);
exports.GroupJoinRequest = GroupJoinRequest;
