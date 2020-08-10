#!/use/bin/env node

const express = require('express');
const morgan = require('morgan');
const { text } = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const debug = require('debug');
const log = debug('ampify:dev-server');

debug.enable('ampify:dev-server');

const app = express();
const port = process.env.PORT || 2310;

const publicPath = path.resolve(process.argv[2] || './dist');

app.use(morgan('short', { stream: { write: (msg) => log(msg.trim()) } }));
app.use(text({ limit: '50mb' }));
app.use(
  express.static(publicPath, {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  }),
);

app.post('/*.js', async (req, res, next) => {
  const file = await fs.readFile(
    path.resolve(publicPath, req.path.substr(1)),
    'utf-8',
  );

  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(file);
});

app.post('/save', async (req, res, next) => {
  try {
    await fs.writeFile(
      path.resolve(publicPath, 'index.html'),
      req.body,
      'utf-8',
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ url: `http://localhost:${port}/index.html` });
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => {
  log('server started on port %s', port);
});

//
