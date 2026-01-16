window.onload = getitem();

function loader() {
    const loader = document.getElementById("loader");
    if (loader) {
        document.getElementById("searchbutton").disabled = true;
        loader.style.display = 'block';
    }
}

function stoploader() {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => { document.getElementById("searchbutton").disabled = false; }, 2000);
        setTimeout(() => { loader.style.display = 'none'; }, 1000)
    }
}

async function getitem() {
    loader();
    const response = await fetch("http://127.0.0.1:8000/get_items");
    const data = await response.json();

    const container = document.getElementById("items");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        stoploader();
        return;
    }

    let itemcard = ""
    data.forEach(item => {
        itemcard += `<div class="item-card">
        <p>${item.tag}</p>
        <button type="button" onclick="godetails(${item.id})">Select</button>
        </div>`;
    });

    container.innerHTML = itemcard;
    stoploader();
}

document.getElementById("searchbar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = e.target.querySelector("input[name='search']").value.trim();
    loader();
    const response = await fetch(`http://127.0.0.1:8000/searchitems/?q=${encodeURIComponent(q)}`, {
        method: "GET"
    });
    const data = await response.json();
    const container = document.getElementById("items");
    container.innerHTML = "";
    if (data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        stoploader();
        return;
    }
    let itemcard = ""
    data.forEach(item => {
        itemcard += `<div class="item-card">
        <p>${item.tag}</p>
        <button type="button" onclick="godetails(${item.id})">Select</button>
        </div>`;
    });
    container.innerHTML = itemcard;
    stoploader();
})

async function sort() {
    loader();
    const response = await fetch("http://127.0.0.1:8000/get_sorteditems", {
        method: "GET"
    });
    const data = await response.json();
    const container = document.getElementById("items");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        stoploader();
        return;
    }

    let itemcard = ""
    data.forEach(item => {
        itemcard += `<div class="item-card">
        <p>${item.tag}</p>
        <button type="button" onclick="godetails(${item.id})">Select</button>
        </div>`;
    });
    container.innerHTML = itemcard;
    stoploader();
}

function godetails(id) {
    window.location.href = `./detail.html?id=${id}`;
}