# Library Management System

This is a simple library management system built using Node.js, Express, and MongoDB. The application allows users to register, log in, browse available books, take books, return books, and view their own list of taken books.

## Features

- **User Authentication:** Users can register, log in, and log out. Passwords are stored securely in the database.
- **Book Management:** Admins can add books to the system with details like title, authors, ISBN, availability, and more.
- **Book Borrowing:** Users can borrow available books, and the system keeps track of the user's taken books.
- **Book Returning:** Users can return borrowed books, updating the book's availability status.
- **User Dashboard:** Users can view their own list of taken books on their dashboard.

## Getting Started

Follow the steps below to set up and run the application:

1. Install Node.js and MongoDB on your machine.
2. Clone the repository to your local machine.
3. Install dependencies using `npm install`.
4. Start the MongoDB server.
5. Run the application using `npm start`.

The application will be accessible at `http://localhost:7777`.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Dependencies

- Express.js
- Mongoose
- EJS (Embedded JavaScript templates)

## Setup and Configuration

1. **Database Connection:**
   - Update the MongoDB connection string in `app.js` with your database credentials.

2. **Start the Application:**
   - Run the application using `npm start`.

3. **Access the Application:**
   - Open a web browser and go to `http://localhost:7777`.

## Usage

1. **Register:**
   - Navigate to `/registration` and register with a unique username and email.

2. **Log In:**
   - After registration, log in using your email and password at `/login`.

3. **Borrow a Book:**
   - Visit the main page at `/index.html`, browse available books, and click "Take Book" to borrow.

4. **Return a Book:**
   - Visit your dashboard at `/my-books` and click "Return Book" next to the borrowed book.

5. **Log Out:**
   - Log out using the "Log Out" button.

## Directory Structure

- `/public`: Static files (CSS, images).
- `/views`: EJS templates for rendering HTML pages.
- `/models`: MongoDB schema models.
- `/routes`: Express.js route handlers.

## Contributing

Feel free to contribute to this project by creating issues or pull requests. For major changes, please open an issue first to discuss your ideas.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.