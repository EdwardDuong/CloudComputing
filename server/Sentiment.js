import Sentiment from "sentiment";
const sentiment = new Sentiment();

class Sentiment {
  constructor(props) {
    super(props);
    this.state = {
      sentimentScore: null,
      generalSentiment: null,
    };
    this.findSentiment = this.findSentiment.bind(this);
  }

  findSentiment(event) {
    const result = sentiment.analyse(event.target.value);
    this.setState({
      sentimentScore: result.score,
    });
    if (result.score < 0) {
      this.setState({
        generalSentiment: "Negative",
      });
    } else if ((result.score = 0)) {
      this.setState({
        generalSentiment: "Neutral",
      });
    } else {
      this.setState({
        generalSentiment: "Positive",
      });
    }
  }
  reder() {
    return (
      <div className="Sentiment">
        <h2> Sentiment Analysis of Tweet</h2>
        <p> Tweet Sentiment Score: {this.this.state.sentimentScore}</p>
        <p> General Sentiment Score: {this.this.state.generalSentiment}</p>
      </div>
    );
  }
}
