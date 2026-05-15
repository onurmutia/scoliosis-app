import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

function PatientDetail({ patient }) {
  if (!patient) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
      Select a patient to view their records
    </div>
  )

  const lastVisit = patient.visits?.[patient.visits.length - 1]

  const chartData = (patient.visits || []).map(v => ({
    date: v.visitDate,
    angle: v.cobbAngle
  }))

  const cobbColor = (angle) => {
    if (angle < 25) return "#16a34a"
    if (angle < 40) return "#d97706"
    return "#dc2626"
  }

  const currentAngle = lastVisit?.cobbAngle ?? patient.initialCobbAngle ?? 0

  return (
    <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>

      {/* Header */}
<div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
  <div style={{
    width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
    background: "#f0f0f0", flexShrink: 0, border: "2px solid #e0e0e0",
    display: "flex", alignItems: "center", justifyContent: "center"
  }}>
    {patient.photo
      ? <img src={patient.photo} alt="Patient" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : <span style={{ fontSize: 28 }}>👤</span>
    }
  </div>
  <div>
    <h2 style={{ marginBottom: 4 }}>{patient.firstName} {patient.lastName}</h2>
    <p style={{ color: "#888", fontSize: 14 }}>
      {patient.gender} · Born {patient.dateOfBirth} · {patient.diagnosisType} scoliosis
    </p>
  </div>
</div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          {
            label: "Current Cobb Angle",
            value: currentAngle + "°",
            sub: lastVisit?.spineRegion ?? "—",
            color: cobbColor(currentAngle)
          },
          {
            label: "Progression",
            value: lastVisit?.progression != null
              ? (lastVisit.progression > 0 ? "+" : "") + lastVisit.progression + "°"
              : "—",
            sub: "since last visit",
            color: lastVisit?.progression > 0 ? "#dc2626" : "#16a34a"
          },
          {
            label: "Risser Sign",
            value: (patient.rissersSign ?? "—") + " / 5",
            sub: "skeletal maturity",
            color: "#4f46e5"
          },
          {
            label: "Treatment",
            value: patient.treatmentPlan ?? "—",
            sub: patient.braceType
              ? patient.braceType + (patient.braceHoursPerDay ? " · " + patient.braceHoursPerDay + "h/day" : "")
              : "—",
            color: "#0891b2"
          },
        ].map(s => (
          <div key={s.label} style={{ background: "#f9f9f9", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Cobb angle chart */}
      {chartData.length > 0 ? (
        <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>Cobb angle over time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#aaa" }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#aaa" }} unit="°" />
              <Tooltip formatter={(val) => val + "°"} labelStyle={{ fontSize: 12 }} />
              <ReferenceLine y={25} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "25° observe", fontSize: 10, fill: "#16a34a" }} />
              <ReferenceLine y={40} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "40° surgery", fontSize: 10, fill: "#dc2626" }} />
              <Line
                type="monotone"
                dataKey="angle"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 5, fill: "#4f46e5" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "#aaa" }}>
            <span style={{ color: "#16a34a" }}>— Below 25°: observation</span>
            <span style={{ color: "#d97706" }}>— 25°–40°: bracing</span>
            <span style={{ color: "#dc2626" }}>— Above 40°: surgery risk</span>
          </div>
        </div>
      ) : (
        <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 16, marginBottom: 24, color: "#aaa", fontSize: 14 }}>
          No visits yet — add a visit to see the Cobb angle chart.
        </div>
      )}

      {/* Visit history */}
      <h3 style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>Visit history</h3>
      {patient.visits?.length === 0 && (
        <p style={{ color: "#aaa", fontSize: 14 }}>No visits recorded yet.</p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["Date", "Cobb Angle", "Region", "Change", "Pain", "Physician", "Notes"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#666" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...(patient.visits || [])].reverse().map((v, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "10px 12px" }}>{v.visitDate}</td>
              <td style={{ padding: "10px 12px", fontWeight: 500, color: cobbColor(v.cobbAngle) }}>{v.cobbAngle}°</td>
              <td style={{ padding: "10px 12px" }}>{v.spineRegion}</td>
              <td style={{ padding: "10px 12px", color: v.progression > 0 ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
                {v.progression != null ? (v.progression > 0 ? "+" : "") + v.progression + "°" : "—"}
              </td>
              <td style={{ padding: "10px 12px" }}>{v.painLevel ?? "—"}</td>
              <td style={{ padding: "10px 12px" }}>{v.physician}</td>
              <td style={{ padding: "10px 12px", color: "#888" }}>{v.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Treatment details */}
      <h3 style={{ fontSize: 14, color: "#555", margin: "24px 0 12px" }}>Treatment details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Diagnosis Type", value: patient.diagnosisType },
          { label: "Curve Location", value: patient.curveLocation },
          { label: "Current Plan", value: patient.treatmentPlan },
          { label: "Brace Type", value: patient.braceType || "—" },
          { label: "Brace Hours/Day", value: patient.braceHoursPerDay ? patient.braceHoursPerDay + "h" : "—" },
          { label: "Physical Therapy", value: patient.physicalTherapy ? "Yes" : "No" },
        ].map(item => (
          <div key={item.label} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default PatientDetail