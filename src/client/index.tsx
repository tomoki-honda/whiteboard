import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import LoginPageComponent from './pages/login';
import BoardPageComponent from './pages/board';
import SignUpPageComponent from './pages/signup';

import './index.scss';

const root = document.getElementById('root')
const App = () => {
  return (
    <div>
      <Router>
        <Route exact path="/" component={LoginPageComponent}></Route>
        <Route path="/board" component={BoardPageComponent}></Route>
        <Route path="/signup" component={SignUpPageComponent}></Route>
      </Router>
    </div>
  );
};

render(<App />, root)