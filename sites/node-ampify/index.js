const express = require('express');
const axios = require('axios');

const app = express();

app.get('/my/page/:id', (req, res, next) => {
  const { id } = req.params;

  res.set('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
      <link rel="amphtml" href="https://example.ampify.io/my/page/${id}/amp">
      <title>Ampify Node.Js Implementation</title>
  </head>
  <body>
    <h1>Convert To AMP</h1>
    
    <p>This is Page ${id}</p>
  </body>
</html>
`);
});

app.get('/my/page/:id/amp', async (req, res, next) => {
  const { id } = req.params;

  const { data } = await axios.get(
    `https://convert.ampify.io/5e92ec491344f30029f32c24?u=https://example.ampify.io/my/page/${id}`,
    {
      responseType: 'stream',
    },
  );

  data.pipe(res);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server started on port %s`, port);
});
