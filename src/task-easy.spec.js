const { TaskEasy } = require("./index");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("Micro Worker", () => {
    describe("New Instance", () => {
        it("Rejects Improper Constructor Arguments", () => {
            const fn = (arg, max) => () => new TaskEasy(arg, max);

            expect(fn()).toThrow();
            expect(fn("hello", 6)).toThrow();
            expect(fn({ a: 6 }, 6)).toThrow();
            expect(fn(() => console.log("hello"), 0)).toThrow();
            expect(fn(() => console.log("hello"), "string")).toThrow();
            expect(fn(() => console.log("hello"), 6)).not.toThrow();
        });
    });

    describe("Private Methods", () => {
        let compare;
        let arr;
        let q;

        beforeEach(() => {
            arr = [];
            compare = (obj1, obj2) => {
                if (obj1.value === obj2.value) return obj1.id < obj2.id;
                return obj1.value >= obj2.value;
            };

            for (let i = 0; i < 15; i++) {
                arr.push({
                    task: delay,
                    args: [100 * i],
                    priority_obj: { value: i }
                });
            }

            q = new TaskEasy(compare);
            q.tasks = arr;
        });

        it("Reorder Method Produces Correct Output", () => {
            q._reorder(0);
            expect(q.tasks).toMatchSnapshot();
        });

        it("Runs Tasks on Push", async () => {
            const delayReturn = ms =>
                new Promise((resolve, reject) => {
                    if (typeof ms !== "number") reject("Bad Input");
                    else
                        setTimeout(() => {
                            resolve(ms);
                        }, ms);
                });

            const q = new TaskEasy(compare);
            const p1 = q.schedule(delayReturn, [50], { value: 1 });
            const p2 = q.schedule(delayReturn, [60], { value: 1 });
            const p3 = q.schedule(delayReturn, [70], { value: 1 });

            await expect(p1).resolves.toBe(50);
            await expect(p2).resolves.toBe(60);
            await expect(p3).resolves.toBe(70);
        });

        it("Runs Tasks on Priority", async () => {
            const delayReturn = ms =>
                new Promise((resolve, reject) => {
                    if (typeof ms !== "number") reject("Bad Input");
                    else
                        setTimeout(() => {
                            resolve(ms);
                        }, ms);
                });

            const q = new TaskEasy(compare);
            const res = [];
            const p1 = q.schedule(delayReturn, [100], { value: 1, id: 1 }).then(n => res.push(n));
            const p2 = q.schedule(delayReturn, [110], { value: 1, id: 2 }).then(n => res.push(n));
            const p3 = q.schedule(delayReturn, [120], { value: 2, id: 3 }).then(n => res.push(n));
            const p4 = q.schedule(delayReturn, [130], { value: 3, id: 4 }).then(n => res.push(n));
            const p5 = q.schedule(delayReturn, [140], { value: 1, id: 5 }).then(n => res.push(n));
            const p6 = q
                .schedule(delayReturn, ["hello"], { value: 0, id: 6 })
                .then(n => res.push(n))
                .catch(e => res.push(e));
            const p7 = q.schedule(delayReturn, [90], { value: 4, id: 5 }).then(n => res.push(n));
            const p8 = q.schedule(delayReturn, [70], { value: 2, id: 6 }).then(n => res.push(n));
            const p9 = q.schedule(delayReturn, [105], { value: 1, id: 7 }).then(n => res.push(n));
            const p10 = q
                .schedule(delayReturn, [107], {
                    value: 2,
                    id: 8
                })
                .then(n => res.push(n));
            const p11 = q
                .schedule(delayReturn, [80], {
                    value: 5,
                    id: 9
                })
                .then(n => res.push(n));

            await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]);

            expect(res).toEqual([100, 80, 90, 130, 120, 70, 107, 110, 140, 105, "Bad Input"]);
        });
    });

    describe("Public Methods", () => {
        let compare;

        beforeEach(() => {
            compare = (obj1, obj2) => {
                if (obj1.value === obj2.value) return obj1.id < obj2.id;
                return obj1.value >= obj2.value;
            };
        });

        describe("Scheduler", () => {
            it("It Rejects Bad Args", () => {
                const q = new TaskEasy(compare);
                const fn = (func, args, obj) => () => {
                    q.schedule(func, args, obj);
                };

                expect(fn(12, [12, 12], { test: 12 })).toThrow();
                expect(fn("12", [12, 12], { test: 12 })).toThrow();
                expect(fn(arg => console.log(arg), "hello", { test: 12 })).toThrow();
                expect(fn(arg => console.log(arg), ["hello"], "test")).toThrow();
                expect(fn(arg => console.log(arg), ["hello"], { test: 12 })).not.toThrow();
            });

            it("Throws if too many tasks queued", () => {
                const q = new TaskEasy(compare, 10);

                const fn = () => {
                    for (let i = 0; i < 15; i++) {
                        q.schedule(delay, [i * 10], { value: i, id: i });
                    }
                };

                expect(fn).toThrow();
            });
        });
    });
});
