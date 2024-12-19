// Archivo script.js para Entre Libros

const products = [
    {
        id: 1,
        title: "En Agosto Nos Vemos",
        author: "Gabriel García Márquez",
        price: 25990,
        image: "/img/gabriel1.jpg",
        badge: "Bestseller"
    },
    {
        id: 2,
        title: "Diario",
        author: "Anna Frank",
        price: 18990,
        oldPrice: 22990,
        image: "/img/anna1.jpg",
        badge: "Oferta"
    },
    {
        id: 3,
        title: "La Casa Neville",
        author: "Florencia Bonelli",
        price: 15990,
        image: "/img/florencia1.jpg",
        badge: "Nuevo"
    },
    {
        id: 4,
        title: "Si Te La Oscuridad",
        author: "Stephen King",
        price: 12990,
        image: "/img/stephen1.jpg",
        badge: "Nuevo"
    },
    {
        id: 5,
        title: "El Extranjero",
        author: "Albert Camus",
        price: 19990,
        image: "/img/camus1.jpg",
        badge: "Oferta"
    },
    {
        id: 6,
        title: "Amor y Otras Palabras",
        author: "Christina Lauren",
        price: 29990,
        image: "/img/lauren1.jpg",
        badge: "Nuevo"
    }
];

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    addProduct(product) {
        const existingProduct = this.items.find(item => item.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToLocalStorage();
        this.updateCartUI();
        this.showAddToCartNotification(product);
    }

    showAddToCartNotification(product) {
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.classList.add('notification-container');
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.classList.add('notification', 'notification-success');
        notification.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div>
                <strong>${product.title}</strong> agregado al carrito
            </div>
            <button class="close-notification">&times;</button>
        `;

        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 10);
    }

    removeProduct(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateCartUI();
    }

    updateProductQuantity(productId, quantity) {
        const product = this.items.find(item => item.id === productId);
        if (product) {
            product.quantity = quantity;
            if (product.quantity <= 0) {
                this.removeProduct(productId);
            } else {
                this.saveToLocalStorage();
                this.updateCartUI();
            }
        }
    }

    calculateTotal() {
        return this.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0);
    }

    saveToLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    updateCartUI() {
        const cartCounter = document.querySelector('.cart-counter');
        const cartTotal = document.querySelector('.cart-total');
        const cartItemsContainer = document.querySelector('.cart-items');

        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = this.items.length > 0 
                ? this.items.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-details">
                            <h5>${item.title}</h5>
                            <p>$${item.price.toLocaleString()}</p>
                            <div class="quantity-control">
                                <button class="btn btn-sm btn-outline-secondary btn-decrease">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary btn-increase">+</button>
                            </div>
                            <button class="btn btn-danger btn-sm btn-remove">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                `).join('') 
                : '<p class="text-center">Tu carrito está vacío</p>';

            document.querySelectorAll('.btn-decrease').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.closest('.cart-item').dataset.id);
                    const currentQuantity = parseInt(e.target.nextElementSibling.textContent);
                    this.updateProductQuantity(productId, currentQuantity - 1);
                });
            });

            document.querySelectorAll('.btn-increase').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.closest('.cart-item').dataset.id);
                    const currentQuantity = parseInt(e.target.previousElementSibling.textContent);
                    this.updateProductQuantity(productId, currentQuantity + 1);
                });
            });

            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.closest('.cart-item').dataset.id);
                    this.removeProduct(productId);
                });
            });
        }

        if (cartTotal) {
            cartTotal.textContent = `$${this.calculateTotal().toLocaleString()}`;
        }
    }

    clearCart() {
        this.items = [];
        this.saveToLocalStorage();
        this.updateCartUI();
    }


    showCheckoutForm() {

        const modalContent = document.querySelector('.modal-body');
        const modalFooter = document.querySelector('.modal-footer');
        const total = this.calculateTotal();
        
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }

        const checkoutHTML = `
            <div class="checkout-summary">
                <h4>Resumen del Pedido</h4>
                <div class="order-items">
                    ${this.items.map(item => `
                        <div class="order-item">
                            <span>${item.title} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total a pagar: $${total.toLocaleString()}</strong>
                </div>
            </div>
            <form id="checkout-form" action="https://formspree.io/f/mpwzvanw" method="POST">
                <div class="form-group">
                    <label for="name">Nombre completo *</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                    <div class="invalid-feedback">Por favor ingrese su nombre</div>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                    <div class="invalid-feedback">Por favor ingrese un email válido</div>
                </div>
                <div class="form-group">
                    <label for="phone">Teléfono *</label>
                    <input type="tel" class="form-control" id="phone" name="phone" required>
                    <div class="invalid-feedback">Por favor ingrese un teléfono válido</div>
                </div>
                <div class="form-group">
                    <label for="address">Dirección de envío *</label>
                    <textarea class="form-control" id="address" name="address" required></textarea>
                    <div class="invalid-feedback">Por favor ingrese una dirección</div>
                </div>
                <input type="hidden" name="order_summary" id="order_summary">
                <button type="submit" class="btn btn-primary w-100">Confirmar Pedido</button>
            </form>
        `;
        
        modalContent.innerHTML = checkoutHTML;

        $('#cartModal').modal({
            backdrop: 'static',
            keyboard: false
        });
        
        const orderSummary = this.items.map(item => 
            `${item.title} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
        ).join('\n');
        document.getElementById('order_summary').value = `${orderSummary}\nTotal: $${total.toLocaleString()}`;
        
        this.setupFormValidation();
    }

    setupFormValidation() {
        const form = document.getElementById('checkout-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm(form)) {
                const formData = new FormData(form);
                
                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    this.showSuccessMessage();
                    this.clearCart();
                })
                .catch(error => {
                    this.showErrorMessage();
                });
            }
        });
    }

    validateForm(form) {
        let isValid = true;
        
        const name = form.querySelector('#name');
        if (!name.value.trim()) {
            this.showError(name, 'El nombre es requerido');
            isValid = false;
        } else if (name.value.trim().length < 3) {
            this.showError(name, 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        } else {
            this.removeError(name);
        }
        
        const email = form.querySelector('#email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            this.showError(email, 'El email es requerido');
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            this.showError(email, 'Por favor ingrese un email válido');
            isValid = false;
        } else {
            this.removeError(email);
        }
        
        const phone = form.querySelector('#phone');
        const phoneRegex = /^\d{9,}$/;
        if (!phone.value.trim()) {
            this.showError(phone, 'El teléfono es requerido');
            isValid = false;
        } else if (!phoneRegex.test(phone.value.replace(/\D/g, ''))) {
            this.showError(phone, 'Por favor ingrese un teléfono válido');
            isValid = false;
        } else {
            this.removeError(phone);
        }
        
        const address = form.querySelector('#address');
        if (!address.value.trim()) {
            this.showError(address, 'La dirección es requerida');
            isValid = false;
        } else if (address.value.trim().length < 10) {
            this.showError(address, 'Por favor ingrese una dirección más detallada');
            isValid = false;
        } else {
            this.removeError(address);
        }
        
        return isValid;
    }

    showError(input, message) {
        input.classList.add('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback) {
            feedback.textContent = message;
        }
    }

    removeError(input) {
        input.classList.remove('is-invalid');
    }

    showSuccessMessage() {
        const modalContent = document.querySelector('.modal-body');
        const modalFooter = document.querySelector('.modal-footer');
        
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }

        modalContent.innerHTML = `
            <div class="alert alert-success" role="alert">
                <h4 class="alert-heading">¡Gracias por tu compra!</h4>
                <p>Hemos recibido tu pedido correctamente. Recibirás un email con los detalles de tu compra.</p>
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="window.location.reload()">Volver a la tienda</button>
                </div>
            </div>
        `;

        const cartModal = $('#cartModal');
        cartModal.modal({
            backdrop: true,
            keyboard: true
        });
    }

    showErrorMessage() {
        const modalContent = document.querySelector('.modal-body');
        modalContent.innerHTML += `
            <div class="alert alert-danger" role="alert">
                Hubo un error al procesar tu pedido. Por favor intenta nuevamente.
            </div>
        `;
    }
}

