const jwt = require('express-jwt');
const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./handlers');

const app = express();
const JWT_SECRET = process.env.SECRET || 'BANANAS';

app.set('json spaces', 2);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(handlers.logger);

app.get('/', (req, res) => res.status(400).send({ endpoints: ['/login', '/quizzes'] }));

app.get('/login', (req, res) => res.status(400).send({ error: 'use POST instead' }));
app.post('/login', handlers.handleLoginSubmit);

//app.use('/locations', jwt({ secret: JWT_SECRET }));
app.get('/locations', handlers.handleLocationsRequest);

//app.use('/ranking', jwt({ secret: JWT_SECRET }));
app.get('/ranking', handlers.handleRankingRequest);

app.use('/quizzes', jwt({ secret: JWT_SECRET }));
app.get('/quizzes', handlers.handleQuizzesRequest);
app.post('/quizzes', handlers.handleQuizzesSubmit);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}...\n`);
});
