import { createDOM, useState, useEffect } from "./init.js";

function Timer() {
    const [timer, setTimer] = useState(0, "timer");
    
    useEffect(() => {
        setInterval(() => setTimer(val => val + 1), 1000);
    }, [])

    return {
        tag: "div",
        properties: {
            "style": "border: 2px solid black; width: 100%; padding-bottom: 5px"
        },
        children: [
            {
                tag: "h3",
                properties: {},
                children: [{ tag: "text", children: "Timer" }]
            },
            {
                tag: "span",
                properties: {
                    style: "font-size: 1.2em;",
                },
                children: [
                    {
                        tag: "text",
                        children: `Timer: ${timer}`
                    }
                ]
            }
        ]
    }
}

function Counter() {
    const [count, setCount] = useState(0, "count");

    return {
        tag: "div",
        properties: {
            "style": "border: 2px solid black; width: 100%; padding-bottom: 5px"
        },
        children: [
            {
                tag: "h3",
                properties: {},
                children: [{ tag: "text", children: "Counter" }]
            },
            {
                tag: "p",
                properties: {
                    style: "font-size: 1.2em;",
                },
                children: [
                    {
                        tag: "text",
                        children: `Counter = ${count}`
                    }
                ]
            },
            {
                tag: "button",
                properties: {
                    style: "background-color: antiquewhite; font-size: 1em;",
                    click: () => setCount((val) => val + 1),
                },
                children: [
                    {
                        tag: "text",
                        children: "Increment"
                    }
                ]
            }
        ]
    }
}

function App() {
    return {
        tag: "div",
        properties: {
            'style': "width: 60%; position: absolute; left: 20%; text-align: center; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;"
        },
        children: [
            {
                tag: "h2",
                properties: {},
                children: [{ tag: "text", children: "The Root Component" }]
            },
            {
                tag: "div",
                properties: {
                    style: "display: flex; flex-direction: row; justify-content: space-evenly;",
                },
                children: [
                    Timer(),
                    Counter(),
                ]
            }
        ],
    }
}

createDOM(App, document.getElementById('root'));