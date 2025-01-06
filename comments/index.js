import express from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";

const app = express();
app.use(express.json());

const whitelist = ["http://localhost:3000", "http://posts.com"];
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

const postsComments = {};

app.post("/post/:id/comment/create", async (req, res) => {
  const id = crypto.randomUUID({ disableEntropyCache: true });
  const { content } = req.body;
  const { id: postId } = req.params;

  const comment = {
    id,
    postId,
    content,
    createdAt: new Date().getTime(),
    status: "pending",
  };
  postsComments[postId] = [...(postsComments[postId] ?? []), comment];

  axios.post("http://event-bus-srv:4000/events", {
    eventType: "CommentCreated",
    data: {
      id,
      content,
      createdAt: new Date().getTime(),
      postId,
      status: "pending",
    },
  });
  return res.status(201).send(comment);
});

app.get("/post/:id/comments", (req, res) => {
  const { id: postId } = req.params;
  return res.status(200).send(postsComments[postId] ?? []);
});

app.post("/events", async (req, res) => {
  const { eventType, data } = req.body;

  if (eventType === "CommentModerated") {
    const comment = postsComments[data.postId].find(
      (item) => item.id === data.id
    );

    comment.status = data.status;

    axios
      .post("http://event-bus-srv:4000/events", {
        eventType: "CommentUpdated",
        data: {
          ...comment,
          content: comment.status === "rejected" ? "" : comment.content,
        },
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return res.status(200).send({ message: "Success" });
});

app.listen(3010, () => {
  console.log("Server running on port 3010");
});
