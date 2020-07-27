// todo: migrate most of these to web requests made to api.blockshub.net so updating stuff is easier...

import {AllowTypes, PropertyType, Required} from "@tsed/common";
import {creatorType} from "./Catalog";

export enum GameState {
    'public' = 1,
    'private',
    'underReview'
}

export class GameThumbnail {
    @Required()
    @AllowTypes('string','null')
    url: string|null;
    @Required()
    moderationStatus: GameThumbnailModerationStatus;
    @Required()
    gameId: number;
}

export enum GameGenres {
    'Any' = 1,
    'Building',
    'Town & City',
    'Military',
    'Comedy',
    'Medieval',
    'Adventure',
    'Sci-Fi',
    'Naval',
    'FPS',
    'RPG',
    'Sports',
    'Fighting',
    'Western',
}

export enum GameGenreDescriptions {
    'Thousands of free 3D games from every genre' = 1,
    'Build stuff with friends',
    'Begin work at your dream job & have a family in Town & City games',
    'Be a soldier in military games',
    'Laugh and meet new people in Comedy games',
    'Rule an ancient kingdom in Medieval games',
    'Explore vast land with friends in Adventure games',
    'Discover aliens in Sci-Fi games',
    'Seek new lands and battle players in Naval games',
    'Form teams and destroy enemies in FPS (First-Person Shooter) games',
    'Roleplay with the only limit bing your imagination in RPG (Role-Playing) games',
    'Get active and work closely with your team in Sports games',
    'Fight other players, with bare hands or swords, in Fighting games',
    'Prospect the grand wild west and meet people in Western games',
}


export enum GameGenreThumbnails {
    'https://cdn.blockshub.net/static/genre/comedy_genre_thumbnail.png' = 5,
    'https://cdn.blockshub.net/static/genre/Western-small.jpg' = 14,
}
export enum GameThumbnailModerationStatus {
    'AwaitingApproval' = 0,
    'Approved' = 1,
    'Declined' = 2,
}

export enum GameSortOptions {
    'Featured' = 1,
    'Top Players' = 2,
    'Recently Updated',
}

export class GameInfo {
    @PropertyType(Number)
    gameId: number;

    @PropertyType(String)
    gameName: string;

    @PropertyType(String)
    gameDescription: string;

    @PropertyType(Number)
    maxPlayers: number;

    @PropertyType(Number)
    iconAssetId: number;

    @PropertyType(Number)
    thumbnailAssetId: number;

    @PropertyType(Number)
    visitCount: number;

    @PropertyType(Number)
    playerCount: number;

    @PropertyType(Number)
    likeCount: number;

    @PropertyType(Number)
    dislikeCount: number;

    gameState: GameState;

    @PropertyType(Number)
    creatorId: number;

    creatorType: creatorType;

    @PropertyType(String)
    createdAt: string;

    @PropertyType(String)
    updatedAt: string;

    @PropertyType(Number)
    genre: GameGenres;
}