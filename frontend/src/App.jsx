import { useState, useEffect } from "react"
import axios from "axios"
import PatientList from "./components/PatientList"
import PatientDetail from "./components/PatientDetail"
import AddPatientForm from "./components/AddPatientForm"
import AddVisitForm from "./components/AddVisitForm"
import EditPatientForm from "./components/EditPatientForm"
import PhotoUpload from "./components/PhotoUpload"
function App() {
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState("detail")

  const fetchPatients = async () => {
    const res = await axios.get("http://localhost:8000/api/patients")
    setPatients(res.data)
  }

 const refreshSelected = async (id) => {
    const res = await axios.get(`http://localhost:8000/api/patients/${id}`)
    setSelected(res.data)
    await fetchPatients()
  }

  useEffect(() => { fetchPatients() }, [])

  const btnStyle = (active) => ({
    padding: "6px 16px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer",
    background: active ? "#4f46e5" : "white", color: active ? "white" : "#333", fontSize: 14
  })

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <PatientList patients={patients} selected={selected}
        onSelect={p => { setSelected(p); setView("detail") }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid #eee", padding: "12px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btnStyle(view === "detail")} onClick={() => setView("detail")}>Patient Detail</button>
          <button style={btnStyle(view === "add")} onClick={() => setView("add")}>+ Add Patient</button>
          {selected && <>
  <button style={btnStyle(view === "visit")} onClick={() => setView("visit")}>+ Add Visit</button>
  <button style={btnStyle(view === "edit")} onClick={() => setView("edit")}>Edit Patient</button>
  <button style={btnStyle(view === "photo")} onClick={() => setView("photo")}>📷 Photo</button>
            <button style={{ ...btnStyle(false), marginLeft: "auto" }}
  onClick={() => alert("Report feature coming soon!")}>Report</button>
<button
  onClick={async () => {
    if (!window.confirm(`Delete ${selected.firstName} ${selected.lastName}? This cannot be undone.`)) return
    await axios.delete(`http://localhost:8000/api/patients/${selected._id}`)
    setSelected(null)
    setView("detail")
    fetchPatients()
  }}
  style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #fca5a5", cursor: "pointer", background: "white", color: "#dc2626", fontSize: 14 }}>
  Delete Patient
</button>
          </>}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {view === "detail" && <PatientDetail patient={selected} />}
          {view === "add" && <AddPatientForm onAdded={() => { fetchPatients(); setView("detail") }} />}
          {view === "visit" && selected && <AddVisitForm patient={selected}
            onDone={() => { refreshSelected(selected._id); setView("detail") }} />}
          {view === "edit" && selected && <EditPatientForm patient={selected}
            onDone={() => { refreshSelected(selected._id); setView("detail") }} />}
            {view === "photo" && selected && <PhotoUpload patient={selected}
  onDone={async () => { await refreshSelected(selected._id); setView("detail") }} />}
        </div>
      </div>
    </div>
  )
}

export default App