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
    document.getElementById("success").innerText = "Item added successfully!";
    stoploader();
})