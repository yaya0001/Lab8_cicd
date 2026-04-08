const express = require("express");
const mongoose = require("mongoose");
const app = express();

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/tasksdb";

const Task = mongoose.model("Task", {
  id: Number,
  name: String,
  status: String
});

const connectWithRetry = () => {
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log("Mongo connected");
      const count = await Task.countDocuments();
      if (count === 0) {
        await Task.insertMany([
          { id: 1, name: "Task1", status: "pending" },
          { id: 2, name: "Task2", status: "done" },
          { id: 7, name: "Tea", status: "pending" }
        ]);
        console.log("Seed data inserted");
      }
    })
    .catch(err => {
      console.log("Mongo connection failed, retrying in 5s...", err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
