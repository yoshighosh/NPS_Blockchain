/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Food } from './food';

@Info({title: 'FoodContract', description: 'My Smart Contract' })
export class FoodContract extends Contract {

    @Transaction(false) 
    @Returns('boolean')
    public async foodExists(ctx: Context, foodId: string, location: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(foodId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(false)
    @Returns('boolean')
    public async trackFoodID(ctx: Context, foodId: string, location: string): Promise<boolean> {
        const track = await this.foodExists(ctx, foodId, location);
        return track;
    }

    @Transaction()//change the contents of the leger, submitted to the leger
    public async createFood(ctx: Context, foodId: string, value: string, location: string): Promise<void> {
        const exists = await this.foodExists(ctx, foodId, location);
        if (exists) {
            throw new Error(`The food ${foodId} already exists`);
        }
        const food = new Food();
        food.value = value;
        const buffer = Buffer.from(JSON.stringify(food));
        await ctx.stub.putState(foodId, buffer);
    }

    @Transaction(false) //evaluated
    @Returns('Food')
    public async readFood(ctx: Context, foodId: string, location: string): Promise<Food> {
        const exists = await this.foodExists(ctx, foodId, location);
        if (!exists) {
            throw new Error(`The food ${foodId} does not exist`);
        }
        const buffer = await ctx.stub.getState(foodId);
        const food = JSON.parse(buffer.toString()) as Food;
        return food;
    }

    @Transaction()
    public async updateFood(ctx: Context, foodId: string, newValue: string, location: string): Promise<void> {
        const exists = await this.foodExists(ctx, foodId, location);
        if (!exists) {
            throw new Error(`The food ${foodId} does not exist`);
        }
        const food = new Food();
        food.value = newValue;
        const buffer = Buffer.from(JSON.stringify(food));
        await ctx.stub.putState(foodId, buffer);
    }

    @Transaction()
    public async deleteFood(ctx: Context, foodId: string, location: string): Promise<void> {
        const exists = await this.foodExists(ctx, foodId, location);
        if (!exists) {
            throw new Error(`The food ${foodId} does not exist`);
        }
        await ctx.stub.deleteState(foodId);
    }

}
