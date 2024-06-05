import { diffing, apply } from "./virtual-dom.js";

let g = {
    state: {},
    queue: [],
    vnode: null,
    root: null,
    effects: { '_': [], }
}

export function createDOM(View, root) {
    g.root = root;

    function draw() {
        let vn = View();
        const diffs = diffing(g.vnode, vn);
        console.log("Difference in views", diffs);
        if (g.root.firstElementChild === null)
            apply(g.root, diffs);
        else {
            apply(g.root.firstElementChild, diffs);
        }
        g.vnode = vn;
    }

    function runEffects() {
        let executedCb = new Set();
        for (let dep in g['effects']) {
            console.log(g['effects'][dep])
            g['effects'][dep].forEach(cb => {
                console.log("Here");
                if (!executedCb.has(cb)) {
                    executedCb.add(cb);
                    cb();
                }
            })
        }
    }

    function updateView() {
        let haveUpdate = false;
        while (g.queue.length > 0) {
            haveUpdate = true;
            const [updatefunc, statename] = g.queue.shift();

            let oldValue = g.state[statename];
            g.state = {
                ...g.state,
                [statename]: updatefunc(oldValue),
            };
            if (g.effects[statename]) {
                g.effects[statename].forEach(cb => cb());
            }
        }

        if (haveUpdate) {
            draw();
        }

        window.requestAnimationFrame(updateView);
    }

    // initializing app
    draw();
    updateView();
    runEffects();

    return g.vnode;
}

function enqueue(updatefunc, stateName) {
    g.queue.push([updatefunc, stateName])
}

export function useState(defaultValue, stateName) {
    if (stateName in g['state']) {
        return [g['state'][stateName], (updatefunc) => enqueue(updatefunc, stateName)]
    } else {
        g.state[stateName] = defaultValue;
        return [g['state'][stateName], (updatefunc) => enqueue(updatefunc, stateName)];
    }
}

function registerCallback(callback, dep) {
    if (dep.length == 0) {
        g['effects']['_'].push(callback);
    } else {
        dep.forEach((dependency) => {
            if (dependency in g['effects']) {
                g['effects'][dependency].push(callback);
            } else {
                g['effects'][dependency] = [callback]
            }
        });
    }
}

export function useEffect(callback, dep) {
    registerCallback(callback, dep);
}