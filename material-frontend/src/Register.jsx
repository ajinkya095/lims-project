import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaFlask,
  FaWarehouse,
  FaSnowflake,
  FaIndustry,
  FaTruck,
  FaChartBar,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://192.168.3.45:7067";

/* ================= DEFAULT PERMISSIONS ================= */
const defaultPermissions = {
  pages: {
    rawMaterial: false,
    production: false,
    stockHouse: false,
    dispatch: false,
    reports: false,
    managerApproval: false,
  },
  rawMaterialModules: {
    coal: false,
    pellets: false,
    ironOre: false,
    dolomite: false,
  },
  stockHouseModules: {
    coal: false,
    ironOre: false,
    dolomite: false,
    charcoal: false,
  },
  actions: {
    save: false,
    approve: false,
    reject: false,
    edit: false,
  },
};

const Register = () => {
  const navigate = useNavigate();
  const loggedUser = localStorage.getItem("userId") || "Guest";
  const [menuOpen, setMenuOpen] = useState(false);

  const storedPermissions = (() => {
    try {
      const raw = localStorage.getItem("permissions");
      if (!raw) return {};
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  })();

  const isSuperAdmin = (localStorage.getItem("userId") || "").toLowerCase() === "ajn@lloyds.in";

  const [roles, setRoles] = useState(["User", "Admin", "Manager"]);
  const [newRole, setNewRole] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    password: "",
    role: "",
  });

  const [permissions, setPermissions] = useState(defaultPermissions);

  /* ================= ROLE CHANGE LOGIC ================= */
  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));

    if (role === "Admin") {
      setPermissions({
        pages: {
          rawMaterial: true,
          production: true,
          stockHouse: true,
          dispatch: true,
          reports: true,
          managerApproval: true,
        },
        rawMaterialModules: {
          coal: true,
          pellets: true,
          ironOre: true,
          dolomite: true,
        },
        stockHouseModules: {
          coal: true,
          ironOre: true,
          dolomite: true,
          charcoal: true,
        },
        actions: {
          save: true,
          approve: true,
          reject: true,
          edit: true,
        },
      });
    } 
    else if (role === "Manager") {
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
      setPermissions(defaultPermissions); // User or custom role
    }
  };

  /* ================= TOGGLE CHECKBOX ================= */
  const togglePermission = (section, key) => {
    setPermissions(prev => ({
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

    if (!formData.role) {
      alert("Please select a role before registering.");
      return;
    }

    const payload = {
      UserId: formData.userId.toLowerCase(),
      UserName: formData.userName,
      Password: formData.password,
      Role: formData.role,
      Permissions: JSON.stringify(permissions),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/production/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ User Registered Successfully");
        navigate("/testing");
      } else {
        const errorText = await res.text();
        console.error("Register failed:", res.status, errorText);
        alert("❌ Registration Failed");
      }
    } catch {
      alert("❌ Backend not reachable");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    localStorage.removeItem("isLoggedIn");
    navigate("/", { replace: true });
  };

  return (
    <div style={pageStyle} className="register-page">
      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={menuBtnStyle}
            title="Open Menu"
          >
            ☰
          </button>
          <img
            src="https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg"
            alt="Logo"
            style={{ height: "34px" }}
          />
        </div>

        <div style={topBarTitleStyle}>
          Laboratory Information Management System
        </div>

        <div style={topBarUserStyle}>
          👤 {loggedUser}
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Logout
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={sidebarStyle}>
          <div style={menuSectionTitleStyle}>
            <FaBoxOpen size={14} />
            <span>Samples</span>
          </div>

          {(storedPermissions?.pages?.rawMaterial || isSuperAdmin) && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
              <FaFlask size={14} />
              <span>Raw Material Testing</span>
            </div>
          )}

          {(storedPermissions?.pages?.stockHouse || isSuperAdmin) && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
              <FaWarehouse size={14} />
              <span>Stock House Testing</span>
            </div>
          )}

          {(storedPermissions?.pages?.production || isSuperAdmin) && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
              <FaSnowflake size={14} />
              <span>Cooler Discharge Testing</span>
            </div>
          )}

          {(storedPermissions?.pages?.production || isSuperAdmin) && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
              <FaIndustry size={14} />
              <span>Product House Testing</span>
            </div>
          )}

          {(storedPermissions?.pages?.dispatch || isSuperAdmin) && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
              <FaTruck size={14} />
              <span>Dispatch</span>
            </div>
          )}

          {(storedPermissions?.pages?.reports || isSuperAdmin) && (
            <>
              <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/reports"); }}>
                <FaChartBar size={14} />
                <span>Reports</span>
              </div>
              <div style={menuSubItemStyle}>Reports</div>
            </>
          )}

          {(storedPermissions?.pages?.managerApproval || isSuperAdmin) && (
            <>
              <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/testing"); }}>
                <FaShieldAlt size={14} />
                <span>Approval</span>
              </div>
              <div style={menuSubItemStyle}>Manager Approval</div>
            </>
          )}

          {isSuperAdmin && (
            <div style={menuItemStyle} onClick={() => { setMenuOpen(false); navigate("/register"); }}>
              <FaUserPlus size={14} />
              <span>Register User</span>
            </div>
          )}

          <div style={{ ...menuItemStyle, color: "#ffb3b3" }} onClick={handleLogout}>
            <span style={{ marginLeft: "2px" }}>Logout</span>
          </div>
        </div>
      )}

      <div style={registerShellStyle}>
        <div style={formWrapStyle}>
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
          <input
            style={inputStyle}
            required
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {/* ROLE */}
          <label style={labelStyle}>Role</label>
          <select
            style={inputStyle}
            value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* ADD ROLE */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Add new role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, flex: 1, padding: "10px 12px" }}
            />
            <button
              type="button"
              onClick={() => {
                if (!newRole.trim()) return;
                setRoles(prev => [...prev, newRole]);
                handleRoleChange(newRole);
                setNewRole("");
              }}
              style={addRoleButton}
            >
              + Add
            </button>
          </div>

          {/* PAGE ACCESS */}
          <div style={sectionBox}>
            <div style={sectionTitle}>Page Access</div>
            {Object.keys(permissions.pages).map(key => (
              <Checkbox
                key={key}
                label={key.replace(/([A-Z])/g, " $1")}
                checked={permissions.pages[key]}
                onChange={() => togglePermission("pages", key)}
              />
            ))}
          </div>

          {/* RAW MATERIAL */}
          {permissions.pages.rawMaterial && (
            <div style={sectionBox}>
              <div style={sectionTitle}>Raw Material Modules</div>
              {Object.keys(permissions.rawMaterialModules).map(key => (
                <Checkbox
                  key={key}
                  label={key}
                  checked={permissions.rawMaterialModules[key]}
                  onChange={() =>
                    togglePermission("rawMaterialModules", key)
                  }
                />
              ))}
            </div>
          )}

          {/* STOCK HOUSE */}
          {permissions.pages.stockHouse && (
            <div style={sectionBox}>
              <div style={sectionTitle}>Stock House Materials</div>
              {Object.keys(permissions.stockHouseModules).map(key => (
                <Checkbox
                  key={key}
                  label={key}
                  checked={permissions.stockHouseModules[key]}
                  onChange={() =>
                    togglePermission("stockHouseModules", key)
                  }
                />
              ))}
            </div>
          )}

          {/* ACTIONS (contextual) */}
          {(permissions.pages.rawMaterial ||
            permissions.pages.production ||
            permissions.pages.stockHouse ||
            permissions.pages.dispatch) && (
            <div style={sectionBox}>
              <div style={sectionTitle}>Action Permissions</div>
              <Checkbox
                label="save"
                checked={permissions.actions.save}
                onChange={() => togglePermission("actions", "save")}
              />
            </div>
          )}

          {permissions.pages.managerApproval && (
            <div style={sectionBox}>
              <div style={sectionTitle}>Manager Approval Permissions</div>
              <Checkbox
                label="approve"
                checked={permissions.actions.approve}
                onChange={() => togglePermission("actions", "approve")}
              />
              <Checkbox
                label="reject"
                checked={permissions.actions.reject}
                onChange={() => togglePermission("actions", "reject")}
              />
              <Checkbox
                label="edit"
                checked={permissions.actions.edit}
                onChange={() => togglePermission("actions", "edit")}
              />
            </div>
          )}

              <button type="submit" style={primaryButton}>
                Create User
              </button>
            </form>

            <button onClick={() => navigate("/testing")} style={cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <style>{registerCss}</style>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const Checkbox = ({ label, checked, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span style={{ color: "var(--label-color)", marginLeft: "8px", fontWeight: "500" }}>
      {label}
    </span>
  </div>
);

/* ================= STYLES ================= */
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
    url("https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: "20px",
  paddingTop: "100px",
};

const registerShellStyle = {
  width: "100%",
  maxWidth: "1120px",
};

const topBarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "70px",
  background: "linear-gradient(90deg, rgba(0,0,0,0.9), rgba(139,0,0,0.88))",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
  zIndex: 1000,
  boxShadow: "0 2px 12px rgba(0,0,0,0.7)",
};

const menuBtnStyle = {
  fontSize: "24px",
  color: "white",
  background: "none",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: "8px",
  padding: "4px 10px",
  cursor: "pointer",
};

const topBarTitleStyle = {
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
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
};

const topBarUserStyle = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "white",
  fontWeight: "600",
  background: "rgba(255,255,255,0.15)",
  padding: "6px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.25)",
};

