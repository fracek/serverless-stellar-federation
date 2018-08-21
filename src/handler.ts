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
import { Request, Response } from 'express';
import Datastore = require('@google-cloud/datastore');
import { Query } from '@google-cloud/datastore/query';
import {
    FederationHandler,
    IFederationRecord,
    IFederationRecordRepository,
} from './federation';

class DatastoreFederationRecordRepository implements IFederationRecordRepository {
    private readonly _datastore: Datastore;

    constructor(private readonly kind: string) {
        this._datastore = new Datastore();
    }

    async findByAddress(address: string): Promise<IFederationRecord | undefined> {
        const query = this.createQuery()
            .filter('stellar_address', '=', address);
        return await this.runQuery(query);
    }

    async findById(id: string): Promise<IFederationRecord | undefined> {
        const query = this.createQuery()
            .filter('account_id', '=', id);
        return await this.runQuery(query);
    }

    private createQuery(): Query {
        return this._datastore.createQuery(this.kind);
    }

    private async runQuery(query: Query): Promise<IFederationRecord | undefined> {
        const result = await this._datastore.runQuery(query);
        const records = result[0];
        if (records.length == 0) return;
        return records[0] as IFederationRecord;
    }
}

const handler = new FederationHandler(new DatastoreFederationRecordRepository('StellarAccount'));

export async function federation(request: Request, response: Response) {
    handler.handle(request, response);
}
