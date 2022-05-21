const progressStyle = require("./ms-progress.css");

export default class MSProgressElement extends HTMLElement {
    constructor() {
        super()

        let shadow = this.attachShadow({ mode: 'open' })
        let mainStyle = document.createElement("style");
        mainStyle.setAttribute("scoped", "scoped");
        mainStyle.innerHTML = progressStyle.default[0][1]; // ??
        shadow.appendChild(mainStyle);

        let style = document.createElement("style");
        style.setAttribute("scoped", "scoped");
        style.classList.add("sub-style")
        shadow.appendChild(style);


        let container = document.createElement("div");
        container.classList.add('ms-progress-container');
        for (let i = 0; i < 6; i++) {
            let span = document.createElement("span");
            container.appendChild(span);
        }

        shadow.appendChild(container);
        console.info("created");
    }

    static get observedAttributes() {
        return ["min", "max"]
    }

    connectedCallback() {
        console.info("connected");

        this.style.display = "block";

        let computedStyle = window.getComputedStyle(this);
        let width = parseInt(computedStyle.width);
        let size = width / Math.SQRT2;
        let pos = (width - size) / 2
        let style = this.shadowRoot.querySelector(".sub-style");
        style.innerHTML = `
            .ms-progress-container.active span { width: ${size}px; height: ${size}px; left: ${pos}px; top:${pos}px; } 
            .ms-progress-container.active span:after { background: ${computedStyle.color}; }`

        this.update();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.update();
    }

    update() {
        let root = this.shadowRoot.querySelector('.ms-progress-container')
        if (!this.getAttribute('min') && !this.getAttribute('max')) {
            root.classList.add("active");
        }
        else {
            root.classList.remove("active");
        }
    }
}