/* Copyright G. Hemingway, 2015 - All rights reserved */
'use strict';

// Necessary modules
require('./stylesheets/base.scss');
require('bootstrap-webpack');
let io = require('socket.io-client');
let jwtDecode = require('jwt-decode');
let actionManager = require('./actionmanager');
import CADManager from './models/cad_manager';
import React from 'react';
import ReactDOM from 'react-dom';
import ResponsiveView from './views/responsive';

class CADApp extends THREE.EventDispatcher {
  constructor() {
    super();
    let $body = $('body');
    this.services = $body.data('services');
    this.config = $body.data('config');
    // Set state
    this.state = {
      token: window.localStorage.getItem('user:token'),
      user: undefined,
    };
    if (this.state.token) {
      this.handleLogin({token: this.state.token});
    } else {
      this.addEventListener('user:login', this.handleLogin.bind(this));
    }

    // Setup socket
    this.socket = undefined;
    if (this.config.socket) {
      // Establish socket connection
      let socketURL = this.services.api_endpoint + this.services.socket;
      this.socket = io(socketURL, {});
      // Connect to the socket server
      this.socket.on('connect', function () {
        console.log('Socket client connected');
      });
    }
    // Create data manager
    this.cadManager = new CADManager(this.config, this.socket,this);

    // Create application-level action manager
    this.actionManager = actionManager;

    // Initialize views
    $body.toggleClass('non-initialized');
    // Initialize the views and dispatch the event to set the model
    let view = (
      <div style={{height:'100%'}}>
        <ResponsiveView
          app = {this}
        />
      </div>
    );
    ReactDOM.render(
      view,
      document.getElementById('primary-view'), function () {
        // Dispatch setModel to the CADManager
      }
    );

    this.cadManager.dispatchEvent({
      type: 'setModel',
      path: 'state/key',
      baseURL: this.services.api_endpoint + this.services.version,
      modelType: 'nc',
    });
  }

  handleLogin(ev) {
    // Set app state
    window.localStorage.setItem('user:token', ev.token);
    this.state.token = ev.token;
    this.state.user = jwtDecode(this.state.token);
    this.removeEventListener('user:login', this.handleLogin.bind(this));
    this.addEventListener('user:logout', this.handleLogout.bind(this));
  }

  handleLogout() {
    // Update logged out state
    window.localStorage.setItem('user:token', undefined);
    this.state.token = undefined;
    this.state.user = undefined;
    this.removeEventListener('user:logout', this.handleLogout.bind(this));
    this.addEventListener('user:login', this.handleLogin.bind(this));
  }
}

// Invoke the new app
module.exports = new CADApp();
