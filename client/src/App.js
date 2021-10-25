import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react'
import { Card, Button, Navbar, Container } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

let socket = null;
let connection = false;
function CardBody({ tweetData }) {
  return (<>
    <Card>
      <Card.Body>
        <Card.Title>{tweetData.text}</Card.Title>
        <Card.Subtitle>{tweetData.username}</Card.Subtitle>
        <Card.Subtitle>{tweetData.sentiment}</Card.Subtitle>
        <Button href={`https://twitter.com/${tweetData.username}/status/${tweetData.id}`}>View tweet</Button>
      </Card.Body>
    </Card>
  </>
  )
}

function App() {
  document.title = "Real-Time Tweet Stream";
  const [tweets, setTweets] = useState([
  ]);
  
  useEffect(() => {
    async function connect() {
      socket = io('http://localhost:3000');

      socket.on("connect", () => {
        console.log("Connected to server...");
      });

      socket.on("tweet", ({ tweet, sentimentData }) => {
        const tweetData = {
          id: tweet.data.id,
          text: tweet.data.text,
          username: `@${tweet.includes.users[0].username}`,
          sentiment: sentimentData,
        };
        setTweets(prevVal => {
          return [...prevVal, tweetData].slice(-20);
        })
      });
    }
    if (!connection) {
      connection = true;
      connect()
    }
  }, [])

  return (
    <div className="App">
      <Navbar variant="dark" bg="dark">
        <Container>
          <Navbar.Brand>
            Real-Time Tweet Stream
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        {tweets.map(tweet => <CardBody tweetData={tweet} />)}
      </Container>
    </div>
  );
}

export default App;
