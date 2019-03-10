import React, { Component } from "react";
import "./App.css";
import TickerTable from "./TickerTable";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>Stock App</header>
        <TickerTable />
      </div>
    );
  }
}

export default App;
