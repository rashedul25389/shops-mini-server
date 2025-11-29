const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pscbpur.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const db = client.db('shopmini_db');
        const productsCollection = db.collection('products');

        app.get('/products', async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        });

        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const result = await productsCollection
                .find({ created_by: email })
                .toArray();
            res.send(result);
        });

        app.get('/products/:id', async (req, res) => {
            const { id } = req.params;
            console.log(id);

            const result = await productsCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send({
                success: true,
                result,
            });
        });

        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = productsCollection.insertOne(data);
            res.send({ success: true, result });
        });

        app.put('/products/:id', async (req, res) => {
            const { id } = req.params;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const update = {
                $set: data,
            };
            const result = await productsCollection.updateOne(filter, update);
            res.send({
                success: true,
                result,
            });
        });

        app.delete('/products/:id', async (req, res) => {
            const { id } = req.params;
            const filter = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);

            res.send({
                success: true,
                result,
            });
        });

        await client.db('admin').command({ ping: 1 });
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Shop mini Dev Platform server is running!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
