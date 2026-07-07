from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> float:
    sentiment = analyzer.polarity_scores(text)
    return sentiment["compound"]