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

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;

  events.push(event);

  axios
    .post("http://posts-clusterip-srv:3005/events", event)
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      console.log("error", error);
    });
  axios
    .post("http://comments-clusterip-srv:3010/events", event)
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      console.log(error.message);
    });
  axios
    .post("http://query-service-clusterip-srv:3015/events", event)
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      console.log(error.message);
    });
  axios
    .post("http://moderation-service-srv:3020/events", event)
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      console.log(error.message);
    });

  return res.send({});
});

app.get("/events", (req, res) => {
  return res.status(200).send(events);
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
