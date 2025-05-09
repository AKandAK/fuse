// src/api/v1/index.js
const express = require('express');
const router = express.Router();

const searchRoute= require('./query');
router.use('/query', searchRoute);

// const savedRoute = require('./saved');
// router.use('/saved', savedRoute);

// const detailsRoute = require('./details');
// router.use('/details', detailsRoute);

module.exports = router;
