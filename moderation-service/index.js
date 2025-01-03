import express from "express";
import cors from "cors";
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

app.post("/events", async (req, res) => {
  const { eventType, data } = req.body;

  if (eventType === "CommentCreated") {
    const { content } = data;

    let status = "approved";

    const keywordsToSearch = [
      "fuck",
      "shit",
      "cunt",
      "asshole",
      "dick",
      "pussy",
      "bastard",
      "racial slur",
      "homophobic slur",
      "kill",
      "violence",
      "hate",
      "discrimination",
      "spam",
      "advertisement",
      "troll",
      "bait",
      "inflammatory",
      "adult",
      "illegal",
      "copyright infringement",
      "false information",
      "misinformation",
      "disinformation",
    ];

    for (const key of keywordsToSearch) {
      if (content.search(key) !== -1) {
        status = "rejected";
        break;
      }
    }

    axios
      .post("http://event-bus-srv:4000/events", {
        eventType: "CommentModerated",
        data: {
          id: data.id,
          postId: data.postId,
          status,
        },
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return res.status(200).send({ message: "Success" });
});

app.listen(3020, () => {
  console.log("Server running on port 3020");
});
