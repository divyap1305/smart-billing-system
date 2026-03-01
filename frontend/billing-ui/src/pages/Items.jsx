import { useState, useEffect } from "react";
import axios from "axios";

function Items() {
  const [name, setName] = useState("");
  const [defaultRate, setDefaultRate] = useState("");
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const res = await axios.get("http://localhost:5000/api/items");
    setItems(res.data);
  };

  const addItem = async () => {
    try {
      await axios.post("http://localhost:5000/api/items", {
        name,
        defaultRate
      });

      alert("Item added!");
      setName("");
      setDefaultRate("");
      fetchItems();

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Item Master</h2>

      <input 
        type="text" 
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ margin: "10px" }}
      />

      <input 
        type="number" 
        placeholder="Default Rate"
        value={defaultRate}
        onChange={(e) => setDefaultRate(e.target.value)}
        style={{ margin: "10px" }}
      />

      <button onClick={addItem} style={{ padding: "10px" }}>
        Add Item
      </button>

      <h3 style={{ marginTop: "20px" }}>Existing Items</h3>

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name} — ₹{item.defaultRate}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;