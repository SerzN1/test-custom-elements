const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
        font-family: -apple-system, BlinkMacSystemFont,
            "Segoe UI", "Roboto", "Oxygen",
            "Ubuntu", "Cantarell", "Fira Sans",
            "Droid Sans", "Helvetica Neue", sans-serif;
        font-size: small;
    }
    :host div:not(:empty) {
        padding: .25em 0;
    }
</style>
`;

export class CustomSearchLastTime extends HTMLElement {
    private lastTime: number = undefined;
    private lastFound = 0;
    private searchId = "";
    private timeoutId: number;
    private rtf: Intl.RelativeTimeFormat;
    private textNode: HTMLDivElement;

    static observedAttributes = ['search-id']

    constructor() {
        super();
        console.log('-i- Custom search last time');

        this.searchId = this.getAttribute('search-id');
        this.rtf = new Intl.RelativeTimeFormat(navigator.language);
        this.textNode = this.createElement();

        this.handleSearchEnd = this.handleSearchEnd.bind(this);
        this.generateMessage = this.generateMessage.bind(this);
        this.tick = this.tick.bind(this);
    }

    public connectedCallback() {
        document.addEventListener(`search:${this.searchId}:end`, this.handleSearchEnd);
    }

    public attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'search-id') {
            this.searchId = newValue;
        }
    }

    public disconnectedCallback() {
        document.removeEventListener(`search:${this.searchId}:end`, this.handleSearchEnd);

        this.textNode = undefined;
        this.rtf = undefined;
        clearTimeout(this.timeoutId);
    }

    private createElement() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const div = document.createElement('div');
        this.shadowRoot.appendChild(div);
        return div;
    }

    private handleSearchEnd(e) {
        clearTimeout(this.timeoutId);
        this.lastTime = Date.now();
        this.lastFound = e.detail.numFound;
        this.tick();
    }
    private tick() {
        const timeDiff = Math.round((this.lastTime - Date.now()) / 1000);
        this.textNode.textContent = this.generateMessage(timeDiff);
        this.timeoutId = setTimeout(this.tick, 1000)
    }
    private generateMessage(seconds: number = undefined): string {
        if (seconds !== undefined) {
            const lastTime = this.rtf.format(seconds, 'second');
            return `Last search was done ${lastTime}, found ${this.lastFound} items`;
        }
        return '';
    }
}
