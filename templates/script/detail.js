window.onload = function () {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("id");
    if (id) {
        getitem(Number(id));
    } else {
        document.getElementById("item-detail").innerHTML = "<p>No item ID provided in URL</p>";
    }
}

function loader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = 'block';
    }
}

function stoploader() {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => { loader.style.display = 'none'; }, 1000)
    }
}

const modal = document.getElementById("updateModal");
modal.style.display = "none";

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("updateModal").style.display = "none";
});

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

    const container1 = document.getElementById("Attributeformdiv");
    container1.innerHTML = '<form id="Attributeform" method="post">Attribute name:<input type="text" name="name" required>Description<input type="text" name="description"><button type="submit">Add</button></form><span id="Attributeformname"></span><span id="Attributeformdescription"></span>';

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
}

async function getitem(id) {
    currentUpdateItemId = null;

    loader();
    const response = await fetch("http://127.0.0.1:8000/get_items");
    let data = await response.json();

    const container = document.getElementById("item-detail");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        stoploader();
        return;
    }
    if (id) {
        data = data.filter(item => item.id === id);
    }
    const item = data[0];
    let table = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>tag</th><th>price</th><th>description</th><th></th><th></th></tr>"
    table += `<tr>
        <td>${item.tag}</td>
        <td>${item.price}</td>
        <td>${item.description || ""}</td>
        <td><button type="button" onclick="updateitem(${item.id})">Update</button></td>
        <td><button type="button" onclick="deleteitem(${item.id})">Delete</button></td>
        </tr>`;
    table += "</table>"
    container.innerHTML = table;
    getattr(id);
    stoploader();
}

async function deleteitem(id) {
    if (!confirm("Confirm Delete?")) return;
    loader();
    await fetch(`http://127.0.0.1:8000/items/${id}/delete`, { method: "DELETE" });
    stoploader();
    window.location.href = "./index.html";
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
if (updateForm) {
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
        getitem(currentUpdateItemId);
    });
}