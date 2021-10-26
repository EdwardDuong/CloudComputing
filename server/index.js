const http = require("http");
const path = require("path");
const express = require("express");
const socketIo = require("socket.io");
const needle = require("needle");
const config = require("dotenv").config();
//Couldn't get this to work. Hardcoding for now
//const TOKEN = process.env.BEARER_TOKEN;
const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAJkVUwEAAAAAQXlpV00P1MHwv8jvlYAJ9dr9q7Y%3DkZMZD1kKSK37NzYZ1ZRNYXxGygamsSpmwDp6Ho7QZBNR72aRE5'
const PORT = process.env.PORT || 3000;
var Analyzer = require("natural").SentimentAnalyzer;
var stemmer = require("natural").PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
const app = express();

const server = http.createServer(app);
const io = socketIo(server);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../", "client", "index.html"));
});

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id";

const rules = [{ value: "dog" }];

// Get stream rules
async function getRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  console.log(response.body);
  return response.body;
}

// Set stream rules
async function setRules(term) {
  const data = {
    add: [{value: term}],
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

// Delete stream rules
async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

function sentimentAnalysic(tweet) {
  return analyzer.getSentiment(tweet.data.text.split(" "));
}

function streamTweets(socket) {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  stream.on("data", (data) => {
    try {
      const tweets = JSON.parse(data);
      console.log(tweets);
      const sentimentData = sentimentAnalysic(tweets);
      console.log(sentimentData);
      socket.emit("tweet", { tweet: tweets, sentimentData: sentimentData });
      //socket.emit("sentiment", sentimentData);
    } catch (error) { }
  });

  return stream;
}

io.on("connection", async (socket) => {
  console.log("Client connected...");
  /*let currentRules = 0;
  try {
    //   Get all stream rules
    currentRules = await getRules();

    // Delete all stream rules
    await deleteRules(currentRules);

    // Set rules based on array above
    await setRules();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const filteredStream = streamTweets(io);

  const timeout = 0;
  filteredStream.on("timeout", () => {
    // Reconnect on error
    console.warn("A connection error occurred. Reconnecting…");
    setTimeout(() => {
      timeout++;
      streamTweets(io);
    }, 2 ** timeout);
    streamTweets(io);
  });*/
  socket.on("search", async (term) => {
    console.log("searched for " + term);
  
    let currentRules = 0;
    try {
      //   Get all stream rules
      currentRules = await getRules();
  
      // Delete all stream rules
      await deleteRules(currentRules);
  
      // Set rules based on array above
      await setRules(term);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  
    const filteredStream = streamTweets(io);
  
    const timeout = 0;
    filteredStream.on("timeout", () => {
      // Reconnect on error
      console.warn("A connection error occurred. Reconnecting…");
      setTimeout(() => {
        timeout++;
        streamTweets(io);
      }, 2 ** timeout);
      streamTweets(io);
    });
  })
});



server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
