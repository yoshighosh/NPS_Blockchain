/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { FoodContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('FoodContract', () => {

    let contract: FoodContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new FoodContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"food 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"food 1002 value"}'));
    });

    describe('#foodExists', () => {

        it('should return true for a food', async () => {
            await contract.foodExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a food that does not exist', async () => {
            await contract.foodExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createFood', () => {

        it('should create a food', async () => {
            await contract.createFood(ctx, '1003', 'food 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"food 1003 value"}'));
        });

        it('should throw an error for a food that already exists', async () => {
            await contract.createFood(ctx, '1001', 'myvalue').should.be.rejectedWith(/The food 1001 already exists/);
        });

    });

    describe('#readFood', () => {

        it('should return a food', async () => {
            await contract.readFood(ctx, '1001').should.eventually.deep.equal({ value: 'food 1001 value' });
        });

        it('should throw an error for a food that does not exist', async () => {
            await contract.readFood(ctx, '1003').should.be.rejectedWith(/The food 1003 does not exist/);
        });

    });

    describe('#updateFood', () => {

        it('should update a food', async () => {
            await contract.updateFood(ctx, '1001', 'food 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"food 1001 new value"}'));
        });

        it('should throw an error for a food that does not exist', async () => {
            await contract.updateFood(ctx, '1003', 'food 1003 new value').should.be.rejectedWith(/The food 1003 does not exist/);
        });

    });

    describe('#deleteFood', () => {

        it('should delete a food', async () => {
            await contract.deleteFood(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a food that does not exist', async () => {
            await contract.deleteFood(ctx, '1003').should.be.rejectedWith(/The food 1003 does not exist/);
        });

    });

});
