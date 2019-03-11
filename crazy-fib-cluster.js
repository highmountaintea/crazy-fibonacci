const cluster = require('cluster');
const Promise = require('bluebird');
const express = require('express');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < 4; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  let app = express();

  function fib(n) {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
  }

  app.get('/fib/:n/:delay', async (req, res) => {
    try {
      let n = parseInt(req.params.n, 10);
      if (!(n >= 1 && n <= 50)) throw new Error('n has to be between 1 and 50');
      fib(n);
      await Promise.delay(parseInt(req.params.delay, 10));
      let result = fib(n);
      let output = JSON.stringify({ result: result });
      res.setHeader('Content-Type', 'application/json');
      res.send(output);
    } catch (e) {
      res.status(400);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ error: e.message }));
    }
  });

  let port = 3600;
  if (process.argv.length >= 3) port = parseInt(process.argv[2], 10);

  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
  console.log(`Worker ${process.pid} started`);
}
