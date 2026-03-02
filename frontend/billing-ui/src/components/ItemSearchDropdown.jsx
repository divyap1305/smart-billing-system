import { useState, useEffect, useRef } from "react";
import axios from "axios";

const ItemSearchDropdown = ({ value, onChange, onSelect, onEnter, index }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search items
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/items/search/${encodeURIComponent(query)}`
        );
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.log("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name);
    onChange(item.name);
    onSelect(item);
    setShowDropdown(false);
    
    // Focus quantity field after selection
    setTimeout(() => {
      if (onEnter) onEnter("select");
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      } else {
        onChange(query);
        if (onEnter) onEnter("enter");
      }
    }
  };

  return (
    <div className="search-container" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type item name..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        autoComplete="off"
      />
      
      {loading && <div style={{ position: "absolute", right: "10px", top: "12px" }}>🔍</div>}
      
      {showDropdown && results.length > 0 && (
        <div className="search-results">
          {results.map((item) => (
            <div
              key={item._id}
              className="search-result-item"
              onClick={() => handleSelect(item)}
            >
              <span className="item-name">{item.name}</span>
              <span className="item-rate">₹{item.rate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemSearchDropdown;