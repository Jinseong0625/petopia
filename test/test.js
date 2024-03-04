const chai = require('chai');
const assert = chai.assert;
const net = require('net');

describe('Server Tests', () => {
  let server;

  before((done) => {
    server = net.createServer();
    server.listen(3567, '218.38.65.83', done);
  });

  after((done) => {
    server.close(done);
  });

  it('should connect to the server', (done) => {
    const client = net.connect({ port: 3567, host: '218.38.65.83' }, () => {
      assert.ok(client);
      client.end();
      done();
    });
  });

  it('should handle data relay', (done) => {
    const client1 = net.connect({ port: 3567, host: '218.38.65.83' }, () => {
      const client2 = net.connect({ port: 3567, host: '218.38.65.83' }, () => {
        client1.write('Test message');
        client2.once('data', (data) => {
          assert.strictEqual(data.toString(), 'Test message');
          client1.end();
          client2.end();
          done();
        });
      });
    });
  });

  // Add more tests as needed
});
