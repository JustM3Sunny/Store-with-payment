const cart = [];
const customerData = {};

function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');

    if (!cartItemsDiv || !cartTotalSpan) {
        console.error("Cart elements not found in the DOM.");
        return;
    }

    cartItemsDiv.innerHTML = '';
    let total = 0;

    const fragment = document.createDocumentFragment();

    for (const item of cart) { // Use a for...of loop for better readability
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        const priceSpan = document.createElement('span');
        priceSpan.textContent = `$${item.price.toFixed(2)}`;

        cartItemDiv.appendChild(nameSpan);
        cartItemDiv.appendChild(priceSpan);
        fragment.appendChild(cartItemDiv);
        total += item.price;
    }

    cartItemsDiv.appendChild(fragment);
    cartTotalSpan.textContent = total.toFixed(2);
}

function showAddressForm() {
    const cartSection = document.getElementById('cart');
    const addressForm = document.getElementById('address');

    if (!cartSection || !addressForm) {
        console.error("Cart or address form elements not found in the DOM.");
        return;
    }

    cartSection.style.display = 'none';
    addressForm.style.display = 'block';
}

function showPaymentForm() {
    const addressForm = document.getElementById('address');
    const paymentForm = document.getElementById('payment');

    if (!addressForm || !paymentForm) {
        console.error("Address or payment form elements not found in the DOM.");
        return;
    }

    // Collect address data
    customerData.fullName = document.getElementById('full-name').value;
    customerData.addressLine1 = document.getElementById('address-line1').value;
    customerData.addressLine2 = document.getElementById('address-line2').value;
    customerData.city = document.getElementById('city').value;
    customerData.state = document.getElementById('state').value;
    customerData.zipCode = document.getElementById('zip-code').value;


    addressForm.style.display = 'none';
    paymentForm.style.display = 'block';
    togglePaymentFields();
}

function togglePaymentFields() {
    const paymentMethod = document.getElementById('payment-method').value;
    const cardFields = document.getElementById('card-fields');
    const upiFields = document.getElementById('upi-fields');
    const gpayFields = document.getElementById('gpay-fields');

    if (!cardFields || !upiFields || !gpayFields) {
        console.error("Payment fields not found in the DOM.");
        return;
    }

    cardFields.style.display = 'none';
    upiFields.style.display = 'none';
    gpayFields.style.display = 'none';

    switch (paymentMethod) { // Use a switch statement for better readability and maintainability
        case 'credit':
        case 'paypal':
            cardFields.style.display = 'block';
            break;
        case 'upi':
            upiFields.style.display = 'block';
            break;
        case 'gpay':
            gpayFields.style.display = 'block';
            break;
    }
}


document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect payment data
    const paymentMethod = document.getElementById('payment-method').value;
    customerData.paymentMethod = paymentMethod;
    customerData.cart = cart;

    let isValid = true; // Flag to track overall form validity

    if (paymentMethod === 'credit' || paymentMethod === 'paypal') {
        const cardName = document.getElementById('card-name').value;
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;

        customerData.cardName = cardName;
        customerData.cardNumber = cardNumber;
        customerData.expiryDate = expiryDate;
        customerData.cvv = cvv;

        // Validate card details (basic validation)
        isValid = validateCardDetails(cardNumber, expiryDate, cvv);
        if (!isValid) {
            alert('Please check your card details.');
            return;
        }
    } else if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upi-id').value;
        customerData.upiId = upiId;
        if (!upiId) {
            alert('Please enter your UPI ID.');
            return;
        }
    } else if (paymentMethod === 'gpay') {
        const gpayId = document.getElementById('gpay-id').value;
        customerData.gpayId = gpayId;
        if (!gpayId) {
            alert('Please enter your Google Pay ID.');
            return;
        }
    }


    if (isValid) {
        // Send data to backend (simulated)
        sendDataToBackend(customerData);

        // Show confirmation
        showConfirmation();

        // Reset cart
        cart.length = 0; // More efficient way to clear the array
        updateCart();
    }
});

function validateCardDetails(cardNumber, expiryDate, cvv) {
    if (!cardNumber || cardNumber.length < 16 || isNaN(cardNumber)) return false;
    if (!expiryDate || expiryDate.length < 5) return false;
    if (!cvv || cvv.length < 3 || isNaN(cvv)) return false;

    return true;
}

function sendDataToBackend(data) {
    // Simulate sending data to backend (replace with actual backend call)
    console.log('Sending data to backend:', data);
    const cartTotal = document.getElementById('cart-total').textContent; // Get cart total here to avoid race conditions

    // Simulate UPI payment request
    if (data.paymentMethod === 'upi') {
        alert(`Simulating UPI payment request to: ${data.upiId} for $${cartTotal}. Please complete the payment on your UPI app.`);
    }
    if (data.paymentMethod === 'gpay') {
        alert(`Simulating Google Pay payment request to: ${data.gpayId} for $${cartTotal}. Please complete the payment on your Google Pay app.`);
    }
    // Convert data to string for saving in a text file
    const dataString = JSON.stringify(data, null, 2);
    // Create a Blob from the string
    const blob = new Blob([dataString], { type: 'text/plain' });
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showConfirmation() {
    const paymentForm = document.getElementById('payment');
    const confirmationSection = document.getElementById('confirmation');
    const confirmationDetailsDiv = document.getElementById('confirmation-details');

    if (!paymentForm || !confirmationSection || !confirmationDetailsDiv) {
        console.error("Confirmation elements not found in the DOM.");
        return;
    }

    paymentForm.style.display = 'none';
    confirmationSection.style.display = 'block';

    confirmationDetailsDiv.innerHTML = `
        <p><strong>Name:</strong> ${customerData.fullName}</p>
        <p><strong>Address:</strong> ${customerData.addressLine1}, ${customerData.addressLine2 ? customerData.addressLine2 + ', ' : ''}${customerData.city}, ${customerData.state} ${customerData.zipCode}</p>
        <p><strong>Payment Method:</strong> ${customerData.paymentMethod}</p>
        <p><strong>Total:</strong> $${document.getElementById('cart-total').textContent}</p>
    `;
}