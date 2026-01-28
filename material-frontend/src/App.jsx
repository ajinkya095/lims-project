import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import RawMaterialTesting from "./RawMaterialTesting";
import Register from "./Register";
import Reports from "./Reports";
import Production from "./Production";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./Unauthorized";


/* 🔐 LOGIN CHECK */
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/" replace />;
};

/* 🔑 PERMISSION CHECK */
const hasAccess = (section, key) => {
  const userId = localStorage.getItem("userId");

  // 🔓 Super Admin bypass
  if (userId === "ajn@lloyds.in") return true;

  const permissionsStr = localStorage.getItem("permissions");
  if (!permissionsStr) return false;

  let permissions = {};
  try {
    permissions = JSON.parse(permissionsStr);
  } catch {
    return false;
  }

  return permissions?.[section]?.[key] === true;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* RAW MATERIAL */}
        <Route
          path="/testing"
          element={
            <PrivateRoute>
              <RawMaterialTesting />
            </PrivateRoute>
          }
        />

        {/* REGISTER (only logged-in users; UI should restrict who sees the button) */}
        <Route
          path="/register"
          element={
            <PrivateRoute>
              <Register />
            </PrivateRoute>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ProtectedRoute allowed={hasAccess("pages", "reports")}>
                <Reports />
              </ProtectedRoute>
            </PrivateRoute>
          }
        />

        {/* PRODUCTION */}
        <Route
          path="/production"
          element={
            <PrivateRoute>
              <ProtectedRoute allowed={hasAccess("pages", "production")}>
                <Production />
              </ProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
      
    </Router>
  );
}

export default App;






// import { useState } from 'react'
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './Login';
// import RawMaterialTesting from './RawMaterialTesting'; // Your current main page

//     const coalFields = [
//   { label: "Month", key: "monthName", type: "text" },
//   { label: "Date", key: "entryDate", type: "date" },
//   { label: "SOURCE", key: "source", type: "text" },
//   { label: "PARTY", key: "party", type: "text" },
//   { label: "Category", key: "category", type: "text" },
//   { label: "Transporter", key: "transporter", type: "text" },
//   { label: "Truck No", key: "truckNo", type: "text" },
//   { label: "Quantity (MT)", key: "QTYMT", type: "number" }, // Matches 'QtyMt' in C#
//     { label: "-3mm", key: "minus3mm", type: "number" },
//     { label: "-4mm", key: "minus4mm", type: "number" },
//     { label: "-6mm", key: "minus6mm", type: "number" },
//     { label: "-1mm", key: "minus1mm", type: "number" },
//     { label: "Stones", key: "stones", type: "number" },
//     { label: "C.Shale", key: "cshale", type: "number" },
//     { label: "Sulphur %", key: "sulphurPct", type: "number" },
//     { label: "I.M.", key: "im", type: "number" },
//     { label: "T.M.", key: "tm", type: "number" },
//     { label: "V.M.", key: "vm", type: "number" },
//     { label: "Ash", key: "ash", type: "number" },
//     { label: "FC (ADB)", key: "fcadb", type: "number" },
//     { label: "FC (DB)", key: "fcdb", type: "number" },
//     { label: "GCV (ARB)", key: "gcvarb", type: "number" },
//     { label: "GCV (ADB)", key: "gcvadb", type: "number" }
// ];

// const pelletsFields = [
//   // Common Fields
//   { label: "Month", key: "monthName", type: "text" },
//   { label: "Date", key: "entryDate", type: "date" },
//   { label: "SUPPLIER / SOURCE", key: "supplier", type: "text" },
//   { label: "QTY (MT)", key: "qtyMT", type: "number" },

//   // Size Fraction Fields
//   { label: "+30", key: "p30mm", type: "number" },
//   { label: "+25", key: "p25mm", type: "number" },
//   { label: "+22", key: "p22mm", type: "number" },
//   { label: "+20", key: "p20mm", type: "number" },
//   { label: "+18", key: "p18mm", type: "number" },
//   { label: "+15", key: "p15mm", type: "number" },
//   { label: "+12", key: "p12mm", type: "number" },
//   { label: "+10", key: "p10mm", type: "number" },
//   { label: "+8", key: "p8mm", type: "number" },
//   { label: "+5", key: "p5mm", type: "number" },
//   { label: "+3", key: "p3mm", type: "number" },
//   { label: "-3", key: "m3mm", type: "number" },
//   { label: "Oversize", key: "oversize", type: "number" },
//   { label: "Undersize", key: "undersize", type: "number" },
//   { label: "MPS (Mean Particle Size)", key: "mps", type: "number" },
//   { label: "Lat + BD (Laterite/Blue Dust)", key: "latBd", type: "number" },

