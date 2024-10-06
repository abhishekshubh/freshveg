// Importing necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // To hash passwords
const path = require('path'); // For serving static files

// Initialize Express app
const app = express(); // Moved this line to the top
const PORT = process.env.PORT || 5000; // Use environment variable for port

// Increase limit to 10mb (you can set this to any value you need)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(cors());
// Serve static files from 'public' folder (if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection to the 'freshveg' database
mongoose.connect('mongodb://localhost:27017/freshveg')
    .then(() => console.log('MongoDB connected to freshveg database'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create Mongoose model for messages
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false }, // Optional field
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema); // Message model

// Create Mongoose model for users
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure unique emails
    password: { type: String, required: true }, // Hashed password will be stored
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema); // User model

// Serve the sign up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'sign_up.html')); // Ensure this file exists
});

// Serve the sign in page
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'sign_in.html')); // Ensure this file exists
});

// POST endpoint to handle form submissions for messages (contact form)
app.post('/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Create a new message document
    const newMessage = new Message({ name, email, phone, message });

    try {
        await newMessage.save(); // Save to the database
        return res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ success: false, message: 'There was an error saving your message.' });
    }
});

// POST endpoint for user signup
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = new User({ name, email, password: hashedPassword });

    try {
        await newUser.save(); // Save to the database
        return res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error saving user:', error);
        return res.status(500).json({ success: false, message: 'There was an error registering your account.' });
    }
});

// POST endpoint for user sign-in
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password.' });
        }

        return res.status(200).json({ success: true, message: 'Login successful!' });
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).json({ success: false, message: 'There was an error logging in.' });
    }
});

// Item Schema and Model
const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: String,
    category: String,
    image: String
});

const Item = mongoose.model('Item', itemSchema);

// Routes for CRUD Operations

//Get all items
app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

// Add new item
app.post('/items', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
});

// Update item
// app.put('/items/:id', async (req, res) => {
//     const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedItem);
// });

app.put('/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image } = req.body;

        // Ensure valid item ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid item ID' });
        }

        // Find the item by ID and update it
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, description, price, category, image },
            { new: true, runValidators: true } // Return the updated document & validate the data
        );

        // Check if item exists
        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Return the updated item
        res.status(200).json({ success: true, updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ success: false, message: 'There was an error updating the item' });
    }
});


// Delete item
app.delete('/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
