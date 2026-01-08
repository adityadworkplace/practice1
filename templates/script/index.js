window.addEventListener("load", getitem());

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("updateModal").style.display = "none";
});

function loader() {
    const loader = document.getElementById("loader");
    if (loader) { loader.style.display = 'block'; }
}

function stoploader() {
    const loader = document.getElementById("loader");
    if (loader) { loader.style.display = 'none'; }
}

async function getattr(id) {
    loader();
    const response = await fetch(`http://127.0.0.1:8000/get_attributes/${id}`);
    const data = await response.json();

    const container = document.getElementById("attributes");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        stoploader();
        return;
    }

    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>name</th><th>description</th></tr>"
    data.forEach(attribute => {
        table += `<tr>
        <td>${attribute.name}</td>
        <td>${attribute.description || ""}</td>
        </tr>`;
    });
    table += "</table>"
    container.innerHTML = table;
    stoploader();
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

    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>tag</th><th>price</th><th>description</th><th></th><th></th></tr>"
    data.forEach(item => {
        table += `<tr>
        <td>${item.tag}</td>
        <td>${item.price}</td>
        <td>${item.description || ""}</td>
        <td><button type="button" onclick="getattr(${item.id}); selectid(${item.id}, this)">Select</button></td>
        <td><button type="button" onclick="updateitem(${item.id})">Update</button></td>
        <td><button type="button" onclick="deleteitem(${item.id})">Delete</button></td>
        </tr>`;
    });
    table += "</table>"
    container.innerHTML = table;
    stoploader();
}

async function selectid(id, btn) {

    const container = document.getElementById("Attributeformdiv");
    container.innerHTML = '<form id="Attributeform" method="post">Attribute name:<input type="text" name="name" required>Description<input type="text" name="description"><button type="submit">Add</button></form>';

    const form = document.getElementById("Attributeform");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        loader();
        const formData = new FormData(form);
        await fetch(`http://127.0.0.1:8000/attribute/${id}`, {
            method: "POST",
            body: formData
        });
        form.reset();
        stoploader();
    });

    document.querySelectorAll('#items tr').forEach(row => { row.style.backgroundColor = ''; });
    const row = btn.closest("tr");
    row.style.backgroundColor = '#d1e7ff';
}

async function deleteitem(id) {
    if (!confirm("Confirm Delete?")) return;
    loader();
    await fetch(`http://127.0.0.1:8000/items/${id}/delete`, { method: "DELETE" });
    stoploader();
    getitem();
}

async function updateitem(id) {

    loader();
    const response = await fetch(`http://127.0.0.1:8000/get_items/${id}`);
    const data = await response.json();
    stoploader();

    const modal = document.getElementById("updateModal");
    modal.style.display = "block";

    const form1 = document.getElementById("updateitemform");
    form1.tag.value = data.tag;
    form1.price.value = data.price;
    form1.description.value = data.description || "";

    form1.addEventListener("submit", async (e) => {
        e.preventDefault();
        loader();
        const formData = new FormData(form1);
        await fetch(`http://127.0.0.1:8000/items/${id}/update`, {
            method: "PUT",
            body: formData
        });
        stoploader();

        const modal = document.getElementById("updateModal");
        modal.style.display = "None";

        getitem();
    })
}

async function createitem() {
    const form1 = document.getElementById("itemform");

    form1.addEventListener("submit", async (e) => {
        e.preventDefault();
        loader();
        const formData = new FormData(form1);
        await fetch(`http://127.0.0.1:8000/items`, {
            method: "POST",
            body: formData
        });
        form1.reset();
        stoploader();
        getitem();
    })
}