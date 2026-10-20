require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

const app = express();

const API_KEY = process.env.OMDB_API_KEY;
const OMDB_URL = 'http://www.omdbapi.com/';
const ONE_DAY = 24 * 60 * 60 * 1000;


const cache = {};

app.use(morgan('dev'));

app.get('/', (req, res) => {
  const { i, t } = req.query;

  if (!i && !t) {
    return res.status(400).json({ error: 'Provide an "i" (IMDb ID) or "t" (title) query parameter' });
  }

  const key = i ? `i=${i}` : `t=${t.toLowerCase()}`;
  const cached = cache[key];


  if (cached && Date.now() - cached.time < ONE_DAY) {
    return res.json(cached.data);
  }

  const params = { apikey: API_KEY };
  if (i) params.i = i;
  else params.t = t;

  axios
    .get(OMDB_URL, { params })
    .then((response) => {
      cache[key] = { data: response.data, time: Date.now() };
      res.json(response.data);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch data from OMDb' });
    });
});

module.exports = app;