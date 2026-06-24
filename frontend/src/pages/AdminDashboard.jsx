import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("overview");

  const [newIntern, setNewIntern] = useState({
    name: "", email: "", password: "", department: "", track: "", startDate: "", endDate: "",
  });
  const [newTask, setNewTask] = useState({
    title: "", description: "", assignedTo: "", deadline: "", priority: "medium",
  });
  const [reviewing, setReviewing] = useState(null); // task being reviewed
  const [feedbackText, setFeedbackText] = useState("");
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    const [internsRes, tasksRes] = await Promise.all([api.get("/interns"), api.get("/tasks")]);
    setInterns(internsRes.data);
    setTasks(tasksRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleAddIntern = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/interns", newIntern);
      setNewIntern({ name: "", email: "", password: "", department: "", track: "", startDate: "", endDate: "" });
      setMsg("Intern onboarded successfully.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to add intern");
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/tasks", newTask);
      setNewTask({ title: "", description: "", assignedTo: "", deadline: "", priority: "medium" });
      setMsg("Task assigned successfully.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to assign task");
    }
  };

  const handleRemoveIntern = async (id) => {
    if (!window.confirm("Remove this intern and all their tasks?")) return;
    await api.delete(`/interns/${id}`);
    loadData();
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    loadData();
  };

  const openReview = (task) => { setReviewing(task); setFeedbackText(task.feedback || ""); };

  const submitReview = async (status) => {
    await api.put(`/tasks/${reviewing._id}/review`, { status, feedback: feedbackText });
    setReviewing(null);
    loadData();
  };

  const activeInterns = interns.filter((i) => i.status === "active").length;
  const pendingReview = tasks.filter((t) => t.status === "submitted").length;

  return (
    <div>
      <div className="navbar">
        <h1>Admin Dashboard — {user?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="grid grid-3">
          <div className="card stat"><div className="num">{interns.length}</div><div className="label">Total Interns</div></div>
          <div className="card stat"><div className="num">{activeInterns}</div><div className="label">Active Interns</div></div>
          <div className="card stat"><div className="num">{pendingReview}</div><div className="label">Submissions Awaiting Review</div></div>
        </div>

        <div className="flex" style={{ marginBottom: 16 }}>
          {["overview", "onboard", "assign-task", "review"].map((t) => (
            <button key={t} className={`btn ${tab === t ? "" : "secondary"}`} onClick={() => setTab(t)}>
              {t.replace("-", " ")}
            </button>
          ))}
        </div>

        {msg && <p className="card" style={{ color: "#2563eb" }}>{msg}</p>}

        {tab === "overview" && (
          <div className="card">
            <h3>Interns</h3>
            <table>
              <thead><tr><th>Name</th><th>Track</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {interns.map((i) => (
                  <tr key={i._id}>
                    <td>{i.name}<br /><small style={{ color: "#6b7280" }}>{i.email}</small></td>
                    <td>{i.track || "—"}</td>
                    <td style={{ width: 140 }}>
                      <div className="progress-bar"><div className="fill" style={{ width: `${i.overallProgress}%` }} /></div>
                      <small>{i.overallProgress}%</small>
                    </td>
                    <td><span className={`badge ${i.status}`}>{i.status}</span></td>
                    <td><button className="btn danger" onClick={() => handleRemoveIntern(i._id)}>Remove</button></td>
                  </tr>
                ))}
                {interns.length === 0 && <tr><td colSpan="5">No interns onboarded yet.</td></tr>}
              </tbody>
            </table>

            <h3 style={{ marginTop: 24 }}>All Tasks</h3>
            <table>
              <thead><tr><th>Task</th><th>Intern</th><th>Deadline</th><th>Status</th><th>Progress</th></tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>{t.assignedTo?.name}</td>
                    <td>{new Date(t.deadline).toLocaleDateString()}</td>
                    <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                    <td>{t.progress}%</td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan="5">No tasks yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "onboard" && (
          <div className="card">
            <h3>Onboard New Intern</h3>
            <form onSubmit={handleAddIntern}>
              <label>Full Name</label>
              <input value={newIntern.name} onChange={(e) => setNewIntern({ ...newIntern, name: e.target.value })} required />
              <label>Email</label>
              <input type="email" value={newIntern.email} onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })} required />
              <label>Temporary Password</label>
              <input type="text" value={newIntern.password} onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })} required minLength={6} />
              <label>Department</label>
              <input value={newIntern.department} onChange={(e) => setNewIntern({ ...newIntern, department: e.target.value })} />
              <label>Track</label>
              <input value={newIntern.track} onChange={(e) => setNewIntern({ ...newIntern, track: e.target.value })} placeholder="e.g. MERN Stack Development" />
              <label>Start Date</label>
              <input type="date" value={newIntern.startDate} onChange={(e) => setNewIntern({ ...newIntern, startDate: e.target.value })} />
              <label>End Date</label>
              <input type="date" value={newIntern.endDate} onChange={(e) => setNewIntern({ ...newIntern, endDate: e.target.value })} />
              <button className="btn">Onboard Intern</button>
            </form>
          </div>
        )}

        {tab === "assign-task" && (
          <div className="card">
            <h3>Assign New Task</h3>
            <form onSubmit={handleAssignTask}>
              <label>Title</label>
              <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
              <label>Description</label>
              <textarea rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
              <label>Assign To</label>
              <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} required>
                <option value="">Select intern</option>
                {interns.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
              <label>Deadline</label>
              <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} required />
              <label>Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button className="btn">Assign Task</button>
            </form>
          </div>
        )}

        {tab === "review" && (
          <div className="card">
            <h3>Submissions Awaiting Review</h3>
            <table>
              <thead><tr><th>Task</th><th>Intern</th><th>Submitted</th><th>Link</th><th>Action</th></tr></thead>
              <tbody>
                {tasks.filter((t) => t.status === "submitted").map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>{t.assignedTo?.name}</td>
                    <td>{t.submittedAt ? new Date(t.submittedAt).toLocaleDateString() : "—"}</td>
                    <td>{t.submissionLink ? <a href={t.submissionLink} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                    <td><button className="btn" onClick={() => openReview(t)}>Review</button></td>
                  </tr>
                ))}
                {tasks.filter((t) => t.status === "submitted").length === 0 && <tr><td colSpan="5">Nothing to review.</td></tr>}
              </tbody>
            </table>

            {reviewing && (
              <div className="card" style={{ marginTop: 16, background: "#f9fafb" }}>
                <h4>Reviewing: {reviewing.title}</h4>
                <p><strong>Notes:</strong> {reviewing.submissionText || "—"}</p>
                <label>Feedback</label>
                <textarea rows={3} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                <div className="flex">
                  <button className="btn success" onClick={() => submitReview("approved")}>Approve</button>
                  <button className="btn danger" onClick={() => submitReview("rejected")}>Reject</button>
                  <button className="btn secondary" onClick={() => setReviewing(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Also allow deleting tasks from anywhere via overview list */}
        {tab === "overview" && tasks.length > 0 && (
          <div className="card">
            <h4>Manage Tasks</h4>
            {tasks.map((t) => (
              <div key={t._id} className="flex-between" style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>
                <span>{t.title} — {t.assignedTo?.name}</span>
                <button className="btn danger" onClick={() => handleDeleteTask(t._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
