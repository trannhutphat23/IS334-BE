const express = require('express')
const mongoose = require('mongoose')
const app = express();
const cors = require("cors");
require('dotenv').config()

app.use(express.json())
app.use(cors())
require('./database/init.mongodb')
app.use('/', require('./router'))

module.exports = app;