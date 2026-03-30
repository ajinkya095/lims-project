import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://192.168.3.45:7067";

const cardStyle = {
  background: "white",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  marginBottom: "30px",
};

const headerStyle = {
  color: "var(--heading-color)",
  marginBottom: "10px",
  borderBottom: "2px solid var(--accent-dark)",
  paddingBottom: "6px",
  fontWeight: "600",
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
  backgroundColor: "var(--accent-dark)",
  color: "#ffffff",
  fontWeight: "600",
  textTransform: "uppercase",
  fontSize: "12px",
  borderBottom: "1px solid #ccc"
};

const tdStyle = {
  padding: "8px 10px",
  color: "var(--accent-dark)",
  fontSize: "13px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  whiteSpace: "nowrap"
};

const rowAltStyle = {
  backgroundColor: "#fdf2f2"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#0f172a",
};

const calendarButton = {
  height: "38px",
  minWidth: "38px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  cursor: "pointer",
  fontSize: "16px"
};

const formatDateInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultWeekRange = () => {
  const today = new Date();
  const sixDaysAgo = new Date(today);
  sixDaysAgo.setDate(today.getDate() - 6);
  return {
    from: formatDateInput(sixDaysAgo),
    to: formatDateInput(today)
  };
};

const Reports = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const defaultWeekRange = getDefaultWeekRange();
  const [data, setData] = useState({
    coal: [],
    pellets: [],
    ironOre: [],
    dolomite: [],
    production: [],
    byProductDolochar: [],
    dispatch: [],
    stockCoal: [],
    stockIronOre: [],
    stockDolomite: [],
    stockCharcoal: []
  });

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    dates: [],
    testings: [],
    materials: []
  });
  const [selectedDates, setSelectedDates] = useState(["All"]);
  const [dateFrom, setDateFrom] = useState(defaultWeekRange.from);
  const [dateTo, setDateTo] = useState(defaultWeekRange.to);
  const [dateAll, setDateAll] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);
  const [selectedTestings, setSelectedTestings] = useState(["All"]);
  const [selectedMaterials, setSelectedMaterials] = useState(["All"]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const getJsonHeaders = () => ({
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  const getFirstArray = (...candidates) =>
    candidates.find((value) => Array.isArray(value)) || [];

  const filterStockByMaterial = (rows, materialKeyword) => {
    if (!Array.isArray(rows)) return [];
    const keyword = String(materialKeyword || "").toLowerCase();
    return rows.filter((row) => {
      const material = String(
        row?.material ??
          row?.Material ??
          row?.stockMaterial ??
          row?.StockMaterial ??
          row?.module ??
          row?.Module ??
          "",
      ).toLowerCase();
      return material.includes(keyword);
    });
  };

  useEffect(() => {
    const testingSet = new Set(selectedTestings);
    const showAll = testingSet.has("All") || selectedTestings.length === 0;
    
    if (showAll) {
      setFilteredMaterials(options.materials);
      return;
    }
    
    const materials = [];
    if (testingSet.has("Raw Material")) {
      materials.push("Coal", "Pellets", "Iron Ore", "Dolomite");
    }
    if (testingSet.has("Stock House")) {
      materials.push("Coal", "Iron Ore", "Dolomite", "Charcoal");
    }
    if (testingSet.has("Production")) {
      materials.push("Cooler Discharge", "Product House", "Dolochar");
    }
    if (testingSet.has("Dispatch")) {
      materials.push("Coal", "Pellets", "Iron Ore", "Dolomite", "Charcoal");
    }
    
    setFilteredMaterials([...new Set(materials)]);
    setSelectedMaterials(["All"]);
  }, [selectedTestings, options.materials]);

  const applyFilters = async () => {
    if (!dateAll && dateFrom && dateTo && dateFrom > dateTo) {
      setErrorMsg("From date cannot be later than To date.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/production/reports-filter`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify({
          dates: selectedDates,
          dateFrom: dateAll ? "" : dateFrom,
          dateTo: dateAll ? "" : dateTo,
          testings: selectedTestings,
          materials: selectedMaterials
        })
      });
      const json = await res.json();
      const stockCombined = getFirstArray(
        json?.stockHouse,
        json?.stockhouse,
        json?.stock,
        json?.stockData,
        json?.stockEntries,
      );
      const stockCoal = getFirstArray(
        json?.stockCoal,
        json?.stockcoal,
        json?.stock_coal,
        json?.stockHouseCoal,
        json?.stock_house_coal,
        json?.stockHouse?.coal,
        json?.stock?.coal,
      );
      const stockIronOre = getFirstArray(
        json?.stockIronOre,
        json?.stockIronore,
        json?.stock_iron_ore,
        json?.stockHouseIronOre,
        json?.stock_house_iron_ore,
        json?.stockHouse?.ironOre,
        json?.stock?.ironOre,
      );
      const stockDolomite = getFirstArray(
        json?.stockDolomite,
        json?.stockdolomite,
        json?.stock_dolomite,
        json?.stockHouseDolomite,
        json?.stock_house_dolomite,
        json?.stockHouse?.dolomite,
        json?.stock?.dolomite,
      );
      const stockCharcoal = getFirstArray(
        json?.stockCharcoal,
        json?.stockcharcoal,
        json?.stock_charcoal,
        json?.stockHouseCharcoal,
        json?.stock_house_charcoal,
        json?.stockHouse?.charcoal,
        json?.stock?.charcoal,
      );

      setData({
        coal: json.coal || [],
        pellets: json.pellets || [],
        ironOre: json.ironOre || [],
        dolomite: json.dolomite || [],
        production: json.production || [],
        byProductDolochar: json.byProductDolochar || [],
        dispatch: json.dispatch || [],
        stockCoal:
          stockCoal.length > 0
            ? stockCoal
            : filterStockByMaterial(stockCombined, "coal"),
        stockIronOre:
          stockIronOre.length > 0
            ? stockIronOre
            : filterStockByMaterial(stockCombined, "iron"),
        stockDolomite:
          stockDolomite.length > 0
            ? stockDolomite
            : filterStockByMaterial(stockCombined, "dolomite"),
        stockCharcoal:
          stockCharcoal.length > 0
            ? stockCharcoal
            : filterStockByMaterial(stockCombined, "charcoal"),
      });
      setHasApplied(true);
    } catch (error) {
      console.error("Failed to load reports:", error);
      setErrorMsg("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/production/reports-options`)
      .then((res) => {
        if (!res.ok) throw new Error(`reports-options failed (${res.status})`);
        return res.json();
      })
      .then((res) => {
        setOptions({
          dates: res.dates || [],
          testings: res.testings || [],
          materials: res.materials || []
        });
      })
      .catch((error) => {
        console.error("Failed to load report options:", error);
        setErrorMsg("Failed to load report filters.");
      });
  }, [userId, token]);

  useEffect(() => {
    // do not auto-load reports until filters are applied
  }, []);

  if (loading) {
    return <p style={{ padding: "30px" }}>Loading reports...</p>;
  }

  const renderTable = (rows, preferredOrder = null) => {
    const safeRows = Array.isArray(rows)
      ? rows.filter((r) => r && typeof r === "object")
      : [];

    if (safeRows.length === 0) {
      return <p>No records</p>;
    }

    const firstRowKeys = Object.keys(safeRows[0] || {});
    const seen = new Set(firstRowKeys);
    let keys = [...firstRowKeys];

    safeRows.forEach((row) => {
      Object.keys(row || {}).forEach((k) => {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      });
    });

    if (Array.isArray(preferredOrder) && preferredOrder.length > 0) {
      const existing = new Set(keys);
      keys = preferredOrder.filter((k) => existing.has(k));
    }

    return (
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ ...tableStyle, minWidth: "max-content", tableLayout: "auto" }}>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} style={{ ...thStyle, whiteSpace: "nowrap" }}>{k}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {safeRows.map((r, i) => (
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

  const handleMultiSelect = (setter) => (e) => {
    let values = Array.from(e.target.selectedOptions).map((o) => o.value);

    if (values.includes("All") && values.length > 1) {
      values = values.filter((v) => v !== "All");
    } else if (values.length === 0) {
      values = ["All"];
    }

    setter(values);
  };

  const downloadPdf = async () => {
    const res = await fetch(`${API_BASE_URL}/api/production/reports-export-pdf`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify({
        dates: selectedDates,
        dateFrom: dateAll ? "" : dateFrom,
        dateTo: dateAll ? "" : dateTo,
        testings: selectedTestings,
        materials: selectedMaterials
      })
    });

    if (!res.ok) {
      alert("Failed to download PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = async () => {
    if (!hasApplied) {
      alert("Apply filters first, then download.");
      return;
    }

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";
      const text =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const buildSection = (title, rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return [];
      const validRows = rows.filter((r) => r && typeof r === "object");
      if (validRows.length === 0) return [];

      const keys = Array.from(
        new Set(validRows.flatMap((r) => Object.keys(r || {}))),
      );
      const lines = [];
      lines.push(escapeCsvValue(title));
      lines.push(keys.map(escapeCsvValue).join(","));
      validRows.forEach((row) => {
        lines.push(keys.map((k) => escapeCsvValue(row[k])).join(","));
      });
      lines.push("");
      return lines;
    };

    const csvLines = [];

    if (showRawCoal) {
      csvLines.push(...buildSection("Raw Material Coal", data.coal));
    }
    if (showRawPellets) {
      csvLines.push(...buildSection("Raw Material Pellets", data.pellets));
    }
    if (showRawIron) {
      csvLines.push(...buildSection("Raw Material Iron Ore", data.ironOre));
    }
    if (showRawDolomite) {
      csvLines.push(...buildSection("Raw Material Dolomite", data.dolomite));
    }
    if (showProductionData) {
      csvLines.push(...buildSection("Production", data.production));
    }
    if (showByProductDolochar) {
      csvLines.push(...buildSection("By Product Dolochar", data.byProductDolochar));
    }
    if (showDispatchData) {
      csvLines.push(...buildSection("Dispatch", data.dispatch));
    }
    if (showStockCoal) {
      csvLines.push(...buildSection("Stock House Coal", data.stockCoal));
    }
    if (showStockIron) {
      csvLines.push(...buildSection("Stock House Iron Ore", data.stockIronOre));
    }
    if (showStockDolomite) {
      csvLines.push(...buildSection("Stock House Dolomite", data.stockDolomite));
    }
    if (showStockCharcoal) {
      csvLines.push(...buildSection("Stock House Charcoal", data.stockCharcoal));
    }

    if (csvLines.length === 0) {
      alert("No records available for selected filters.");
      return;
    }

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const showAllTestings = selectedTestings.includes("All") || selectedTestings.length === 0;
  const showAllMaterials = selectedMaterials.includes("All") || selectedMaterials.length === 0;

  const showRawMaterial = showAllTestings || selectedTestings.includes("Raw Material");
  const showStockHouse = showAllTestings || selectedTestings.includes("Stock House");
  const showProduction = showAllTestings || selectedTestings.includes("Production");
  const showDispatch = showAllTestings || selectedTestings.includes("Dispatch");

  const showRawCoal = showRawMaterial && (showAllMaterials || selectedMaterials.includes("Coal"));
  const showRawPellets = showRawMaterial && (showAllMaterials || selectedMaterials.includes("Pellets"));
  const showRawIron = showRawMaterial && (showAllMaterials || selectedMaterials.includes("Iron Ore"));
  const showRawDolomite = showRawMaterial && (showAllMaterials || selectedMaterials.includes("Dolomite"));

  const showStockCoal = showStockHouse && (showAllMaterials || selectedMaterials.includes("Coal"));
  const showStockIron = showStockHouse && (showAllMaterials || selectedMaterials.includes("Iron Ore"));
  const showStockDolomite = showStockHouse && (showAllMaterials || selectedMaterials.includes("Dolomite"));
  const showStockCharcoal = showStockHouse && (showAllMaterials || selectedMaterials.includes("Charcoal"));

  const showProductionData =
    showProduction &&
    (showAllMaterials ||
      selectedMaterials.includes("Cooler Discharge") ||
      selectedMaterials.includes("Product House"));

  const showByProductDolochar =
    showProduction &&
    (showAllMaterials || selectedMaterials.includes("Dolochar"));

  const showDispatchData =
    showDispatch &&
    (showAllMaterials ||
      selectedMaterials.includes("Coal") ||
      selectedMaterials.includes("Pellets") ||
      selectedMaterials.includes("Iron Ore") ||
      selectedMaterials.includes("Dolomite") ||
      selectedMaterials.includes("Charcoal"));

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 20px 40px",
        backgroundImage:
          "linear-gradient(rgba(13, 13, 13, 0.62), rgba(13, 13, 13, 0.62)), url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            marginBottom: "16px",
            background: "var(--accent-dark)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          Back
        </button>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.24)",
            backdropFilter: "blur(4px)"
          }}
        >
      <h1 style={{ color: "var(--heading-color)", marginBottom: "20px", fontWeight: "600" }}>
        Reports Dashboard
      </h1>

      <div style={{ ...cardStyle, marginBottom: "20px" }}>
        <h2 style={headerStyle}>Filters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ fontWeight: "500", color: "var(--label-color)" }}>Date</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                <input
                  type="checkbox"
                  checked={dateAll}
                  onChange={(e) => setDateAll(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                All dates
              </label>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", fontWeight: "700" }}>From</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      ref={dateFromRef}
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      disabled={dateAll}
                      style={{ ...inputStyle, padding: "8px", borderRadius: "10px", flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => dateFromRef.current?.showPicker?.() || dateFromRef.current?.focus()}
                      disabled={dateAll}
                      style={calendarButton}
                      title="Pick start date"
                    >
                      📅
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", fontWeight: "700" }}>To</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      ref={dateToRef}
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      disabled={dateAll}
                      style={{ ...inputStyle, padding: "8px", borderRadius: "10px", flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => dateToRef.current?.showPicker?.() || dateToRef.current?.focus()}
                      disabled={dateAll}
                      style={calendarButton}
                      title="Pick end date"
                    >
                      📅
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ fontWeight: "500", color: "var(--label-color)" }}>Testing</label>
              <span style={{ fontSize: "12px", color: "#475569" }}>{selectedTestings?.includes("All") ? "All" : `${selectedTestings?.length || 0} selected`}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                multiple
                value={selectedTestings}
                onChange={handleMultiSelect(setSelectedTestings)}
                style={{
                  minHeight: "120px",
                  padding: "10px",
                  borderRadius: "10px",
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  width: "100%"
                }}
              >
                <option value="All">All</option>
                {options.testings.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ fontWeight: "500", color: "var(--label-color)" }}>Material</label>
              <span style={{ fontSize: "12px", color: "#475569" }}>{selectedMaterials?.includes("All") ? "All" : `${selectedMaterials?.length || 0} selected`}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                multiple
                value={selectedMaterials}
                onChange={handleMultiSelect(setSelectedMaterials)}
                style={{
                  minHeight: "120px",
                  padding: "10px",
                  borderRadius: "10px",
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  width: "100%"
                }}
              >
                <option value="All">All</option>
                {filteredMaterials.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={applyFilters}
            style={{
              padding: "10px 18px",
              background: "var(--accent-dark)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Apply Filters
          </button>
          <button
            onClick={downloadExcel}
            style={{
              padding: "10px 18px",
              background: "#0f766e",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Download Report (.csv)
          </button>
          <button
            onClick={downloadPdf}
            style={{
              padding: "10px 18px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Download PDF
          </button>
        </div>
      </div>

      {loading && <p style={{ padding: "30px" }}>Loading reports...</p>}
      {errorMsg && (
        <div
          style={{
            ...cardStyle,
            marginTop: "10px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            fontWeight: "700"
          }}
        >
          {errorMsg}
        </div>
      )}

      {!hasApplied && !loading && (
        <div style={{ ...cardStyle, marginTop: "10px" }}>
          <p style={{ color: "#475569", fontWeight: "600" }}>
            Please select filters and click <b>Apply Filters</b> to view reports.
          </p>
        </div>
      )}

      {hasApplied && (showRawCoal || showRawPellets || showRawIron || showRawDolomite) && (
        <>
          {showRawCoal && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Raw Material Coal</h2>
              <p>Total Records: <b>{(data.coal || []).length}</b></p>
              {renderTable(data.coal, [
                "coalId",
                "monthName",
                "entryDate",
                "source",
                "party",
                "category",
                "transporter",
                "truckNo",
                "qtyMt",
                "tm",
                "im",
                "vm",
                "ash",
                "fcadb",
                "fcdb",
                "minus3mm",
                "minus4mm",
                "minus6mm",
                "stones",
                "gcvarb",
                "gcvadb",
               
              ])}
            </div>
          )}

          {showRawPellets && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Raw Material Pellets</h2>
              <p>Total Records: <b>{(data.pellets || []).length}</b></p>
              {renderTable(data.pellets,[
                "pelletsId",
                "monthName",
                "entryDate",
                "supplier",
                "qtyMt",
                "feTPct",
                "loiPct",
                "tiPct",
                "aiPct",
                "p30mm",
                "p25mm",
                "p22mm",
                "p20mm",
                "p18mm",
                "p15mm",
                "p12mm",
                "p10mm",
                "p8mm",
                "p5mm",
                "p3mm",
                "m3mm",
                "mps",
                "overSize",
                "underSize",
                "sio2Pct",
                "al2o3Pct",
                "pPct"
              ])}
            </div>
          )}

          {showRawIron && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Raw Material Iron Ore</h2>
              <p>Total Records: <b>{(data.ironOre || []).length}</b></p>
              {renderTable(data.ironOre, [
                "ironOreId",
                "monthName",
                "entryDate",
                "sampleNo",
                "supplierSource",
                "qty",
                "truckNo",
                "moisturePct",
                "plus30",
                "plus25",
                "plus22",
                "plus20",
                "plus18",
                "plus15",
                "plus12",
                "plus10",
                "plus8",
                "plus5",
                "plus3",
                "plus1",
                "minus1",
                "oversize",
                "undersize",
                "mps",
                "laterite",
                "blueDust",
                "shaleStone",
                "tumblerIndex",
                "accretionIndex",
                "feTotal",
                "loi",
                "sio2",
                "al2o3",
                "phosphorus"
              ])}
            </div>
          )}

          {showRawDolomite && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Raw Material Dolomite</h2>
              <p>Total Records: <b>{(data.dolomite || []).length}</b></p>
              {renderTable(data.dolomite, [
                "dolomiteId",
                "monthName",
                "entryDate",
                "source",
                "size",
                "qty",
                "truckNo",
                "moisturePct",
                "plus8mm",
                "plus6mm",
                "plus2mm",
                "plus1mm",
                "minus1mm",
                "caoPct",
                "mgoPct",
                "silicaPct",
                "loiPct"
              ])}
            </div>
          )}
        </>
      )}

      {hasApplied && showProductionData && (
        <div style={cardStyle}>
          <h2 style={headerStyle}>Production</h2>
          <p>Total Records: <b>{(data.production || []).length}</b></p>
          {renderTable(data.production)}
        </div>
      )}

      {hasApplied && showByProductDolochar && (
        <div style={cardStyle}>
          <h2 style={headerStyle}>By Product Dolochar</h2>
          <p>Total Records: <b>{(data.byProductDolochar || []).length}</b></p>
          {renderTable(data.byProductDolochar, [
            "id",
            "productionCode",
            "material",
            "fc",
            "minus1mm",
            "status",
            "entryDate"
          ])}
        </div>
      )}

      {hasApplied && showDispatchData && (
        <div style={cardStyle}>
          <h2 style={headerStyle}>Dispatch</h2>
          <p>Total Records: <b>{(data.dispatch || []).length}</b></p>
          {renderTable(data.dispatch)}
        </div>
      )}

      {hasApplied && (showStockCoal || showStockIron || showStockDolomite) && (
        <>
          {showStockCoal && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Stock House Coal</h2>
              <p>Total Records: <b>{(data.stockCoal || []).length}</b></p>
              {renderTable(data.stockCoal)}
            </div>
          )}

          {showStockIron && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Stock House Iron Ore</h2>
              <p>Total Records: <b>{(data.stockIronOre || []).length}</b></p>
              {renderTable(data.stockIronOre)}
            </div>
          )}

          {showStockDolomite && (
            <div style={cardStyle}>
              <h2 style={headerStyle}>Stock House Dolomite</h2>
              <p>Total Records: <b>{(data.stockDolomite || []).length}</b></p>
              {renderTable(data.stockDolomite)}
            </div>
          )}
        </>
      )}

        </div>
      </div>
    </div>
  );
};

export default Reports;


