/*
 * Copyright 2018 Francesco Ceccon <francesco@ceccon.me>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Datastore = require('@google-cloud/datastore');
const cors = require('cors')

const projectId = 'stellar-federation';

const datastore = new Datastore({
  projectId: projectId,
});

function sendQueryResult(req, res, query) {
  datastore.runQuery(query).then(results => {
    const accounts = results[0];
    if (accounts.length == 0) {
      return res.status(404).send({detail: 'Not found'});
    }
    const account = accounts[0];

    const stellarAddress = account['name'] + '*' + account['domain'];

    let body = {
      stellar_address: stellarAddress,
      account_id: account['address'],
    };

    if (account['memo'] !== undefined && account['memo_type'] !== undefined) {
      body['memo'] = account['memo'];
      body['memo_type'] = account['memo_type'];
    }
    res.send(body);
  });
}

function lookupByName(req, res, stellarAddress) {
  const parts = stellarAddress.split('*');

  if (parts.length != 2) {
    return res.status(500).send({detail: 'Invalid stellar address ' + stellarAddress});
  }
  const name = parts[0];
  const domain = parts[1];
  const query = datastore
	.createQuery('Account')
	.filter('name', '=', name)
	.filter('domain', '=', domain);
  return sendQueryResult(req, res, query);
}

function lookupById(req, res, address) {
  const query = datastore
	.createQuery('Account')
	.filter('address', '=', address);
  return sendQueryResult(req, res, query);
}

stellarFederationFn = function(req, res) {
  const q = req.query['q'];
  const type = req.query['type'];
  if (q === undefined || type === undefined) {
    res.status(500).send({detail: 'Wrong query'});
  } else {
    if (type === 'name') {
      return lookupByName(req, res, q);
    } else if (type == 'id') {
      return lookupById(req, res, q);
    } else {
      res.status.send(500).send({detail: 'Unknown query type ' + type});
    }
  }
};

exports.stellarFederation = function(req, res) {
  var corsFn = cors();
  corsFn(req, res, function() {
    stellarFederationFn(req, res);
  });
};
