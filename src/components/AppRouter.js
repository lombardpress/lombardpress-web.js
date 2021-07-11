import React, {Suspense} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Home from "./Home"
import Search3 from "./Search3"
import TextSwitch from "./TextSwitch"
import About from "./About"
import NavBar from './NavBar';
import Spinner from './Spinner';
import Footer from './Footer';
import OSDInstance from './OSDInstance';

import 'bootstrap/dist/css/bootstrap.css'
import '../styles/App.scss';
//import '../styles/index.scss';

const AppRouter = () => {
  return (
  <Suspense fallback={<Spinner/>}>
    <BrowserRouter forceRefresh={false}>
      <div>
        <NavBar/>
        <Switch>
          <Route path="/" exact={true} component={Home}/>
          <Route path="/res" exact={true} component={TextSwitch}/>
          <Route path="/text"  exact={true} component={TextSwitch}/>
          <Route path="/about" exact={true} component={About}/>
          <Route path="/search" exact={true} component={Search3}/>
          <Route path="/osd" exact={true} component={OSDInstance}/>
          {
            //<Route path="/edit/:id" exact={true} component={EditExpensePage}/>
          //<Route path="/help" exact={true} component={HelpPage}/>
          // <Route component={NotFoundPage}/>
          }
        </Switch>
        <Footer/>
      </div>
    </BrowserRouter>
  </Suspense>
)
}

export default AppRouter
