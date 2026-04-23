import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [activeTab, setActiveTab] = useState("passes"); // "passes", "users", "routes"
  
  // States
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [passes, setPasses] = useState([]);
  
  // Forms
  const [userForm, setUserForm] = useState({ name: "", age: "" });
  const [routeForm, setRouteForm] = useState({ route_name: "" });
  const [passForm, setPassForm] = useState({ user_id: "", route_id: "", start_date: "", expiry_date: "" });
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setError("");
      const [uRes, rRes, pRes] = await Promise.all([
        axios.get("http://localhost:5000/users"),
        axios.get("http://localhost:5000/routes"),
        axios.get("http://localhost:5000/passes")
      ]);
      setUsers(uRes.data);
      setRoutes(rRes.data);
      setPasses(pRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Ensure the backend is running.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Submit User
  const submitUser = async () => {
    if (!userForm.name || !userForm.age) return setError("All fields required");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/users", userForm);
      setUserForm({ name: "", age: "" });
      fetchAll();
    } catch (err) { setError("Failed to submit user."); } finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    try {
      if (!window.confirm("Delete user? (This will delete all passes associated with this user)")) return;
      await axios.delete(`http://localhost:5000/users/${id}`);
      fetchAll();
    } catch (err) { setError("Failed to delete."); }
  };

  // Submit Route
  const submitRoute = async () => {
    if (!routeForm.route_name) return setError("Route name required");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/routes", routeForm);
      setRouteForm({ route_name: "" });
      fetchAll();
    } catch (err) { setError("Failed to submit route."); } finally { setLoading(false); }
  };

  const deleteRoute = async (id) => {
    try {
      if (!window.confirm("Delete route? (This will delete all passes associated with this route)")) return;
      await axios.delete(`http://localhost:5000/routes/${id}`);
      fetchAll();
    } catch (err) { setError("Failed to delete."); }
  };

  // Submit Pass
  const submitPass = async () => {
    if (!passForm.user_id || !passForm.route_id || !passForm.start_date || !passForm.expiry_date) 
      return setError("All fields required");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/pass", passForm);
      setPassForm({ user_id: "", route_id: "", start_date: "", expiry_date: "" });
      fetchAll();
    } catch (err) { setError("Failed to save pass."); } finally { setLoading(false); }
  };

  const deletePass = async (id) => {
    try {
      if (!window.confirm("Delete pass?")) return;
      await axios.delete(`http://localhost:5000/passes/${id}`);
      fetchAll();
    } catch (err) { setError("Failed to delete pass."); }
  };

  // Filtering
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRoutes = routes.filter(r => r.route_name.toLowerCase().includes(search.toLowerCase()));
  const filteredPasses = passes.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.route.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <h1>🚌 Bus Pass System</h1>
          <div className="brand-subtitle">Administrator Portal</div>
        </div>
        
        <div className="tabs">
          <button className={`tab-btn ${activeTab === "passes" ? "active" : ""}`} onClick={() => setActiveTab("passes")}>🎫 Passes</button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>👥 Users</button>
          <button className={`tab-btn ${activeTab === "routes" ? "active" : ""}`} onClick={() => setActiveTab("routes")}>🛣️ Routes</button>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          {activeTab === "passes" && (
            <>
              <h3>Generate Pass</h3>
              <div className="form-label">Select User</div>
              <select value={passForm.user_id} onChange={e => setPassForm({...passForm, user_id: e.target.value})}>
                <option value="">-- Choose User --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} (Age: {u.age})</option>)}
              </select>

              <div className="form-label">Select Route</div>
              <select value={passForm.route_id} onChange={e => setPassForm({...passForm, route_id: e.target.value})}>
                <option value="">-- Choose Route --</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
              </select>

              <div className="form-label">Start Date</div>
              <input type="date" value={passForm.start_date} onChange={e => setPassForm({...passForm, start_date: e.target.value})} />
              
              <div className="form-label">Expiry Date</div>
              <input type="date" value={passForm.expiry_date} onChange={e => setPassForm({...passForm, expiry_date: e.target.value})} />

              <button onClick={submitPass} disabled={loading}>{loading ? "Processing..." : "Generate Pass"}</button>
            </>
          )}

          {activeTab === "users" && (
            <>
              <h3>Register User</h3>
              <div className="form-label">Full Name</div>
              <input value={userForm.name} placeholder="John Doe" onChange={e => setUserForm({...userForm, name: e.target.value})} />
              
              <div className="form-label">Age</div>
              <input type="number" value={userForm.age} placeholder="25" onChange={e => setUserForm({...userForm, age: e.target.value})} />

              <button onClick={submitUser} disabled={loading}>{loading ? "Processing..." : "Register User"}</button>
            </>
          )}

          {activeTab === "routes" && (
            <>
              <h3>Add Route</h3>
              <div className="form-label">Route Name</div>
              <input value={routeForm.route_name} placeholder="Red Line 42B" onChange={e => setRouteForm({...routeForm, route_name: e.target.value})} />

              <button onClick={submitRoute} disabled={loading}>{loading ? "Processing..." : "Add Route"}</button>
            </>
          )}
        </div>
        {error && <div className="error">{error}</div>}
      </aside>

      <main className="main-content">
        <h2>
          {activeTab === "passes" && "Registered Passes"}
          {activeTab === "users" && "Registered Users"}
          {activeTab === "routes" && "Available Routes"}
          
          <input 
            className="search-input"
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </h2>

        {activeTab === "passes" && (
          filteredPasses.length === 0 ? <div className="no-data">No passes found.</div> : (
          <div className="cards-grid">
            {filteredPasses.map(p => (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <span>🎫 {p.name}</span>
                  <button className="btn-delete" onClick={() => deletePass(p.id)}>Delete</button>
                </div>
                <div className="card-detail">Age: <span>{p.age}</span></div>
                <div className="card-detail">Route: <span>{p.route}</span></div>
                <div className="card-detail">Start Date: <span>{new Date(p.start_date).toLocaleDateString()}</span></div>
                <div className="card-detail">Expiry Date: <span>{new Date(p.expiry_date).toLocaleDateString()}</span></div>
                <div className="card-detail" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 0}}>
                  Pass ID: <span>#{p.id.toString().padStart(4, '0')}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {activeTab === "users" && (
          filteredUsers.length === 0 ? <div className="no-data">No users found.</div> : (
          <div className="cards-grid">
            {filteredUsers.map(u => (
              <div className="card" key={u.id}>
                <div className="card-header">
                  <span>👥 {u.name}</span>
                  <button className="btn-delete" onClick={() => deleteUser(u.id)}>Delete</button>
                </div>
                <div className="card-detail" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 0}}>
                  Age: <span>{u.age}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {activeTab === "routes" && (
          filteredRoutes.length === 0 ? <div className="no-data">No routes found.</div> : (
          <div className="cards-grid">
            {filteredRoutes.map(r => (
              <div className="card" key={r.id}>
                <div className="card-header">
                  <span>🛣️ {r.route_name}</span>
                  <button className="btn-delete" onClick={() => deleteRoute(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;