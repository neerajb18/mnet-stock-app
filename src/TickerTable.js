import React, { Component } from "react";
import fecha from "fecha";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

const LIMIT = 20;
const SPARKLINE_COLOR = "#1C8CDC";
const SPARKLINE_HEIGHT = 20;
const SPARKLINE_MARGIN = 5;

export default class TickerTable extends Component {
  state = { tickers: {} };

  componentDidMount() {
    let connection = new WebSocket("ws://stocks.mnet.website");

    // Log errors
    connection.onerror = error => {
      console.log("WebSocket Error " + error);
    };

    //Update tickers
    connection.onmessage = e => this.updateTickerData(JSON.parse(e.data));
  }

  updateTickerData(data) {
    let { tickers } = this.state;
    data.forEach(([name, price]) => {
      let ticker = tickers[name];
      tickers[name] = this.getFormattedTickerData(ticker, price);
    });
    this.setState({ tickers });
  }

  getFormattedTickerData(ticker, price) {
    let history = [price];
    let diff = 0;
    if (ticker !== undefined) {
      diff = price - ticker.price;
      if (ticker.history.length < LIMIT) {
        history = ticker.history.concat(price);
      } else {
        history = ticker.history.slice(1).concat(price);
      }
    }

    return {
      price,
      history,
      diff,
      time: new Date()
    };
  }

  getFormattedTime(time) {
    let format = "HH:mm A";
    let currentTime = new Date();

    //last updated before today with different calendar year
    if (time.getYear() < currentTime.getYear()) format = "DD MMM YYYY HH:mm A";
    //last updated before today
    if (time.getDate() < currentTime.getDate()) format = "DD MMM HH:mm A";
    //last updated is less than 20 seconds
    else if ((time.getTime() - currentTime.getTime()) / 1000 < 20) format = "";
    return format === "" ? "A few seconds ago" : fecha.format(time, format);
  }

  render() {
    let { tickers } = this.state;
    return (
      <section>
        <div className="table">
          <div className="theader">
            <div className="ticker">Ticker</div>
            <div className="price">Price</div>
            <div className="last-update">Last Update</div>
            <div className="trend">Trend</div>
          </div>
          {Object.keys(tickers).map(name => {
            let ticker = tickers[name];
            let priceClass =
              ticker.diff > 0 ? "green" : ticker.diff < 0 ? "red" : "";
            return (
              <div className="row" key={name}>
                <div className="small">
                  <div className="cell">Ticker</div>
                  <div className="cell ticker">{name}</div>
                </div>
                <div className="small">
                  <div className="cell">Price</div>
                  <div className={`cell ${priceClass}`}>
                    {ticker.price.toFixed(2)}
                  </div>
                </div>
                <div className="small">
                  <div className="cell">Last Update</div>
                  <div className="cell last-update">
                    {this.getFormattedTime(ticker.time)}
                  </div>
                </div>
                <div className="small">
                  <div className="cell">Trend</div>
                  <div className="cell">
                    <Sparklines
                      data={ticker.history}
                      limit={LIMIT}
                      height={SPARKLINE_HEIGHT}
                      margin={SPARKLINE_MARGIN}
                    >
                      <SparklinesLine color={SPARKLINE_COLOR} />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}
