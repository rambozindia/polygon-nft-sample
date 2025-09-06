import { useState } from 'react';

const AdminDashboard = () => {
  const [baseURI, setBaseURI] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSetBaseURI = async () => {
    try {
      const response = await fetch('http://localhost:3001/set-base-uri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseURI }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Base URI set successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    }
  };

  const handleInitialMint = async () => {
    try {
      const response = await fetch('http://localhost:3001/initial-mint-and-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(quantity, 10) }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    }
  };

  return (
    <div>
      <h3>Admin Dashboard</h3>
      <div>
        <h4>Set Base URI</h4>
        <input
          type="text"
          value={baseURI}
          onChange={(e) => setBaseURI(e.target.value)}
          placeholder="https://example.com/nft/"
        />
        <button onClick={handleSetBaseURI}>Set Base URI</button>
      </div>
      <hr />
      <div>
        <h4>Initial Mint and List</h4>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button onClick={handleInitialMint}>Mint and List</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
