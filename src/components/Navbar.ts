export class Navbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
      }

    render() {
        this.shadowRoot!.innerHTML = 
            `<link rel="stylesheet" href="/src/styles/main.scss">
            <nav class="navbar">
                <div class="container-fluid">
                    <a class="navbar-brand" href="https://github.com/lanasavic">Lana Savić</a>
                </div>
            </nav>
        `;
    }
}

customElements.define('navbar-top', Navbar);
