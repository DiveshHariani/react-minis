function isEvent(prop) {
    const validEvents = new Set(["click"]);
    return validEvents.has(prop);
}

/**
 * valid operations:
 * 1. Create a new node
 * 2. Remove a node
 * 3. Replace a node
 * 4. Modify a node
 * 5. No operation on current node (contains c property: array to represent changes in child)
 */
export function diffing(oldNode, newNode) {
    if (oldNode === null) {
        return { create: newNode };
    }

    // If both nodes are text and there is change in the content -> Replace
    if (oldNode.tag === "text" && newNode.tag === "text") {
        if (oldNode.children !== newNode.children) {
            return { replace: newNode };
        } else {
            return { noop: true }
        }
    }

    if (oldNode.tag !== newNode.tag) {
        return { replace: newNode }
    }

    // remove properties that are not in the new properties and were present in old
    let unwantedProperties = []
    for (let prop in oldNode.properties) {
        if (newNode.properties[prop] === undefined) {
            unwantedProperties.push(prop);
        }
    }

    // add new properties
    let newProperties = {}
    for (let prop in newNode.properties) {
        if (newNode.properties[prop] !== oldNode.properties[prop]) {
            newProperties[prop] = newNode.properties[prop];
        }
    }

    const childrenSize = Math.max(oldNode.children.length, newNode.children.length);
    let childrenDiff = [];
    for (let i = 0; i < childrenSize; i++) {
        if (oldNode.children[i] === "undefined") {
            childrenDiff.push({ create: newNode.children[i] });
        } else if (newNode.children[i] === "undefined") {
            childrenDiff.push({ remove: true })
        } else {
            childrenDiff.push(diffing(oldNode.children[i], newNode.children[i]));
        }
    }

    if (unwantedProperties.length > 0 || Object.keys(newProperties).length > 0)
        return { modify: { unwantedProperties, newProperties, childrenDiff } };
    else
        return { noop: childrenDiff };
}

export function apply(el, diffs) {
    let diff = Object.keys(diffs)[0];
    switch (diff) {
        case 'modify':
            console.log("modify", el);
            modify(el, diffs['modify']);
            break;

        case 'replace': {
            console.log("replace", el);
            const newEl = create(diffs['replace']);
            el.replaceWith(newEl);
            break;
        }
        case 'create': {
            console.log("create", el);
            const newEl = create(diffs['create']);
            if (Array.from(el.childNodes).length > 0) {
                el.childNodes[0].replaceWith(newEl);
            } else {
                el.appendChild(newEl);
            }
            break;
        }
        case 'remove': {
            console.log("remove", el);
            el.remove();
            break;
        }

        case 'noop': {
            console.log("noop", el);
            const children = Array.from(el.childNodes);
            children.forEach((child, i) => apply(child, diffs['noop'][i]));   
            break;
        }
    }
}

function create(vnode) {
    if (vnode.tag === 'text') {
        const el = document.createTextNode(vnode.children);
        return el;
    }

    const { tag, properties, children } = vnode
    const el = document.createElement(tag);

    el.events = { listeners: {} }

    for (let prop in properties) {
        const value = properties[prop]
        if (isEvent(prop)) {
            el.events.listeners[prop] = value;
            el.addEventListener(prop, value);
        } else {
            el[prop] = value;
        }
    }

    for (let child of children) {
        let childElement = create(child);
        el.appendChild(childElement);
    }

    return el;
}

function modify(el, diff) {
    const children = Array.from(el.childNodes);

    for (const prop of diff.unwantedProperties) {
        if (isEvent(prop)) {
            if (el.events.listeners[prop] !== undefined) {
                let value = el.events.listeners[prop]
                el.removeEventListener(prop, value);
            }
        } else {
            el.removeAttribute(prop);
        }
    }

    for (const prop in diff.newProperties) {
        const value = diff.newProperties[prop]
        if (isEvent(prop)) {
            if (el.events.listeners[prop] !== undefined) {
                let oldValue = el.events.listeners[prop]
                el.removeEventListener(prop, oldValue);
                el.events.listeners[prop] = undefined;
            }
            el.addEventListener(prop, value);
            el.events.listeners[prop] = value;
        } else {
            el[prop] = value;
        }
    }

    children.forEach((child, i) => {
        apply(child, diff.childrenDiff[i]);
    });
}