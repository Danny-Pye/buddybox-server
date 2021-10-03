import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {readdirSync} from 'fs';

const morgan = require('morgan');
require("dotenv").config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    path: "/socket.io",
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-type"],
    },
});


// **** DB *****
mongoose.connect(process.env.DATABASE, {
    useNewURLParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
}).then(() => console.log('Database connected')).catch((err) => console.log("database connection failed =>", err));

// *** MIDDLEWARE ****




app.use(express.json({limit: "5mb"}));
app.use(express.urlencoded({extended: true}));
app.use(cors({
        origin: [process.env.CLIENT_URL],
    }
));

//*** Auto Load Routes **** //
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// socket.io
io.on('connect', (socket) => {
    // console.log('socket.io connected', socket.id);
    socket.on('new-post', (newPost) => {
        // console.log("new post =>", newPost);
        socket.broadcast.emit('new-post', newPost);
    });
});


const port =  process.env.PORT || 8000;

http.listen(port, () => console.log(`Server listening on port ${port}`));