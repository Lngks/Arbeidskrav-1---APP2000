const registerUser = document.querySelector("#registerUser");
const registerTrip = document.querySelector("#registerTrip");

function validateName(event) {
    const nameInput = event.currentTarget.elements.fullName.value.trim();
    const words = nameInput.split(/\s+/);
    if (words.length < 2) {
        alert("Please enter your full name (first and last name).");
        return false;
    } return true;
}

function validateEmail(event) {
    const email = event.currentTarget.elements.email.value.trim();
    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return false;
    } return true;
}

registerUser.addEventListener("submit", (event) => {
    const isNameValid = validateName(event);
    const isEmailValid = validateEmail(event);

    if (!isNameValid || !isEmailValid) {
        event.preventDefault();
    }
});

function validateDate(event) {
    const startDate = event.currentTarget.elements.startDate.value.trim();
    const endDate = event.currentTarget.elements.endDate.value.trim();

    if (startDate > endDate) {
        alert("Please enter a valid time (End date after start date).")
        return false;
    } return true;
}

function validateDestination(event) {
    const dest = event.currentTarget.elements.destination.value.trim();
    const validDestination = /^[A-Za-zÆØÅæøå\s-]+$/;

    if (!validDestination.test(dest)) {
        alert("Destination can only include letters, space and hyphen");
        return false;
    } return true;
}

registerTrip.addEventListener("submit", (event) => {
    const isDateValid = validateDate(event);
    const isDestinationValid = validateDestination(event);

    if (!isDateValid || !isDestinationValid) {
        event.preventDefault();
    }
});
    