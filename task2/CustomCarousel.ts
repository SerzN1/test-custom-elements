import { ApiDocument } from "./types";

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
    :host #gallery {
        scroll-snap-type: y mandatory;
        overflow-y: scroll;
        scroll-behavior: smooth;
        display: flex;
    }

    :host #gallery img {
        scroll-snap-align: center;
    }
</style>
`;

const sizeToScreenMap = {
    "S": "640w",
    "M": "800w",
    "L": "1024w",
}

export class CustomCarousel extends HTMLElement {
    private source: string = "";
    private timeoutId: number;
    private rtf: any;
    private node: HTMLDivElement;

    static observedAttributes = ['source']

    constructor() {
        super();
        console.log('-i- Custom carousel');

        this.handleSearchStart = this.handleSearchStart.bind(this);
        this.handleSearchEnd = this.handleSearchEnd.bind(this);
        this.generateMessage = this.generateMessage.bind(this);
        this.showPreloader = this.showPreloader.bind(this);
    }

    public connectedCallback() {
        document.addEventListener(`search:${this.source}:start`, this.handleSearchStart);
        document.addEventListener(`search:${this.source}:end`, this.handleSearchEnd);
        this.node = this.createElement();
    }

    public attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'source') {
            this.source = newValue;
        }
    }

    public disconnectedCallback() {
        document.removeEventListener(`search:${this.source}:start`, this.handleSearchStart);
        document.removeEventListener(`search:${this.source}:end`, this.handleSearchEnd);

        this.node = undefined;
    }

    private createElement() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const div = document.createElement('div');
        div.id = "gallery";
        this.shadowRoot.appendChild(div);
        return div;
    }

    private handleSearchStart(e) {
        this.showPreloader();
    }

    private handleSearchEnd(e) {
        console.log(e.detail.docs);
        const { numFound, docs } = e.detail;
        if (numFound !== 0) {
            this.renderImages(docs);
        } else {
            this.renderNotFound();
        }
    }
    private renderImages(docs: ApiDocument[]) {
        const fragment = document.createDocumentFragment();
        docs.forEach((doc: ApiDocument) => {
            const img = document.createElement('img');
            img.srcset = this.generateSrcSet('olid', doc.edition_key[0] || doc.cover_edition_key);
            img.alt = doc.title;
            fragment.appendChild(img);
        })
        this.node.innerHTML = "";
        this.node.appendChild(fragment);
    }
    // TODO: Make it configurable
    // examples/images/-S.jpg 1024w
    private generateSrcSet(key, value) {
        const mask = (key, value, size) =>
            `http://covers.openlibrary.org/b/${key}/${value}-${size}.jpg ${sizeToScreenMap[size]}`;
        return ["S", "M", "L"]
            .map(size => mask(key, value, size))
            .join(', ');
    }


    private showPreloader() {
        this.node.textContent = "Loading ...";
    }
    private renderNotFound() {
        this.node.textContent = "Not found :(";
    }
    private generateMessage(seconds: number = undefined): string {
        if (seconds !== undefined) {
            const lastTime = this.rtf.format(seconds, 'second');
            return `Last search was done ${lastTime}`;
        }
        return '';
    }
}
