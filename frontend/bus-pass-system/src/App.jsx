import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    route: "",
  });

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.age || !form.route) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post("http://localhost:5000/pass", form);

      setForm({ name: "", age: "", route: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to submit data. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const deletePass = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this pass?")) return;
      await axios.delete(`http://localhost:5000/passes/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete the pass.");
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/passes");
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Ensure the backend is running.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((d) => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <h1>🚌 Bus Pass Management</h1>
          <div className="brand-subtitle">Administrator Portal</div>
        </div>

        <div className="form-group">
          <div className="form-label">Passenger Full Name</div>
          <input
            name="name"
            value={form.name}
            placeholder="John Doe"
            onChange={handleChange}
            autoComplete="off"
          />
          <div className="form-label">Age</div>
          <input
            name="age"
            type="number"
            value={form.age}
            placeholder="E.g. 25"
            onChange={handleChange}
          />
          <div className="form-label">Bus Route</div>
          <input
            name="route"
            value={form.route}
            placeholder="E.g. Red Line, 42B"
            onChange={handleChange}
            autoComplete="off"
          />

          <button onClick={submit} disabled={loading}>
            {loading ? "Processing..." : "Generate New Pass"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </aside>

      <main className="main-content">
        <h2>
          Registered Passes
          <input 
            className="search-input"
            type="text" 
            placeholder="Search by name or route..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </h2>

        {data.length === 0 ? (
          <div className="no-data">No passes generated yet. Create one from the sidebar!</div>
        ) : filteredData.length === 0 ? (
          <div className="no-data">No passes match your search criteria.</div>
        ) : (
          <div className="cards-grid">
            {filteredData.map((d) => (
              <div className="card" key={d.id}>
                <div className="card-header">
                  <span>🎫 {d.name}</span>
                  <button className="btn-delete" onClick={() => deletePass(d.id)}>Delete</button>
                </div>
                <div className="card-detail">
                  Age: <span>{d.age}</span>
                </div>
                <div className="card-detail">
                  Route: <span>{d.route}</span>
                </div>
                <div className="card-detail" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                  Pass ID: <span>#{d.id.toString().padStart(4, '0')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;