// <user-card>: the card of a user on the Team Board, a web component with an open shadow root.
// The name is always shown; the e-mail and the role appear while the mouse is over the card. Their place is
// kept when they are hidden, so the card keeps its size: a card that grew on hover would shrink under the
// mouse when a drag leaves it, and the browser would not start the drag.
// Attributes: data-name, data-email, data-role, and highlighted (a highlighted card has another color).
// The slot "actions" shows the buttons of the page next to the name (they stay in the page, not in the shadow root).
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; margin-bottom: 10px; cursor: grab; }
    .card { padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: white; text-align: left; }
    :host([highlighted]) .card { border-color: #f0ad4e; background: #fff8e1; }
    .top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .name { font-weight: bold; }
    .details { visibility: hidden; margin-top: 6px; font-size: 0.9em; color: #555; }
    :host(:hover) .details { visibility: visible; }
  </style>
  <div class="card">
    <div class="top">
      <div class="name"></div>
      <slot name="actions"></slot>
    </div>
    <div class="details">
      <div class="email"></div>
      <div class="role"></div>
    </div>
  </div>
`;

class UserCard extends HTMLElement {
  static observedAttributes = ["data-name", "data-email", "data-role"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  // The values are set as text, never as HTML
  render() {
    const root = this.shadowRoot;
    root.querySelector(".name").textContent = this.dataset.name || "";
    root.querySelector(".email").textContent = this.dataset.email || "";
    root.querySelector(".role").textContent = this.dataset.role ? `Role: ${this.dataset.role}` : "";
  }
}

if (!customElements.get("user-card")) {
  customElements.define("user-card", UserCard);
}
