
document.addEventListener("DOMContentLoaded", async (event) => {
    const response = await fetch('/items');
    const items = await response.json();

    const shoppingList=document.querySelector('#shoppingList');

    items.forEach((item)=> {
        let li = document.createElement('li');
        li.innerText = `${item.quantity} - ${item.name}`;
        shoppingList.appendChild(li);
    })
});