//   // Quality & Chemical Fields
//   { label: "Unshape %", key: "unshapePct", type: "number" },
//   { label: "Unfired %", key: "unfiredPct", type: "number" },
//   { label: "% T.I. (Tumbler Index)", key: "tiPct", type: "number" },
//   { label: "% A.I. (Abrasion Index)", key: "aiPct", type: "number" },
//   { label: "% Fe(T)", key: "feTPct", type: "number" },
//   { label: "% LOI", key: "loiPct", type: "number" },
//   { label: "% SiO2", key: "sio2Pct", type: "number" },
//   { label: "% Al2O3", key: "al2o3Pct", type: "number" },
//   { label: "% P", key: "pPct", type: "number" }
// ];

// const ironOreFields = [
//     { label: "% Moisture", key: "moisturePct", type: "number" },
//     { label: "+30 mm", key: "plus30", type: "number" },
//     { label: "+25 mm", key: "plus25", type: "number" },
//     { label: "+22 mm", key: "plus22", type: "number" },
//     { label: "+20 mm", key: "plus20", type: "number" },
//     { label: "+18 mm", key: "plus18", type: "number" },
//     { label: "+15 mm", key: "plus15", type: "number" },
//     { label: "+10 mm", key: "plus10", type: "number" },
//     { label: "+8 mm", key: "plus8", type: "number" },
//     { label: "+5 mm", key: "plus5", type: "number" },
//     { label: "+3 mm", key: "plus3", type: "number" },
//     { label: "+1 mm", key: "plus1", type: "number" },
//     { label: "-1 mm", key: "minus1", type: "number" },
//     { label: "Oversize", key: "oversize", type: "number" },
//     { label: "Undersize", key: "undersize", type: "number" },
//     { label: "MPS", key: "mps", type: "number" },
//     { label: "Laterite", key: "laterite", type: "number" },
//     { label: "Blue Dust", key: "blueDust", type: "number" },
//     { label: "Shale/Stone", key: "shaleStone", type: "number" },
//     { label: "% T.I.", key: "tumblerIndex", type: "number" },
//     { label: "% A.I.", key: "accretionIndex", type: "number" },
//     { label: "% Fe(T)", key: "feTotal", type: "number" },
//     { label: "% LOI", key: "loi", type: "number" },
//     { label: "% SiO2", key: "sio2", type: "number" },
//     { label: "% Al2O3", key: "al2o3", type: "number" },
//     { label: "% P", key: "phosphorus", type: "number" }
// ];


// function App() {

  

  

  
//   // --- States for Navigation ---
//   const [activeModule, setActiveModule] = useState("quality"); // 'quality' or 'production'
  
  
//   // --- States for Quality Control (Existing) ---
//   const [fields, setFields] = useState([]);
//   const [material, setMaterial] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [qualityFormData, setQualityFormData] = useState({});
//   const [selectedMaterial, setSelectedMaterial] = useState("");


//   // --- States for Production CD/PH (New) ---
  //  const [source, setSource] = useState(""); // CD or PH
//   const [prodFormData, setProdFormData] = useState({
//     area: "", item: "", shift: "", feM: "", sulphur: "", carbon: "", nMag: "",
//     overSize: "", underSize: "", binNo: "", remarks: "", magInChar: "",
//     feMInChar: "", grade: "", status: ""
//   });

//   // --- Functions for Quality Control (Original Logic) ---
//   const fetchFields = async (type) => {
//     setMaterial(type);
//     setQualityFormData({});
//     if (!type) { setFields([]); return; }
//     setIsLoading(true);
//     try {
//       const response = await fetch(`https://localhost:7067/api/material/${type}`);
//       if (!response.ok) throw new Error("Material not found");
//       const data = await response.json();
//       setFields(data);
//     } catch (error) { alert("API Error: " + error.message); } 
//     finally { setIsLoading(false); }
//   };

//  const handleQualitySubmit = async () => {
//     // 1. Generate the Custom ID (e.g., RMCA-0001)
//     // Note: In a real app, you'd get the count from the DB. 
//     // For now, let's assume we use a timestamp or a local count.
//     const customId = getNextId(material, 0);

//     // 2. Build the Payload
//     const payload = {
//         ...qualityFormData,
//         materialId: customId,
//         materialType: material,
//         status: "Pending" // Force status to Pending for new entries
//     };

// //     const validateRange = (value) => {
// //     // If the box is empty, return null so C# doesn't crash on an empty string
// //     if (value === "" || value === null || value === undefined) return null;
    
// //     const num = parseFloat(value);

// //     return isNaN(num) ? null : num;
    
// //     if (isNaN(num)) return null;

