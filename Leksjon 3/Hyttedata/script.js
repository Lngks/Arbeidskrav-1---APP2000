"use strict";
async function getData() {
    const response = await fetch("Data.json");
    const data = await response.json();
    return data;
}
function showCabins(cabins) {
    const cabinList = document.querySelector("#cabinList");
    if (!cabinList) {
        return;
    }
    cabins.forEach((cabin) => {
        const article = document.createElement("article");
        const heading = document.createElement("h2");
        heading.textContent = cabin.name;
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.textContent = "×";
        closeButton.className = "closeButton";
        const description = document.createElement("p");
        description.className = "description";
        description.textContent = cabin.description;
        const location = document.createElement("p");
        location.textContent = `Sted: ${cabin.place.municipality}, ${cabin.place.county}`;
        const facilities = document.createElement("p");
        facilities.textContent = `Fasiliteter: ${cabin.facilities.join(", ")}`;
        article.append(heading, closeButton, description, location, facilities);
        cabinList.appendChild(article);
    });
}
async function start() {
    const button = document.querySelector("#visHytter");
    if (!button) {
        return;
    }
    button.addEventListener("click", async () => {
        const data = await getData();
        showCabins(data.cabins);
    });
}
function articleHandler() {
    document.body.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const closeButton = target.closest(".closeButton");
        // if (closeButton instanceof HTMLElement) {
        //     closeButton.closest("article")?.remove();
        // }
        if (closeButton instanceof HTMLElement) {
            const article = closeButton.closest("article");
            if (article instanceof HTMLElement) {
                article.classList.add("fade-out");
                article.addEventListener("transitionend", () => {
                    article.remove();
                }, { once: true });
            }
        }
    });
}
function initCabinPage() {
    articleHandler();
    start();
}
window.addEventListener("DOMContentLoaded", initCabinPage);
