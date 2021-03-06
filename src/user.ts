﻿import { userSchema } from "./interfaces/userSchema";
import { accountStatus } from "./enum/accountStatus";
import { savedCard } from "./interfaces/savedCard";
import { userAccountSchema } from "./interfaces/userAccountSchema";
import { PassThrough } from "stream";
import { databaseWrapper } from "./databaseWrapper";
import bcrypt from "bcrypt";
import { userAccountPublicSchema } from "./interfaces/userAccountPublicSchema";
import { filterXSS } from "xss";

export class user {

    // User Schema
    private uuid: string;
    private currentAccountStatus: accountStatus;
    private verificationCode: string;
    private cardID: string;
    private savedCards: Map<string, savedCard>;

    // User Account Schema
    private email: string;
    private passwordHash: string;

    // User Account Public Schema
    private firstName: string;
    private lastName: string;
    private customURL: string;
    private profilePictureURL: string;





    //
    //  Construction / Initialization
    //

    constructor(newUserSchema: userSchema) {
        this.initializeInternalUserSchema(newUserSchema);
    }

    // Populate internal variables related to userSchema
    private initializeInternalUserSchema(newUserSchema: userSchema): void {
        this.uuid = newUserSchema.uuid;
        this.currentAccountStatus = newUserSchema.currentAccountStatus;
        this.verificationCode = newUserSchema.verificationCode;
        this.cardID = newUserSchema.cardID;

        this.savedCards = new Map<string, savedCard>();
        for (const card of newUserSchema.savedCards) {
            this.savedCards.set(card.cardID, card);
        }

        this.initializeInternalUserAccountSchema(newUserSchema.userAccount);
    }

    // Populate internal variables related to userAccountSchema
    private initializeInternalUserAccountSchema(newUserAccountSchema: userAccountSchema): void {
        this.email = newUserAccountSchema.email;
        this.passwordHash = newUserAccountSchema.passwordHash;

        this.initializeInternalUserAccountPublicSchema(newUserAccountSchema.public);
    }

    // Populate internal variables related to userAccountPublicSchema
    private initializeInternalUserAccountPublicSchema(newUserAccountPublicSchema: userAccountPublicSchema): void {
        this.firstName = newUserAccountPublicSchema.firstName;
        this.lastName = newUserAccountPublicSchema.lastName;
        this.customURL = newUserAccountPublicSchema.customURL;
        this.profilePictureURL = newUserAccountPublicSchema.profilePictureURL;
    }





    //
    //  Getters
    //

    public getUUID(): string {
        return this.uuid;
    }

    public getAccountSchema(): userAccountSchema {
        const output: userAccountSchema = {
            email: this.email,
            passwordHash: this.passwordHash,
            public: {
                firstName: this.firstName,
                lastName: this.lastName,
                customURL: this.customURL,
                profilePictureURL: this.profilePictureURL
            }
        }

        return output;
    }

    public getCardID(): string {
        return this.cardID;
    }

    public getSavedCard(savedCardID: string): savedCard {
        return this.savedCards.get(savedCardID);
    }

    public getAllSavedCards(): savedCard[] {

        // Turn the values from our savedCards Map into an array
        const savedCardsArray: savedCard[] = Array.from(this.savedCards.values());

        // Sort the array first by if it's favorited, then by alphabetical order
        const sortedSavedCardsArray: savedCard[] = savedCardsArray.sort((cardA, cardB) => {
            if (cardA.favorited && !cardB.favorited) {
                return -1;
            }
            else if (!cardA.favorited && cardB.favorited) {
                return 1;
            }
            else {
                return 0;
            }
        });

        return sortedSavedCardsArray;
    }

    public getAccountStatus(): accountStatus {
        return this.currentAccountStatus;
    }

    public getVerificationCode(): string {
        return this.verificationCode;
    }



    //
    //  Setters
    //