// //     // Optional: Keep values between 0-100 for percentage fields
// //     return Math.min(100, Math.max(0, num));
// // };


//     // 3. Send to API
//     const response = await fetch('https://localhost:7067/api/production/save-quality', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//     });

//     if (response.ok) {
//         alert(`Successfully Saved with ID: ${customId}`);
//         setQualityFormData({}); // Clear form
//     }
// };

// // const validateRange = (value) => {
// //     if (value === "") return null;
// //     const num = parseFloat(value);
// //     if (isNaN(num)) return null;
// //     return num; 
// // };

// const validateRange = (value) => {
//     // 1. If the box is empty, return null so the database gets a (null) value
//     if (value === "" || value === null || value === undefined) {
//         return null;
//     }
    
//     // 2. Convert the text input to a real number
//     const num = parseFloat(value);

//     // 3. If it's not a valid number (e.g., the user typed a letter), return null
//     if (isNaN(num)) {
//         return null;
//     }

//     // 4. Keep values between 0 and 100 (standard for % and moisture fields)
//     // This prevents "Number out of range" errors in Oracle
//     return Math.min(100, Math.max(0, num));
// };

//   const handleQualityChange = (field, value) => {
//     // 1. Updated list: Added 'shaleStone' if you treat it as text, 
//     // but usually, everything in your list except these should be numeric.
//     const nonNumericFields = [
//         "supplier", "truckNo", "monthName", "source", 
//         "party", "category", "transporter", "entryDate", "status"
//     ];
    
//     const isNumeric = !nonNumericFields.includes(field);

//     if (isNumeric) {
//         // 2. If the user clears the box, set it to null immediately
//         if (value === "" || value === null) {
//             setQualityFormData(prev => ({ ...prev, [field]: null }));
//             return;
//         }

//         // 3. Ensure validateRange is called and the result is a number
//         // We use parseFloat here to ensure .NET sees a Number, not a String
//         const numericValue = parseFloat(value);
        
//         // If the user is still typing and it's not a valid number yet (like just a minus sign)
//         if (isNaN(numericValue)) return;

//         setQualityFormData(prev => ({ 
//             ...prev, 
//             [field]: numericValue 
//         }));
//     } else {
//         // 4. Standard text fields
//         setQualityFormData(prev => ({ ...prev, [field]: value }));
//     }
// };

//   // --- Functions for Production CD/PH (New Logic) ---
//   const handleProdInputChange = (name, value) => {
//     setProdFormData({ ...prodFormData, [name]: value });
//   };
//   const [isSaving, setIsSaving] = useState(false);

  // const handleProductionSubmit = async () => {
  //     const payload = {
  //     ...prodFormData,
  //     source: source,
  //     entryDate: new Date().toISOString(),
  //     // Ensure numbers are parsed correctly
  //     feM: parseFloat(prodFormData.feM || 0),
  //     sulphur: parseFloat(prodFormData.sulphur || 0),
  //     carbon: parseFloat(prodFormData.carbon || 0),
  //     nMag: parseFloat(prodFormData.nMag || 0),
  //     overSize: parseFloat(prodFormData.overSize || 0),
  //     underSize: parseFloat(prodFormData.underSize || 0),
  //     magInChar: parseFloat(prodFormData.magInChar || 0),
  //     feMInChar: parseFloat(prodFormData.feMInChar || 0),
  //   };

  //   try {
  //     const response = await fetch('https://localhost:7067/api/production/save-production', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload)
  //     });
  //     if (response.ok) { alert(`🎉 ${source} Data Saved!`); setProdFormData({}); }
  //   } catch (e) { alert("Connection Error"); }
  // };

//   // 1. Initial State for Dispatch
// const [dispatchFormData, setDispatchFormData] = useState({
//   slNo: "", month: "", entryDate: "", material: "", truckNo: "", 
//   partyName: "", destination: "", materialSize: "", qty: "", feM: "", 
//   minus3mm: "", trReason: "", partyFeM: "", partyRecov: "", 
//   complaintQty: "", dispatchOfficer: "", remarks: "", status: ""
// });

// // 2. The Missing Handler Function
// const handleDispatchChange = (name, value) => {
//   setDispatchFormData(prev => ({ 
//     ...prev, 
//     [name]: value 
//   }));
// };



// // 3. The Submit Function for Dispatch
// const handleDispatchSubmit = async () => {
//   try {
//     const res = await fetch('https://localhost:7067/api/production/save-dispatch', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(dispatchFormData)
//     });

//     if (res.ok) {
//       alert("🎉 Dispatch Data Saved successfully!");
      
