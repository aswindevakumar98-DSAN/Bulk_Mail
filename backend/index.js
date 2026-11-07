
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://bulk-mail-3cejn7u5r-aswin-3559.vercel.app',
    'https://bulk-mail-ochre.vercel.app'
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parse JSON
app.use(express.json());

// 3. Define Credential model ONCE, outside the API route
const credentialSchema = new mongoose.Schema({
    user: String,
    pass: String
}, {
    collection: 'bulkmail'
});

const Credential =
    mongoose.models.Credential ||
    mongoose.model('Credential', credentialSchema);

// 4. Test backend
app.get('/', (req, res) => {
    res.send('Bulkmail Backend is Running!');
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Bulkmail API is running',
        database: mongoose.connection.readyState === 1
            ? 'Connected'
            : 'Disconnected'
    });
});

// 5. Send email API
app.post('/send-email', async (req, res) => {
    try {
        const { msg, emailList } = req.body;

        // Validate message
        if (!msg) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Validate email list
        if (!Array.isArray(emailList) || emailList.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email list is empty or invalid'
            });
        }

        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database is not connected'
            });
        }

        // Fetch Gmail credentials
        const data = await Credential.find().limit(1);

        if (!data.length || !data[0].user || !data[0].pass) {
            return res.status(500).json({
                success: false,
                message: 'Email credentials not found'
            });
        }

        // Configure Gmail transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data[0].user,
                pass: data[0].pass
            }
        });

        // Send emails
        for (const recipient of emailList) {

            if (!recipient.A) {
                continue;
            }

            const mailOptions = {
                from: data[0].user,
                to: recipient.A,
                subject: 'Test Email',
                text: msg
            };

            const info = await transporter.sendMail(mailOptions);

            console.log(
                'Email sent:',
                recipient.A,
                info.response
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Emails sent successfully'
        });

    } catch (error) {
        console.error('EMAIL SENDING ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Error sending emails'
        });
    }
});

// 6. Connect MongoDB and start server
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    });

