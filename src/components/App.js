import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import Home from '../containers/home'
import Settings from '../containers/settings'
import About from '../containers/about'

import StartupLogic from './StartupLogic'

import '../styles/component-styles/App.css'
import logo from '../images/logo.png'

class App extends Component {
  render () {
    return (
      <div className="application">
        <StartupLogic />
        <header className="main-header">
          <nav>
            <ul>
              <li>
                {/* eslint-disable react/forbid-component-props */}
                <Link to="/" className="main-header-logolink"><img src={logo} alt="Hisinge Buss AB" /></Link>
              </li>
              <li>
                <Link to="/">Räknare</Link>
              </li>
              <li>
                <Link to="/settings">Priser</Link>
              </li>
              <li>
                <Link to="/about">Instruktioner</Link>
                {/* eslint-enable react/forbid-component-props */}
              </li>
            </ul>
          </nav>
        </header>

        <main className="main-content">
          <Route exact path="/" component={Home} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/about" component={About} />
        </main>
        <footer className="main-footer" />

      </div>
    )
  }
}

export default App