//       // Reset form after save
//       setDispatchFormData({
//         slNo: "", month: "", entryDate: "", material: "", truckNo: "", 
//         partyName: "", destination: "", materialSize: "", qty: "", feM: "", 
//         minus3mm: "", trReason: "", partyFeM: "", partyRecov: "", 
//         complaintQty: "", dispatchOfficer: "", remarks: "", status: ""
//       });
//     } else {
//       alert("Failed to save to Oracle database.");
//     }
//   } catch (error) {
//     alert("Connection Error: " + error.message);
//   }
// };

// const handleStockChange = (name, value) => {
//   setStockFormData(prev => ({
//     ...prev,
//     [name]: value
//   }));
// };


// const [stockMaterial, setStockMaterial] = useState("");
//  const [stockFormData, setStockFormData] = useState({ 
// //   kiln: "", belt: "", status: "",
// //   size25mm: "", size22mm: "", size20mm: "", size18mm: "", size15mm: "", 
// //   size12mm: "", size10mm: "", size8mm: "", size6mm: "", size5mm: "", 
// //   size3mm: "", size1mm: "", minus1mm: "", mps: "", tm: "", vm: "", 
// //   ash: "", fc: "", feT: "", loi: "", plus18mm: "", minus8mm: "", plus6mm: ""
// // });
//   const handleCoalSubmit = async () => {
//     setIsSaving(true);
//     try {
//         const response = await fetch('https://localhost:7067/api/production/save-coal', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(qualityFormData) // Ensure your state has the Coal data
//         });

//         const result = await response.json();

//         if (response.ok) {
//             alert(`Coal Record Saved! ID: ${result.id}`);
//             setQualityFormData({}); // Clear form
//         } else {
//             alert("Error: " + result.message);
//         }
//     } catch (error) {
//         alert("Failed to connect to server.");
//     } finally {
//         setIsSaving(false);
//     }
// };

// const handlePelletsSubmit = async () => {
//     setIsSaving(true);
//     try {
//         // Ensure every key from pelletsFields exists in the payload, even as null
//         const completeData = { ...qualityFormData };
        
//         const response = await fetch('https://localhost:7067/api/production/save-pellets', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(completeData)
//         });

//         if (response.ok) {
//             const result = await response.json();
//             alert("Stored Successfully! ID: " + result.id);
//             setQualityFormData({}); 
//         } else {
//             const errorData = await response.json();
//             alert("Error: " + errorData.message);
//         }
//     } catch (error) {
//         alert("Server connection failed.");
//     } finally {
//         setIsSaving(false);
//     }
// };

// const handleIronOreSubmit = async () => {
//     setIsSaving(true);
//     try {
//         // Ensure every key from pelletsFields exists in the payload, even as null
//         const completeData = { ...qualityFormData };
        
//         const response = await fetch('https://localhost:7067/api/production/save-ironore', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(completeData)
//         });

//         if (response.ok) {
//             const result = await response.json();
//             alert("Stored Successfully! ID: " + result.id);
//             setQualityFormData({}); 
//         } else {
//             const errorData = await response.json();
//             alert("Error: " + errorData.message);
//         }
//     } catch (error) {
//         alert("Server connection failed.");
//     } finally {
//         setIsSaving(false);
//     }
// };

// const handleStockSubmit = async () => {
//   // 1. Prepare payload with Material Type
//   const finalPayload = { ...stockFormData, materialType: stockMaterial };

//   // 2. Convert numeric fields from strings to numbers
//   Object.keys(finalPayload).forEach(key => {
//     const nonNumericFields = ['kiln', 'belt', 'status', 'materialType'];
//     if (!nonNumericFields.includes(key) && finalPayload[key] !== "") {
//       finalPayload[key] = parseFloat(finalPayload[key]);
//     } else if (!nonNumericFields.includes(key) && finalPayload[key] === "") {
//       finalPayload[key] = null; // Send null for empty numeric fields
//     }
//   });



//   try {
//     const res = await fetch('https://localhost:7067/api/production/save-stockhouse', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(finalPayload)
//     });

//     if (res.ok) {
//       alert("🎉 Data Saved Successfully!");
//     } else {
//       const errorText = await res.text();
//       console.error("Server Error Detail:", errorText);
//       alert("Database Rejected Data. See Console (F12) for details.");
//     }
//   } catch (err) {
//     alert("Check if your Backend is running.");
//   }
// };

//   // --- Styles ---
//   const navButtonStyle = (isActive) => ({
//     padding: '12px 24px',
//     cursor: 'pointer',
//     borderRadius: '12px',
//     border: 'none',
//     backgroundColor: isActive ? '#1a3a5a' : '#fff',
//     color: isActive ? '#fff' : '#1a3a5a',
//     fontWeight: 'bold',
//     transition: '0.3s',
//     boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//   });

