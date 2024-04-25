document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[name="email"]');

    form.addEventListener('submit', function (event) {
        const emailValue = emailInput.value;

        if (!emailValue.includes('@') || !isValidDomain(emailValue)) {
            event.preventDefault(); 
            emailInput.setCustomValidity('Invalid email address');
        } else {
            emailInput.setCustomValidity(''); 
        }
    });

    emailInput.addEventListener('input', function () {
 
        emailInput.setCustomValidity('');
    });

    function isValidDomain(email) {
        const validDomains = ['com', 'net', 'org', 'edu']; 
        const domain = email.split('@')[1];
        
        if (domain && domain.trim() !== '') {
            const domainExtension = domain.split('.')[1];
            return validDomains.includes(domainExtension);
        }
        
        return false; 
    }
});
