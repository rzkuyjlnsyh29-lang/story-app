// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import StoriesPage from '../pages/stories/stories-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import MapPage from '../pages/map/map-page';
import OfflineStoriesPage from '../pages/offline-stories/offline-stories-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new StoriesPage(),
  '/add-story': new AddStoryPage(),
  '/map': new MapPage(),
  '/offline-stories': new OfflineStoriesPage(),
  // Add this to handle map with any path including query params
  '/map/:id': new MapPage(), // This will catch /map?lat=...&lon=...
};

export default routes;