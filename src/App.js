import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import { addToHomeScreen, pushNotificationsSupported, updateSubscription, subscribeToNotifications, unsubscribeFromNotifications, logSubscriptionObjects } from "./Notifications";

import { version } from '../version.json';

export const App = () =>
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">{`React PWA Demo v${version}`}</h1>
    </header>
    <p className="App-intro">
      <button type="button" onClick={addToHomeScreen}>Add to Home Screen</button>
      <br />
      {pushNotificationsSupported
      ?
        <Fragment>
          <button type="button" onClick={() => subscribeToNotifications("some ID")}>Subscribe To Notifications</button>
          <br />
          <button type="button" onClick={() => unsubscribeFromNotifications("some ID")}>Unsubscribe</button>
          <br />
          <button type="button" onClick={() => updateSubscription("some ID")}>Update Subscription</button>
          {/* <br />
          <button type="button" onClick={logSubscriptionObjects}>console.log Subscription Objects</button> */}
        </Fragment>
      :
        <div>Push notifications not supported</div>
      }
    </p>
  </div>;