//   const inputStyle = {
//     padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem'
//   };
//   const labelStyle = { 
//     fontSize: '0.85rem', 
//     fontWeight: '800', 
//     color: '#1a3a5a', 
//     textTransform: 'uppercase', 
//     marginBottom: '2px' 
//   };

//   return  (

    
    
    
//     <div style={{ 
//       minHeight: '100vh', width: '100vw',
//       backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg')`,
//       backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
//       display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px',
//       fontFamily: "'Segoe UI', Roboto, sans-serif", boxSizing: 'border-box'
//     }}>
      
//       {/* Brand & Navigation */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
//         <div style={{ backgroundColor: '#fff', padding: '10px 25px', borderRadius: '50px' }}>
//           <img src="https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg" alt="Logo" style={{ height: '40px' }} />
//         </div>
        
//         <button onClick={() => setActiveModule("quality")} style={navButtonStyle(activeModule === "quality")}>Raw Material Testing</button>
//         <button onClick={() => setActiveModule("stockhouse")} style={navButtonStyle(activeModule === "stockhouse")}>Stock House Analysis</button>
//          {/* <button onClick={() => setActiveModule("Stock_House_Analysis")} style={navButtonStyle(activeModule === "Stock_House_Analysis")}>Stock House Analysis</button> */}
//         <button onClick={() => { setActiveModule("production"); setSource("CD"); }} style={navButtonStyle(activeModule === "production" && source === "CD")}>Cooler Discharge</button>
//         <button onClick={() => { setActiveModule("production"); setSource("PH"); }} style={navButtonStyle(activeModule === "production" && source === "PH")}>Product House</button>
//          <button onClick={() => setActiveModule("dispatch")} style={navButtonStyle(activeModule === "dispatch")}>Dispatch</button>
        

       
//       </div>

//       <div style={{ 
//        width: "100%",maxWidth: "1100px",margin: "0 auto", backgroundColor: 'rgba(255, 255, 255, 0.94)', 
//         backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
//       }}>
        
//         {/* --- MODULE 1: RAW MATERIAL TESTING (YOUR ORIGINAL CODE) --- */}
//         {/* --- MODULE 1: RAW MATERIAL TESTING --- */}
//     {activeModule === "quality" && (
//     <div style={{ padding: '20px' }}>
//     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a3a5a', paddingBottom: '10px' }}>

//        <div style={{ marginBottom: "15px" }}>
//       <label>Select Raw Material:</label>
//       <select
//       value={selectedMaterial}
//     onChange={(e) => setSelectedMaterial(e.target.value)}
//    >
//     <option value="">Select Material</option>
//      <option value="COAL">Coal</option>
//     <option value="PELLETS">Pellets</option>
//     <option value="IRON_ORE">Iron Ore</option>
//     <option value="DOLOMITE">Dolomite</option>
//     </select>

//     </div>

      
//     <h2>
//     {selectedMaterial === "COAL" && "Coal Analysis Entry"}
//     {selectedMaterial === "PELLETS" && "Pellets Analysis Entry"}
//     {selectedMaterial === "IRON_ORE" && "Iron Ore Analysis Entry"}
//     {selectedMaterial === "DOLOMITE" && "Dolomite Analysis Entry"}
//     </h2>

//       <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
//         Next ID: RACA-XXXX
//       </div>
//     </div>

//     {/* Input Grid */}
//     {/* Input Grid */}
//     {selectedMaterial === "COAL" && (
//     <>
//     {/* Input Grid */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
//       {coalFields.map((f) => (
//         <div key={f.key} style={{ display: 'flex', flexDirection: 'column' }}>
//           <label style={labelStyle}>{f.label}</label>
//           <input 
//             type={f.type}
//             style={inputStyle}
//             onChange={(e) => {
//               const val = f.type === "number" ? validateRange(e.target.value) : e.target.value;
//               setQualityFormData({ ...qualityFormData, [f.key]: val });
//             }}
//           />
//         </div>
//       ))}

//       {/* Status Field */}
//       <div style={{ display: 'flex', flexDirection: 'column' }}>
//         <label style={labelStyle}>Status</label>
//         <select style={{ ...inputStyle, backgroundColor: '#f0f0f0' }} disabled>
//           <option value="Pending">Pending</option>
//         </select>
//       </div>
//     </div>
//    </>
//     )}



//    {selectedMaterial === "COAL" && (
//     <button 
//      onClick={handleCoalSubmit} 
//     style={{ marginTop: '30px', width: '100%', padding: '15px', backgroundColor: '#1a3a5a', color: 'white', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
//    >
//      Save Coal Analysis
//    </button>
//    )}

//    {selectedMaterial === "PELLETS" && (

