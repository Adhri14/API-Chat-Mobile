const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const realtimeChat = require('./realtimeChat');
require('dotenv/config');
const port = process.env.APP_PORT || 4000;

const {
    authRouter,
    userRouter
} = require('./app/Routes');

const app = express();

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());

// TODO API
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

mongoose.set("strictQuery", false);
mongoose.connect(process.env.APP_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Database is ready!');
}).catch(err => {
    console.log('Database error!');
});

const server = app.listen(port, async () => {
    console.log('Server is running on port : ', port);
});

realtimeChat(server);
