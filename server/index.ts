import { join } from 'path';
import { readFileSync } from 'fs';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as jsonServer from 'json-server';
import { verify, sign } from 'jsonwebtoken';

const server = jsonServer.create();
const SECRET_KEY = '123456789';
const EXPIRES_IN = '1h';

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const PORT = process.env.PORT || 4201;
const DB = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'UTF-8'));

const AUTH_ROUTER = express.Router();
const API_ROUTER = express.Router();
const JSON_SERVER_ROUTER = jsonServer.router(DB);

server.use(/^(?!\/auth).*$/, (req, res, next) => {
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401;
    res.status(status).json({ status, message: 'Bad authorization header' });
    return;
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    verify(token, SECRET_KEY);
    next();
  } catch (err) {
    const status = 401;
    res.status(status).json({ status, message: 'Access token is not valid, try to login again' });
  }
});

AUTH_ROUTER.post('/login', (req, res) => {
  const { username, password } = req.body;
  const expiresIn = req.query.expiresIn;

  if (!isAuthenticated({ username, password })) {
    const status = 401;
    res.status(status).json({ status, message: 'Incorrect email or password' });
    return;
  }

  const accessToken = sign({ username, password }, SECRET_KEY, { expiresIn: expiresIn || EXPIRES_IN });
  res.status(200).json({ accessToken });
});

AUTH_ROUTER.get('/forgotPassword', (req, res) => {
  const user = DB.users.find(userEntity => userEntity.username === req.query.username);

  if (!user) {
    const status = 400;
    res.status(status).json({ status, message: 'Username does not exist' });
    return;
  }

  res.status(200).json({ password: user.password });
});

API_ROUTER.post('/reset', (req, res) => {
  console.log('Resetting database...');
  JSON_SERVER_ROUTER.db.set('todos', []).write();

  return res.status(200).json({ message: 'DB successfully reset' });
});

API_ROUTER.put('/toggleAll', (req, res) => {
  const completed = req.query.completed;
  const todos = JSON_SERVER_ROUTER.db.get('todos').value();

  todos.forEach(todo => (todo.completed = completed.toLowerCase() === 'true'));
  JSON_SERVER_ROUTER.db.set('todos', todos).write();

  res.status(200).json(todos);
});

API_ROUTER.put('/clearCompleted', (req, res) => {
  const todos = JSON_SERVER_ROUTER.db.get('todos').value();

  const updatedTodos = todos.filter(todo => !todo.completed);
  JSON_SERVER_ROUTER.db.set('todos', updatedTodos).write();

  res.status(200).json(updatedTodos);
});

API_ROUTER.use('/', JSON_SERVER_ROUTER);

server.use('/auth', AUTH_ROUTER);
server.use('/api', API_ROUTER);

server.listen(PORT, () => {
  console.log(`REST API running on localhost:${PORT}...`);
});

function isAuthenticated({ username, password }) {
  return DB.users.findIndex(user => user.username === username && user.password === password) !== -1;
}