//    <>
//     {/* Input Grid */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
//       {pelletsFields.map((f) => (
//         <div key={f.key} style={{ display: 'flex', flexDirection: 'column' }}>
//           <label style={labelStyle}>{f.label}</label>
//           <input 
//             type={f.type}
//             style={inputStyle}
//             onChange={(e) => {
//               const val = f.type === "number" ? validateRange(e.target.value) : e.target.value;
//               setQualityFormData({ ...qualityFormData, [f.key]: val });
//             }}
//           />
//         </div>
//       ))}

//       {/* Status Field */}
//       <div style={{ display: 'flex', flexDirection: 'column' }}>
//         <label style={labelStyle}>Status</label>
//         <select style={{ ...inputStyle, backgroundColor: '#f0f0f0' }} disabled>
//           <option value="Pending">Pending</option>
//         </select>
//       </div>
//     </div>
//    </>



//      )}

//    {selectedMaterial === "PELLETS" && (
//    <button 
//    disabled={isSaving} // Disables the button automatically
//    onClick={handlePelletsSubmit} 
//    style={{ 
//     marginTop: '30px', 
//     width: '100%', 
//     padding: '15px', 
//     backgroundColor: isSaving ? '#ccc' : '#1a3a5a', // Grey out when saving
//     color: 'white', 
//     borderRadius: '10px', 
//     fontWeight: 'bold', 
//     cursor: isSaving ? 'not-allowed' : 'pointer' 
//     }}
//    >
//    {isSaving ? "Processing... Please Wait" : "Save Pellets Analysis"}
//    </button>
//    )}

//    {selectedMaterial === "IRON_ORE" && (

//     <>
//     {/* Input Grid */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
//       {ironOreFields.map((f) => (
//         <div key={f.key} style={{ display: 'flex', flexDirection: 'column' }}>
//           <label style={labelStyle}>{f.label}</label>
//           <input 
//             type={f.type}
//             style={inputStyle}
//             onChange={(e) => {
//               const val = f.type === "number" ? validateRange(e.target.value) : e.target.value;
//               setQualityFormData({ ...qualityFormData, [f.key]: val });
//             }}
//           />
//         </div>
//       ))}

//       {/* Status Field */}
//       <div style={{ display: 'flex', flexDirection: 'column' }}>
//         <label style={labelStyle}>Status</label>
//         <select style={{ ...inputStyle, backgroundColor: '#f0f0f0' }} disabled>
//           <option value="Pending">Pending</option>
//         </select>
//       </div>
//     </div>
//    </>



//    )}

//    {selectedMaterial === "IRON_ORE" && (
//    <button 
//      disabled={isSaving} // Disables the button automatically
//     onClick={handleIronOreSubmit} 
//     style={{ 
//     marginTop: '30px', 
//     width: '100%', 
//     padding: '15px', 
//     backgroundColor: isSaving ? '#ccc' : '#1a3a5a', // Grey out when saving
//     color: 'white', 
//     borderRadius: '10px', 
//     fontWeight: 'bold', 
//     cursor: isSaving ? 'not-allowed' : 'pointer' 
//    }}
//     >
//     {isSaving ? "Processing... Please Wait" : "Save Iron Ore Analysis"}
//    </button>
//    )}



