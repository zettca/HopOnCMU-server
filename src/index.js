const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./handlers');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(handlers.logger);

app.get('/', handlers.handleIndex);

app.get('/login/', (req, res) => { res.send({ error: 'use POST instead' }); });
app.post('/login/', handlers.handleLoginSubmit);

app.get('/quizzes/', handlers.handleQuizzesRequest);
app.get('/quizzes/:id', handlers.handleQuizzesRequest);
app.post('/quizzes/:id', handlers.handleQuizzesSubmit);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}...`);
});
