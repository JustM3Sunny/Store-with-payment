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

    cart.forEach(item => {
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
    });

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
    try {
        const fullName = document.getElementById('full-name').value;
        const addressLine1 = document.getElementById('address-line1').value;
        const addressLine2 = document.getElementById('address-line2').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zip-code').value;

        // Validate address data
        if (!fullName || !addressLine1 || !city || !state || !zipCode) {
            alert("Please fill in all required address fields.");
            return false; // Indicate validation failure
        }

        // Store address data in customerData object
        customerData.fullName = fullName;
        customerData.addressLine1 = addressLine1;
        customerData.addressLine2 = addressLine2;
        customerData.city = city;
        customerData.state = state;
        customerData.zipCode = zipCode;

        return true; // Indicate success
    } catch (error) {
        console.error("Error collecting address data:", error);
        alert("An error occurred while collecting address information. Please try again.");
        return false; // Indicate failure
    }
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
    customerData.cart = cart;

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
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    const isValid = validateCardDetails(cardNumber, expiryDate, cvv);
    if (!isValid) {
        alert('Please check your card details.');
        return false;
    }

    customerData.cardName = cardName;
    customerData.cardNumber = cardNumber;
    customerData.expiryDate = expiryDate;
    customerData.cvv = cvv;

    return isValid;
}

function collectAndValidateUpiDetails() {
    const upiId = document.getElementById('upi-id').value;

    const isValid = validateUpiDetails(upiId);
    if (!isValid) {
        alert('Please enter a valid UPI ID.');
        return false;
    }

    customerData.upiId = upiId;
    return isValid;
}

function collectAndValidateGpayDetails() {
    const gpayId = document.getElementById('gpay-id').value;

    const isValid = validateGpayDetails(gpayId);
    if (!isValid) {
        alert('Please enter a valid Google Pay ID.');
        return false;
    }

    customerData.gpayId = gpayId;
    return isValid;
}

function validateCardDetails(cardNumber, expiryDate, cvv) {
    const cardNumberRegex = /^\d{16}$/; // Basic 16-digit card number validation
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    const cvvRegex = /^\d{3,4}$/; // 3 or 4 digit CVV

    if (!cardNumber || !cardNumberRegex.test(cardNumber)) {
        alert('Invalid card number. Please enter a 16-digit number.');
        return false;
    }

    if (!expiryDate || !expiryDateRegex.test(expiryDate)) {
        alert('Invalid expiry date. Please use MM/YY format.');
        return false;
    }

    if (!cvv || !cvvRegex.test(cvv)) {
        alert('Invalid CVV. Please enter a 3 or 4 digit number.');
        return false;
    }

    return true;
}

function validateUpiDetails(upiId) {
    const upiIdRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return !!(upiId && upiIdRegex.test(upiId));
}

function validateGpayDetails(gpayId) {
    const gpayIdRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return !!(gpayId && gpayIdRegex.test(gpayId));
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
    saveDataToFile(data);
}

function saveDataToFile(data) {
    try {
        const dataString = JSON.stringify(data, null, 2);
        const blob = new Blob([dataString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customer_data.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error saving data to file:", error);
        alert("An error occurred while saving the data. Please try again.");
    }
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