//    </div>
//     )}
//         {/* --- MODULE 2: COOLER DISCHARGE / PRODUCT HOUSE (NEW CODE) --- */}
//         {/* --- MODULE 2: COOLER DISCHARGE / PRODUCT HOUSE (UPDATED STYLING) --- */}
  //    {activeModule === "production" && (
  //   <div>
  //   <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a3a5a', paddingBottom: '15px', marginBottom: '20px' }}>
  //     <h2 style={{ color: '#1a3a5a', margin: 0 }}>{source === "CD" ? "Cooler Discharge" : "Product House"} Data Entry</h2>
  //     <span style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#1a3a5a', padding: '8px 15px', borderRadius: '10px' }}>Source: {source}</span>
  //   </div>

  //   {/* Selection Row */}
  //   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
  //     {['area', 'item', 'shift'].map((type) => (
  //       <div key={type}>
  //         <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>{type}</label>
  //         <select onChange={(e) => handleProdInputChange(type, e.target.value)} style={{ ...inputStyle, width: '100%' }}>
  //           <option value="">-- Select {type} --</option>
  //           {type === 'area' && <>
  //             <option value="100TPD">100 TPD</option><option value="500TPD">500 TPD</option>
  //             <option value="600TPD1">600 TPD 1</option><option value="600TPD2">600 TPD 2</option>
  //           </>}
  //           {type === 'item' && <>
  //             <option value="Pellets">Pellets</option><option value="Lumps">Lumps</option><option value="Fines">Fines</option>
  //           </>}
  //           {type === 'shift' && <>
  //             <option value="A">Shift A</option><option value="B">Shift B</option><option value="C">Shift C</option>
  //           </>}
  //         </select>
  //       </div>
  //     ))}
  //   </div>

  //   {/* Technical Inputs Grid */}
  //   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
  //     {['feM', 'sulphur', 'carbon', 'nMag', 'overSize', 'underSize', 'magInChar', 'feMInChar'].map(field => (
  //       <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  //         <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>
  //           {field === 'feM' ? 'Fe(M)' : 
  //            field === 'nMag' ? 'N MAG' : 
  //            field === 'overSize' ? 'Over Size' : 
  //            field === 'underSize' ? 'Under Size' : 
  //            field === 'magInChar' ? 'Mag in Char' : 
  //            field === 'feMInChar' ? 'Fe(m) in Char' : field}
  //         </label>
  //         <input type="number" placeholder="0.00" onChange={(e) => handleProdInputChange(field, e.target.value)} style={inputStyle} />
  //       </div>
  //     ))}

  //     {/* Manual Inputs with SAME High-Visibility Styling */}
  //     <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  //       <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Bin No</label>
  //       <input onChange={(e) => handleProdInputChange('binNo', e.target.value)} style={inputStyle} />
  //     </div>
  //     <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  //       <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Grade</label>
  //       <input onChange={(e) => handleProdInputChange('grade', e.target.value)} style={inputStyle} />
  //     </div>
  //     <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  //       <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Status</label>
  //       <input onChange={(e) => handleProdInputChange('status', e.target.value)} style={inputStyle} />
  //     </div>
  //     <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '5px' }}>
  //       <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a3a5a', textTransform: 'uppercase' }}>Remarks</label>
  //       <textarea onChange={(e) => handleProdInputChange('remarks', e.target.value)} style={{ ...inputStyle, height: '60px' }} />
  //     </div>
  //   </div>

  //   <button onClick={handleProductionSubmit} style={{ marginTop: '30px', width: '100%', padding: '18px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)' }}>
  //     Confirm & Save {source} Entry
  //   </button>
  //  </div>
  //  )}

//    {/* --- MODULE 3: DISPATCH (NEW) --- */}
//     {activeModule === "dispatch" && (
//    <div>
//     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a3a5a', paddingBottom: '15px', marginBottom: '20px' }}>
//       <h2 style={{ color: '#1a3a5a', margin: 0 }}>Dispatch Data Entry</h2>
//       <span style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#1a3a5a', padding: '8px 15px', borderRadius: '10px' }}>Department: Dispatch</span>
//     </div>

