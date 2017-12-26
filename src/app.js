import Application from 'Application';

const app = new Application(window.innerWidth, window.innerHeight, {
  antialias: true,
});
document.body.appendChild(app.view);
