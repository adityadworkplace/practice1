import { useNavigate } from 'react-router-dom';
import '../global.css'

export default function Form() {
    const navigate = useNavigate();

    
    async function createItem(event: any) {
        event.preventDefault();
        const loader = document.getElementById('loader') as HTMLDivElement;
        loader.style.display = "block";
        const formData = new FormData(event.target);
        const response = await fetch('http://127.0.0.1:8000/items', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            navigate('/');
        } else {
            console.error("Failed to create item");
        }
    }
    return (
        <>
            <nav>
                <button onClick={() => { window.location.href = '/' }}>Items</button>
                <button onClick={() => { window.location.href = '/form' }}>Item form</button>
            </nav>
            <div className="formdiv">
                <form id="itemform" method="post" onSubmit={createItem}>
                    Item tag:<input type="text" name="tag" required />
                    <span id="itemformtag"></span>
                    <br />
                    Price:<input type="number" name="price" required />
                    <span id="itemformprice"></span>
                    <br />
                    Description:<input type="text" name="description" />
                    <span id="itemformdescription"></span>
                    <br />
                    <button type="submit">Save</button>
                </form>
                <div id="loader"
                    style={{ display: "none", position: "fixed", top: "10px", right: "10px", background: "#ddd", padding: "10px", border: "5px solid #ddd" }}>
                    Loading...</div>
            </div>
        </>
    )
}