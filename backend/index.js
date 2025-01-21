const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/FormData'); // Import your schema
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 }) // Increase timeout to 30 seconds
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('Error connecting to MongoDB Atlas', err);
        process.exit(1);
    });

app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    FormDataModel.findOne({ email: email })
        .then(user => {
            if (user) {
                return res.status(409).json({ message: 'User already registered' });
            } else {
                FormDataModel.create({ email, password })
                    .then(newUser => res.status(201).json({ message: 'User registered successfully', user: newUser }))
                    .catch(err => res.status(500).json({ message: 'Error saving user', error: err }));
            }
        })
        .catch(err => res.status(500).json({ message: 'Database error', error: err }));
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    FormDataModel.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.password === password) {
                return res.status(200).json({ message: 'Login successful', user });
            } else {
                return res.status(401).json({ message: 'Invalid password' });
            }
        })
        .catch(err => res.status(500).json({ message: 'Database error', error: err }));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
