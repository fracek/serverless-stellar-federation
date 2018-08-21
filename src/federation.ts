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

export enum QueryType {
    Name = 'name',
    Id = 'id',
}

export interface IFederationRecord {
    stellar_address: string;
    account_id: string;
    memo_type?: string;
    memo?: string;
}


export interface IFederationRecordRepository {
    findByAddress(address: string): Promise<IFederationRecord | undefined>;
    findById(id: string): Promise<IFederationRecord | undefined>;
}

export class FederationHandler {
    constructor(private readonly repository: IFederationRecordRepository) {
    }

    async lookupByAddress(request: Request, response: Response, address: string) {
        const record = await this.repository.findByAddress(address);
        if (record == null) {
            return response.status(404).send({
                detail: `Could not find record with address ${address}`,
            });
        }
        return response.send(record);
    }

    async lookupById(request: Request, response: Response, id: string) {
        const record = await this.repository.findById(id);
        if (record == null) {
            return response.status(404).send({
                detail: `Could not find record with account id ${id}`,
            });
        }
        return response.send(record);
    }

    async handle(request: Request, response: Response) {
        const queryType = request.query['type'];
        if (queryType == null) {
            return response.status(500).send({
                detail: 'Must specify type',
            });
        }

        const q = request.query['q'];
        if (q == null) {
            return response.status(500).send({
                detail: 'Must specify q',
            });
        }

        switch (queryType) {
            case QueryType.Name:
                return this.lookupByAddress(request, response, q);
            case QueryType.Id:
                return this.lookupById(request, response, q);
            default:
                return response.status(500).send({
                    detail: `Unknown query type ${queryType}`,
                })
        }
    }
}
