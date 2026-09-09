function updateContent(event) {
    const inputField = document.querySelector('#inputField');
    const content = inputField.value;
    if (content.trim() === '') {
        alert('Legg til tekst før du oppdaterer.');
        return;
    } else {
    let newParagraph = document.createElement('p');
        newParagraph.textContent = content;
        document.body.appendChild(newParagraph);
    }
}

function removeContent(event) {
    event.target.remove();
}

function buttonListener() {
    const button = document.querySelector('#updateButton');
    const inputField = document.querySelector('#inputField');
    button.addEventListener('click', updateContent);
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            updateContent(event);
        }
    });
}

function paragraphListener() {
    const paragraphs = document.querySelectorAll('p');
    document.body.addEventListener('click', function(event) {
        if (event.target.tagName === 'P') {
            removeContent(event);
        }
    });
}

function initPage() {
    buttonListener();
    paragraphListener();
}

window.addEventListener('DOMContentLoaded', initPage);