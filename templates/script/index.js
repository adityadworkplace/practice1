window.onload = getitem();

const modal = document.getElementById("updateModal");
modal.style.display = "none";

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("updateModal").style.display = "none";
});

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

    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>tag</th><th>price</th><th>description</th><th></th><th></th><th></th></tr>"
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
    container.innerHTML = '<form id="Attributeform" method="post">Attribute name:<input type="text" name="name" required>Description<input type="text" name="description"><button type="submit">Add</button></form><span id="Attributeformname"></span><span id="Attributeformdescription"></span>';

    const form = document.getElementById("Attributeform");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const span = document.getElementById("Attributeformname");
        const span2 = document.getElementById("Attributeformdescription");
        span.innerText = "";
        span2.innerText = "";
        if (form.name.value.trim() === "") {
            span.innerText = "Name is required";
            return;
        } else if (!/^[a-zA-Z0-9_-]+$/.test(form.name.value.trim()) || form.name.value.trim().length > 50) {
            span.innerText = "Name can only contain alphanumeric characters, underscores, and hyphens, and must be less than 50 characters long";
            return;
        }
        if (form.description.value.trim() === "") {
            span2.innerText = "Description is required";
            return;
        }
        loader();
        await fetch(`http://127.0.0.1:8000/attribute/${id}`, {
            method: "POST",
            body: formData
        });
        form.reset();
        getattr(id);
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

let currentUpdateItemId = null;
const updateForm = document.getElementById("updateitemform");

async function updateitem(id) {
    loader();

    const response = await fetch(`http://127.0.0.1:8000/get_items/${id}`);
    const data = await response.json();

    stoploader();

    currentUpdateItemId = id;
    document.getElementById("updateModal").style.display = "block";

    updateForm.tag.value = data.tag;
    updateForm.price.value = data.price;
    updateForm.description.value = data.description || "";
}

updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUpdateItemId) return;

    const span = document.getElementById("updateitemformtag");
    const span1 = document.getElementById("updateitemformprice");
    const span2 = document.getElementById("updateitemformdescription");

    span.innerText = "";
    span1.innerText = "";
    span2.innerText = "";

    if (updateForm.tag.value.trim() === "") {
        span.innerText = "Tag is required";
        return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(updateForm.tag.value.trim()) ||
        updateForm.tag.value.trim().length > 50) {
        span.innerText = "Invalid tag";
        return;
    }

    if (updateForm.price.value.trim() === "" ||
        isNaN(updateForm.price.value)) {
        span1.innerText = "Price is required";
        return;
    }

    if (Number(updateForm.price.value) < 0) {
        span1.innerText = "Price cannot be negative";
        return;
    }

    if (updateForm.description.value.trim().length > 0 &&
        updateForm.description.value.trim().length < 3) {
        span2.innerText = "Description too short";
        return;
    }

    loader();

    await fetch(
        `http://127.0.0.1:8000/items/${currentUpdateItemId}/update`,
        {
            method: "PUT",
            body: new FormData(updateForm)
        }
    );

    stoploader();
    document.getElementById("updateModal").style.display = "none";
    currentUpdateItemId = null;
    getitem();
});


const form1 = document.getElementById("itemform");

form1.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form1);
    const span = document.getElementById("itemformtag");
    const span1 = document.getElementById("itemformprice");
    const span2 = document.getElementById("itemformdescription");
    span.innerText = "";
    span1.innerText = "";
    span2.innerText = "";
    if (form1.tag.value.trim() === "") {
        span.innerText = "Tag is required";
        return;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form1.tag.value.trim()) || form1.tag.value.trim().length > 50) {
        span.innerText = "Tag can only contain alphanumeric characters, underscores, and hyphens, and must be less than 50 characters long";
        return;
    }
    if (form1.price.value.trim() === "" || isNaN(Number(form1.price.value))) {
        span1.innerText = "Price is required";
        return;
    }
    if (Number(form1.price.value) < 0) {
        span1.innerText = "Price cannot be negative";
        return;
    }
    if (form1.description.value.trim().length > 0 && form1.description.value.trim().length < 3) {
        span2.innerText = "Description should be at least 3 characters long if provided";
        return;
    }
    loader();
    await fetch(`http://127.0.0.1:8000/items`, {
        method: "POST",
        body: formData
    });
    form1.reset();
    stoploader();
    getitem();
})

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
    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>tag</th><th>price</th><th>description</th><th></th><th></th><th></th></tr>"
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

    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>tag</th><th>price</th><th>description</th><th></th><th></th><th></th></tr>"
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