import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. Field Definitions (Outside the component to keep it clean) ---





const coalFields = [
  { label: "Month", key: "monthName", type: "text" },
  { label: "Date", key: "entryDate", type: "date" },
   { label: "Source", key: "source", type: "text" },
  { label: "Party", key: "party", type: "text" },
  { label: "Category", key: "category", type: "text" },
  { label: "Transporter", key: "transporter", type: "text" },
  { label: "Quantity (MT)", key: "qtymt", type: "number" },
  { label: "Truck No", key: "truckNo", type: "text" },
  { label: " -3 MM", key: "minus3mm", type: "number" },
  { label: " -4 MM", key: "minus4mm", type: "number" },
  { label: " -6 MM", key: "minus6mm", type: "number" },
  { label: " -1 MM", key: "minus1mm", type: "number" },
  { label: " STONES", key: "stones", type: "number" },
  { label: " C.SHALE", key: "cshale", type: "number" },
  { label: " % S", key: "sulphurPct", type: "number" },
  { label: " IM", key: "im", type: "number" },
  { label: " TM", key: "tm", type: "number" },
  { label: " VM", key: "vm", type: "number" },
  { label: " ASH", key: "ash", type: "number" },
  { label: " FC ADB", key: "fcadb", type: "number" },
  { label: " FC (DB)", key: "fcdb", type: "number" },
  { label: " GCV ARB", key: "gcvarb", type: "number" },
  { label: " GCV ADB", key: "gcvadb", type: "number" }
];

const pelletsFields = [
  { label: "Month", key: "monthName", type: "text" },   // ✅ MONTHNAME
  { label: "Supplier", key: "supplier", type: "text" },
  { label: "QTY (MT)", key: "qtyMT", type: "number" },

  { label: "P30 MM", key: "p30mm", type: "number" },
  { label: "P25 MM", key: "p25mm", type: "number" },
  { label: "P22 MM", key: "p22mm", type: "number" },
  { label: "P20 MM", key: "p20mm", type: "number" },
  { label: "P18 MM", key: "p18mm", type: "number" },
  { label: "P15 MM", key: "p15mm", type: "number" },
  { label: "P12 MM", key: "p12mm", type: "number" },
  { label: "P10 MM", key: "p10mm", type: "number" },
  { label: "P8 MM",  key: "p8mm",  type: "number" },
  { label: "P5 MM",  key: "p5mm",  type: "number" },
  { label: "P3 MM",  key: "p3mm",  type: "number" },
  { label: "-3 MM",  key: "m3mm",  type: "number" },

  { label: "Oversize", key: "oversize", type: "number" },
  { label: "Undersize", key: "undersize", type: "number" },
  { label: "MPS", key: "mps", type: "number" },
  { label: "LAT BD", key: "latbd", type: "number" },

  { label: "Unshaped %", key: "unshapePct", type: "number" },   // ✅ UNSHAPEPCT
  { label: "Unfired %", key: "unfiredPct", type: "number" },    // ✅ UNFIREDEPCT

  { label: "Ti %", key: "tiPct", type: "number" },
  { label: "Al %", key: "aiPct", type: "number" },
  { label: "Fe(T) %", key: "feTPct", type: "number" },
  { label: "LOI %", key: "loiPct", type: "number" },
  { label: "SiO2 %", key: "sio2Pct", type: "number" },
  { label: "Al2O3 %", key: "al2o3Pct", type: "number" },
  { label: "P %", key: "pPct", type: "number" }
];





const ironOreFields = [
  { label: "% Moisture", key: "moisturePct", type: "number" },
  { label: "% Fe(T)", key: "feTotal", type: "number" },
  { label: "Laterite", key: "laterite", type: "number" }
];




