export class TodoItem extends HTMLElement {
  static get observedAttributes() {
    return ['content', 'completed'];
  }

  get content(): string {
    return this.getAttribute('content') || '';
  }

  set content(value: string) {
    this.setAttribute('content', value);
  }

  get completed(): boolean {
    return this.hasAttribute('completed');
  }

  set completed(value: boolean) {
    if (value) {
      this.setAttribute('completed', '');
    } else {
      this.removeAttribute('completed');
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/src/styles/main.scss">
      <li class="${this.completed ? 'completed' : ''}">
        ${this.content}
      </li>
    `;
  }

  attributeChangedCallback() {
    this.render();
  }
}

customElements.define('todo-item', TodoItem);
