const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'sarinda-dev-secret';

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ypt4liz.mongodb.net/?appName=Cluster0`;

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
        await client.connect();

        const menuCollection = client.db("sarindaDB").collection("menu");
        const revCollection = client.db("sarindaDB").collection("reviews");
        const cartCollection = client.db("sarindaDB").collection("carts");
        const userCollection = client.db("sarindaDB").collection("users");
        const bookingCollection = client.db("sarindaDB").collection("bookings");

        const verifyJWT = (req, res, next) => {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' });
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).send({ message: 'unauthorized access' });
            }

            jwt.verify(token, accessTokenSecret, (error, decoded) => {
                if (error) {
                    return res.status(403).send({ message: 'forbidden access' });
                }

                req.decoded = decoded;
                next();
            });
        };

        const verifyAdmin = async (req, res, next) => {
            const requester = await userCollection.findOne({ email: req.decoded?.email });

            if (requester?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' });
            }

            next();
        };

        app.post('/jwt', async (req, res) => {
            try {
                const { email } = req.body;

                if (!email) {
                    return res.status(400).send({ message: 'email is required' });
                }

                const user = await userCollection.findOne({ email });

                if (!user) {
                    return res.status(404).send({ message: 'user not found' });
                }

                const token = jwt.sign(
                    { email, role: user.role || 'user' },
                    accessTokenSecret,
                    { expiresIn: '7d' }
                );

                res.send({ token });
            } catch (error) {
                console.error('POST /jwt error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/menu', async (req, res) => {
            try {
                const result = await menuCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error('GET /menu error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/menu/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await menuCollection.findOne(query);
                res.send(result);
            } catch (error) {
                console.error('GET /menu/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/reviews', async (req, res) => {
            try {
                const { email } = req.query;
                const query = email ? { email } : {};
                const result = await revCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('GET /reviews error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/carts', verifyJWT, async (req, res) => {
            try {
                const result = await cartCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error('GET /carts error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/users', verifyJWT, async (req, res) => {
            try {
                const { email } = req.query;
                const requesterEmail = req.decoded?.email;
                const requester = await userCollection.findOne({ email: requesterEmail });

                if (requester?.role !== 'admin' && email && email !== requesterEmail) {
                    return res.status(403).send({ message: 'forbidden access' });
                }

                if (requester?.role !== 'admin' && !email) {
                    return res.status(403).send({ message: 'forbidden access' });
                }

                const query = email ? { email } : {};
                const result = await userCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('GET /users error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.get('/bookings', verifyJWT, async (req, res) => {
            try {
                const { email } = req.query;
                const query = email ? { email } : {};
                const result = await bookingCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('GET /bookings error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.post('/carts', verifyJWT, async (req, res) => {
            try {
                const cartItem = req.body;
                const result = await cartCollection.insertOne(cartItem);
                res.send(result);
            } catch (error) {
                console.error('POST /carts error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.post('/menu', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const menuItem = req.body;
                const result = await menuCollection.insertOne(menuItem);
                res.send(result);
            } catch (error) {
                console.error('POST /menu error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.post('/users', async (req, res) => {
            try {
                const userItem = req.body;
                const result = await userCollection.insertOne(userItem);
                res.send(result);
            } catch (error) {
                console.error('POST /users error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.post('/reviews', verifyJWT, async (req, res) => {
            try {
                const reviewItem = req.body;
                const reviewDoc = {
                    name: reviewItem?.name || '',
                    email: reviewItem?.email || '',
                    details: reviewItem?.details || '',
                    rating: Number(reviewItem?.rating) || 1,
                    createdAt: new Date(),
                };

                const result = await revCollection.insertOne(reviewDoc);
                res.send(result);
            } catch (error) {
                console.error('POST /reviews error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.post('/bookings', verifyJWT, async (req, res) => {
            try {
                const bookingItem = req.body;

                const user = await userCollection.findOne({ email: bookingItem?.email });
                const isAdmin = user?.role === 'admin';

                const bookingDoc = {
                    ...bookingItem,
                    status: isAdmin ? 'confirmed' : 'pending',
                    createdAt: new Date(),
                };

                const result = await bookingCollection.insertOne(bookingDoc);
                res.send(result);
            } catch (error) {
                console.error('POST /bookings error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.patch('/menu/:id', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedMenu = req.body;
                const updateDoc = {
                    $set: {
                        name: updatedMenu.name,
                        category: updatedMenu.category,
                        price: Number(updatedMenu.price),
                        recipe: updatedMenu.recipe,
                        image: updatedMenu.image,
                    }
                };

                const result = await menuCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error('PATCH /menu/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.patch('/users/:id/role', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const { role } = req.body;
                const updateDoc = {
                    $set: { role }
                };

                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error('PATCH /users/:id/role error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.patch('/bookings/:id/confirm', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        status: 'confirmed',
                        confirmedAt: new Date(),
                    }
                };

                const result = await bookingCollection.updateOne(query, updateDoc);
                res.send(result);
            } catch (error) {
                console.error('PATCH /bookings/:id/confirm error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.delete('/menu/:id', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await menuCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error('DELETE /menu/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.delete('/users/:id', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await userCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error('DELETE /users/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.delete('/bookings/:id', verifyJWT, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await bookingCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error('DELETE /bookings/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        app.delete('/carts/:id', verifyJWT, async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await cartCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error('DELETE /carts/:id error:', error);
                res.status(500).send({ message: 'Internal server error', error: error.message });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // Start listening AFTER routes are registered
        app.listen(port, () => {
            console.log(`sarinda is open at port ${port}`);
        });

    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('cooking');
});
