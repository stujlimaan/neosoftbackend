


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const axios = require('axios'); 

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost/meanApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const PostSchema = new mongoose.Schema({
  userId: Number,
  id: Number,
  title: String,
  body: String,
});


const Post = mongoose.model("Post", PostSchema);

app.get("/fetch-and-save-post", async (req, res) => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/posts");
    const posts = response.data;
    await Post.insertMany(posts);
    res.send("Posts fetched and saved successfully");
  } catch (err) {
    res.status(500).send("Error fetching and saving posts: " + err.message);
  }
});

// Pagination, Sorting, and Search
app.get('/posts', async (req, res) => {
  const { page = 1, limit = 10, search = '', sortBy = 'id', sortOrder = 'asc' } = req.query;
  try {
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ]
    };

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await Post.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort)
      .exec();

    const count = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPosts: count
    });
  } catch (err) {
    res.status(500).send("Internal error: " + err.message);
  }
});

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
