/**
 * A simple in memory priority queue
 *
 * @class TaskEasy
 * @param {Function} compare_func - Function to handle comparison objects passed to Scheduler
 * @param {Number} [max_queue_size=100] Max number of tasks allowed in queue
 */
class TaskEasy {
    constructor(compare_func, max_queue_size = 100) {
        this.tasks = [];
        this.taskRunning = false;

        if (typeof compare_func !== "function")
            throw new Error(
                `Task Easy Comparison Function must be of Type <function> instead got ${typeof compare_func}`
            );

        if (typeof max_queue_size !== "number")
            throw new Error(
                `Task Easy Max Queue Size must be of Type <Number> instead got ${typeof number}`
            );

        if (max_queue_size <= 0) throw new Error("Task Easy Max Queue Size must be greater than 0");

        this.compare = compare_func;
        this.max = max_queue_size;
    }

    /**
     * Schedules a new "Task" to be Performed
     *
     * @param {function} task - task to schedule
     * @param {Array} args - array of arguments to pass to task
     * @param {object} priority_obj - object that will be passed to comparison handler provided in the constructor
     * @returns
     * @memberof TaskQueue
     */
    schedule(task, args, priority_obj) {
        if (typeof task !== "function")
            throw new Error(`Scheduler Task must be of Type <function> instead got ${typeof task}`);
        if (!Array.isArray(args))
            throw new Error(`Scheduler args must be of Type <Array> instead got ${typeof args}`);
        if (typeof priority_obj !== "object")
            throw new Error(
                `Scheduler Task must be of Type <Object> instead got ${typeof priority_obj}`
            );
        if (this.tasks.length >= this.max)
            throw new Error(`Micro Queue is already full at size of ${this.max}!!!`);

        // return Promise to Caller
        return new Promise((resolve, reject) => {
            // Push Task to Queue
            if (this.tasks.length === 0) {
                this.tasks.unshift({ task, args, priority_obj, resolve, reject });
                this._reorder(0);
                this._next();
            } else {
                this.tasks.unshift({ task, args, priority_obj, resolve, reject });
                this._reorder(0);
            }
        });
    }

    /**
     * Swaps the tasks with the specified indexes
     *
     * @param {number} ix
     * @param {number} iy
     * @memberof TaskEasy
     */
    _swap(ix, iy) {
        const temp = this.tasks[ix];
        this.tasks[ix] = this.tasks[iy];
        this.tasks[iy] = temp;
    }

    /**
     * Recursively Reorders from Seed Index Based on Outcome of Comparison Function
     *
     * @param {number} index
     * @memberof TaskQueue
     */
    _reorder(index) {
        const { compare } = this;
        const size = this.tasks.length;

        const l = index * 2 + 1;
        const r = index * 2 + 2;

        let swap = index;

        if (l < size && compare(this.tasks[l].priority_obj, this.tasks[swap].priority_obj))
            swap = l;
        if (r < size && compare(this.tasks[r].priority_obj, this.tasks[swap].priority_obj))
            swap = r;

        if (swap !== index) {
            this._swap(swap, index);
            this._reorder(swap);
        }
    }

    /**
     * Executes Highest Priority Task
     *
     * @memberof TaskQueue
     */
    _runTask() {
        this._swap(0, this.tasks.length - 1);

        const job = this.tasks.pop();
        const { task, args, resolve, reject } = job;

        this._reorder(0);

        this.taskRunning = true;

        task(...args)
            .then((...args) => {
                resolve(...args);
                this.taskRunning = false;
                this._next();
            })
            .catch((...args) => {
                reject(...args);
                this.taskRunning = false;
                this._next();
            });
    }

    /**
     * Executes Next Task in Queue if One Exists and One is Currently Running
     *
     * @memberof TaskQueue
     */
    _next() {
        if (this.tasks.length !== 0 && this.taskRunning === false) {
            this._runTask();
        }
    }
}

module.exports = TaskEasy;
