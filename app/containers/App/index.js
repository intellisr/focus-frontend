/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

// import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Main from '../Main/index';
// import Attention from '../Attention/index';
import GlobalStyle from '../../global-styles';
import logo from '../../images/FocusLogo.png';
import { initializeApp } from "firebase/app";
import Train from '../Train/index';
import dashboard from '../Dashboard/index';

const AppWrapper = styled.div``;


export default function App() {

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPJwhd8Ar9BfRZ0c4M5z8aZoXBE0pkL0M",
  authDomain: "focus-77577.firebaseapp.com",
  projectId: "focus-77577",
  storageBucket: "focus-77577.appspot.com",
  messagingSenderId: "302007662211",
  appId: "1:302007662211:web:c1d73803f8e85d1de18db6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

  return (
    <AppWrapper>
      <img src={logo} alt="Logo" height={'100px'}/>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route path="/dashboard" component={dashboard} />
        <Route path="/train" component={Train} />
        {/* <Route path="" component={NotFoundPage} /> */}
      </Switch>
    </AppWrapper>
  );
}
