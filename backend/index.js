
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();


// Enable CORS
const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',
    'https://bulk-mail-3cejn7u5r-aswin-3559.vercel.app',
    'https://bulk-mail-ochre.vercel.app'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON data
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://aswin03kool_db_user:bzBTNcSDMcFKxC5q@aswin.y0zfm68.mongodb.net/passkey').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Gmail SMTP transporter


// Test backend
app.get('/', (req, res) => {
  res.send('Bulkmail Backend is Running!');
});

// Send email API

app.post('/send-email', async (req, res) => {
  try {
    const msg = req.body.msg;
    const emailList = req.body.emailList;

    const credential = mongoose.model('Credential', {}, 'bulkmail');
    const data = await credential.find();

    if (!data || data.length === 0) {
      return res.status(500).send('No email credentials found');
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass
      }
    });

    // Validate message
    if (!msg) {
      return res.status(400).send('Message is required');
    }

    // Validate email list
    if (!Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).send('Email list is empty or invalid');
    }

    // Send emails
    for (let i = 0; i < emailList.length; i++) {

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailList[i].A,
        subject: 'Test Email',
        text: msg
      };

      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent:', emailList[i].A, info.response);
    }

    res.status(200).send('All emails sent successfully');

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).send('Error sending email');
  }
});


// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
