 getitem();

async function getattr(id) {
    const response = await fetch(`http://127.0.0.1:8000/get_attributes/${id}`);
    const data = await response.json();

    const container = document.getElementById("attributes");
    container.innerHTML = "";

    if(data.length === 0){
        container.innerHTML = "<p>No data found</p>";
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
}

async function getitem() {
    const response = await fetch("http://127.0.0.1:8000/get_items");
    const data = await response.json();

    const container = document.getElementById("items");
    container.innerHTML = "";

    if(data.length === 0){
        container.innerHTML = "<p>No data found</p>";
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
}

async function selectid(id,btn){
    
    const container = document.getElementById("Attributeformdiv");
    container.innerHTML = '<form id="Attributeform" method="post">Attribute name:<input type="text" name="name" required>Description<input type="text" name="description"><button type="submit">Add</button></form>';

    const form = document.getElementById("Attributeform") ;
    form.action = `http://127.0.0.1:8000/attribute/${id}`
    document.querySelectorAll('tr').forEach(row =>{ row.style.backgroundColor = '';});
    const row = btn.closest("tr");
    row.style.backgroundColor = '#d1e7ff';
}

async function deleteitem(id) {
    if (!confirm("Confirm Delete?")) return;
    await fetch(`http://127.0.0.1:8000/items/${id}/delete`, { method: "DELETE" });
    getitem();
}

async function updateitem(id) {
    const form1 = document.getElementById("itemform") ;
    form1.action = `http://127.0.0.1:8000/items/${item_id}/update`
    getitem();
}

async function createitem() {
    const form1 = document.getElementById("itemform") ;
    form1.action = `http://127.0.0.1:8000/items`
    getitem();
}