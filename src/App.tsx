import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
import { CalendarPage } from './pages/CalendarPage';
import { TodayPage } from './pages/TodayPage';

export const App = (props: any) => {
    return (
        <HashRouter>
            <div>
                <Route path="/" exact component={ LandingPage } />
                <Route path="/users" component={ UsersPage } />
                <Route path="/today" component={ TodayPage } />
                <Route path="/calendar" component={ CalendarPage } />
            </div>
        </HashRouter>
    );
};