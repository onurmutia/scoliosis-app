import { useState, useEffect } from "react"
import { getPatients, getPatient, deletePatient } from "./api"
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
  const [loading, setLoading] = useState(true)

  const fetchPatients = async () => {
    try {
      const data = await getPatients()
      setPatients(data)
    } catch (e) {
      alert("Failed to load patients: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshSelected = async (id) => {
    const updated = await getPatient(id)
    setSelected(updated)
    setPatients(prev => prev.map(p => p._id === id ? updated : p))
  }

  useEffect(() => { fetchPatients() }, [])

  const btnStyle = (active) => ({
    padding: "6px 16px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer",
    background: active ? "#4f46e5" : "white", color: active ? "white" : "#333", fontSize: 14
  })

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <PatientList
        patients={patients}
        selected={selected}
        loading={loading}
        onSelect={p => { setSelected(p); setView("detail") }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid #eee", padding: "12px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btnStyle(view === "detail")} onClick={() => setView("detail")}>Patient Detail</button>
          <button style={btnStyle(view === "add")} onClick={() => setView("add")}>+ Add Patient</button>
          {selected && <>
            <button style={btnStyle(view === "visit")} onClick={() => setView("visit")}>+ Add Visit</button>
            <button style={btnStyle(view === "edit")} onClick={() => setView("edit")}>Edit Patient</button>
            <button style={btnStyle(view === "photo")} onClick={() => setView("photo")}>📷 Photo</button>
            <button
              style={{ ...btnStyle(false), marginLeft: "auto" }}
              onClick={() => alert("Report feature coming soon!")}>
              Report
            </button>
            <button
              onClick={async () => {
                if (!window.confirm(`Delete ${selected.firstName} ${selected.lastName}? This cannot be undone.`)) return
                try {
                  await deletePatient(selected._id)
                  setSelected(null)
                  setView("detail")
                  setPatients(prev => prev.filter(p => p._id !== selected._id))
                } catch (e) {
                  alert("Failed to delete patient: " + e.message)
                }
              }}
              style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #fca5a5", cursor: "pointer", background: "white", color: "#dc2626", fontSize: 14 }}>
              Delete Patient
            </button>
          </>}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {view === "detail" && <PatientDetail patient={selected} />}
          {view === "add" && <AddPatientForm onAdded={(newPatient) => {
            fetchPatients()
            setView("detail")
          }} />}
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
