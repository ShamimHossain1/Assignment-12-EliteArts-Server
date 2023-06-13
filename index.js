const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yervfsu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const usersCollection = client.db('ass12').collection('users');
        const courseCollection = client.db('ass12').collection('course');
        const cartCollection = client.db('ass12').collection('carts');
        const paymentCollection = client.db('ass12').collection('payment');

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
//   run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World')
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
