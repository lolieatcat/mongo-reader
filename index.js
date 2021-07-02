require('dotenv').config();
const express = require('express');
const { promisify } = require('util');

const server = express();
const port = parseInt(process.env.PORT || '9000');
const { Router } = require('express');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_DB ? process.env.MONGO_DB : 'mongodb://127.0.0.1:27017/';


const read = async (req, res) => {
  console.log('req', req.query);
  const dbName = req.query.db;
  const colName = req.query.col;
  const name = req.query.name;
  const value = req.query.value;

  const db = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const dbo = db.db(dbName);
  let ret = await dbo.collection(colName).find({ [name]: value }).toArray();

  res.json(ret);
}

const api = () => {
  const router = Router();
  router.get('/read', read);
  return router;
}

async function bootstrap() {
  server.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //当允许携带cookies此处的白名单不能写’*’
    res.header('Access-Control-Allow-Headers', 'content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With'); //允许的请求头
    res.header('Access-Control-Allow-Methods', 'POST, GET'); //允许的请求方法
    res.header('Access-Control-Allow-Credentials', false);  //允许携带cookies
    next();
  });
  server.use(api());
  await promisify(server.listen.bind(server, port))();
  console.log(`> Started on port ${port}`);
}

bootstrap();

