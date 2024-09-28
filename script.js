const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartCounter = document.getElementById('cart-count');
const cepInput = document.getElementById('cep');
const cepWarn = document.getElementById('cep-warn');
const numeroWarn = document.getElementById('numero-warn');
const numeroInput = document.getElementById('numero');
const dateSpan = document.getElementById('date-span');
const taxaTotal = document.getElementById('taxa-total');
let taxa = 0;
let novoEndereco;

let cart = [];

class Endereco {
    constructor(bairro, rua, numero) {
        this.bairro = bairro;
        this.rua = rua;
        this.numero = numero;
    }
}

// Abrir o modal do carrinho
cartBtn.addEventListener('click', () => {
    updateCartModal();
    cartModal.style.display = 'flex';
})

// Fechar o modal quando clicar fora
cartModal.addEventListener('click', (event) => {
    if (event.target == cartModal) {
        cartModal.style.display = 'none';
    }
})

// Fechar o modal quando clicar no botão
closeModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
})

menu.addEventListener('click', (event) => {
    let parentButton = event.target.closest('.add-to-cart-btn');

    if (parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price')).toFixed(2);

        // Adicionar no carrinho
        addToCart(name, price);
    }
})

// Função para adicionar no carrinho
const addToCart = (name, price) => {
    const existingItem = cart.find(item => item.name == name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        })
    }

    updateCartModal();
}

// Atualiza o carrinho
const updateCartModal = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('flex', 'justify-between', 'mb-4', 'flex-col')

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$${item.price}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
            </div>
        `;

        total += (item.price * item.quantity);

        cartItemsContainer.appendChild(cartItemElement);
    })

    total += taxa;

    cartTotal.textContent = total.toLocaleString('pt-BR', {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerText = cart.length;

}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const name = event.target.getAttribute('data-name');
        removeItemCart(name);
    }
})

const removeItemCart = (name) => {
    const index = cart.findIndex(item => item.name == name);
    if (index != -1) {
        const item = cart[index];
        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
        } else {
            cart.splice(index, 1);
            updateCartModal();
        }
    }
}

cepInput.addEventListener('input', (event) => {
    let inputValue = event.target.value;

    if (inputValue != '') {
        cepInput.classList.remove('border-red-500');
        cepWarn.classList.add('hidden');
    }

    if (cepInput.value.length == 5) {
        cepInput.value += '-'
    }

    if(cepInput.value.length < 9){
        taxa = 0;
        updateCartModal();
    }

    if (cepInput.value.length == 9) {
        const url = `https://viacep.com.br/ws/${cepInput.value}/json/`;
        fetch(url)
            .then(response => response.json())
            .then(endereco => calcularTaxa(endereco.bairro));
    }
})

numeroInput.addEventListener('input', (event) => {
    let inputValue = event.target.value;

    if (inputValue != '') {
        numeroInput.classList.remove('border-red-500');
        numeroWarn.classList.add('hidden');
    }
})

// Finalizar o pedido
checkoutBtn.addEventListener('click', () => {
    if (cart.length == 0) {
        Toastify({
            text: "Não há pedidos no carrinho!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "rgb(239, 68, 68)",
            },
        }).showToast();
    }

    if (cepInput.value == '' && cart.length > 0) {
        cepWarn.classList.remove('hidden');
        cepInput.classList.add('border-red-500');
    }

    if (numeroInput.value == '' && cart.length > 0) {
        numeroWarn.classList.remove('hidden');
        numeroInput.classList.add('border-red-500');
    }

    if (cart.length > 0 && cepInput.value != '' && numeroInput.value != '') {
        const url = `https://viacep.com.br/ws/${cepInput.value}/json/`;
        fetch(url)
            .then(response => response.json())
            .then(endereco => criarEndereco(endereco));
        // Enviar pedido
        const cartItems = cart.map((item) => {
            return(
                `${item.name} 
                Quantidade: (${item.quantity}) 
                Preço: R$${item.price} | `
            )
        }).join("")

        const message = encodeURIComponent(cartItems);
        const phone = '+5521971195445';

        window.open(`https://wa.me/${phone}?text=${message}Taxa de entrega: R$${taxa} Total: R$${cartTotal.textContent} Endereço: ${novoEndereco.rua}, ${novoEndereco.numero} - ${novoEndereco.bairro}`, "_blank");
    }

})

const criarEndereco = (endereco) => {
    novoEndereco = new Endereco(endereco.bairro, endereco.logradouro, numeroInput.value);
}

