import '../global.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import arrow from '../assets/arrow.png';

export default function Items() {
    const navigate = useNavigate();
    const [items, setItems] = useState<any[]>([]);


    async function fetchItems() {
        const response = await fetch("http://127.0.0.1:8000/get_items");
        const data = await response.json();
        setItems(data);
    }

    async function sort() {
        const response = await fetch("http://127.0.0.1:8000/get_sorteditems");
        const data = await response.json();
        setItems(data);
    }

    async function search(event: any) {
        event.preventDefault();
        const form = document.getElementById('searchbar') as HTMLFormElement;
        const formData = new FormData(form);
        const q = new URLSearchParams(formData as any).toString();
        const response = await fetch(`http://127.0.0.1:8000/searchitems/?${q}`);
        const data = await response.json();
        setItems(data);
    }

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <>
            <nav>
                <button onClick={() => { navigate('/') }}>Items</button>
                <button onClick={() => { navigate('/form') }}>Item form</button>
            </nav>
            <div className="main">
                <h1>Items and Attributes</h1>
                <br />
                <div>
                    <form id="searchbar" method="get" onSubmit={search}>
                        Search Item: <input type="text" name="q" />
                        <button type='submit' id="searchbutton">Search</button>
                    </form>
                    <button onClick={sort}><img src={arrow} style={{ width: '15px' }} /></button>
                </div>
                <div className="items">
                    {items.length === 0 ? (
                        <p>No data found</p>
                    ) : (
                        items.map((item) => (
                            <div className="item-card" key={item.id}>
                                <p>{item.tag}</p>
                                <button type="button" onClick={() => { navigate(`/details/${item.id}`) }}>Select</button>
                            </div>)
                        ))}
                </div>
                <br />
                <div id="loader"
                    style={{ display: 'none', position: 'fixed', top: '10px', right: '10px', background: '#ddd', padding: '10px', borderRadius: '5px' }}>
                    Loading...</div>
            </div>
        </>
    )
}