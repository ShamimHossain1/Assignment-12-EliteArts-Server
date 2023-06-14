const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zdzmpk5.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        //await client.connect();
        client.connect();

        const usersCollection = client.db('ass12').collection('users');
        const courseCollection = client.db('ass12').collection('course');
        const cartCollection = client.db('ass12').collection('carts');
        const paymentCollection = client.db('ass12').collection('payment');


        //USER API
        app.get('/ins', async (req, res) => {
            const result = await usersCollection.find({ role: 'instructor' }).toArray();
            res.send(result);
        });
        app.get('/history/:email', async (req, res) => {
            const email = req.params.email;

            app.delete('/history/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await paymentCollection.deleteOne(query);
                res.send(result);
              })

              app.get('/users', verifyJWT, verifyAdmin,  async (req, res) => {
                const result = await usersCollection.find().toArray();
                res.send(result);
              });

              app.post('/users', async (req, res) => {
                const user = req.body;
                const query = { email: user.email }
                const existingUser = await usersCollection.findOne(query)
                if (existingUser) {
                  return res.send({ message: 'already exists' })
                }
                const result = await usersCollection.insertOne(user);
                res.send(result)
              })
              // //// admin verify
    app.get('/users/admin/:email', verifyJWT,  async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ admin: false })
      // }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result);
    })

    // instructor
    app.get('/users/ins/:email',   async (req, res) => {
      const email = req.params.email.toLowerCase();
      console.log({email})
    
      // if (req.decoded.email !== email) {
      //   res.send({ instructor: false });
      // }
    
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user)
      const result = { instructor: user?.role === 'instructor' };
      res.send(result);
    });
    // make admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "admin"
        }
      }

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    // ins
    app.patch('/users/ins/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "instructor"
        }
      }

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    //add
    app.post('/course', async (req, res) => {
      const newCourse = req.body;

      const result = await courseCollection.insertOne(newCourse);
      res.send(result);
    })
    app.get('/course', async (req, res) => {
      const cursor = courseCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.delete('/course/:id', verifyJWT, verifyAdmin, async (req, res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await courseCollection.deleteOne(query)
      res.send(result);    
   })

     // for ins 
     app.get('/course/:email', async (req, res) => {
      const email = req.params.email;
    
      try {
        const result = await courseCollection.find({ email: email }).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving course data');
      }
    });

    // cart collection
    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item)
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })






          
            try {
              const result = await paymentCollection.find({ email: email }).toArray();
              res.send(result);
            } catch (error) {
              console.error(error);
              res.status(500).send('Error retrieving payment history');
            }
          });

        // Send a ping to confirm a successful connection
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
