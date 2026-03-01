const ItemRow = ({ item, index, updateItem, removeItem }) => {
  return (
    <tr>
      <td>
        <input
          value={item.description}
          onChange={(e) =>
            updateItem(index, "description", e.target.value)
          }
        />
      </td>

      <td>
        <input
          type="number"
          value={item.qty}
          onChange={(e) =>
            updateItem(index, "qty", Number(e.target.value))
          }
        />
      </td>

      <td>
        <input
          type="number"
          value={item.rate}
          onChange={(e) =>
            updateItem(index, "rate", Number(e.target.value))
          }
        />
      </td>

      <td>{item.amount}</td>

      <td>
        <button onClick={() => removeItem(index)}>X</button>
      </td>
    </tr>
  );
};

export default ItemRow;