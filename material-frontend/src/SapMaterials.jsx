import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://192.168.3.45:7067";
const SAP_API_URL = `${API_BASE_URL}/api/sap/test-sap`;

export default function SapMaterials() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasRows = useMemo(() => rows.length > 0, [rows]);

  const loadSapData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(SAP_API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected API response format.");
      }

      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Unable to load SAP data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>SAP Materials</h1>
          <button type="button" onClick={() => navigate("/testing")} style={styles.secondaryBtn}>
            Back
          </button>
        </div>

        <div style={styles.actionRow}>
          <button type="button" onClick={loadSapData} disabled={loading} style={styles.primaryBtn}>
            {loading ? "Loading..." : "Load SAP Data"}
          </button>
          <span style={error ? styles.errorText : styles.statusText}>
            {error
              ? `Error: ${error}`
              : loading
                ? "Fetching data from backend..."
                : hasRows
                  ? `Loaded ${rows.length} record(s)`
                  : "Click Load SAP Data to fetch records"}
          </span>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Material Number</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td style={styles.emptyCell}>No data loaded.</td>
                </tr>
              )}

              {rows.map((item, index) => (
                <tr key={`${item?.materialNumber ?? item?.MaterialNumber ?? "row"}-${index}`}>
                  <td style={styles.td}>{item?.materialNumber ?? item?.MaterialNumber ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    padding: "24px",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  card: {
    maxWidth: "980px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#1f2937",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  primaryBtn: {
    background: "#0f4cd6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "#ffffff",
    color: "#1f2937",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  statusText: {
    color: "#4b5563",
    fontSize: "14px",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: "14px",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: "14px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eef2f7",
    color: "#111827",
    fontSize: "14px",
  },
  emptyCell: {
    padding: "14px",
    color: "#6b7280",
    fontStyle: "italic",
  },
};

