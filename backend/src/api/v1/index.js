// src/api/v1/index.js
const express = require('express');
const router = express.Router();

const searchRoute= require('./query');
router.use('/query', searchRoute);

const bookmarksRoute = require('./bookmarks');
router.use('/bookmarks', bookmarksRoute);

const userRoute = require('./user');
router.use('/user', userRoute);

const detailsRoute = require('./details');
router.use('/details', detailsRoute);

module.exports = router;
