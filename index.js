'use strict';

const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().listUsers().then(res => {
    for (let u of res.users) console.log(u.email);
});

const { MongoClient } = require('mongodb');
const MONGO_DB = 'palup-test';
const MONGO_COLLECTION = 'users';
const openMongo = async function(dbcallback) {
    const client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
    try {
        await client.connect();
        await dbcallback(client.db(MONGO_DB).collection(MONGO_COLLECTION));
        await client.close();
    } catch (e) {
        console.error(e);
    }
};

const express = require('express');
//const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();

// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else if (req.body && req.body.userToken) {
        console.log("found userToken in POST data");
        idToken = req.body.userToken;
    } else {
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};

app.use(cors);

app.get('/', (req, res) => res.send('Hello world!'));

//app.use(cookieParser);
app.use(express.json());

app.post('/register', async (req, res) => {
    const uid = Math.floor(Math.random() * 10000);//req.body.userInfo.uid || req.user.uid;
    openMongo(async users => {
        await users.updateMany({}, { $push : { 'connections.new': uid }});
        const others = (await users.find().project({ _id: 0, uid: 1 }).toArray()).map(d => d.uid);
        const newUser = {
            uid: uid,
            info: req.body.info,
            about: req.body.about,
            connections: {
                new: others,
                feed: [], saved: [], match: [], trash: []
            }
        };
        await users.insertOne(newUser);
        res.send('OK');
    });
});

app.get('/recommendations', async (req, res) => {
    const uid = parseInt(req.query.uid) || req.user.uid;
    openMongo(async users => {
        let u = await users.findOne({uid: uid});
        let feedUsers = await users.find({ uid: { $in: u.connections.feed } }).toArray();
        if (u.connections.new.length > 0) {
            //request ai api
            const newUsers = await users.find({ uid: { $in: u.connections.new } }).toArray();
            feedUsers = feedUsers.concat(newUsers);
            await users.updateOne({uid: uid}, { $set: { 'connections.new': [] }});
            await users.updateOne({uid: uid}, { $set: { 'connections.feed': u.connections.feed.concat(u.connections.new) }});
        }
        let sres = JSON.stringify(feedUsers.map(fu => ({about: fu.about, info: fu.info})));
        res.send(sres);
    });
});

app.get('/find', async (req, res) => {
    openMongo(async users => {
        const us = await users.find({}).toArray();
        let sres = '';
        for (let u of us) {
            sres += JSON.stringify(u) + '\n';
        }
        res.send(sres);
    });
});

app.get('/clear', async (req, res) => {
    openMongo(users => {
        users.drop();
        res.send('OK');
    });
});

app.use(validateFirebaseIdToken);

app.get('/hello', (req, res) => {
    res.send(`Hello ${req.user.name}`);
});

app.post('/body', (req, res) => {
    res.send(JSON.stringify(req.body));
});

app.listen(9000);