    public async setCardID(newCardID: string): Promise<void> {

        // Check for a falsy input parameter
        if (newCardID === null) {
            throw new Error("Cannot pass null");
        }
        else if (newCardID === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // Set the cardID in memory
        this.cardID = newCardID;

        // Update the user in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to set the cardID
            const updateData = {
                $set: {
                    cardID: newCardID
                }
            };

            // Apply update operation!
            const updateResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if updateResult.modifiedCount is greater than zero!
        });
    }

    public async setAccountStatus(newAccountStatus: accountStatus): Promise<void> {

        // Check for a falsy input parameter
        if (newAccountStatus === null) {
            throw new Error("Cannot pass null");
        }
        else if (newAccountStatus === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // Set the account status in memory
        this.currentAccountStatus = newAccountStatus;

        // Update the user in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to set the account status
            const updateData = {
                $set: {
                    currentAccountStatus: newAccountStatus
                }
            };

            // Apply update operation!
            const updateResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if updateResult.modifiedCount is greater than zero!
        });
    }

    public async setVerificationCode(newVerificationCode: string): Promise<void> {

        // Check for a falsy input parameter
        if (newVerificationCode === null) {
            throw new Error("Cannot pass null");
        }
        else if (newVerificationCode === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // Set the verification code in memory
        this.verificationCode = newVerificationCode;

        // Update the user in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to set the verification code
            const updateData = {
                $set: {
                    verificationCode: newVerificationCode
                }
            };

            // Apply update operation!
            const updateResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if updateResult.modifiedCount is greater than zero!
        });
    }




    //
    //  Utility Methods
    //

    public tryPassword(password: string): boolean {

        // Check for a falsy input parameter
        if (password === null) {
            return false;
        }
        else if (password === undefined) {
            return false;;
        }

        return bcrypt.compareSync(password, this.passwordHash);
    }

    public async addSavedCard(cardToAddID: string): Promise<savedCard> {

        // Check for a falsy input parameter
        if (cardToAddID === null) {
            throw new Error("Cannot pass null");
        }
        else if (cardToAddID === undefined) {
            throw new Error("Cannot pass undefined");
        }
        else if (cardToAddID === "") {
            throw new Error("Cannot pass Empty String");
        }

        // Construct savedCard interface
        const newSavedCard: savedCard = {
            cardID: cardToAddID,
            favorited: false,
            memo: ""
        }

        // Add to data structure in memory
        this.savedCards.set(cardToAddID, newSavedCard);

        // Add to the array in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to push the new savedCard to the savedCard array
            const updateData = {
                $push: {
                    savedCards: newSavedCard
                }
            };

            // Apply push operation!
            const pushResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if pushResult.modifiedCount is greater than zero!
        });



        return newSavedCard;
    }

    public async updateSavedCard(cardUpdateForm: savedCard): Promise<boolean> {

        // Check for a falsy input parameter
        if (cardUpdateForm === null) {
            throw new Error("Cannot pass null");
        }
        else if (cardUpdateForm === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // If we don't have this savedCard...
        if (!this.savedCards.has(cardUpdateForm.cardID)) {
            // ... bounce!
            return false;
        }

        // Update the data structure in memory
        this.savedCards.set(cardUpdateForm.cardID, cardUpdateForm);

        // Update the array in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user, and THIS savedCard
            const filter = { uuid: this.getUUID(),  "savedCards.cardID": cardUpdateForm.cardID }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to push the new savedCard to the savedCard array
            const updateData = {
                $set: {
                    "savedCards.$": cardUpdateForm
                }
            };

            // Apply set operation!
            const setResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if pushResult.modifiedCount is greater than zero!
        });

        return true;
    }

    public async removeSavedCard(cardToRemoveID: string): Promise<boolean> {

        // Check for a falsy input parameter
        if (cardToRemoveID === null) {
            throw new Error("Cannot pass null");
        }
        else if (cardToRemoveID === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // Remove from data structure in memory
        const result = this.savedCards.delete(cardToRemoveID);

        // Remove from the array in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to remove a savedCard from the array by it's ID
            const updateData = {
                $pull: {
                    savedCards: { cardID: cardToRemoveID }
                }
            };

            // Apply push operation!
            const pushResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if pushResult.modifiedCount is greater than zero!
        });



        return result;
    }

    public async updateAccountSchema(accountSchemaUpdate: userAccountSchema): Promise<void> {

        // Check for a falsy input parameter
        if (accountSchemaUpdate === null) {
            throw new Error("Cannot pass null");
        }
        else if (accountSchemaUpdate === undefined) {
            throw new Error("Cannot pass undefined");
        }

        // Update the account schema in memory
        this.updateInternalAccountSchema(accountSchemaUpdate);

        // Update the user in the database
        await databaseWrapper.runMongoOperation(async (database) => {

            // Get user collection from database
            var userCollection = await database.collection("users");

            // Create a filter indicating that we want THIS user
            const filter = { uuid: this.getUUID() }

            // Create options explicitly saying that we do NOT want to upsert (create new data if it doesn't exist)
            const options = { upsert: false }

            // Create the update data, saying that we want to update user account data
            const updateData = {
                $set: {
                    userAccount: this.getAccountSchema()
                }
            };

            // Apply update operation!
            const updateResult = await userCollection.updateOne(filter, updateData, options);


            // If we wanted to check if it actually updated something at this point,
            // we would check to see if updateResult.modifiedCount is greater than zero!
        });

        // If we're modifying the public account info...
        if (accountSchemaUpdate.public) {

            const ourCard = await databaseWrapper.getCard(this.getCardID());

            // If we actually have a card...
            if (ourCard) {

                // Update it's known info!
                await ourCard.setOwnerInfo(accountSchemaUpdate.public);
            }
        }
    }









    //
    //  Helper Methods
    //

    private updateInternalAccountSchema(accountSchemaUpdate: userAccountSchema): void {
        if (accountSchemaUpdate.email != undefined) {
            this.email = accountSchemaUpdate.email;
        }

        if (accountSchemaUpdate.passwordHash != undefined) {
            this.passwordHash = accountSchemaUpdate.passwordHash;
        }

        if (accountSchemaUpdate.public != undefined) {
            this.updateInternalAccountPublicSchema(accountSchemaUpdate.public);
        }
    }

    private updateInternalAccountPublicSchema(accountPublicSchemaUpdate: userAccountPublicSchema): void {
        if (accountPublicSchemaUpdate.firstName != undefined) {
            this.firstName = filterXSS(accountPublicSchemaUpdate.firstName);
        }

        if (accountPublicSchemaUpdate.lastName != undefined) {
            this.lastName = filterXSS(accountPublicSchemaUpdate.lastName);
        }

        if (accountPublicSchemaUpdate.customURL != undefined) {
            this.customURL = accountPublicSchemaUpdate.customURL;
        }

        if (accountPublicSchemaUpdate.profilePictureURL != undefined) {
            this.profilePictureURL = accountPublicSchemaUpdate.profilePictureURL;
        }
    }
}