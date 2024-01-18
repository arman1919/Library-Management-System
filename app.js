const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
  secret: '1922001', 
  resave: false,
  saveUninitialized: true
}));

const PORT = process.env.PORT || 7777;

// Connecting to MongoDB using Mongoose
mongoose.connect('mongodb+srv://arman75780:A75780.a@alms.v6rmr6w.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`The server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });



const userSchema = new mongoose.Schema({
username: String,
email: String,
password: String,
takenBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] // Array for storing books taken by the user
});

const User = mongoose.model('User', userSchema);



const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  isbn: String,
  published_year: Number,
  category: [String],
  availability: Boolean,
  location: {
    shelf: String,
    row: Number
  },
  additional_info: {
    publisher: String,
    language: String,
    page_count: Number
  },
  cover_url: String,
  online_version_url: String
});

const Book = mongoose.model('Book', bookSchema);





app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if there is a user with the same email address
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.redirect('/registration?error=User with this email already exists');
    }

   // Checking if there is a user with the same username
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.redirect('/registration?error=User with this username already exists');
    }

    // If there is no user with the same email and username, create a new user
    const user = await User.create({ username, email, password });
    user.takenBooks = [];
    await user.save();

    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});





app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registration.html'));
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect('/login?error=User not found');
    }

    if (user.password === password) {
      req.session.user = user.toObject();
      return res.redirect('/index.html');
    } else {
      return res.redirect('/login?error=Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login');
  }
});




app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.post('/logout', (req, res) => {

  res.redirect('/'); // Redirecting to the login page
});


const booksPerPage = 10

app.get('/books', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || booksPerPage;

  try {
    const books = await Book
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
});


app.get('/book', async (req, res) => {
  const isbn = req.query.isbn;// Getting the ISBN from the request parameters

  try {
    const book = await Book.findOne({ isbn }); // Replace with "isbn" instead of "ISBN"

    if (!book) {
      res.status(404).send('Book not found');
      return;
    }

   // We are sending a page with detailed information about the book
    res.render('book-details', { book }); // Rendering the book-details.ejs page from the /views folder
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).send('Error fetching book details');
  }
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});



app.post('/book/take/:isbn', async (req, res) => {
  const isbn = req.params.isbn; // Getting the ISBN of the book from the request parameters
  try {
    // Checking if the user is in the session (logged in)
    if (!req.session.user) {
      return res.status(401).send('Unauthorized'); // If the user is not logged in, we send an error
    }

   // Getting information about the current user from the session
    const currentUserData = req.session.user;

    // Re-getting the user from the database by _id from the session object
    const currentUser = await User.findById(currentUserData._id);

    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    // Finding a book by ISBN
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Check if the book is available and if it has already been taken by the user
    if (book.availability && !currentUser.takenBooks.includes(book._id)) {
      currentUser.takenBooks.push(book._id);
      book.availability = false;
      await currentUser.save();
      await book.save();
      return res.redirect('/index.html');
  } else {
      // If the book is not available or already taken, set the message
      const message = 'The book is unavailable or has already been borrowed';
      return res.render('book-details', { book, message });
  }
  } catch (error) {
    console.error('Error taking book:', error);
    res.status(500).send('Error taking book');
  }
});


app.post('/book/return/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    if (!req.session.user) {
      return res.status(401).send('Unauthorized');
    }

    const currentUserData = req.session.user;
    const currentUser = await User.findById(currentUserData._id);

    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Checking if the user has taken this book
    const bookIndex = currentUser.takenBooks.indexOf(book._id);

    if (bookIndex !== -1) {
      // Deleting a book from the list of the user's taken books
      currentUser.takenBooks.splice(bookIndex, 1);
      book.availability = true; // Updating the availability of the book to true
      await currentUser.save();
      await book.save();
      return res.redirect('/index.html'); // After returning the book, we redirect to the main page
    } else {
      // If the book was not taken by the user
      const message = 'Did you not take this book or is it already in the library';
      return res.render('book-details', { book, message });
    }
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).send('Error returning book');
  }
});


app.get('/my-books', async (req, res) => {
  try {
    // Checking if the user is in the session (logged in)
    if (!req.session.user) {
      return res.status(401).send('Unauthorized'); // If the user is not logged in, we send an error
    }

    // Getting information about the current user from the session
    const currentUserData = req.session.user;

    // Re-getting the user from the database by _id from the session object
    const currentUser = await User.findById(currentUserData._id).populate('takenBooks');

    if (!currentUser) {
      return res.status(404).send('User not found');
    }

    res.render('my-books', { books: currentUser.takenBooks });
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).send('Error fetching user books');
  }
});