const http = require('http')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socket = require('socket.io');

dotenv.config({path: './config.env'}); // always run before the app
const app = require('./app');
const server = http.createServer(app);
const io = socket(server);

const formatMessage = require('./utils/formatMessage');

io.on('connection', socket => {
    // console.log(`connected  ${socket.id}`);
    // const user = socket.hand

    socket.on('chatMessage', msg => {
        io.emit('message', formatMessage('User', msg))
        console.log(formatMessage('User', msg), socket.id)
    });
    
})

const DB = process.env.CLUBMERCE_DB.replace('<PASSWORD>', process.env.CLUBMERCE_DB_PASSWORD);

mongoose.connect(DB)
.then(con => {
    console.log('Db connection successful!');
}).catch(err => {
    console.log(err);
});

const port = process.env.PORT || 8000;

server.listen(port, process.env.HOST, () => {
    console.log(`App running on port ${port}...`);
});