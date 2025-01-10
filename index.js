require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const { json } = require('body-parser');
const urlparser = require('url');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MANGO_URI);
const db = client.db('urlparse');
const collection = db.collection('urls');

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  
  const origin_url = req.body.url;
  
  const dnslookup = dns.lookup(urlparser.parse(origin_url).hostname, async (error, link) => {
    if (!link) {
      res.json({
        error: 'invalid url'
      })
    } else {

      const urlCount = await collection.countDocuments({});
      const data = {
        original_url : origin_url, 
        short_url : urlCount
      };

      const insert_data = collection.insertOne(data);
      res.json({
        original_url : origin_url, 
        short_url : urlCount
      })
    }
  })
});

app.get("/api/short_url/:short_url", async (req, res) => {

  const ans = await collection.findOne({ short_url: +req.params.short_url });
  res.redirect(ans.original_url);

});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
