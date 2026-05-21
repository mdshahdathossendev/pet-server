const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
app.use(express.json());
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const port = process.env.PORT
app.use(cors());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)
const verifayToken = async(req, res, next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
     return res.status(401).json({
      message: "Unauthorized"
    });
  };
    const token = authHeader.split(" ")[1];
    console.log(token)
  if(!token){
     return res.status(401).json({
      message: "Unauthorized"});
  };
  try{
    const {payload} = await jwtVerify(token, JWKS);
  console.log(payload)
   next();
  }
  catch (error) {
    console.error('Token validation failed:', error)
    throw error
  }
}
async function run() {
  try {
    const db = client.db("Pat-server");
    const patCullation = db.collection("data");
    const myListingCulation = db.collection('listing')
    // await client.connect();
    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    app.get('/allpat', async(req, res) =>{
        const result = await patCullation.find().toArray();
        res.send(result)
    });
    app.get('/allpat/:id',verifayToken, async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await patCullation.findOne(query);
        res.send(result)
    });
    app.post('/allpat', async(req, res)=>{
        const query = req.body;
        const result = await patCullation.insertOne(query);
        res.send(result)
    });
    app.delete('/allpat/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await patCullation.deleteOne(query);
        res.send(result)
    });
    app.patch('/allpat/:id', async (req, res) => {

    const id = req.params.id;
    const updatedData = req.body;

    const filter = { _id: new ObjectId(id) };

    const updatedDoc = {
    $set: updatedData,
  };

    const result = await patCullation.updateOne(
    filter,
    updatedDoc
  );
  res.send(result);
});
app.post('/listing', async(req, res)=>{
    const query = req.body;
    const result = await myListingCulation.insertOne(query);
    res.send(result)
  });
app.get('/listing',verifayToken, async(req, res)=>{
    const result = await myListingCulation.find().toArray();
    res.send(result)
});
app.get('/listing/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    const result = await myListingCulation
        .find({ userId })
        .toArray();

    res.send(result);
});
 app.get('/listing/delts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        deltsId: id
      };
      const result = await myListingCulation.find(query).toArray();
      res.send(result);
    });
app.delete('/listing/:id',async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await myListingCulation.deleteOne(query);
    res.send(result)
});
app.get('/listing/:id', verifayToken, async(req, res) => {
    const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await myListingCulation.findOne(query);
        res.send(result);
});
app.get("/pets", async (req, res) => {
  try {
    const { search, species } = req.query;

    let query = {};

    // 🔍 search by name
    if (search) {
      query.petName = {
        $regex: search,
        $options: "i",
      };
    }

    // 🐶 filter by species
    if (species) {
      query.species = { $in: species.split(",") };
    }

    const pets = await petCollection.find(query).toArray();

    res.send(pets);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Server error" });
  }
});
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