// //     {/* Dispatch Grid */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
//       {/* Row 1 */}
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Sl No</label><input onChange={(e)=>handleDispatchChange('slNo', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Month</label><input onChange={(e)=>handleDispatchChange('month', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Date</label><input type="date" onChange={(e)=>handleDispatchChange('entryDate', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Material</label><input onChange={(e)=>handleDispatchChange('material', e.target.value)} style={inputStyle}/></div>
      
//       {/* Row 2 */}
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Truck No</label><input onChange={(e)=>handleDispatchChange('truckNo', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Name</label><input onChange={(e)=>handleDispatchChange('partyName', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Destination</label><input onChange={(e)=>handleDispatchChange('destination', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Size</label><input onChange={(e)=>handleDispatchChange('materialSize', e.target.value)} style={inputStyle}/></div>

//       {/* Row 3 (Numeric Fields) */}
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>QTY</label><input type="number" onChange={(e)=>handleDispatchChange('qty', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Fe(M)</label><input type="number" onChange={(e)=>handleDispatchChange('feM', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>-3mm</label><input type="number" onChange={(e)=>handleDispatchChange('minus3mm', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Tr Reason</label><input onChange={(e)=>handleDispatchChange('trReason', e.target.value)} style={inputStyle}/></div>

//       {/* Row 4 */}
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Fe(M)</label><input type="number" onChange={(e)=>handleDispatchChange('partyFeM', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Party Recov</label><input type="number" onChange={(e)=>handleDispatchChange('partyRecov', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Complaint QTY</label><input type="number" onChange={(e)=>handleDispatchChange('complaintQty', e.target.value)} style={inputStyle}/></div>
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Dispatch Officer</label><input onChange={(e)=>handleDispatchChange('dispatchOfficer', e.target.value)} style={inputStyle}/></div>

//       {/* Row 5 */}
//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Status</label><input onChange={(e)=>handleDispatchChange('status', e.target.value)} style={inputStyle}/></div>
//       <div style={{gridColumn: 'span 3', display:'flex', flexDirection:'column'}}><label style={labelStyle}>Remarks</label><textarea onChange={(e)=>handleDispatchChange('remarks', e.target.value)} style={{...inputStyle, height: '45px'}}/></div>
//     </div>

//     <button onClick={handleDispatchSubmit} style={{ marginTop: '30px', width: '100%', padding: '18px', backgroundColor: '#1a3a5a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
//       Confirm & Save Dispatch Entry
//     </button>
//    </div>
//     )}

//    {activeModule === "stockhouse" && (
//    <div>
//     <h2 style={{ color: '#1a3a5a', borderBottom: '2px solid #1a3a5a', paddingBottom: '10px' }}>Stock House Analysis</h2>
    
//     {/* Top Selection Row */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
//       <div>
//         <label style={labelStyle}>Kiln</label>
//         <select onChange={(e)=>handleStockChange('kiln', e.target.value)} style={{...inputStyle, width:'100%'}}>
//           <option value="">-- Select Kiln --</option>
//           <option value="Kiln 1">Kiln 1</option><option value="Kiln 2">Kiln 2</option>
//           <option value="Kiln 3">Kiln 3</option><option value="Kiln 4">Kiln 4</option>
//         </select>
//       </div>
//       <div>
//         <label style={labelStyle}>Material</label>
//         <select onChange={(e)=>setStockMaterial(e.target.value)} style={{...inputStyle, width:'100%'}}>
//           <option value="">-- Select Material --</option>
//           <option value="Coal">Coal</option><option value="IronOre">Iron Ore</option>
//           <option value="Dolomite">Dolomite</option><option value="Charcoal">Charcoal</option>
//         </select>
//       </div>
//       <div>
//         <label style={labelStyle}>Belt</label>
//         <input onChange={(e)=>handleStockChange('belt', e.target.value)} placeholder="Enter Belt No." style={{...inputStyle, width:'92%'}}/>
//       </div>
//     </div>

//     {/* Dynamic Grid based on Material */}
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
//       {stockMaterial === "Coal" && (
//         <>
//           {['size25mm', 'size22mm', 'size20mm', 'size18mm', 'size15mm', 'size12mm', 'size10mm', 'size8mm', 'size6mm', 'size5mm', 'size3mm', 'size1mm', 'minus1mm', 'mps', 'tm', 'vm', 'ash', 'fc'].map(f => (
//             <div key={f} style={{display:'flex', flexDirection:'column'}}>
//               <label style={labelStyle}>{f.replace('size', '').replace('mm', ' mm').toUpperCase()}</label>
//               <input type="number" onChange={(e)=>handleStockChange(f, e.target.value)} style={inputStyle}/>
//             </div>
//           ))}
//         </>
//       )}

//       {stockMaterial === "IronOre" && (
//         <>
//           {['tm', 'feT', 'loi', 'plus18mm', 'minus8mm', 'mps'].map(f => (
//             <div key={f} style={{display:'flex', flexDirection:'column'}}>
//               <label style={labelStyle}>{f.toUpperCase()}</label>
//               <input type="number" onChange={(e)=>handleStockChange(f, e.target.value)} style={inputStyle}/>
//             </div>
//           ))}
//         </>
//       )}

//       {stockMaterial === "Dolomite" && (
//         <>
//           {['tm', 'plus6mm', 'minus1mm', 'mps'].map(f => (
//             <div key={f} style={{display:'flex', flexDirection:'column'}}>
//               <label style={labelStyle}>{f.toUpperCase()}</label>
//               <input type="number" onChange={(e)=>handleStockChange(f, e.target.value)} style={inputStyle}/>
//             </div>
//           ))}
//         </>
//       )}

//       {stockMaterial === "Charcoal" && (
//         <>
//           {['fc', 'minus1mm'].map(f => (
//             <div key={f} style={{display:'flex', flexDirection:'column'}}>
//               <label style={labelStyle}>{f.toUpperCase()}</label>
//               <input type="number" onChange={(e)=>handleStockChange(f, e.target.value)} style={inputStyle}/>
//             </div>
//           ))}
//         </>
//       )}

//       <div style={{display:'flex', flexDirection:'column'}}><label style={labelStyle}>Status</label><input onChange={(e)=>handleStockChange('status', e.target.value)} style={inputStyle}/></div>
//     </div>

//     {stockMaterial && (
//       <button onClick={handleStockSubmit} style={{ marginTop: '30px', width: '100%', padding: '18px', backgroundColor: '#1a3a5a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
//         Save Stock House Analysis
//       </button>
//     )}
//     </div>  
//     )}

//       </div>
//       <p style={{ color: 'white', marginTop: '20px' }}>© 2026 Lloyds Metals and Energy Limited | LIMS</p>
//     </div>
//   );
 
// }

// export default App;