const RawMaterialTesting = () => {

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(null);

  const [animKey, setAnimKey] = useState(0);


useEffect(() => {
  const stored = localStorage.getItem("permissions");
  try {
    setPermissions(stored ? JSON.parse(stored) : {});
  } catch {
    setPermissions({});
  }
}, []);

const userId = localStorage.getItem("userId");

const effectivePermissions = userId === "ajn@lloyds.in"
  ? {
      pages: {
        rawMaterial: true,
        production: true,
        reports: true,
        managerApproval: true,
        dispatch: true,
        stockHouse: true,
      },
      rawMaterialModules: {
        coal: true,
        pellets: true,
        ironOre: true,
      },
      actions: {
        save: true,
        saveDraft: true,
        approve: true,
        reject: true,
        edit: true,
      },
    }
  : permissions;

  // --- 2. Component State ---
  // const [userId, setUserId] = useState("");
// const [password, setPassword] = useState("");
const [prodFormData, setProdFormData] = useState({
  area: "",
  item: "",
  shift: "",
  feM: "",
  sulphur: "",
  carbon: "",
  nMag: "",
  overSize: "",
  underSize: "",
  magInChar: "",
  feMInChar: "",
  binNo: "",
  grade: "",
  status: "",
  remarks: ""
});
 // Also missing from your code
const [dispatchFormData, setDispatchFormData] = useState({
  slNo: "",
  month: "",
  entryDate: "",
  material: "",
  truckNo: "",
  partyName: "",
  destination: "",
  materialSize: "",
  qty: "",
  feM: "",
  minus3mm: "",
  trReason: "",
  partyFeM: "",
  partyRecov: "",
  complaintQty: "",
  dispatchOfficer: "",
  remarks: "",
  status: ""
});
 // Also missing
  const [activeModule, setActiveModule] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
const [qualityFormData, setQualityFormData] = useState({});

  const [isSaving, setIsSaving] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(
//   !!localStorage.getItem("userId")
// );
  const [editingItem, setEditingItem] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editMode, setEditMode] = useState(false);
const [tempEditData, setTempEditData] = useState(null);



  

  // --- 3. Helper Functions ---
  const validateRange = (value) => {
    if (value === "" || value === null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.min(100, Math.max(0, num));
  };

  const fetchNextId = async (material) => {
  try {
    // Example: https://localhost:7067/api/production/get-next-id?material=COAL
    const res = await fetch(`https://localhost:7067/api/production/get-next-id?material=${material}`);
    if (res.ok) {
      const nextId = await res.text(); // Assuming API returns a string like "RMCA-0002"
      setQualityFormData(prev => ({ ...prev, id: nextId }));
    }
  } catch (err) {
    console.error("Error fetching ID:", err);
  }
};


  const [source, setSource] = useState("");
  const handleStockChange = (name, value) => {
  setStockFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const [openSamples, setOpenSamples] = useState(false);
const [openReports, setOpenReports] = useState(false);
const [openApproval, setOpenApproval] = useState(false);

const [formData, setFormData] = useState({
  field1: "",
  field2: "",
  field3: ""
});


const [stockMaterial, setStockMaterial] = useState("");
 const [stockFormData, setStockFormData] = useState({ 
  kiln: "", belt: "", status: "",
  size25mm: "", size22mm: "", size20mm: "", size18mm: "", size15mm: "", 
  size12mm: "", size10mm: "", size8mm: "", size6mm: "", size5mm: "", 
  size3mm: "", size1mm: "", minus1mm: "", mps: "", tm: "", vm: "", 
  ash: "", fc: "", feT: "", loi: "", plus18mm: "", minus8mm: "", plus6mm: ""
});
const handleStockSubmit = async () => {
  // 1. Prepare payload with Material Type
  const finalPayload = { ...stockFormData, materialType: stockMaterial };

  // 2. Convert numeric fields from strings to numbers
  Object.keys(finalPayload).forEach(key => {
    const nonNumericFields = ['kiln', 'belt', 'status', 'materialType'];
    if (!nonNumericFields.includes(key) && finalPayload[key] !== "") {
      finalPayload[key] = parseFloat(finalPayload[key]);
    } else if (!nonNumericFields.includes(key) && finalPayload[key] === "") {
      finalPayload[key] = null; // Send null for empty numeric fields
    }
  });



  try {
    const res = await fetch('https://localhost:7067/api/production/save-stockhouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });

    if (res.ok) {
      alert("🎉 Data Saved Successfully!");
    } else {
      const errorText = await res.text();
      console.error("Server Error Detail:", errorText);
      alert("Database Rejected Data. See Console (F12) for details.");
    }
  } catch (err) {
    alert("Check if your Backend is running.");
  }
};

const [pendingTasks, setPendingTasks] = useState([]);

// --- Function to fetch items awaiting approval ---
const fetchPendingData = async () => {
  try {
    const res = await fetch('https://localhost:7067/api/production/get-pending');
    const data = await res.json();
    setPendingTasks(data);
  } catch (err) {
    console.error("Failed to load pending tasks");
  }
};

const [pendingData, setPendingData] = useState({
  coal: [],
  pellets: [],
  ironOre: [],
  production: [],
  dispatch: [],
  stockHouse: []
});

const fetchAllPending = async () => {
  const res = await fetch('https://localhost:7067/api/production/get-all-pending');
  const data = await res.json();
  setPendingData(data);
};


// Function to handle the Approval/Rejection click
const handleStatusUpdate = async (id, module, newStatus) => {
  try {
    const response = await fetch('https://localhost:7067/api/production/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        Id: id.toString(), // Convert to string for the API DTO
        Module: module, 
        NewStatus: newStatus 
      })
    });

    if (response.ok) {
      alert(`Record ${newStatus} successfully!`);
      fetchAllPending(); // Refresh the list after action
    }
  } catch (error) {
    alert("Error updating status");
  }
};

// const [isLoggedIn, setIsLoggedIn] = useState(false);
// const [loginRole, setLoginRole] = useState(""); // to track if user or admin


// --- Function to Approve/Reject ---
const handleApproval = async (id, newStatus) => {
  try {
    const res = await fetch(`https://localhost:7067/api/production/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, status: newStatus })
    });
    if (res.ok) {
      alert(`Record ${newStatus}!`);
      fetchPendingData(); // Refresh the list
    }
  } catch (err) {
    alert("Error updating status");
  }
};
const handleEditClick = (item, moduleKey) => {
  setTempEditData({ ...item, module: moduleKey });
  setEditMode(true);
};



  const handleQualityChange = (field, value, type) => {
  // If numeric field, parse it; otherwise, keep as text
  const val = type === "number" ? (value === "" ? null : parseFloat(value)) : value;
  
  setQualityFormData(prev => ({ 
    ...prev, 
    [field]: val 
  }));
};
    const labelStyle = { 
    fontSize: '0.85rem', 
    fontWeight: '800', 
    color: '#1a3a5a', 
    textTransform: 'uppercase', 
    marginBottom: '2px' 
  };
    const handleProductionSubmit = async () => {
      const payload = {
      ...prodFormData,
      source: source,
      entryDate: new Date().toISOString(),
      // Ensure numbers are parsed correctly
      feM: parseFloat(prodFormData.feM || 0),
      sulphur: parseFloat(prodFormData.sulphur || 0),
      carbon: parseFloat(prodFormData.carbon || 0),
      nMag: parseFloat(prodFormData.nMag || 0),
      overSize: parseFloat(prodFormData.overSize || 0),
      underSize: parseFloat(prodFormData.underSize || 0),
      magInChar: parseFloat(prodFormData.magInChar || 0),
      feMInChar: parseFloat(prodFormData.feMInChar || 0),
    };

    try {
      const response = await fetch('https://localhost:7067/api/production/save-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) { alert(`🎉 ${source} Data Saved!`); 
      setProdFormData({
  area: "",
  item: "",
  shift: "",
  feM: "",
  sulphur: "",
  carbon: "",
  nMag: "",
  overSize: "",
  underSize: "",
  magInChar: "",
  feMInChar: "",
  binNo: "",
  grade: "",
  status: "",
  remarks: ""
});
 
    }
    } catch (e) { alert("Connection Error"); }
  };

  const handleMaterialChange = (e) => {
  const value = e.target.value;
  setSelectedMaterial(value);
  localStorage.setItem("selectedMaterial", value); // ✅ SAVE
};


  

  const fadeStyle = `
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;




const handleSave = async () => {
  setIsSaving(true);

  if (!selectedMaterial) {
    alert("Select material first");
    setIsSaving(false);
    return;
  }

  const token = localStorage.getItem("token");

  // Build payload from your form
  const payload = {
    ...qualityFormData,
    status: "Pending"
  };

  // Decide endpoint based on material
  let url = "";
  if (selectedMaterial === "COAL") url = "save-coal";
  else if (selectedMaterial === "PELLETS") url = "save-pellets";
  else if (selectedMaterial === "IRON_ORE") url = "save-iron-ore";

  try {
    const res = await fetch(`https://localhost:7067/api/production/${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Server error:", err);
      alert("Save failed. Check console.");
      return;
    }

    alert("Saved Successfully!");

    // Clear draft after successful save
    localStorage.removeItem(`draft_${selectedMaterial}`);

    // Reset form
    setQualityFormData({
      id: "",
      status: "Pending",
    });

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Server Error");
  } finally {
    setIsSaving(false);
  }
};



  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const headerStyle = { backgroundColor: '#1a3a5a', color: 'white', textAlign: 'left' };
const rowStyle = { borderBottom: '1px solid #ddd' };
const approveBtn = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };
const rejectBtn = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };

   const handleProdInputChange = (name, value) => {
    setProdFormData({ ...prodFormData, [name]: value });
  };
  const handleDispatchSubmit = async () => {
  try {
    const res = await fetch('https://localhost:7067/api/production/save-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispatchFormData)
    });

    if (res.ok) {
      alert("🎉 Dispatch Data Saved successfully!");
      
      // Reset form after save
      setDispatchFormData({
        slNo: "", month: "", entryDate: "", material: "", truckNo: "", 
        partyName: "", destination: "", materialSize: "", qty: "", feM: "", 
        minus3mm: "", trReason: "", partyFeM: "", partyRecov: "", 
        complaintQty: "", dispatchOfficer: "", remarks: "", status: ""
      });
    } else {
      alert("Failed to save to Oracle database.");
    }``
  } catch (error) {
    alert("Connection Error: " + error.message);
  }
};
useEffect(() => {
  const savedMaterial = localStorage.getItem("selectedMaterial");
  if (savedMaterial) {
    setSelectedMaterial(savedMaterial);
  }
}, []);

useEffect(() => {
  if (!selectedMaterial) return;

  const draftKey = `draft_${selectedMaterial}`;
  const savedDraft = localStorage.getItem(draftKey);

 if (savedDraft) {
  try {
    const parsed = JSON.parse(savedDraft);
    setQualityFormData(parsed.data || {});
  } catch {
    localStorage.removeItem(draftKey);
  }
}

  
}, [selectedMaterial]);




const handleUpdateSave = async () => {
    // 1. Extract the correct ID based on the module being edited
    // This handles 'coalId', 'pelletId', 'ironOreId', or a standard 'id'
    const idValue = tempEditData.coalId || 
                    tempEditData.pelletId || 
                    tempEditData.ironOreId || 
                    tempEditData.id;

    const moduleName = tempEditData.module;

    // 2. Separate metadata (id, module, status) from the actual values to be updated
    const { 
        module, coalId, pelletId, ironOreId, id, 
        status, entryDate, ...restOfFields 
    } = tempEditData;

    // 3. Construct the payload to match your C# EditRequestDto
    const payload = {
        id: idValue ? idValue.toString() : "",
        module: moduleName,
        fields: restOfFields 
    };

    console.log("Sending Updated Data:", payload);

    try {
        const res = await fetch('https://localhost:7067/api/production/edit-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert("✅ Data Updated Successfully!");
            setEditMode(false); // Closes the popup
            fetchAllPending();  // Refreshes the table to show new values
        } else {
            const error = await res.json();
            alert("❌ Update Failed: " + (error.message || "Server error"));
        }
    } catch (err) {
        console.error("Update Error:", err);
        alert("Server Error: Check if your Backend API is running.");
    }
};

const handleSaveDraft = () => {
  if (!selectedMaterial) {
    alert("Select material first");
    return;
  }

  const draftKey = `draft_${selectedMaterial}`;

  localStorage.setItem(
    draftKey,
    JSON.stringify({
      material: selectedMaterial,   // ✅ SAVE MATERIAL
      data: qualityFormData
    })
  );

  alert("Draft saved successfully ✅");
};



  

const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");

  navigate("/", { replace: true });
};



  

  const handleDispatchChange = (name, value) => {
  setDispatchFormData(prev => ({ 
    ...prev, 
    [name]: value 
  }));
};



  // --- 4. Styles ---
  const navButtonStyle = (isActive) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: isActive ? '#1a3a5a' : '#fff',
    color: isActive ? '#fff' : '#1a3a5a',
    fontWeight: 'bold',
    marginRight: '10px'
  });

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc' };

  const menuItemStyle = {
  padding: "12px 10px",
  cursor: "pointer",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  fontWeight: "600"
};

  const frozenInputStyle = {
  ...inputStyle,
  backgroundColor: '#e9ecef',
  cursor: 'not-allowed',
  borderColor: '#1a3a5a',
  color: '#6c757d'
};





  return (
  <div style={{ 
    minHeight: '100vh',
    width: '100vw',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  }}>

    <style>{fadeStyle}</style>
    

    {/* Navigation Header */}
{/* Top Bar */}
<div style={{
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "70px",
  background: "linear-gradient(90deg, rgba(0,0,0,0.9), rgba(26,58,90,0.9))",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
  zIndex: 1000,
  boxShadow: "0 2px 12px rgba(0,0,0,0.7)"
}}>

  {/* Left: Menu + Logo */}
  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      style={{
        fontSize: "24px",
        color: "white",
        background: "none",
        border: "1px solid rgba(255,255,255,0.4)",
        borderRadius: "8px",
        padding: "4px 10px",
        cursor: "pointer"
      }}
    >
      ☰
    </button>

    <img
      src="https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg"
      alt="Logo"
      style={{ height: "34px" }}
    />
  </div>

  {/* Center: Title */}
  <div style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    padding: "8px 22px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
  }}>
    Laboratory Information Management System
  </div>
</div>



{/* Sidebar */}
{menuOpen && (
  <div style={{
    position: "fixed",
    top: "60px",
    left: 0,
    width: "260px",
    height: "calc(100vh - 60px)",
    background: "#1a3a5a",
    color: "white",
    padding: "20px",
    zIndex: 999,
    boxShadow: "4px 0 12px rgba(0,0,0,0.4)",
    overflowY: "auto"
  }}>

    {/* SAMPLES */}
    <div
      onClick={() => setOpenSamples(!openSamples)}
      style={{ ...menuItemStyle, fontSize: "16px" }}
    >
      📦 Samples
    </div>

    {openSamples && (
      <div style={{ marginLeft: "15px" }}>
        {effectivePermissions?.pages?.rawMaterial && (
          <div onClick={() => { setActiveModule("quality"); setMenuOpen(false); }} style={menuItemStyle}>
            Raw Material Testing
          </div>
        )}
        {effectivePermissions?.pages?.stockHouse && (
          <div onClick={() => { setActiveModule("stockhouse"); setMenuOpen(false); }} style={menuItemStyle}>
            Stock House Testing
          </div>
        )}
        {effectivePermissions?.pages?.production && (
          <>
            <div onClick={() => { setActiveModule("production"); setSource("CD"); setMenuOpen(false); }} style={menuItemStyle}>
              Cooler Discharge Testing
            </div>
            <div onClick={() => { setActiveModule("production"); setSource("PH"); setMenuOpen(false); }} style={menuItemStyle}>
              Product House Testing
            </div>
          </>
        )}
        {effectivePermissions?.pages?.dispatch && (
          <div onClick={() => { setActiveModule("dispatch"); setMenuOpen(false); }} style={menuItemStyle}>
            Dispatch
          </div>
        )}
      </div>
    )}

    {/* REPORTS */}
    <div
      onClick={() => setOpenReports(!openReports)}
      style={{ ...menuItemStyle, fontSize: "16px" }}
    >
      📊 Reports
    </div>

    {openReports && (
      <div style={{ marginLeft: "15px" }}>
        {effectivePermissions?.pages?.reports && (
          <div onClick={() => { navigate("/reports"); setMenuOpen(false); }} style={menuItemStyle}>
            Reports
          </div>
        )}
      </div>
    )}

    {/* APPROVAL */}
    <div
      onClick={() => setOpenApproval(!openApproval)}
      style={{ ...menuItemStyle, fontSize: "16px" }}
    >
      🛡️ Approval
    </div>

    {openApproval && (
      <div style={{ marginLeft: "15px" }}>
        {effectivePermissions?.pages?.managerApproval && (
          <div onClick={() => { setActiveModule("manager"); fetchAllPending(); setMenuOpen(false); }} style={menuItemStyle}>
            Manager Approval
          </div>
        )}
      </div>
    )}

    {/* REGISTER */}
    {userId === "ajn@lloyds.in" && (
      <div onClick={() => { navigate("/register"); setMenuOpen(false); }} style={menuItemStyle}>
        ➕ Register User
      </div>
    )}

    {/* LOGOUT */}
    <div onClick={handleLogout} style={{ ...menuItemStyle, color: "#ffb3b3" }}>
      Logout
    </div>
  </div>
)}






   {/* Main Card Container */}
 {activeModule && ( 
  <div style={{
    width: "100%",
    maxWidth: "1100px",
   margin: "80px auto 0",
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
  }}>

    <button
  onClick={() => setActiveModule("")}
  style={{
    marginBottom: "20px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1a3a5a",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  ← Back
</button>

    

    
    

      {/* ----------------------- */}
      {/* QUALITY TESTING MODULE */}
      {/* ----------------------- */}
      {activeModule === "quality" && (
  <div style={{ padding: '20px' }}>
    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontWeight: 'bold', color: '#1a3a5a' }}>Select Raw Material: </label>
  <select
  value={selectedMaterial}
  onChange={(e) => {
    const material = e.target.value;
    setSelectedMaterial(material);

    const draftKey = `draft_${material}`;
    const hasDraft = localStorage.getItem(draftKey);

    if (!hasDraft && material) {
      fetchNextId(material);
    }
  }}
  style={{ ...inputStyle, borderColor: "#1a3a5a" }}
 >
  <option value="">-- Choose --</option>

  {effectivePermissions?.rawMaterialModules?.coal && (
    <option value="COAL">Coal</option>
  )}

  {effectivePermissions?.rawMaterialModules?.pellets && (
    <option value="PELLETS">Pellets</option>
  )}

  {effectivePermissions?.rawMaterialModules?.ironOre && (
    <option value="IRON_ORE">Iron Ore</option>
  )}
 </select>

    </div>

    <hr style={{ borderColor: '#1a3a5a', opacity: 0.2 }} />

    {selectedMaterial && (
      <>
        <h2 style={{ color: '#1a3a5a', marginBottom: '20px' }}>{selectedMaterial} Analysis Entry</h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '15px', 
          marginTop: '20px' 
        }}>
          {/* --- NEW ID FIELD (FREEZED) --- */}
       {/* --- UPDATED ENTRY ID FIELD --- */}
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={labelStyle}>Entry ID</label>
 <input
  type="text"
  value={qualityFormData?.id || (selectedMaterial ? "Generating..." : "SELECT MATERIAL")}
  readOnly
  style={{ 
    ...inputStyle, 
    backgroundColor: '#e9ecef', 
    color: '#1a3a5a',
    borderColor: '#1a3a5a',
    cursor: 'not-allowed',
    fontWeight: 'bold'
  }}
/>

</div>

          {/* 1. Dynamic Fields (mapped from your Field Definitions) */}
          {(selectedMaterial === "COAL" ? coalFields :
            selectedMaterial === "PELLETS" ? pelletsFields : ironOreFields).map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#1a3a5a', 
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                {f.label}
              </label>
              <input
  type={f.type}
  value={qualityFormData?.[f.key] ?? ""}   // ✅ THIS LINE
  placeholder="0.00"
  style={{ ...inputStyle, borderColor: '#1a3a5a' }}
  onChange={(e) => handleQualityChange(f.key, e.target.value, f.type)}
/>

            </div>
          ))}

          {/* 2. Status Field (Always visible, blue theme, FREEZED) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#1a3a5a', 
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Status
            </label>
            <input
              type="text"
              value="Pending"
              readOnly
              style={{ 
                ...inputStyle, 
                backgroundColor: '#e9ecef', // Light grey "Freezed" color
                color: '#d97706', 
                fontWeight: 'bold',
                borderColor: '#1a3a5a',
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>

       {/* SAVE BUTTON */}
{effectivePermissions?.actions?.save && (
  <button
    onClick={handleSave}
    disabled={isSaving}
    style={{
      marginTop: "30px",
      width: "100%",
      padding: "15px",
      backgroundColor: "#1a3a5a",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "1rem",
      cursor: "pointer",
    }}
  >
    Save Analysis
  </button>
)}

{/* SAVE DRAFT BUTTON */}
{effectivePermissions?.actions?.saveDraft && (
  <button
    type="button"
    onClick={handleSaveDraft}
    style={{
      marginTop: "12px",
      width: "100%",
      padding: "12px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "0.95rem",
      cursor: "pointer",
    }}
  >
    Save as Draft
  </button>
)}

      </>
    )}
  </div>
)}

      {/* ----------------------- */}
      {/* STOCKHOUSE MODULE */}
      {/* ----------------------- */}
      {activeModule === "stockhouse" && (
          <div>
            <h2 style={{ color: "#1a3a5a", borderBottom: "2px solid #1a3a5a", paddingBottom: "10px" }}>
              Stock House Analysis
            </h2>

            {/* Top Selection Row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "25px",
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "12px"
            }}>
              <div>
                <label style={labelStyle}>Kiln</label>
                <select
      value={stockFormData.kiln || ""}
     onChange={e => handleStockChange("kiln", e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">-- Select Kiln --</option>
                  <option>Kiln 1</option>
                  <option>Kiln 2</option>
                  <option>Kiln 3</option>
                  <option>Kiln 4</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Material</label>
                <select onChange={e => setStockMaterial(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">-- Select Material --</option>
                  <option value="Coal">Coal</option>
                  <option value="IronOre">Iron Ore</option>
                  <option value="Dolomite">Dolomite</option>
                  <option value="Charcoal">Charcoal</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Belt</label>
                <input
                  placeholder="Enter Belt No."
                  onChange={e => handleStockChange("belt", e.target.value)}
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>
            </div>

            {/* Dynamic Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              {stockMaterial === "Coal" &&
                ['25mm','22mm','20mm','18mm','15mm','12mm','10mm','8mm','6mm','5mm','3mm','1mm','-1mm','MPS','TM','VM','ASH','FC']
                  .map(f => (
                    <div key={f}>
                      <label style={labelStyle}>{f}</label>
                      <input
      type="number"
       value={stockFormData?.[f] ?? ""}   // ✅ IMPORTANT LINE
      onChange={e => handleStockChange(f, e.target.value)}
      style={inputStyle}
     />

                    </div>
                  ))
              }

              {stockMaterial === "IronOre" &&
                ['TM','FET','LOI','+18mm','-8mm','MPS'].map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label>
                    <input type="number" onChange={e => handleStockChange(f, e.target.value)} style={inputStyle} />
                  </div>
                ))
              }

              {stockMaterial === "Dolomite" &&
                ['TM','+6mm','-1mm','MPS'].map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label>
                    <input type="number" onChange={e => handleStockChange(f, e.target.value)} style={inputStyle} />
                  </div>
                ))
              }

              {stockMaterial === "Charcoal" &&
                ['FC','-1mm'].map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label>
                    <input type="number" onChange={e => handleStockChange(f, e.target.value)} style={inputStyle} />
                  </div>
                ))
              }

              {stockMaterial && (
                <div>
                  <label style={labelStyle}>Status</label>
                  <input onChange={e => handleStockChange("status", e.target.value)} style={inputStyle} />
                </div>
              )}
            </div>

            {stockMaterial && (
              <button
                onClick={handleStockSubmit}
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "18px",
                  backgroundColor: "#1a3a5a",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}>
                Save Stock House Analysis
              </button>
            )}
          </div>
        )}

      {/* ----------------------- */}
      {/* PRODUCTION MODULE */}
      {/* ----------------------- */}
       {activeModule === "production" && (
       <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a3a5a', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2 style={{ color: '#1a3a5a', margin: 0 }}>{source === "CD" ? "Cooler Discharge" : "Product House"} Data Entry</h2>
        <span style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#1a3a5a', padding: '8px 15px', borderRadius: '10px' }}>Source: {source}</span>
        </div>

    {/* Selection Row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
      {['area', 'item', 'shift'].map((type) => (
        <div key={type}>
          <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>{type}</label>
          <select
  value={prodFormData[type] || ""}
  onChange={(e) => handleProdInputChange(type, e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            <option value="">-- Select {type} --</option>
            {type === 'area' && <>
              <option value="100TPD">100 TPD</option><option value="500TPD">500 TPD</option>
              <option value="600TPD1">600 TPD 1</option><option value="600TPD2">600 TPD 2</option>
            </>}
            {type === 'item' && <>
              <option value="Pellets">Pellets</option><option value="Lumps">Lumps</option><option value="Fines">Fines</option>
            </>}
            {type === 'shift' && <>
              <option value="A">Shift A</option><option value="B">Shift B</option><option value="C">Shift C</option>
            </>}
          </select>
        </div>
      ))}
    </div>

    {/* Technical Inputs Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
      {['feM', 'sulphur', 'carbon', 'nMag', 'overSize', 'underSize', 'magInChar', 'feMInChar'].map(field => (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>
            {field === 'feM' ? 'Fe(M)' : 
             field === 'nMag' ? 'N MAG' : 
             field === 'overSize' ? 'Over Size' : 
             field === 'underSize' ? 'Under Size' : 
             field === 'magInChar' ? 'Mag in Char' : 
             field === 'feMInChar' ? 'Fe(m) in Char' : field}
          </label>
          <input type="number" placeholder="0.00" onChange={(e) => handleProdInputChange(field, e.target.value)} style={inputStyle} />
        </div>
      ))}

      {/* Manual Inputs with SAME High-Visibility Styling */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Bin No</label>
        <input onChange={(e) => handleProdInputChange('binNo', e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Grade</label>
        <input onChange={(e) => handleProdInputChange('grade', e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Status</label>
        <input onChange={(e) => handleProdInputChange('status', e.target.value)} style={inputStyle} />
      </div>
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Remarks</label>
        <textarea onChange={(e) => handleProdInputChange('remarks', e.target.value)} style={{ ...inputStyle, height: '60px' }} />
      </div>
    </div>

    <button onClick={handleProductionSubmit} style={{ marginTop: '30px', width: '100%', padding: '18px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)' }}>
      Confirm & Save {source} Entry
    </button>
   </div>
   )}

      {/* ----------------------- */}
      {/* DISPATCH MODULE */}
      {/* ----------------------- */}
       {activeModule === "dispatch" && (
   <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a3a5a', paddingBottom: '15px', marginBottom: '20px' }}>
      <h2 style={{ color: '#1a3a5a', margin: 0 }}>Dispatch Data Entry</h2>
      <span style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#1a3a5a', padding: '8px 15px', borderRadius: '10px' }}>Department: Dispatch</span>
    </div>

       {/* Dispatch Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
      {/* Row 1 */}
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Sl No</label><input onChange={(e)=>handleDispatchChange('slNo', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Month</label><input onChange={(e)=>handleDispatchChange('month', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Date</label><input type="date" onChange={(e)=>handleDispatchChange('entryDate', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Material</label><input onChange={(e)=>handleDispatchChange('material', e.target.value)} style={inputStyle}/></div>
      
      {/* Row 2 */}
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Truck No</label><input onChange={(e)=>handleDispatchChange('truckNo', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Name</label><input onChange={(e)=>handleDispatchChange('partyName', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Destination</label><input onChange={(e)=>handleDispatchChange('destination', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Size</label><input onChange={(e)=>handleDispatchChange('materialSize', e.target.value)} style={inputStyle}/></div>

      {/* Row 3 (Numeric Fields) */}
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>QTY</label><input type="number" onChange={(e)=>handleDispatchChange('qty', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Fe(M)</label><input type="number" onChange={(e)=>handleDispatchChange('feM', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>-3mm</label><input type="number" onChange={(e)=>handleDispatchChange('minus3mm', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Tr Reason</label><input onChange={(e)=>handleDispatchChange('trReason', e.target.value)} style={inputStyle}/></div>

      {/* Row 4 */}
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Fe(M)</label><input type="number" onChange={(e)=>handleDispatchChange('partyFeM', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Recov</label><input type="number" onChange={(e)=>handleDispatchChange('partyRecov', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Complaint QTY</label><input type="number" onChange={(e)=>handleDispatchChange('complaintQty', e.target.value)} style={inputStyle}/></div>
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Dispatch Officer</label><input onChange={(e)=>handleDispatchChange('dispatchOfficer', e.target.value)} style={inputStyle}/></div>

      {/* Row 5 */}
      <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Status</label><input onChange={(e)=>handleDispatchChange('status', e.target.value)} style={inputStyle}/></div>
      <div style={{gridColumn: 'span 3', display:'flex', flexDirection:'column'}}><label style={labelStyle}>Remarks</label><textarea onChange={(e)=>handleDispatchChange('remarks', e.target.value)} style={{...inputStyle, height: '45px'}}/></div>
     </div>

      <button onClick={handleDispatchSubmit} style={{ marginTop: '30px', width: '100%', padding: '18px', backgroundColor: '#1a3a5a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
      Confirm & Save Dispatch Entry
      </button>
     </div>
     )}
  {activeModule === "manager" && (
  <div style={{ padding: "20px" }}>
    <h2 style={{ color: "#1a3a5a", borderBottom: "2px solid #1a3a5a" }}>
      Approvals Management
    </h2>

    {Object.keys(pendingData).map((moduleKey) => {
      const tasks = pendingData[moduleKey];
      if (tasks.length === 0) return null;

      return (
        <div key={moduleKey} style={{ marginBottom: "40px" }}>
          <h3 style={{ textTransform: "capitalize", color: "#2c3e50" }}>
            {moduleKey} Pending Requests
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              backgroundColor: "#ffffff",
              color: "#1a3a5a",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1a3a5a", color: "white" }}>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>ID / Source</th>
                <th style={{ padding: "12px" }}>Details</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((item, index) => {
                const itemId =
                  item.coalId || item.pelletId || item.ironOreId || item.id;
                const displayModule =
                  moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);

                return (
                  <tr
                    key={itemId}
                    style={{
                      backgroundColor:
                        index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                      borderBottom: "1px solid #e5e7eb",
                      textAlign: "center",
                    }}
                  >
                    <td style={{ padding: "10px", color: "#1a3a5a" }}>
                      {item.entryDate
                        ? new Date(item.entryDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td style={{ padding: "10px", color: "#1a3a5a" }}>
                      {itemId}
                    </td>

                    <td style={{ padding: "10px", color: "#1a3a5a" }}>
                      {item.materialType || item.source || item.kiln || "N/A"}
                    </td>

                    <td style={{ padding: '10px' }}>

  {effectivePermissions?.actions?.approve && (
    <button
      onClick={() => handleStatusUpdate(itemId, moduleKey.toUpperCase(), "Approved")}
      style={{
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '8px'
      }}
    >
      Approve
    </button>
  )}

  {effectivePermissions?.actions?.reject && (
    <button
      onClick={() => handleStatusUpdate(itemId, moduleKey.toUpperCase(), "Rejected")}
      style={{
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '8px'
      }}
    >
      Reject
    </button>
  )}

  {effectivePermissions?.actions?.edit && (
    <button
      onClick={() => {
        setTempEditData({ ...item, module: moduleKey });
        setEditMode(true);
      }}
      style={{
        backgroundColor: '#3498db',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none'
      }}
    >
      Edit
    </button>
  )}

</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    })}

    {Object.values(pendingData).every((arr) => arr.length === 0) && (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          color: "#7f8c8d",
        }}
      >
        <p>✅ All caught up! No pending approvals.</p>
      </div>
    )}
  </div>
)}




{localStorage.getItem("userRole") === "manager" && (
  <button 
    onClick={() => { setActiveModule("manager"); fetchPendingData(); }} 
    style={navButtonStyle(activeModule === "manager")}>
    Approval Queue
  </button>
)}


    </div>
)}
     {/* --- EDIT MODAL POPUP --- */}
   {/* --- EDIT MODAL POPUP --- */}
{editMode && tempEditData && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker background to see the box clearly
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
  }}>
    <div style={{
      backgroundColor: 'white', padding: '30px', borderRadius: '15px',
      width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'
    }}>
      <h2 style={{ color: '#1a3a5a', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Edit {tempEditData.module} Record
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginTop: '20px',
        minHeight: '100px' // Ensures the box isn't flat if keys are missing
      }}>
        {Object.keys(tempEditData).map((key) => {
          // Fields to hide from editing
          const hiddenFields = ['module', 'status', 'entrydate', 'coalid', 'pelletid', 'ironoreid', 'id'];
          if (hiddenFields.includes(key.toLowerCase())) return null;

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
                {key.toUpperCase()}
              </label>
              <input
                type="text"
                value={tempEditData[key] || ""}
                onChange={(e) => setTempEditData({ ...tempEditData, [key]: e.target.value })}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>

       
        <button onClick={() => setEditMode(false)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleUpdateSave} style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    <p style={{ color: 'white', marginTop: '20px' }}>© 2026 Lloyds Metals and Energy Limited | LIMS</p>
  </div>
);

};

export default RawMaterialTesting;