import '../global.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function Details() {
    const navigate = useNavigate();
    const [item, setItem] = useState<any>(null);
    const [Attributes, setAttributes] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const { id } = useParams() as { id: string };

    async function fetchItem(id: string) {
        const response = await fetch(`http://127.0.0.1:8000/get_items/${id}`);
        const data = await response.json();
        setItem(data);
    }

    async function fetchAttributes(id: string) {
        const response = await fetch(`http://127.0.0.1:8000/get_attributes/${id}`);
        const data = await response.json();
        setAttributes(data);
    }

    async function createAttribute(event: any) {
        event.preventDefault();
        const form = document.getElementById('Attributeform') as HTMLFormElement;
        const formData = new FormData(form);
        await fetch(`http://127.0.0.1:8000/attribute/${id}`, {
            method: 'POST',
            body: formData,
        });
        form.reset();
        fetchAttributes(id);
    }

    async function updateItem(event: any, id: string) {
        event.preventDefault();
        const form = document.getElementById('updateitemform') as HTMLFormElement;
        const formData = new FormData(form);
        await fetch(`http://127.0.0.1:8000/items/${id}/update`, {
            method: 'PUT',
            body: formData,
        });
        form.reset();
        fetchItem(id);
        setShowModal(false);
    }

    async function deleteItem(id: string) {
        await fetch(`http://127.0.0.1:8000/items/${id}/delete`, {
            method: 'DELETE',
        });
        navigate('/');
    }

    async function closem() {
        setShowModal(false);
    }

    useEffect(() => {
        if (!id) return;
        fetchItem(id);
        fetchAttributes(id);
    }, [id]);

    return (
        <>
            <nav>
                <button onClick={() => { navigate('/') }}>Items</button>
                <button onClick={() => { navigate('/form') }}>Item form</button>
            </nav>
            <div className="main">
                <h1>Items and Attributes</h1>
                <div id="item-detail">
                    {item === null ? (
                        <p>No data found</p>
                    ) : (
                        <div key={item.id}>
                            <p> Item : {item.tag}</p>
                            <p>Price : {item.price}</p>
                            <p>Description : {item.description}</p>
                            <p><button type="button" onClick={() => setShowModal(true)}>Update</button></p>
                            <p><button type="button" onClick={() => { deleteItem(item.id) }}>Delete</button></p>
                        </div>
                    )}
                </div>
                <div id="Attributeformdiv">
                    <form id="Attributeform" method="post" onSubmit={createAttribute}>
                        <br />
                        Attribute name:<input type="text" name="name" required />
                        <span id="Attributeformname"></span>
                        <br />
                        Description<input type="text" name="description" required />
                        <span id="Attributeformdescription"></span>
                        <br />
                        <button type="submit">Add</button>
                    </form>
                </div>
                <div id="attributes">
                    {Attributes.length === 0 ? (
                        <p>No Attributes found</p>
                    ) : (
                        Attributes.map((attribute) => (
                            <div className="attribute-card" key={attribute.id}>
                                <p>{attribute.name} : {attribute.description}</p>
                            </div>)
                        ))}
                </div>
                {showModal && (<div id="updateModal">
                    <div id="model-content">
                        <span id="closeModal" onClick={closem}>&times;</span>
                        <h3>Update Item</h3>
                        <form id="updateitemform" method="post" onSubmit={(event) => updateItem(event, item.id)}>
                            Item tag: <input type="text" name="tag" required />
                            <span id="updateitemformtag"></span>
                            <br />
                            Price: <input type="number" name="price" required />
                            <span id="updateitemformprice"></span>
                            <br />
                            Description: <input type="text" name="description" />
                            <span id="updateitemformdescription"></span>
                            <br />
                            <button type="submit">Save</button>
                        </form>
                    </div>
                </div>
                )}
                <div id="loader"
                    style={{ display: 'none', position: 'fixed', top: '10px', right: '10px', background: '#ddd', padding: '10px', borderRadius: '5px' }}>
                    Loading...</div>

            </div>
        </>
    );
}