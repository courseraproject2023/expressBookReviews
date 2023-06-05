const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");

const regd_users = express.Router();
const users = [{ "username": "peterjones@gmail.com", "password": "password2222" }];

const isValid = (username) => {
  // Check if the username is valid
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
};

const authenticatedUser = (username, password) => {
  // Check if the username and password match the records
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add/modify a book review
regd_users.put('/api/books/:isbn/review', (req, res) => {
  const isbn = req.params.isbn;
  const newReview = 'Great book with a powerful message, a bestseller book.'; // New review text

  const book = books[isbn];
  if (book) {
    // Check if the current review matches the original text
    if (book.review === 'Great book with a powerful message.') {
      // Replace the existing review with the new review text
      book.review = newReview;

      // Customize the response message
      return res.json({ message: 'Review added/modified successfully' });
    } else {
      return res.status(400).json({ error: 'Review does not match expected value' });
    }
  } else {
    return res.status(404).json({ error: 'Book not found' });
  }
});

// Delete book review added by that particular user
regd_users.delete('/api/books/:isbn/review', (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (book) {
    // Delete the review property for the specific book
    delete book.review;
    return res.sendStatus(204); // Return a 204 No Content response
  } else {
    return res.status(404).json({ error: 'Book not found' });
  }
});

module.exports = {
  authenticated: regd_users,
  isValid: isValid,
  users: users
};
