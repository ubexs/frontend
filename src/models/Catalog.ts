/**
 * Imports
 */
enum currencyType {
    'Primary' = 1,
    'Secondary'
}
import { PropertyType, Required } from '@tsed/common';
import { Example, Description } from '@tsed/swagger';
/**
 * Enums
 */
/**
 * Category of Item
 */
export enum category {
    'Hat' = 1,
    'Shirt',
    'Pants',
    'Faces',
    'Gear',
    'Shoes',
    'TShirt',
    /**
     * Static Image Re-sized to square for group icons
     */
        'GroupIcon',
    /**
     * Head Model - Consists of OBJ
     */
        'Head',
}
export enum assetType {
    'Texture' = 0,
    'OBJ',
    'MTL',
}
export enum collectible {
    true = 1,
    false = 0,
}
export enum isForSale {
    true = 1,
    false = 0,
}
export enum moderatorStatus {
    'Ready' = 0,
    'Pending',
    'Moderated',
}
export enum searchCategory {
    'Featured' = 10,
    'Any' = 11,
    'Collectibles' = 20,
}
/**
 * Type of Creator for an item
 */
export enum creatorType {
    'User' = 0,
    'Group',
}
/**
 * Catalog Data from the catalog table
 */
export interface CatalogInfo {
    catalogId: number;
    catalogName: string;
    description: string;
    price: number;
    averagePrice: number;
    forSale: isForSale;
    maxSales: number;
    collectible: collectible;
    status: moderatorStatus;
    creatorId: number;
    creatorType: creatorType;
    /**
     * This is different from the {creatorId} - it is the actually userId of the user who created the item (while creatorId would be the ID of the group if it was uploaded to a group)
     */
    userId: number;
    category: category;
    dateCreated: string;
    currency: currencyType;
}
export interface CatalogAssetItem {
    assetId: number;
    dateCreated: string;
    assetType: assetType;
    fileName: string;
    fileType: 'png' | 'obj' | 'mtl' | 'jpg';
}
export interface FilesInterface {
    png: boolean | Buffer;
    jpg: boolean | Buffer;
    obj: boolean | Buffer;
    mtl: boolean | Buffer;
}
export class CatalogCreationSuccessResponse {
    @Required()
    @Example(true)
    success: true;
    @Required()
    @Description('the id of the catalogItem created')
    id: number;
}
export class CatalogItemComment {
    @Required()
    userId: number;
    @Required()
    date: string;
    @Required()
    comment: string;
    @Required()
    isDeleted: 0 | 1;
}
export class SearchResults {
    @Required()
    catalogId: number;
    @Required()
    catalogName: string;
    @Required()
    price: number;
    @Required()
    currency: currencyType;
    @Required()
    userId: number;
    @Required()
    collectible: collectible;
    @Required()
    maxSales: number | null;
    @PropertyType(Number)
    collectibleLowestPrice: number|null;
}
/**
 * catalog_comments
 */
export interface Comments {
    commentId: number;
    catalogId: number;
    userId: number;
    date: Record<string, any>;
    comment: string;
}
/**
 * Average Price Chart
 */
export interface ChartData {
    amount: number;
    date: Record<string, any>;
}

/**
 * Response from a Catalog Name from it's id
 */
export interface MultiGetNames {
    /**
     * The Catalog Item's ID
     */
    catalogId: number;
    /**
     * The catalog item's name
     */
    catalogName: string;
}

/**
 * Response from retrieving a thumbnail by the CatalogID
 */
export interface ThumbnailResponse {
    /**
     * The Catalog Item's ID
     */
    catalogId: number;
    /**
     * The URL
     */
    url: string;
}

export class LowestPriceCollectibleItems {
    catalogId: number;
    price: number | null;
}
