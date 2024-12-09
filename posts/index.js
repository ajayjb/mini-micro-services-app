import express from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";

const app = express();
app.use(express.json());

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

const posts = {};

app.post("/post", async (req, res) => {
  const id = crypto.randomUUID({ disableEntropyCache: true });
  const { title } = req.body;
  posts[id] = { id, title, createdAt: new Date().getTime() };

  axios
    .post("http://localhost:4000/events", {
      eventType: "PostCreated",
      data: { id, title, createdAt: new Date().getTime() },
    })
    .catch((error) => {
      console.log(error.message);
    });

  return res.status(201).send(posts[id]);
});

app.get("/posts", (req, res) => {
  return res.status(200).send(Object.values(posts));
});

app.post("/events", async (req, res) => {
  const { eventType, data } = req.body;
  return res.status(200).send({ message: "Success" });
});

app.listen(3005, () => {
  console.log("Server running on port 3005");
});
