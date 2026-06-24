import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function InternDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState(null); // task being worked on
  const [submission, setSubmission] = useState({ submissionText: "", submissionLink: "" });
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    const [tasksRes, meRes] = await Promise.all([api.get("/tasks"), api.get(`/interns/${user.id}`)]);
    setTasks(tasksRes.data);
    setProfile(meRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const updateProgress = async (taskId, progress) => {
    await api.put(`/tasks/${taskId}/progress`, { progress });
    loadData();
  };

  const openSubmit = (task) => {
    setActive(task);
    setSubmission({ submissionText: task.submissionText || "", submissionLink: task.submissionLink || "" });
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    await api.put(`/tasks/${active._id}/submit`, submission);
    setActive(null);
    setMsg("Work submitted for review.");
    loadData();
  };

  const completedCount = tasks.filter((t) => t.status === "approved").length;
  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length;

  return (
    <div>
      <div className="navbar">
        <h1>Intern Dashboard — {user?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <div className="grid grid-3">
          <div className="card stat"><div className="num">{profile?.overallProgress ?? 0}%</div><div className="label">Overall Progress</div></div>
          <div className="card stat"><div className="num">{completedCount}</div><div className="label">Tasks Approved</div></div>
          <div className="card stat"><div className="num">{pendingCount}</div><div className="label">Tasks In Progress</div></div>
        </div>

        {msg && <p className="card" style={{ color: "#16a34a" }}>{msg}</p>}

        <div className="card">
          <h3>My Tasks</h3>
          <table>
            <thead><tr><th>Task</th><th>Deadline</th><th>Priority</th><th>Status</th><th>Progress</th><th>Action</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}<br /><small style={{ color: "#6b7280" }}>{t.description}</small></td>
                  <td>{new Date(t.deadline).toLocaleDateString()}</td>
                  <td>{t.priority}</td>
                  <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                  <td style={{ width: 150 }}>
                    <div className="progress-bar"><div className="fill" style={{ width: `${t.progress}%` }} /></div>
                    <input
                      type="range" min="0" max="100" value={t.progress}
                      disabled={t.status === "submitted" || t.status === "approved"}
                      onChange={(e) => updateProgress(t._id, Number(e.target.value))}
                      style={{ marginTop: 4 }}
                    />
                  </td>
                  <td>
                    {(t.status === "pending" || t.status === "in-progress" || t.status === "rejected") && (
                      <button className="btn" onClick={() => openSubmit(t)}>Submit</button>
                    )}
                    {t.status === "submitted" && <em style={{ fontSize: 12 }}>Awaiting review</em>}
                    {t.status === "approved" && <em style={{ fontSize: 12, color: "#16a34a" }}>✓ Approved</em>}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan="6">No tasks assigned yet.</td></tr>}
            </tbody>
          </table>
        </div>

        {tasks.some((t) => t.feedback) && (
          <div className="card">
            <h3>Feedback Received</h3>
            {tasks.filter((t) => t.feedback).map((t) => (
              <div key={t._id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                <strong>{t.title}</strong> — <span className={`badge ${t.status}`}>{t.status}</span>
                <p style={{ margin: "4px 0 0", color: "#374151" }}>{t.feedback}</p>
              </div>
            ))}
          </div>
        )}

        {active && (
          <div className="card">
            <h3>Submit Work: {active.title}</h3>
            <form onSubmit={handleSubmitWork}>
              <label>Notes / Description of work</label>
              <textarea rows={3} value={submission.submissionText}
                onChange={(e) => setSubmission({ ...submission, submissionText: e.target.value })} />
              <label>Link (GitHub repo, deployed URL, doc, etc.)</label>
              <input value={submission.submissionLink}
                onChange={(e) => setSubmission({ ...submission, submissionLink: e.target.value })} placeholder="https://..." />
              <div className="flex">
                <button className="btn success">Submit for Review</button>
                <button type="button" className="btn secondary" onClick={() => setActive(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
