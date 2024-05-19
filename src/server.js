import "babel-polyfill";

import express from 'express';
import path from 'path';
import https from 'https';
import http from 'http';

import webpackConfig from '../webpack.config';
import { backendUrlGraphql, mode } from '../constants.json';
import renderOnServer from './renderOnServer';

const PORT = 8080;
const app = express();

// Serve JavaScript
app.get('/bundle.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  if (mode === 'PRODUCTION') {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript')
    if (backendUrlGraphql.search('https') >= 0) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader("Expires", new Date(Date.now() + 86400).toUTCString());
    }
    else {
      res.setHeader('Cache-Control', 'no-cache');
    }
    res.sendFile('bundle.js.gz', {root: __dirname});
  }
  else
    res.sendFile('bundle.js', {root: __dirname})
});

app.get('*.css', (req, res, next) => {
  if (mode === 'PRODUCTION') {
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader("Expires", new Date(Date.now() + 31536000).toUTCString());
    res.sendFile(req.url + '.gz', {root: __dirname});
  }
  else {
    res.sendFile(req.url, {root: __dirname})
  }
})

app.use('*/images/', express.static(path.resolve(__dirname, '.', 'images'), { maxAge: '1y' }));
app.use('*/fonts/', express.static(path.resolve(__dirname, '.', 'fonts'), { maxAge: '1y' }));
app.use('*/svg-icons/', express.static(path.resolve(__dirname, '.', 'svg-icons'), { maxAge: '1y' }));
app.use('*/font-awesome/', express.static(path.resolve(__dirname, '.', 'font-awesome'), { maxAge: '1y' }));
app.use('*/favicon.ico/', express.static(path.resolve(__dirname, '.', 'favicon.ico'), { maxAge: '1y' }));
app.use('*/sitemap.txt', express.static(path.resolve(__dirname, '.', 'sitemap.txt'), { maxAge: '1y' }));
app.use('*/robots.txt', express.static(path.resolve(__dirname, '.', 'sitemap.txt'), { maxAge: '1y' }));

app.use((req, res, next) => {
  if (/Trident/.test(req.headers['user-agent'])) {
    res.render(path.resolve(__dirname, '..', 'views', 'change_browser.ejs'), {});
  }

  if (backendUrlGraphql.search('https') >= 0) {
    https
      .get(backendUrlGraphql, () => {
        renderOnServer(req, res, next);
      })
      .on('error', () => {
        res.render(path.resolve(__dirname, '..', 'views', 'down.ejs'), {});
      });
  }
  else if (backendUrlGraphql.search('http') >= 0) {
    http
      .get(backendUrlGraphql, () => {
        renderOnServer(req, res, next);
      })
      .on('error', () => {
        res.render(path.resolve(__dirname, '..', 'views', 'down.ejs'), {});
      });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`); // eslint-disable-line no-console
});
