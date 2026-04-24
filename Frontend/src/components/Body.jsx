import React, { useState, useEffect } from "react";
import "../index.css";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Body = () => {
  const [editingId, setEditingId] = useState(null);
  const [listTitle, setListTitle] = useState("");
  const [listItems, setListItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list title + items using POST on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${API}/list`);  // POST to fetch data
        setListTitle(res.data.title);
        setListItems(res.data.items);
      } catch (err) {
        setError("Failed to load list.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // DELETE
  const handleDelete = async (id) => {
    try {
      await axios.post(`${API}/delete`, { deleteItemId: id });
      setListItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ADD new item
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const res = await axios.post(`${API}/add`, {
        newItem: newItem.trim(),
        list: listTitle,
      });
      setListItems((prev) => [...prev, res.data]);
      setNewItem("");
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  // EDIT
  const handleEdit = async (e, id) => {
    e.preventDefault();
    if (!editValue.trim()) return;
    try {
      const res = await axios.post(`${API}/edit`, {
        updatedItemId: id,
        updatedItemTitle: editValue.trim(),
      });
      setListItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: res.data.title } : item
        )
      );
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="box" id="heading">
        <h1>{listTitle}</h1>
      </div>

      <div className="box">
        {listItems.map((item) => (
          <div key={item.id} className="item">

            {/* DELETE */}
            <input
              type="checkbox"
              onChange={() => handleDelete(item.id)}
            />

            {/* EDIT / VIEW */}
            {editingId === item.id ? (
              <form className="edit" onSubmit={(e) => handleEdit(e, item.id)}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                <button className="edit" type="submit">
                  <img className="icon" src="/public/check-solid.svg" alt="tick" />
                </button>
              </form>
            ) : (
              <>
                <p>{item.title}</p>
                <button
                  className="edit"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditValue(item.title);
                  }}
                >
                  <img className="icon" src="/public/pencil-solid.svg" alt="edit" />
                </button>
              </>
            )}
          </div>
        ))}

        {/* ADD */}
        <form className="item" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="New Item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            autoComplete="off"
          />
          <button className="add" type="submit">+</button>
        </form>
      </div>
    </>
  );
};

export default Body;