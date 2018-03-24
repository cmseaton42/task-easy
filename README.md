<p align="center"><img width="280" src="https://i.imgur.com/VwF0DyE.png" alt="Task Easy Logo"></p>

<div align="center">
  <p><a href="https://www.npmjs.com/package/task-easy"><img src="https://img.shields.io/npm/v/task-easy.svg?style=flat-square" alt="npm" /></a>
  <a href="https://github.com/cmseaton42/task-easy/blob/master/LICENSE"><img src="https://img.shields.io/github/license/cmseaton42/task-easy.svg?style=flat-square" alt="license" /></a>
  <img src="https://img.shields.io/travis/cmseaton42/task-easy.svg?style=flat-square" alt="Travis" />
  <img src="https://img.shields.io/coveralls/github/cmseaton42/task-easy.svg?style=flat-square" alt="Coveralls github" />
</p>
</div>

# Task Easy - Promise Queue Made Easy ✅

A simple, customizable, and lightweight priority queue for promise based tasks.

## Getting Started

Install with npm

```
npm install task-easy --save
```

## How it Works

**TaskEasy** is built as an extension of a simple heap data structure. Tasks are queued by simply passing a task (function) to the `.schedule` method along with an array of arguments to be called as well as an object to describe the task's relative priority. The caller is returned a promise which will resolve once the scheduled task has ran. Priority determination is left up to the user via a function that accepts task priority object and returns a judgement.

### Usage

The usage of **TaskEasy** is best given by example so that is the route we will take.

In this example, we will be passing priority objects to the scheduler that will be marked by the following signature.

```js
{
    // An integer representing priority,
    // the higher the number the higher the priority
    priority: Number,

    // A timestamp to illustrate when the task
    // was scheduled, used as a 'tie-breaker' for
    // tasks of the same priority
    timestamp: Date
}
```

> **NOTE**
>
> The priority object's signature that you want to queue your items with is 100% up to you. 😄

Now, let's create a function that will receive our priority objects and output a priority judgment so that _TaskEasy_ knows how to handle queued tasks. Our function will be passed two arguments (the priority objects of two scheduled tasks) and return a judgement indicating which task is of _higher_ priority. If we return `true`, then we are communicating to _TaskEasy_ that the first task is higher priority than the second task or vice versa

```js
// This function is passed to the TaskEasy contructor and will be used internally to determine tasks order.
const prioritize = (obj1, obj2) => {
    return ob1.priority === obj2.priority
        ? obj1.timestamp.getTime() < obj2.timestamp.getTime() // Return true if task 1 is older than task 2
        : obj1.priority > obj2.priority; // return true if task 1 is higher priority than task 2
};
```

Now, we can initialize a new _TaskEasy_ instance.

```js
const TaskEasy = require("task-easy");

const max_tasks = 200; // How many tasks will we allow to be queued at a time (defaults to 100)
const queue = new TaskEasy(prioritize, max_tasks);
```

Now, lets build an async function to demo the scheduler.

```js
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
```

> **NOTE**
>
> Scheduled tasks _MUST_ be functions that return _promises_. This works well with async functions or with ES2017 `ASYNC/AWAIT` functions.

Now, that we have a task to schedule, let's schedule some tasks. The `.schedule` method takes three arguments, the task to call, an array of arguments, and a priority oject to that is associated with the scheduled task. It will return a promise that will resolve or reject once the task has been ran.

```js
// .schedule accepts the task signature,
// an array or arguments, and a priority object
const task1 = queue
    .schedule(delay, [100], { priority: 1, timestamp: new Date() })
    .then(() => console.log("Task 1 ran..."));

const task2 = queue
    .schedule(delay, [100], { priority: 1, timestamp: new Date() })
    .then(() => console.log("Task 2 ran..."));

const task3 = queue
    .schedule(delay, [100], { priority: 2, timestamp: new Date() })
    .then(() => console.log("Task 3 ran..."));

const task4 = queue
    .schedule(delay, [100], { priority: 1, timestamp: new Date() })
    .then(() => console.log("Task 4 ran..."));

const task5 = queue
    .schedule(delay, [100], { priority: 3, timestamp: new Date() })
    .then(() => console.log("Task 5 ran..."));

// OUTPUT
// Task 1 ran...
// Task 5 ran...
// Task 3 ran...
// Task 2 ran...
// Task 4 ran...
```

> **NOTE**
>
> In the above example, `task1` resolved first as it once put onto the queue first and was immediately called as it was the only task on the queue at that time.

## Built With

*   [NodeJS](https://nodejs.org/en/) - The Engine
*   [javascript - ES2017](https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) - The Language

## Contributers

*   **Canaan Seaton** - _Owner_ - [GitHub Profile](https://github.com/cmseaton42) - [Personal Website](http://www.canaanseaton.com/)

## License

This project is licensed under the MIT License - see the [LICENCE](https://github.com/cmseaton42/task-easy/blob/master/LICENSE) file for details
