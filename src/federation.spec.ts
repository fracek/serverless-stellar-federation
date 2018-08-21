/*
* Copyright 2018 Francesco Ceccon <francesco@ceccon.me>
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import 'mocha';
import { expect } from 'chai';
import * as MockExpressRequest from 'mock-express-request';
import * as MockExpressResponse from 'mock-express-response';
import {
    IFederationRecordRepository,
    IFederationRecord,
    FederationHandler
} from './federation';


class MockFederationRecordRepository implements IFederationRecordRepository {
    private readonly _records: IFederationRecord[];

    constructor() {
        this._records = [
            {
                stellar_address: 'foo*example.org',
                account_id: 'GA7SBUASY7A7DXIQJFKTK2BTALLVHPWCHFZCGVYFZYWGKPUI4ZNIGRUH'
            },
            {
                stellar_address: 'bar*example.org',
                account_id: 'GA7VPCQN43TNGTXL5LASPFO7XOX2SSJGPA6HTWF4SDU62CW2F2N5YROY',
                memo_type: 'text',
                memo: 'THIS IS A MEMO',
            },
            {
                stellar_address: 'baz*example.org',
                account_id: 'GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT'
            }
        ];
    }

    async findByAddress(address: string): Promise<IFederationRecord | undefined> {
        return this._records.find((r) => r.stellar_address == address);
    }

    async findById(id: string): Promise<IFederationRecord | undefined> {
        return this._records.find((r) => r.account_id == id);
    }
}


describe('FederationHandler', async () => {
    const handler = new FederationHandler(new MockFederationRecordRepository());

    describe('#lookupByAddress', async () => {
        it('should return the record if present', async () => {
            var request = new MockExpressRequest();
            var response = new MockExpressResponse();
            await handler.lookupByAddress(request, response, 'foo*example.org');

            expect(response.statusCode).to.eql(200);
            var body = response._getJSON();
            expect(body).to.have.property('stellar_address').eql('foo*example.org');
            expect(body).to.have.property('account_id').eql('GA7SBUASY7A7DXIQJFKTK2BTALLVHPWCHFZCGVYFZYWGKPUI4ZNIGRUH');
            expect(body).to.not.have.property('memo');
        });

        it('should return 404 if not present', async () => {
            var request = new MockExpressRequest();
            var response = new MockExpressResponse();
            await handler.lookupByAddress(request, response, 'foobar*example.org');

            expect(response.statusCode).to.eql(404);
            var body = response._getJSON();
            expect(body).to.have.property('detail').to.have.string('foobar*example.org');
        });
    });

    describe('#lookupById', async () => {
        it('should return the record if present', async () => {
            var request = new MockExpressRequest();
            var response = new MockExpressResponse();
            await handler.lookupById(request, response, 'GA7VPCQN43TNGTXL5LASPFO7XOX2SSJGPA6HTWF4SDU62CW2F2N5YROY');

            expect(response.statusCode).to.eql(200);
            var body = response._getJSON();
            expect(body).to.have.property('stellar_address').eql('bar*example.org');
            expect(body).to.have.property('account_id').eql('GA7VPCQN43TNGTXL5LASPFO7XOX2SSJGPA6HTWF4SDU62CW2F2N5YROY');
            expect(body).to.have.property('memo_type').eql('text');
            expect(body).to.have.property('memo').eql('THIS IS A MEMO');
        });

        it('should return 404 if not present', async () => {
            var request = new MockExpressRequest();
            var response = new MockExpressResponse();
            await handler.lookupById(request, response, 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

            expect(response.statusCode).to.eql(404);
            var body = response._getJSON();
            expect(body).to.have.property('detail').to.have.string('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        });
    });

    describe('#handle', async () => {
        it('should return an error if type is missing', async () => {
            var request = new MockExpressRequest({
                url: '/federation',
            });
            var response = new MockExpressResponse();
            await handler.handle(request, response);
            expect(response.statusCode).to.eql(500);
            expect(response._getJSON()).to.have.property('detail').to.have.string('type');
        });

        it('should return an error if q is missing', async () => {
            var request = new MockExpressRequest({
                url: '/federation',
                query: {
                    type: 'name'
                }
            });
            var response = new MockExpressResponse();
            await handler.handle(request, response);
            expect(response.statusCode).to.eql(500);
            expect(response._getJSON()).to.have.property('detail').to.eql('Must specify q');
        });

        it('should return an error if type is unknown', async () => {
            var request = new MockExpressRequest({
                url: '/federation',
                query: {
                    type: 'unknown',
                    q: 'test',
                }
            });
            var response = new MockExpressResponse();
            await handler.handle(request, response);
            expect(response.statusCode).to.eql(500);
            expect(response._getJSON()).to.have.property('detail').to.have.string('Unknown');
        });

        it('should return the record if name query', async () => {
            var request = new MockExpressRequest({
                url: '/federation',
                query: {
                    type: 'name',
                    q: 'foo*example.org',
                },
            });
            var response = new MockExpressResponse();
            await handler.handle(request, response);
            expect(response.statusCode).to.eql(200);
            expect(response._getJSON()).to.have.property('account_id').eql('GA7SBUASY7A7DXIQJFKTK2BTALLVHPWCHFZCGVYFZYWGKPUI4ZNIGRUH');
        });

        it('should return the record if id query', async () => {
            var request = new MockExpressRequest({
                url: '/federation',
                query: {
                    type: 'id',
                    q: 'GA7SBUASY7A7DXIQJFKTK2BTALLVHPWCHFZCGVYFZYWGKPUI4ZNIGRUH',
                },
            });
            var response = new MockExpressResponse();
            await handler.handle(request, response);
            expect(response.statusCode).to.eql(200);
            expect(response._getJSON()).to.have.property('stellar_address').eql('foo*example.org');
        });
    });
});
