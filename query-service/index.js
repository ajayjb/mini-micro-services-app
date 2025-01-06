import express from "express";
import cors from "cors";
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

const posts = {};

const eventHandler = (eventType, data) => {
  if (eventType === "PostCreated") {
    posts[data.id] = { ...data, comments: [] };
  } else if (eventType === "CommentCreated") {
    posts[data.postId].comments.push(data);
  } else if (eventType === "CommentUpdated") {
    const comment = posts[data.postId].comments.find(
      (item) => item.id === data.id
    );

    comment.status = data.status;
    comment.content = data.content;
  }
};

app.post("/events", async (req, res) => {
  const { eventType, data } = req.body;
  eventHandler(eventType, data);
  return res.status(200).send({ message: "Success" });
});

app.get("/posts", (req, res) => {
  return res.status(200).send(Object.values(posts));
});

app.listen(3015, async () => {
  console.log("Server running on port 3015");

  const events = await axios.get("http://event-bus-srv:4000/events");
  events.data.forEach((element) => {
    eventHandler(element.eventType, element.data);
  });
});
