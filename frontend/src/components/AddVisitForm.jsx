import { useState } from "react"
import { addVisit } from "../api"

function AddVisitForm({ patient, onDone }) {
  const [form, setForm] = useState({
    visitDate: "", cobbAngle: 0, spineRegion: "",
    progression: "", physician: "", notes: "", painLevel: 0
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.visitDate || !form.spineRegion || !form.physician)
      return alert("Please fill in date, region and physician")
    if (form.cobbAngle <= 0) return alert("Cobb angle must be greater than 0")
    const pain = +form.painLevel
    if (pain < 0 || pain > 10) return alert("Pain level must be between 0 and 10")
    setLoading(true)
    try {
      await addVisit(patient._id, {
        ...form,
        cobbAngle: +form.cobbAngle,
        painLevel: pain,
        progression: form.progression !== "" ? +form.progression : null
      })
      alert("Visit added!")
      onDone()
    } catch (e) {
      alert("Error: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const input = (label, key, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }} />
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2 style={{ marginBottom: 6 }}>Add Visit</h2>
      <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>
        Patient: {patient.firstName} {patient.lastName}
      </p>
      {input("Visit Date", "visitDate", "date")}
      {input("Cobb Angle (°)", "cobbAngle", "number")}
      {input("Spine Region (e.g. T6–T11)", "spineRegion")}
      {input("Progression (° change, leave blank for first visit)", "progression", "number")}
      {input("Pain Level (0–10)", "painLevel", "number")}
      {input("Physician", "physician")}
      {input("Notes", "notes")}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{
            background: loading ? "#a5b4fc" : "#4f46e5", color: "white",
            border: "none", padding: "10px 24px", borderRadius: 8,
            fontSize: 14, cursor: loading ? "not-allowed" : "pointer"
          }}>
          {loading ? "Saving..." : "Save Visit"}
        </button>
        <button onClick={onDone} disabled={loading}
          style={{ background: "white", color: "#555", border: "1px solid #ddd", padding: "10px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default AddVisitForm
