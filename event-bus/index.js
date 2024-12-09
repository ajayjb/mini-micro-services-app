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

  axios.post("http://localhost:3005/events", event).catch((error) => {
    console.log(error.message);
  });
  axios.post("http://localhost:3010/events", event).catch((error) => {
    console.log(error.message);
  });
  axios.post("http://localhost:3015/events", event).catch((error) => {
    console.log(error.message);
  });
  axios.post("http://localhost:3020/events", event).catch((error) => {
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
