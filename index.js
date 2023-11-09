const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b0m9oyj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const categoriesCollection = client
      .db("bookifyDB")
      .collection("categories");
    const booksCollection = client.db("bookifyDB").collection("books");
    const borrowedBooksCollection = client
      .db("bookifyDB")
      .collection("borrowedBooks");

    // getting all books from database
    app.get("/allbooks", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });
    //   get categories from database
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });
    //   get books for specific category from database
    app.get("/books/:categoryName", async (req, res) => {
      const name = req.params.categoryName;
      const query = { category: name };
      const books = await booksCollection.find(query).toArray();
      res.send(books);
    });

    // getting single data from database
    app.get("/bookDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const book = await booksCollection.findOne(query);
      res.send(book);
    });
    // getting single data from database for update
    app.get("/updateBook/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const book = await booksCollection.findOne(query);
      res.send(book);
    });

    app.put("/updateBook/:id", async (req, res) => {
      const id = req.params.id;
      const book = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updatedBook = {
        $set: {
          img: book.img,
          name: book.name,
          authorName: book.author,
          rating: book.rating,
          category: book.selectedOption,
        },
      };

      const result = await booksCollection.updateOne(
        filter,
        updatedBook,
        options
      );
      res.send(result);
    });

    app.post("/addBook", async (req, res) => {
      const book = req.body;
      console.log(book);
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    // update quantity of borrowed book
    app.put("/updateQuantity/:id", async (req, res) => {
      const id = req.params.id;
      const book = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updatedBook = {
        $set: {
          quantity: book.qty,
        },
      };
      const result = await booksCollection.updateOne(
        filter,
        updatedBook,
        options
      );
      res.send(result);
    });

    // add borrowed Book to database
    app.post("/borrowedBooks", async (req, res) => {
      const borrowedBook = req.body;
      console.log(borrowedBook);
      const result = await borrowedBooksCollection.insertOne(borrowedBook);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bookify server is running");
});

app.listen(port, () => {
  console.log(`Bookify server is running on port ${port}`);
});
