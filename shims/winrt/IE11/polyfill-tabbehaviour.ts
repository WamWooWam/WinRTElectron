// this handles focus rings like IE

let styleElement = document.createElement("style");
styleElement.append(document.createTextNode(":focus { outline: none !important; }"))
document.head.appendChild(styleElement);

function handleTab(e: KeyboardEvent) {
    if (e.keyCode === 9) { // unsure how to replacethis
        document.head.removeChild(styleElement);
        window.removeEventListener("keydown", handleTab);
        window.addEventListener("mousedown", handleMouseDown);
    }
}

function handleMouseDown() {
    document.head.appendChild(styleElement);
    window.removeEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleTab);
}

window.addEventListener("keydown", handleTab);
