const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using service account key
const serviceAccount = require('./key.json'); // Path to your key.json file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const port = 3000;
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/ls.html"); 
});
// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Sign Up route
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Save user details to Firestore
  db.collection('users').doc(email).set({
    fullName: name,
    email: email,
    password: password, // WARNING: Storing plaintext password is a bad idea
  })
  .then(() => {
    res.status(200).send('User created successfully');
  })
  .catch((error) => {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  });
});

// Sign In route
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists in Firestore and match the password
  db.collection('users').doc(email).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.password === password) {
          res.status(200).send('Signed in successfully');
        } else {
          res.status(401).send('Incorrect password');
        }
      } else {
        res.status(404).send('No user found with that email');
      }
    })
    .catch((error) => {
      console.error('Error signing in:', error);
      res.status(500).send('Error signing in');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
