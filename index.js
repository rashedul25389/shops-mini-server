const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
    cors({
        origin: '*', // অথবা শুধু frontend URL দিন
    })
);
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pscbpur.mongodb.net/?retryWrites=true&w=majority`;

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

        // Get all products
        app.get('/products', async (req, res) => {
            try {
                const result = await productsCollection.find().toArray();
                res.send(result);
            } catch (err) {
                res.status(500).send({ error: 'Failed to fetch products' });
            }
        });

        // Get product by ID
        app.get('/products/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await productsCollection.findOne({
                    _id: new ObjectId(id),
                });
                res.send({ success: true, result });
            } catch (err) {
                res.status(500).send({ error: 'Failed to fetch product' });
            }
        });

        // Add new product
        app.post('/products', async (req, res) => {
            const data = req.body;
            try {
                const result = await productsCollection.insertOne(data);
                res.send({ success: true, result });
            } catch (err) {
                res.status(500).send({ error: 'Failed to add product' });
            }
        });

        // Update product
        app.put('/products/:id', async (req, res) => {
            const { id } = req.params;
            const data = req.body;
            try {
                const filter = { _id: new ObjectId(id) };
                const update = { $set: data };
                const result = await productsCollection.updateOne(
                    filter,
                    update
                );
                res.send({ success: true, result });
            } catch (err) {
                res.status(500).send({ error: 'Failed to update product' });
            }
        });

        // Delete product
        app.delete('/products/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await productsCollection.deleteOne({
                    _id: new ObjectId(id),
                });
                res.send({ success: true, result });
            } catch (err) {
                res.status(500).send({ error: 'Failed to delete product' });
            }
        });

        console.log('Connected to MongoDB successfully!');
    } finally {
        // client.close(); // Deployable server এ client খোলা রাখবেন
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Shop mini Dev Platform server is running!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