const logoutBtnStyle = {
  marginLeft: "6px",
  padding: "4px 10px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(239,68,68,0.85)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const sidebarStyle = {
  position: "fixed",
  top: "70px",
  left: 0,
  width: "260px",
  height: "calc(100vh - 70px)",
  background: "linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-alt) 100%)",
  color: "white",
  padding: "20px",
  zIndex: 1001,
  boxShadow: "10px 0 28px rgba(0,0,0,0.45)",
  borderRight: "1px solid rgba(255,255,255,0.08)",
};

const menuItemStyle = {
  padding: "12px 14px",
  marginBottom: "8px",
  cursor: "pointer",
  border: "1px solid var(--sidebar-border)",
  borderRadius: "12px",
  background: "var(--sidebar-surface)",
  fontWeight: "700",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "var(--sidebar-text)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
};

const menuSectionTitleStyle = {
  ...menuItemStyle,
  fontSize: "16px",
  fontWeight: "700",
};

const menuSubItemStyle = {
  padding: "10px 14px 10px 22px",
  border: "1px solid var(--sidebar-border)",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.03)",
  fontWeight: "700",
  color: "var(--sidebar-text-muted)",
  fontSize: "14px",
  marginBottom: "8px",
};

const formWrapStyle = {
  display: "flex",
  justifyContent: "center",
};

