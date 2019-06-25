export class CustomSearch extends HTMLElement {
    private searchId: string;
    private api: string;
    private button: HTMLButtonElement;
    private icon: HTMLImageElement;
    private input: HTMLInputElement;
    private lastQuery: string;

    constructor() {
        super();
        console.log('-i- Custom search init');

        this.startVoiceRecord = this.startVoiceRecord.bind(this);
        this.handleSearchStart = this.handleSearchStart.bind(this);
        this.handleSearchEnd = this.handleSearchEnd.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);

        this.createNodes();
    }

    public connectedCallback() {
        this.searchId = this.getAttribute("id");
        this.api = this.getAttribute("api");
    }

    public disconnectedCallback() {
        this.destroy();
    }

    private createNodes() {
        const shadow = this.attachShadow({mode: 'open'});

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: flex;
                contain: content;
            }
            :host input { box-shadow: inset 0 2px 0 rgba(0,0,0, 0.05); flex-grow: 1;}
            :host img { width: 24px; padding: 0 3px; }
        `;
        shadow.appendChild(style);

        this.input = document.createElement('input');
        this.input.type = "text";
        this.input.addEventListener('keypress', this.handleSearchInput);
        shadow.appendChild(this.input);

        this.icon = document.createElement('img');
        this.icon.src = "https://png.pngtree.com/svg/20151224/66ea5e6a8b.svg";
        this.icon.addEventListener('click', this.startVoiceRecord);
        shadow.appendChild(this.icon);

        this.button = document.createElement('button');
        this.button.textContent = "Search";
        this.button.addEventListener('click', this.handleSearchStart);
        shadow.appendChild(this.button);
    }

    private destroy() {
        this.input.removeEventListener('input', this.handleSearchInput);
        this.icon.removeEventListener('click', this.startVoiceRecord);
        this.button.removeEventListener('click', this.handleSearchStart);

        this.input = undefined;
        this.icon = undefined;
        this.button = undefined;
    }

    private handleSearchInput(e) {
        if (e.keyCode === 13) {
            this.handleSearchStart(e);
        }
    }

    private handleSearchStart(e: Event) {
        const query = this.input.value.trim();
        if (!query || this.lastQuery === query) {
            return;
        }
        this.lastQuery = query;
        console.log(this.searchId);
        const event = new CustomEvent(`search:${this.searchId}:start`, {
            bubbles: true,
            cancelable: false,
            detail: {
                query,
            }
        });
        this.dispatchEvent(event);
        document.dispatchEvent(event);
        fetch(this.api + query, {
            mode: 'cors',
        })
            .then(res => res.json())
            .then(this.handleSearchEnd)
            .catch(this.handleSearchError)
    }
    private handleSearchEnd(result) {
        console.log(result);
        const event = new CustomEvent(`search:${this.searchId}:end`, {
            bubbles: true,
            cancelable: false,
            detail: result
        });
        this.dispatchEvent(event);
        document.dispatchEvent(event);
    }
    private handleSearchError(err) {
        console.log(err);
        const event = new CustomEvent(`search:${this.searchId}:err`, {
            bubbles: true,
            cancelable: false,
        });
        this.dispatchEvent(event);
    }

    private startVoiceRecord(e) {
        console.log('start voice record');
    }
    private endVoiceRecord(e) {
        console.log('end voice record');
    }
}
