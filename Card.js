// 1. LISTA DE RESPALDO (Vacía)
const listaproductosRespaldo = [];

// 2. FUNCIÓN PARA DIBUJAR LAS TARJETAS EN EL HTML
function renderizarProductos(listaParaPintar) {
    let productitem = document.getElementById("productos");

    if (!productitem) return;

    productitem.innerHTML = ""; 

    if (!listaParaPintar || listaParaPintar.length === 0) {
        productitem.innerHTML = `<p style="text-align:center; width:100%; color:#888; grid-column: 1/-1; padding: 20px;">No hay productos disponibles por el momento. ¡Añade uno desde tu panel!</p>`;
        return;
    }

    // ORDENAR: Envía los productos con 'agotado: true' al final de la lista de forma automática
    listaParaPintar.sort((a, b) => {
        return (a.agotado === true) - (b.agotado === true);
    });
    listaParaPintar.forEach((product, index) => {
        let urlImagen = product.imagen || product.image || "";
        const idProducto = product.id !== undefined && product.id !== null ? product.id : (index + 1);

        if (urlImagen.startsWith("/")) {
            urlImagen = urlImagen.substring(1); 
        }

        if (urlImagen.startsWith("imagenes/") && !urlImagen.startsWith("./")) {
            urlImagen = "./" + urlImagen;
        }

        const precioVenta = product.precio ? parseFloat(product.precio).toFixed(2) : "0.00";
        const precioDescuento = product.descuento ? parseFloat(product.descuento).toFixed(2) : "0.00";

        // Validación de stock para modificar el botón y añadir el efecto opaco
        const estaAgotado = product.agotado === true;
        const textoBoton = estaAgotado ? "Agotado" : (product.botton || "Agregar");

        // Estilo dinámico para poner Gris toda la tarjeta del producto si está agotado
        const estiloTarjetaGris = estaAgotado 
            ? `style="filter: grayscale(100%); opacity: 0.6; background-color: #f5f5f5;"` 
            : '';

        // Desactiva por completo el botón si el producto está sin stock
        const atributosBoton = estaAgotado 
            ? `disabled style="background-color: #ccc; border-color: #ccc; color: #666; cursor: not-allowed; pointer-events: none;"` 
            : `onclick="addToCart(${idProducto}, '${product.nombre || 'Gelatina'}', ${product.precio || 0}, '${urlImagen}')"`;

        const iconoBoton = estaAgotado 
            ? `<i class="fas fa-times-circle"></i>` 
            : `<i class="fas fa-cart-plus"></i>`;
        productitem.innerHTML += `
        <div class="product-card ${estaAgotado ? 'agotado-card' : ''}" ${estiloTarjetaGris} data-category="${product.categoria || 'Todos'}">
            <span class="product-tag tag-bestseller" ${estaAgotado ? 'style="display:none;"' : ''}>Más Vendido</span>
            <img src="${urlImagen}" alt="${product.nombre || 'Gelatina'}" class="product-image" onerror="this.onerror=null; this.src='https://placehold.co/300x300?text=Imagen+no+disponible'">
            <div class="product-info">
                <div class="product-category">${product.categoria || 'Dulce'}</div>
                <h3 class="product-name">${product.nombre || 'Sin Nombre'}</h3>
                <p class="product-description">${product.descripcion || 'Sin descripción'}</p>
                <div class="product-footer">
                    <div class="product-price"> S/${precioVenta}<span> S/${precioDescuento}</span></div>
                    <button class="add-to-cart" ${atributosBoton}>
                        ${iconoBoton}
                        ${textoBoton}
                    </button>
                </div>
            </div>
        </div>
        `;
    });
}
// 3. CONSULTA AL ARCHIVO DE LA INTERFAZ (CON ROMPE-CACHÉ INTEGRADO)
fetch(`./productos.json?v=${new Date().getTime()}`)
.then(response => {
    if (!response.ok) throw new Error('No se pudo leer el archivo de productos');
    return response.json();
})
.then(data => {
    let listaCms = [];
    if (data && Array.isArray(data.productos)) {
        listaCms = data.productos;
    } else if (Array.isArray(data)) {
        listaCms = data;
    }

    listaCms = listaCms.filter(prod => prod && prod.nombre);
    renderizarProductos(listaCms);
})
.catch(error => {
    console.log("Error al cargar productos:", error.message);
    renderizarProductos([]); 
});

// 4. LÓGICA DE TU CARRITO DE COMPRAS
let cart = [];

function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    updateCart();
    showModal(`¡${name} agregado al carrito!`);
    createConfetti();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartCount || !cartTotal) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `S/ ${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        cartItems.innerHTML = `
        <div class="cart-empty">
            <i class="fas fa-shopping-cart"></i>
            <p>Tu carrito está vacío</p>
        </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='https://placehold.co/80x80'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">S/ ${item.price} x ${item.quantity}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `).join('');
    }
}
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

// MUESTRA EL VENTANA MODAL DE AVISO
function showModal(text) {
    const modalText = document.getElementById('modalText');
    const modal = document.getElementById('modal');
    if (modalText && modal) {
        modalText.textContent = text;
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    const colors = ['#ff6b9d', '#c44569', '#f8b500', '#ff6b6b', '#5f27cd', '#00d2d3'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.trim().toLowerCase() === category.toLowerCase() || (category === 'todos' && btn.textContent.trim().toLowerCase() === 'todos')) {
            btn.classList.add('active');
        }
    });

    cards.forEach((card, index) => {
        const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : "";
        const targetCategory = category.toLowerCase();
        
        if (targetCategory === 'todos' || cardCategory === targetCategory) {
            card.style.display = 'block';
            card.style.animation = `slideInUp 0.6s ease-out ${index * 0.1}s both`;
        } else {
            card.style.display = 'none';
        }
    });
}

function buscarProductos() {
    let input = document.getElementById("searchInput");
    let filtro = input.value.toLowerCase().trim();
    let productos = document.querySelectorAll(".product-card");

    productos.forEach((producto, index) => {
        let nombre = producto.querySelector(".product-name")?.innerText.toLowerCase() || "";
        let descripcion = producto.querySelector(".product-description")?.innerText.toLowerCase() || "";
        let categoria = producto.querySelector(".product-category")?.innerText.toLowerCase() || "";
        
        let textoCompleto = nombre + " " + descripcion + " " + categoria;
        
        if (textoCompleto.includes(filtro)) {
            producto.style.display = "";
            producto.style.animation = `slideInUp 0.4s ease-out ${index * 0.05}s both`;
        } else {
            producto.style.display = "none";
        }
    });
}

// 5. REDIRECCIONAMIENTO DIRECTO ENLACE WHATSAPP EN FORMATO WA.ME
function checkout() {
    if (cart.length === 0) {
        showModal('Tu carrito está vacío. Agrega productos primero.');
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    let message = '¡Hola! Quiero comprar estos productos:\n\n';
    cart.forEach(item => {
        message += `• ${item.name} - S/ ${item.price} x ${item.quantity}\n`;
    });
    message += `\nTotal: S/ ${total.toFixed(2)}\n\n¡Gracias! ✨`;

    // Crear URL de WhatsApp correctamente
    const whatsappUrl =
    'https://api.whatsapp.com/send?phone=51910158797&text=' +
    encodeURIComponent(message);

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
}

// CONECTOR DE RESPALDO DIRECTO
document.addEventListener("DOMContentLoaded", () => {
    const botonEnviar = document.getElementById("btn-whatsapp");
    if (botonEnviar) {
        botonEnviar.onclick = checkout;
    }
});
