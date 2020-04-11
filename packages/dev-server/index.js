#!/usr/bin/env node

const express = require('express');
const morgan = require('morgan');
const { text } = require('body-parser');
const { join } = require('path');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 2310;

app.use(morgan('short'));
app.use(text({ limit: '50mb' }));
app.use(
  express.static(join(__dirname, 'public'), {
    etag: false,
    maxAge: 0,
  }),
);

app.post('/save', async (req, res, next) => {
  try {
    await fs.writeFile('./public/latest.html', req.body, 'utf-8');
    res.json({ url: `http://localhost:${port}/latest.html` });
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => {
  console.log('server started on port %s', port);
});
