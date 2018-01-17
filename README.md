Stellar Federation Function
===========================

This is a [Stellar Federation
Server](https://www.stellar.org/developers/guides/concepts/federation.html)
implemented as a Google Cloud Function.

The main advantage over the official federation server is that it's
serverless, so it will be cheaper to run for the average user.


Usage
-----

First, go to the Datastore dashboard and create a new `Account` entity.
This entity should have at least the `address`, `name`, and `domain`
keys. Optionally, you can add the `memo` and `memo_type` fields.

After that, change the `projectId` constant in `index.js` to reflect
your project id.

Finally, deploy the function by uploading the project as zip (include
both `index.js` and `package.json`) or by running `npm run deploy`.


Donation
--------

You can donate XLM to `francesco*ceccon.me`(
`GD65TZEDHDYWHGDZFH5R7I64A35IKD6ICQK2ISX2AXDS4UJ6F6XMFTA6`).


License
-------


Copyright 2018 Francesco Ceccon <francesco@ceccon.me>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
