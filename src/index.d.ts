// Task Easy Class
export declare class TaskEasy<C> {
    constructor(compare_func: (ob1: C, obj2: C) => boolean, max_queue_size?: number);
    schedule<P, T extends TaskEasy.Task<P>>(task: T, args: TaskEasy.Arguments<T>, priority_obj: C): Promise<P>;
}

declare namespace TaskEasy {
    // Extract argument types from passed function type
    export type Arguments<T> = [T] extends [(...args: infer U) => any] ? U : [T] extends [void] ? [] : [T];

    // Generic task type, must return promise
    export type Task<T> = (...args: any[]) => Promise<T>;
}