const cart = new ShoppingCart();

function initializeProducts() {

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            const title = productCard.querySelector('.product-title').textContent;
            const priceText = productCard.querySelector('.product-price').textContent.replace('$', '').replace('.', '');
            const image = productCard.querySelector('.product-image img').src;
            
            const product = products.find(p => p.title === title);
            
            if (product) {
                cart.addProduct({
                    ...product,
                    image: image
                });
            }
        });
    });
}

function init() {
    initializeProducts();

    cart.updateCartUI();

    const finishPurchaseBtn = document.getElementById('finishPurchaseBtn');
    if (finishPurchaseBtn) {
        finishPurchaseBtn.addEventListener('click', () => {
            if (cart.items.length > 0) {
                cart.showCheckoutForm();
            } else {
                alert('Tu carrito está vacío');
            }
        });
    }

    const keepShoppingBtn = document.querySelector('.btn-secondary[data-dismiss="modal"]');
    if (keepShoppingBtn) {
        keepShoppingBtn.addEventListener('click', () => {
            cart.updateCartUI();
        });
    }
    
}

function renderProducts() {
    const productsContainer = document.querySelector('.productos-section .container .row.g-4.mb-4');

    products.forEach(product => {
        const productHTML = `
            <div class="col-lg-4 col-md-6">
                <div class="product-card">
                    <div class="product-badge ${product.badge.toLowerCase()}">${product.badge}</div>
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}">
                        <div class="product-overlay">
                            <button class="btn btn-light btn-sm quick-view">
                                <i class="fas fa-eye"></i> Vista rápida
                            </button>
                        </div>
                    </div>
                    <div class="product-details">
                        <h5 class="product-title">${product.title}</h5>
                        <p class="product-author">${product.author}</p>
                        <div class="product-price-container">
                            ${product.oldPrice ? `<div class="price-wrapper">
                                <span class="product-price-old">$${product.oldPrice.toLocaleString()}</span>
                                <span class="product-price sale">$${product.price.toLocaleString()}</span>
                            </div>` : `<span class="product-price">$${product.price.toLocaleString()}</span>`}
                            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        productsContainer.innerHTML += productHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});


document.addEventListener('DOMContentLoaded', init);

