ScrollReveal().reveal('[data-sr]', {
    origin: 'bottom',
    distance: '50px',
    duration: 1000,
    delay: 0,
    reset: true,
    interval: 200, 
    mobile: true,
    easing: 'ease',
    viewFactor: 0.5 
});

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        var planName = this.closest('.product-details').querySelector('.plan').textContent;
        var planPrice = this.closest('.product-details').querySelector('.price').textContent;
        var price = parseFloat(planPrice.split(' ')[1].replace(',', '.')); // Ambil harga dari teks, ubah ke tipe float
        var quantity = this.closest('.product-details').querySelector('#quantity').value;
        var total = price * quantity;

        fetch('/plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: planName, price: total }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});