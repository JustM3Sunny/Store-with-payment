const cart = [];
const customerData = {};

function addToCart(name, price) {
    if (typeof name !== 'string' || name.trim() === '') {
        console.error('Invalid product name:', name);
        return;
    }
    if (typeof price !== 'number' || price <= 0) {
        console.error('Invalid product price:', price);
        return;
    }

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

    cartItemsDiv.innerHTML = ''; // Clear existing content

    let total = 0;

    const fragment = document.createDocumentFragment();

    for (const item of cart) { // Use a for...of loop for better performance and readability
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

    if (!collectAddressData()) {
        return; // Prevent proceeding if address data collection fails
    }

    addressForm.style.display = 'none';
    paymentForm.style.display = 'block';
    togglePaymentFields();
}

function collectAddressData() {
    const fullName = document.getElementById('full-name').value.trim();
    const addressLine1 = document.getElementById('address-line1').value.trim();
    const addressLine2 = document.getElementById('address-line2').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zip-code').value.trim();

    // Validate address data
    if (!fullName || !addressLine1 || !city || !state || !zipCode) {
        alert("Please fill in all required address fields.");
        return false; // Indicate validation failure
    }

    // Basic ZIP code validation
    if (!/^\d{5}(?:-\d{4})?$/.test(zipCode)) {
        alert("Please enter a valid ZIP code.");
        return false;
    }

    // Store address data in customerData object
    customerData.fullName = fullName;
    customerData.addressLine1 = addressLine1;
    customerData.addressLine2 = addressLine2;
    customerData.city = city;
    customerData.state = state;
    customerData.zipCode = zipCode;

    return true; // Indicate success
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

    switch (paymentMethod) {
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
        default:
            console.warn("Unknown payment method:", paymentMethod); // Handle unexpected payment methods
            break;
    }
}


document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect payment data
    const paymentMethod = document.getElementById('payment-method').value;
    customerData.paymentMethod = paymentMethod;
    customerData.cart = cart.map(item => ({ ...item })); // Create a copy of the cart

    let isValid = true;

    switch (paymentMethod) {
        case 'credit':
        case 'paypal':
            isValid = collectAndValidateCardDetails();
            break;
        case 'upi':
            isValid = collectAndValidateUpiDetails();
            break;
        case 'gpay':
            isValid = collectAndValidateGpayDetails();
            break;
        default:
            console.error("Invalid payment method selected.");
            isValid = false;
            break;
    }

    if (isValid) {
        // Send data to backend (simulated)
        sendDataToBackend(customerData);

        // Show confirmation
        showConfirmation();

        // Reset cart
        resetCart();
    }
});

function collectAndValidateCardDetails() {
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.trim();
    const expiryDate = document.getElementById('expiry-date').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all card details.');
        return false;
    }

    if (!validateCardDetails(cardNumber, expiryDate, cvv)) {
        return false;
    }

    customerData.cardName = cardName;
    // DO NOT STORE SENSITIVE DATA
    // customerData.cardNumber = cardNumber;
    // customerData.expiryDate = expiryDate;
    // customerData.cvv = cvv;

    return true;
}

function collectAndValidateUpiDetails() {
    const upiId = document.getElementById('upi-id').value.trim();

    if (!upiId) {
        alert('Please enter your UPI ID.');
        return false;
    }

    if (!validateUpiDetails(upiId)) {
        alert('Please enter a valid UPI ID.');
        return false;
    }

    customerData.upiId = upiId;
    return true;
}

function collectAndValidateGpayDetails() {
    const gpayId = document.getElementById('gpay-id').value.trim();

    if (!gpayId) {
        alert('Please enter your Google Pay ID.');
        return false;
    }

    if (!validateGpayDetails(gpayId)) {
        alert('Please enter a valid Google Pay ID.');
        return false;
    }

    customerData.gpayId = gpayId;
    return true;
}

function validateCardDetails(cardNumber, expiryDate, cvv) {
    const cardNumberRegex = /^\d{16}$/; // Basic 16-digit card number validation
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    const cvvRegex = /^\d{3,4}$/; // 3 or 4 digit CVV

    if (!cardNumberRegex.test(cardNumber)) {
        alert('Invalid card number. Please enter a 16-digit number.');
        return false;
    }

    if (!expiryDateRegex.test(expiryDate)) {
        alert('Invalid expiry date. Please use MM/YY format.');
        return false;
    }

    if (!cvvRegex.test(cvv)) {
        alert('Invalid CVV. Please enter a 3 or 4 digit number.');
        return false;
    }

    return true;
}

function validateUpiDetails(upiId) {
    const upiIdRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiIdRegex.test(upiId);
}

function validateGpayDetails(gpayId) {
    const gpayIdRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gpayIdRegex.test(gpayId);
}

function sendDataToBackend(data) {
    // Simulate sending data to backend (replace with actual backend call)
    console.log('Sending data to backend:', data);
    const cartTotal = document.getElementById('cart-total').textContent;

    // Simulate UPI payment request
    if (data.paymentMethod === 'upi') {
        alert(`Simulating UPI payment request to: ${data.upiId} for $${cartTotal}. Please complete the payment on your UPI app.`);
    }
    if (data.paymentMethod === 'gpay') {
        alert(`Simulating Google Pay payment request to: ${data.gpayId} for $${cartTotal}. Please complete the payment on your Google Pay app.`);
    }

    // Save data to a file (consider security implications in a real application)
    // Removed saving data to file due to security concerns.
    // saveDataToFile(data);
    alert("Payment successful!");
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

function resetCart() {
    cart.length = 0;
    updateCart();
}