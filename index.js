const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const realtimeChat = require('./realtimeChat');
const path = require('path');

const ROLE_ENV = 'local';

if (ROLE_ENV === 'production') {
    let config = require('dotenv');
    config.config({ path: './config/config.env' });
    console.log('masuk role production')
} else {
    require('dotenv/config');
}

const {
    authRouter,
    userRouter,
    chatRouter,
    deviceInfoRouter,
    mediaRouter
} = require('./app/Routes');
const testingRouter = require('./app/Routes/testing');

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());

// TODO API
app.use('/', testingRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/upload', mediaRouter);
app.use('/api/device_info', deviceInfoRouter);

mongoose.set("strictQuery", false);
mongoose.connect(process.env.APP_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Database is ready!');
}).catch(err => {
    console.log(err);
    console.log('Database error!');
});

const server = app.listen(process.env.APP_PORT, "0.0.0.0", () => {
    const port = server.address().port;
    console.log(`Express is working on port ${port}`);
});

realtimeChat(server);
