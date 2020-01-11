declare type Task = {
    task: (...args: any[]) => Promise<any>;
    args: any[];
    priority_obj: object;
    resolve: (v: any) => void;
    reject: (err: any) => void;
};

declare class TaskEasy {
    constructor(compare_func: any, max_queue_size?: number);
    schedule(task: any, args: any, priority_obj: any): Promise<unknown>;
}
