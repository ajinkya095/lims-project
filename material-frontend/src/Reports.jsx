import React, { useEffect, useState } from "react";

const cardStyle = {
  background: "white",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  marginBottom: "30px",
};

const headerStyle = {
  color: "#1a3a5a",
  marginBottom: "10px",
  borderBottom: "2px solid #1a3a5a",
  paddingBottom: "6px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderRadius: "10px",
  overflow: "hidden"
};

const thStyle = {
  padding: "10px",
  backgroundColor: "#1a3a5a",
  color: "#ffffff",
  fontWeight: "600",
  textTransform: "uppercase",
  fontSize: "12px",
  borderBottom: "1px solid #ccc"
};

const tdStyle = {
  padding: "8px 10px",
  color: "#1a3a5a",          // 👈 DARK TEXT
  fontSize: "13px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb"
};

const rowAltStyle = {
  backgroundColor: "#eef3f8"
};

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://localhost:7067/api/production/get-all-data")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: "30px" }}>Loading reports...</p>;
  }

  if (!data) {
    return <p style={{ padding: "30px" }}>No data available</p>;
  }

  const renderTable = (rows) => {
    if (!rows || rows.length === 0) return <p>No records</p>;

    const keys = Object.keys(rows[0]);

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} style={thStyle}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {rows.map((r, i) => (
    <tr key={i} style={i % 2 === 0 ? {} : rowAltStyle}>
      {keys.map((k) => (
        <td key={k} style={tdStyle}>
          {r[k] === null || r[k] === undefined
            ? "-"
            : typeof r[k] === "object"
              ? JSON.stringify(r[k])
              : String(r[k])}
        </td>
      ))}
    </tr>
  ))}
</tbody>

        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: "30px", background: "#f4f7fb", minHeight: "100vh" }}>
      <h1 style={{ color: "#1a3a5a", marginBottom: "30px" }}>
        📊 Reports Dashboard
      </h1>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Raw Material – Coal</h2>
        <p>Total Records: <b>{data.coal.length}</b></p>
        {renderTable(data.coal)}
      </div>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Raw Material – Pellets</h2>
        <p>Total Records: <b>{data.pellets.length}</b></p>
        {renderTable(data.pellets)}
      </div>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Raw Material – Iron Ore</h2>
        <p>Total Records: <b>{data.ironOre.length}</b></p>
        {renderTable(data.ironOre)}
      </div>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Production</h2>
        <p>Total Records: <b>{data.production.length}</b></p>
        {renderTable(data.production)}
      </div>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Dispatch</h2>
        <p>Total Records: <b>{data.dispatch.length}</b></p>
        {renderTable(data.dispatch)}
      </div>

      <div style={cardStyle}>
        <h2 style={headerStyle}>Stock House</h2>
        <p>Total Records: <b>{data.stockHouse.length}</b></p>
        {renderTable(data.stockHouse)}
      </div>
    </div>
  );
};

export default Reports;