const calcularTaxa = (bairro) => {
    if(bairro == 'Agriões'){
        taxa = 8;
        taxaTotal.innerText = 'R$8,00';
        updateCartModal();
    }
    if(bairro == 'Albuquerque'){
            taxa = 25;
            taxaTotal.innerText = 'R$25,00';
            updateCartModal();
    }
    if(bairro =='Alto'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Araras'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }   
    if(bairro == 'Artistas'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Barra do Imbuí'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Barroso'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Beira Linha'){
            taxa = 10;
            taxaTotal.innerText = 'R$10,00';
            updateCartModal();
    }
    if(bairro == 'Bom Retiro'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Caleme'){
        taxa = 18;
        taxaTotal.innerText = 'R$18,00';
        updateCartModal();
    }
    if(bairro == 'Carlos Guinle'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }
    if(bairro == 'Cascata do Imbuí'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }
    if(bairro == 'Cascata dos Amores'){
        taxa = 12;            
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
 }
    if(bairro == 'Comary'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }
    if(bairro == 'Coreia'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }    
    if(bairro == 'Corta Vento'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Ermitage'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Espanhol'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Fazenda Ermitagem'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Fazendinha'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Fischer'){
        taxa = 18;
        taxaTotal.innerText = 'R$18,00';
        updateCartModal();
    }
    if(bairro == 'Fonte Santa'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Golfe'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Granja Florestal'){
        taxa = 20;
        taxaTotal.innerText = 'R$20,00';
        updateCartModal();
    }
    if(bairro == 'Granja Guarani'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Granja Primor'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Iucas'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Cascata'){
        taxa = 8;
        taxaTotal.innerText = 'R$8,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Féo'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Meudon'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Serrano'){
        taxa = 16;
        taxaTotal.innerText = 'R$16,00';
        updateCartModal();
    }
    if(bairro == 'Meudon'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Montanhas'){
        taxa = 18;
        taxaTotal.innerText = 'R$18,00';
        updateCartModal();
    }
    if(bairro == 'Morro do Tiro'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Pinheiros'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Parque do Imbui'){
        taxa = 16;
        taxaTotal.innerText = 'R$16,00';
        updateCartModal();
    }
    if(bairro == 'Paineira'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Panorama'){
        taxa = 8;
        taxaTotal.innerText = 'R$8,00';
        updateCartModal();
    }
    if(bairro == 'Parque do Ingá'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Parque São Luiz'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Pedreira'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }
    if(bairro == 'Pessegueiros'){
        taxa = 38;
        taxaTotal.innerText = 'R$38,00';
        updateCartModal();
    }
    if(bairro == 'Pimenteiras'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Pimentel'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Posse'){
        taxa = 22;
        taxaTotal.innerText = 'R$22,00';
        updateCartModal();
    }
    if(bairro == 'Prata'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Quebra Frascos'){
        taxa = 16;
        taxaTotal.innerText = 'R$16,00';
        updateCartModal();
    }
    if(bairro == 'Quinta Lebrão'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Rosário'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Jardim Salaco'){
        taxa = 20;
        taxaTotal.innerText = 'R$20,00';
        updateCartModal();
    }
    if(bairro == 'Santa Cecília'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'São Pedro'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Soberbo'){
        taxa = 14;
        taxaTotal.innerText = 'R$14,00';
        updateCartModal();
    }
    if(bairro == 'Suspiro'){
        taxa = 30;
        taxaTotal.innerText = 'R$30,00';
        updateCartModal();
    }
    if(bairro == 'Taumaturgo'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
    if(bairro == 'Tijuca'){
        taxa = 8;
        taxaTotal.innerText = 'R$8,00';
        updateCartModal();
    }
    if( bairro == 'Três Córregos'){
        taxa = 25;
        taxaTotal.innerText = 'R$25,00';
        updateCartModal();
    }
    if(bairro == 'Vale da Revolta'){
        taxa = 12;
        taxaTotal.innerText = 'R$12,00';
        updateCartModal();
    }
    if(bairro == 'Vale do Paraíso'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
   if(bairro == 'Vargem Grande'){
        taxa = 50;
        taxaTotal.innerText = 'R$50,00';
        updateCartModal();
    }
    if(bairro == 'Várzea'){
        taxa = 8;
        taxaTotal.innerText = 'R$8,00';
        updateCartModal();
    }
    if(bairro == 'Vila Muqui'){
        taxa = 10;
        taxaTotal.innerText = 'R$10,00';
        updateCartModal();
    }
}

