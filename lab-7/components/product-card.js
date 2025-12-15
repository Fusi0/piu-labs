const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host{
      display: block;
      width: 260px;
      height: 420px; /* fixed card height so all cards match */
      font-family: system-ui, Arial, sans-serif;
      box-sizing: border-box;
    }
    .card{
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
      background: white;
      box-shadow: 0 6px 18px rgba(20,30,50,0.06);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .media{
      background: #f4f6f8;
      height: 170px; /* fixed media area height */
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:hidden;
    }
    ::slotted(img){
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .body{
      padding:12px 14px;
      display:flex;
      flex-direction:column;
      gap:8px;
      flex:1 1 auto;
    }
    .title{
      font-size:16px;
      font-weight:700;
      color:#111;
      line-height:1.2;
    }
    .price-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .price{font-size:15px;font-weight:800;color:#0b63bf}
    .promo{background:#ffefef;color:#d9534f;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:700}
    .meta{display:flex;gap:8px;flex-direction:column}
    .colors ::slotted(button){
      width:22px;height:22px;border-radius:50%;border:1px solid rgba(0,0,0,0.08);cursor:pointer;margin-right:6px;padding:0;display:inline-block;vertical-align:middle}
    .sizes ::slotted(button){
      padding:6px 8px;border-radius:6px;border:1px solid #ddd;background:#fafafa;margin-right:6px;cursor:pointer;font-size:13px
    }
    .actions{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
    .add-btn{background:#0b63bf;color:white;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:700}
    .add-btn:active{transform:translateY(1px)}
    .info-row{display:flex;align-items:center;justify-content:space-between}
  </style>

  <div class="card">
    <div class="media">
      <slot name="image">
        <!-- default placeholder -->
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f4f6f8'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'>No image</text></svg>" alt="placeholder">
      </slot>
    </div>
    <div class="body">
      <div class="info-row">
        <div class="title"><slot name="title">Untitled product</slot></div>
        <div class="promo"><slot name="promo"></slot></div>
      </div>

      <div class="price-row">
        <div class="price"><slot name="price">—</slot></div>
      </div>

      <div class="meta">
        <div class="colors"><slot name="colors"></slot></div>
        <div class="sizes"><slot name="sizes"></slot></div>
      </div>

      <div class="actions">
        <slot name="extra"></slot>
        <button class="add-btn">DO KOSZYKA</button>
      </div>
    </div>
  </div>
`;

export default class ProductCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const btn = this.shadowRoot.querySelector('.add-btn');
        btn.addEventListener('click', () => this._onAdd());
    }

    disconnectedCallback() {
        const btn = this.shadowRoot.querySelector('.add-btn');
        btn.removeEventListener('click', () => this._onAdd());
    }

    _slotText(name) {
        const slot = this.shadowRoot.querySelector(`slot[name="${name}"]`);
        if (!slot) return null;
        const nodes = slot.assignedNodes({ flatten: true });
        for (const n of nodes) {
            if (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
                return n.textContent.trim();
            if (n.nodeType === Node.ELEMENT_NODE && n.textContent.trim())
                return n.textContent.trim();
        }
        return null;
    }

    _onAdd() {
        const title =
            this._slotText('title') || this.getAttribute('data-title') || '';
        const price =
            this._slotText('price') || this.getAttribute('data-price') || '';
        const eventDetail = { title, price, element: this };
        this.dispatchEvent(
            new CustomEvent('add-to-cart', {
                detail: eventDetail,
                bubbles: true,
                composed: true,
            })
        );
    }
}

customElements.define('product-card', ProductCard);
