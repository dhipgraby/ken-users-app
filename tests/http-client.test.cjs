const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');

// Real Axios transforms, but never a network adapter or a real credential.
function fixtureClient(expected, respond) {
  let calls = 0;
  const client = axios.create({ adapter: async (config) => {
    assert.ok(calls < expected.length, 'Unexpected adapter call');
    const [method, url] = expected[calls++];
    assert.equal(config.method, method);
    assert.equal(config.url, url);
    return respond(config);
  } });
  return { client, complete: () => assert.equal(calls, expected.length) };
}

test('JSON POST serialization and Bearer GET headers remain compatible', async () => {
  const { client, complete } = fixtureClient([
    ['post', '/fixture/login'], ['get', '/fixture/user'],
  ], (config) => {
    if (config.method === 'post') {
      assert.equal(config.headers.get('Content-Type'), 'application/json');
      assert.deepEqual(JSON.parse(config.data), { identifier: 'fixture-user', password: 'fake-password' });
    } else {
      assert.equal(config.headers.get('Authorization'), 'Bearer fixture-token');
      assert.equal(config.data, undefined);
    }
    return { data: '{"id":"fixture-user"}', status: 200, statusText: 'OK', headers: {}, config };
  });
  const posted = await client.post('/fixture/login', { identifier: 'fixture-user', password: 'fake-password' }, {
    headers: { 'Content-Type': 'application/json' },
  });
  assert.deepEqual(posted.data, { id: 'fixture-user' });
  const fetched = await client.get('/fixture/user', { headers: { Authorization: 'Bearer fixture-token' } });
  assert.equal(fetched.status, 200);
  assert.deepEqual(fetched.data, posted.data);
  complete();
});

test('AxiosError identification and transformed error response remain compatible', async () => {
  const { client, complete } = fixtureClient([['get', '/fixture/denied']], (config) => {
    const response = { data: '{"message":"Unauthorized","statusCode":401}', status: 401,
      statusText: 'Unauthorized', headers: {}, config };
    throw new axios.AxiosError('Fixture denied', axios.AxiosError.ERR_BAD_REQUEST, config, undefined, response);
  });
  await assert.rejects(client.get('/fixture/denied'), (error) => {
    assert.ok(error instanceof axios.AxiosError);
    assert.equal(axios.isAxiosError(error), true);
    assert.equal(error.code, 'ERR_BAD_REQUEST');
    assert.equal(error.response.status, 401);
    assert.equal(error.response.statusText, 'Unauthorized');
    assert.deepEqual(error.response.data, { message: 'Unauthorized', statusCode: 401 });
    return true;
  });
  assert.equal(axios.isAxiosError(new Error('ordinary fixture error')), false);
  complete();
});
