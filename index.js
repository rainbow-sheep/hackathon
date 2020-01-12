'use strict';

const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().listUsers().then(res => {
    for (let u of res.users) console.log(u.email);
});

const { MongoClient } = require('mongodb');
const DB = 'palup-test';
const mongo = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
mongo.connect(function(err) {
    //assert.equal(null, err);
    console.log("Connected successfully to server");
    mongo.close();
});

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
    const client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
    const uid = Math.floor(Math.random() * 10000);//req.body.userInfo.uid || req.user.uid;
    try {
        await client.connect();
        const db = client.db(DB);
        await db.collection('connections').updateMany({}, { $push : { new : uid }})
        const others = (await db.collection('user_info').find({}).project({ _id: 0, uid: 1 }).toArray()).map(d => d.uid);
        req.body.userInfo.uid = uid;
        await db.collection('user_info').insertOne(req.body.userInfo);
        await db.collection('connections').insertOne({
            uid: uid,
            new: others,
            feed: [],
            interest: [],
            match: [],
            trash: []
        });
        await client.close();
        res.send('OK');
    } catch (e) {}
});

app.get('/find', async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
    try {
        await client.connect();
        let sres = JSON.stringify(await client.db(DB).collection('user_info').find({}).toArray()) + '\n';
        sres += JSON.stringify(await client.db(DB).collection('connections').find({}).toArray()) + '\n';
        await client.close();
        res.send(sres);
    } catch (e) {}
});

app.get('/clear', async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
    try {
        await client.connect();
        await client.db(DB).collection('user_info').drop();
        await client.db(DB).collection('connections').drop();
        //await client.db(DB).collection('user_info').find({}).toArray().then(async arry => {
        await client.close();
        res.send('OK');
    } catch (e) {}
});

app.use(validateFirebaseIdToken);

app.get('/hello', (req, res) => {
    res.send(`Hello ${req.user.name}`);
});

app.post('/body', (req, res) => {
    res.send(JSON.stringify(req.body));
});

app.listen(9000);
