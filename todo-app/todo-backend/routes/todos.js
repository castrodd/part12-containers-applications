const express = require('express');
const { Todo } = require('../mongo');
const router = express.Router();
const { getAsync, setAsync } = require('../redis/index');

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* GET statistics listing. */
router.get('/statistics', async (_, res) => {
  const todos = await getAsync('todos')
  let addedTodos = parseInt(todos);
  if (isNaN(addedTodos)) {
      addedTodos = 0;
  }

  const resultObject = {"added_todos": addedTodos};
  res.send(resultObject);
})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })

  const todos = await getAsync('todos')
  let addedTodos = parseInt(todos);
  if (isNaN(addedTodos)) {
      addedTodos = 0;
  }

  setAsync('todos', addedTodos + 1);

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  
  req.todo = await Todo.findById(id)
  console.log("HERE: ", req.todo)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  console.log("IN GET: ", req.todo)
  res.send(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const newTodo = await Todo.updateOne({
    _id: req.todo._id
}, {
    $set: {
        text: req.body.text,
        done: req.body.done
    }
})

  res.send(newTodo);
});

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router;
