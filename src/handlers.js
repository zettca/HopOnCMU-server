const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const usersDB = low(new FileSync('db/users.json'));
const quizzesDB = low(new FileSync('db/quizzes.json'));

usersDB.defaults({ users: [] }).write();
quizzesDB.defaults({ quizzes: [] }).write();

// ===== HELPERS

function logger(req, res, next) {
  console.log(`${req.ip}: ${req.originalUrl}`);
  next();
}

// ===== API Handlers

function handleIndex(req, res) {
  res.send({
    endpoints: {
      login: { methods: ['POST'] },
      quizzes: { methods: ['GET', 'POST'] },
    }
  });
}

function register(username, password) {
  usersDB.get('users').push({ username, password }).write();
}

function handleLoginSubmit(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send({ error: 'send username and password pls' });
  }

  const user = usersDB.get('users').find({ username }).value();
  console.log(user);


  if (user == null) {
    console.log(`Registering user ${username}:${password}...`);
    register(username, password);
    return res.send({ jwt: 'asdfghjkl' });
  } else if (user.password === password) {
    console.log(`Logged in user ${user.username}`);
    return res.send({ jwt: 'asdfghjkl' });
  } else {
    console.log(`Fail login attempt by ${username}:${password}`);
    return res.send({ error: 'wrong password' });
  }
}

function handleQuizzesRequest(req, res) {
  const quizId = req.params.id;
  console.log(`Request for quizId=${quizId}`);
  res.send({
    id: 5,
    questions: [
      'question1',
      'question2',
    ],
  });
}

function handleQuizzesSubmit(req, res) {
  const quizId = req.params.id;
  console.log(`Request for quizId=${quizId}`);
  res.send({
    id: 5,
    questions: [
      'question1',
      'question2',
    ],
  });
}

module.exports = {
  logger,
  handleIndex,
  handleLoginSubmit,
  handleQuizzesRequest,
  handleQuizzesSubmit,
};
