document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[name="email"]');

    form.addEventListener('submit', function (event) {
        const emailValue = emailInput.value;

        // Check if email contains '@' and has a valid domain extension
        if (!emailValue.includes('@') || !isValidDomain(emailValue)) {
            event.preventDefault(); // Prevent form submission
            emailInput.setCustomValidity('Invalid email address'); // Set custom validation message
        } else {
            emailInput.setCustomValidity(''); // Reset validation message
        }
    });

    emailInput.addEventListener('input', function () {
        // Reset validation message when user inputs something
        emailInput.setCustomValidity('');
    });

    function isValidDomain(email) {
        const validDomains = ['com', 'net', 'org', 'edu']; // Add more valid domain extensions if needed
        const domain = email.split('@')[1];
        
        // Check if domain exists and is not empty
        if (domain && domain.trim() !== '') {
            const domainExtension = domain.split('.')[1];
            return validDomains.includes(domainExtension);
        }
        
        return false; 
    }
});