const cardStyle = {
  width: "620px",
  background: "rgba(255,255,255,0.95)",
  padding: "38px 46px",
  borderRadius: "20px",
  color: "var(--accent-dark)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
  fontSize: "24px",
  fontWeight: "600",
  color: "var(--heading-color)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#0f172a",
};

const labelStyle = {
  fontWeight: "500",
  marginBottom: "4px",
  color: "var(--label-color)",
};

const primaryButton = {
  width: "100%",
  padding: "14px",
  background: "var(--accent-dark)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
};

const cancelButton = {
  width: "100%",
  marginTop: "12px",
  background: "#f1f5f9",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "12px",
  fontWeight: "700",
  color: "var(--accent-dark)",
  cursor: "pointer",
};

const addRoleButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "var(--accent-dark)",
  fontWeight: "700",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const sectionBox = {
  background: "#f1f5f9",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
};

const sectionTitle = {
  fontWeight: "800",
  marginBottom: "8px",
};

const registerCss = `
.register-page input,
.register-page select,
.register-page textarea {
  color: #0f172a !important;
  -webkit-text-fill-color: #0f172a !important;
  caret-color: #0f172a;
}

.register-page input::placeholder {
  color: #64748b !important;
  opacity: 1;
}

.register-page input:-webkit-autofill,
.register-page input:-webkit-autofill:hover,
.register-page input:-webkit-autofill:focus,
.register-page input:-webkit-autofill:active {
  -webkit-text-fill-color: #0f172a !important;
  caret-color: #0f172a;
  transition: background-color 9999s ease-in-out 0s;
}
`;

export default Register;



