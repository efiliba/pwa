import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { addToHomeScreen, subscribeToNotifications } from "./Notifications";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">React PWA Demo</h1>
        </header>
        <p className="App-intro">
          <button type="button" onClick={addToHomeScreen}>Add to Home Screen</button>
          <br />
          <button type="button" onClick={() => subscribeToNotifications("some ID")}>Subscribe To Notifications</button>
        </p>
      </div>
    );
  }
}

export default App;
