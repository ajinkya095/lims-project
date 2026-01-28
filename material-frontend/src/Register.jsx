import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ================= DEFAULT PERMISSIONS ================= */
const defaultPermissions = {
  pages: {
    rawMaterial: false,
    production: false,
    stockHouse: false,   // ✅ ADD
    dispatch: false, 
    reports: false,
    managerApproval: false,
  },
  rawMaterialModules: {   // ✅ RENAME THIS
    coal: false,
    pellets: false,
    ironOre: false,
  },
  actions: {
    save: false,
    saveDraft: false,
    approve: false,
    reject: false,
    edit: false,
  },
};


const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    password: "",
    role: "",
  });

  const [permissions, setPermissions] = useState(defaultPermissions);

  /* ================= ROLE CHANGE LOGIC ================= */
  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });

    if (role === "admin") {
      setPermissions({
        pages: {
          rawMaterial: true,
          production: true,
          reports: true,
          managerApproval: true,
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
      });
    } 
    else if (role === "manager") {
      setPermissions({
        ...defaultPermissions,
        pages: {
          ...defaultPermissions.pages,
          managerApproval: true,
        },
        actions: {
          approve: true,
          reject: true,
          edit: true,
        },
      });
    } 
    else {
      setPermissions(defaultPermissions); // user = nothing auto
    }
  };

  const blueText = {
  color: "#1a3a5a",
  fontWeight: "600",
};


  /* ================= TOGGLE CHECKBOX ================= */
  const togglePermission = (section, key) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();

    const payload = {
      UserId: formData.userId.toLowerCase(),
      UserName: formData.userName,
      Password: formData.password,
      Role: formData.role,
      Permissions: JSON.stringify(permissions),
    };

    try {
      const res = await fetch("https://localhost:7067/api/production/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ User Registered Successfully");
        navigate("/testing");
      } else {
        alert("❌ Registration Failed");
      }
    } catch {
      alert("❌ Backend not reachable");
    }
  };
  const handleRawMaterialChange = (key) => (e) => {
  const checked = e.target.checked;

  setPermissions(prev => ({
    ...prev,
    rawMaterialModules: {
      ...prev.rawMaterialModules,
      [key]: checked
    }
  }));
};

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Register New User</h2>

        <form onSubmit={handleRegister}>
          <label style={labelStyle}>User ID</label>
          <input
  style={inputStyle}
  required
  value={formData.userId}
  onChange={(e) =>
    setFormData({ ...formData, userId: e.target.value })
  }
/>


          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} required
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          />

          <label style={labelStyle}>Password</label>
          <input type="password" style={inputStyle} required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <label style={labelStyle}>Role</label>
          <select style={inputStyle} value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          {/* PAGE ACCESS */}
          <div style={sectionBox}>
            <h3 style={blueText}>Page Access</h3>
            <Checkbox label="Raw Material" checked={permissions.pages.rawMaterial}
              onChange={() => togglePermission("pages", "rawMaterial")} />
            <Checkbox label="Production" checked={permissions.pages.production}
              onChange={() => togglePermission("pages", "production")} />

               <Checkbox label="Stock House Analysis"
    checked={permissions.pages.stockHouse}
    onChange={() => togglePermission("pages", "stockHouse")}
  />

  <Checkbox label="Dispatch"
    checked={permissions.pages.dispatch}
    onChange={() => togglePermission("pages", "dispatch")}
  />
            <Checkbox label="Reports" checked={permissions.pages.reports}
              onChange={() => togglePermission("pages", "reports")} />
            <Checkbox label="Manager Approval" checked={permissions.pages.managerApproval}
              onChange={() => togglePermission("pages", "managerApproval")} />
          </div>

          {/* RAW MATERIAL */}
         {/* RAW MATERIAL */}
{permissions.pages.rawMaterial && (
  <div style={sectionBox}>
    <div style={sectionTitle}>Raw Material Modules</div>

    <Checkbox
      label="Coal"
      checked={permissions.rawMaterialModules.coal}
      onChange={() =>
        togglePermission("rawMaterialModules", "coal")
      }
    />

    <Checkbox
      label="Pellets"
      checked={permissions.rawMaterialModules.pellets}
      onChange={() =>
        togglePermission("rawMaterialModules", "pellets")
      }
    />

    <Checkbox
      label="Iron Ore"
      checked={permissions.rawMaterialModules.ironOre}
      onChange={() =>
        togglePermission("rawMaterialModules", "ironOre")
      }
    />
  </div>
)}


          {/* ACTIONS */}
          <div style={sectionBox}>
            <div style={sectionTitle}>Action Permissions</div>
            <Checkbox label="Save" checked={permissions.actions.save}
              onChange={() => togglePermission("actions", "save")} />
            <Checkbox label="Save Draft" checked={permissions.actions.saveDraft}
              onChange={() => togglePermission("actions", "saveDraft")} />
            <Checkbox label="Approve" checked={permissions.actions.approve}
              onChange={() => togglePermission("actions", "approve")} />
            <Checkbox label="Reject" checked={permissions.actions.reject}
              onChange={() => togglePermission("actions", "reject")} />
            <Checkbox label="Edit" checked={permissions.actions.edit}
              onChange={() => togglePermission("actions", "edit")} />
          </div>

          <button type="submit" style={primaryButton}>Create User</button>
        </form>

        <button onClick={() => navigate("/testing")} style={cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const Checkbox = ({ label, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span style={{ color: "#1a3a5a", marginLeft: "8px", fontWeight: "500" }}>
      {label}
    </span>
  </div>
);


/* ================= STYLES ================= */
const pageStyle = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" };
const cardStyle = { width: "460px", background: "#fff", padding: "30px", borderRadius: "15px",color: "#1a3a5a" };
const titleStyle = { textAlign: "center", color: "#1a3a5a" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px" };
const labelStyle = { fontWeight: "600", color: "#1a3a5a" };
const primaryButton = { width: "100%", padding: "12px", background: "#1a3a5a", color: "#fff" };
const cancelButton = { width: "100%", marginTop: "10px", background: "none", border: "none" };
const sectionBox = { background: "#f6f8fa", padding: "12px", marginBottom: "12px" };
const sectionTitle = {
  color: "#1a3a5a",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "8px",
  borderBottom: "1px solid #ccc",
  paddingBottom: "4px",
};


export default Register;
