import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function EmployeeTables() {
  const API_URL = "http://127.0.0.1:8000/api/employee/employees/";
  const CSV_UPLOAD_URL = "http://127.0.0.1:8000/api/employee/upload_csv/";
  const MANAGER_LIST_URL = "http://127.0.0.1:8000/api/employee/employees/managers/";

  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    emp_id: "",
    first_name: "",
    last_name: "",
    email: "",
    department_code: "",
    role: "",
    designation: "",
    project_name: "",
    joining_date: "",
    manager: "",
  });

  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("add");
  const [showModal, setShowModal] = useState(false);
  const searchTimeoutRef = useRef(null);

  const managerLabel = (m) => {
    const name =
      m.full_name ||
      `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim();
    const id = m.emp_id || m.user?.emp_id || "";
    return id ? `${name} (${id})` : name || "Unknown";
  };

  const fetchManagers = async () => {
    try {
      const res = await fetch(MANAGER_LIST_URL);
      const data = await res.json();
      setManagers(
        (data.results || data).map((m) => ({
          emp_id: m.emp_id || m.user?.emp_id || "",
          full_name:
            m.full_name ||
            `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim(),
        }))
      );
    } catch (error) {
      console.error("Error fetching manager list:", error);
    }
  };

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${page}`);
      const data = await res.json();

      setEmployees(data.results || []);
      setTotalPages(data.total_pages || Math.ceil((data.count || 0) / 10));
      setCurrentPage(data.current_page || page);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAlert({ message: "Failed to load employees", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      let allEmployees = [];
      let page = 1;
      while (true) {
        const res = await fetch(`${API_URL}?page=${page}`);
        const data = await res.json();

        if (!data.results || data.results.length === 0) break;

        allEmployees = [...allEmployees, ...data.results];
        if (!data.next) break;
        page++;
      }
      return allEmployees;
    } catch (err) {
      console.error("Error fetching all employees for search:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage);
    fetchManagers();
  }, [currentPage]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSearchChange = (e) => {
  const value = e.target.value.trim();
  setSearchTerm(value);

  // Clear any previous debounce timer
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  // Debounce API call by 500ms after typing stops
  searchTimeoutRef.current = setTimeout(async () => {
    try {
      // 🟢 If search box is empty, restore paginated data (no reload flicker)
      if (!value) {
        if (isSearching) setIsSearching(false);
        setLoading(true);
        await fetchEmployees(currentPage);
        setLoading(false);
        return;
      }

      // 🟢 Avoid redundant refresh
      if (value === searchTerm && employees.length > 0 && isSearching) return;

      setIsSearching(true);
      setLoading(true);

      // ✅ Backend search (emp_id + first_name + last_name only)
      const res = await fetch(`${API_URL}?search=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error("Search request failed");

      const data = await res.json();
      setEmployees(data.results || []);

    } catch (error) {
      console.error("Error searching employees:", error);
      setAlert({ message: "Failed to search employees", type: "danger" });
    } finally {
      setLoading(false);
    }
  }, 500);
};

  const filteredEmployees = employees;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAdd = () => {
    setFormData({
      id: null,
      emp_id: "",
      first_name: "",
      last_name: "",
      email: "",
      department_code: "",
      role: "",
      designation: "",
      project_name: "",
      joining_date: "",
      manager: "",
    });
    setErrors({});
    setMode("add");
    setShowModal(true);
  };

  const handleEdit = (emp) => {
    setFormData({
      id: emp.id,
      emp_id: emp.emp_id,
      first_name: emp.user?.first_name || "",
      last_name: emp.user?.last_name || "",
      email: emp.email,
      department_code: emp.department_code || emp.department?.code || "",
      role: emp.role || "",
      designation: emp.designation || "",
      project_name: emp.project_name || "",
      joining_date: emp.joining_date || "",
      manager: emp.manager_name !== "Not Assigned" ? emp.manager_name : "",
    });

    setErrors({});
    setMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}${empId}/`, { method: "DELETE" });
      
      if (isSearching) {
        const allEmployees = await fetchAllEmployees();
        const filtered = allEmployees.filter(
          (emp) =>
            emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setEmployees(filtered);
      } else {
        fetchEmployees(currentPage);
      }
      
      setAlert({ message: "Employee Deleted Successfully", type: "success" });
    } catch (error) {
      console.error("Error deleting employee", error);
      setAlert({ message: "Failed to delete employee", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (emp) => {
    handleEdit(emp);
    setMode("view");
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    const method = mode === "edit" ? "PATCH" : "POST";
    const url = mode === "edit" ? `${API_URL}${formData.emp_id}/` : API_URL;

    const payload = { ...formData };
    delete payload.emp_id;
    delete payload.id;

    const requiredFields = [
      "first_name",
      "email",
      "role",
      "department_code",
      "joining_date",
    ];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!payload[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (payload.email && !validateEmail(payload.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      setAlert({
        message: "⚠️ Please fill all mandatory fields before saving.",
        type: "warning",
      });
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg =
          data?.errors
            ? Object.entries(data.errors)
                .map(
                  ([key, val]) =>
                    `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
                )
                .join(" | ")
            : data?.error || "Failed to save employee.";
        setAlert({ message: errorMsg, type: "danger" });
        return;
      }

      if (mode === "add") {
        const resAll = await fetch(API_URL);
        const dataAll = await resAll.json();
        const totalCount = dataAll.count || 0;
        const lastPage = Math.ceil(totalCount / 10);
        setCurrentPage(lastPage);
        setIsSearching(false);
        setSearchTerm("");
        await fetchEmployees(lastPage);
      } else {
        if (isSearching) {
          const allEmployees = await fetchAllEmployees();
          const filtered = allEmployees.filter(
            (emp) =>
              emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setEmployees(filtered);
        } else {
          await fetchEmployees(currentPage);
        }
      }

      setFormData({
        id: null,
        emp_id: "",
        first_name: "",
        last_name: "",
        email: "",
        department_code: "",
        role: "",
        designation: "",
        project_name: "",
        joining_date: "",
        manager: "",
      });
      setShowModal(false);

      setAlert({
        message:
          mode === "edit"
            ? "Employee Updated Successfully!"
            : "Employee Added Successfully!",
        type: "success",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error saving employee:", error);
      setAlert({ message: "Something went wrong while saving.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const formDataCSV = new FormData();
    formDataCSV.append("file", file);

    try {
      const res = await fetch(CSV_UPLOAD_URL, { method: "POST", body: formDataCSV });
      if (!res.ok) throw new Error("CSV upload failed");
      
      setIsSearching(false);
      setSearchTerm("");
      fetchEmployees(1);
      setCurrentPage(1);
      setAlert({ message: "CSV Uploaded Successfully!", type: "success" });
    } catch (error) {
      console.error("CSV upload error:", error);
      setAlert({ message: "Failed to upload CSV", type: "danger" });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="container py-3">
      <h5 className="mb-3">EMPLOYEE DETAILS</h5>

      {alert.message && (
        <div className={`alert alert-${alert.type} fade show`} role="alert">
          {alert.message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div className="position-relative w-25">
              <input
                type="text"
                placeholder="Search by Name or Emp ID..."
                className="form-control"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {isSearching && (
                <small className="text-muted d-block mt-1">
                  Searching across all pages...
                </small>
              )}
            </div>

            <div>
              <label
                htmlFor="csvUpload"
                className="btn btn-outline-secondary me-2 mb-0"
              >
                <i className="bi bi-upload"></i>
              </label>
              <input
                id="csvUpload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{ display: "none" }}
              />

              <button className="btn btn-primary" onClick={handleAdd}>
                <i className="bi bi-plus-circle me-2" /> Add Employee
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table
              className="table table-bordered table-striped text-center align-middle"
              style={{ whiteSpace: "nowrap", tableLayout: "auto" }}
            >
              <thead className="table-info">
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Project</th>
                  <th>Manager</th>
                  <th>Joining Date</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                      <p className="mt-3 text-muted mb-0">
                        {searchTerm ? "No employees match your search" : "No employees found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.emp_id}</td>
                      <td>{emp.full_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.project_name || "-"}</td>
                      <td>{emp.manager_name || "Not Assigned"}</td>
                      <td>{emp.joining_date}</td>
                      <td>{emp.department_name}</td>
                      <td>
                        <span
                          className={
                            emp.status === "Active"
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        <div className="d-flex justify-content-end align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            onClick={() => handleEdit(emp)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="View"
                            onClick={() => handleView(emp)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(emp.emp_id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isSearching && totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-end mt-2">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${page === currentPage ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5>
                    {mode === "add"
                      ? "Add New Employee"
                      : mode === "edit"
                      ? "Edit Employee"
                      : "View Employee"}
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    {/* First Name */}
                    <div className="col-md-6">
                      <label className="form-label">
                        First Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        readOnly={mode === "view"}
                        placeholder={errors.first_name || ""}
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">{errors.first_name}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        className="form-control"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        readOnly={mode === "view"}
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Email <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={mode === "edit" || mode === "view"}
                        placeholder={errors.email || ""}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    {/* Department */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Department <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        className={`form-select ${errors.department_code ? "is-invalid" : ""}`}
                        name="department_code"
                        value={formData.department_code}
                        onChange={handleInputChange}
                        disabled={mode === "view"}
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="FIN">Finance</option>
                        <option value="ENG">Engineering</option>
                        <option value="MKT">Marketing</option>
                        <option value="SALES">Sales</option>
                      </select>
                      {errors.department_code && (
                        <div className="invalid-feedback">
                          {errors.department_code}
                        </div>
                      )}
                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Role <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        className={`form-select ${errors.role ? "is-invalid" : ""}`}
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={mode === "view"}
                      >
                        <option value="">Select Role</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                      {errors.role && (
                        <div className="invalid-feedback">{errors.role}</div>
                      )}
                    </div>

                    {/* Designation */}
                    <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <input
                        className="form-control"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        readOnly={mode === "view"}
                      />
                    </div>

                    {/* Project */}
                    <div className="col-md-6">
                      <label className="form-label">Project Name</label>
                      <input
                        className="form-control"
                        name="project_name"
                        value={formData.project_name}
                        onChange={handleInputChange}
                        readOnly={mode === "view"}
                      />
                    </div>

                    {/* Joining Date */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Joining Date <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="date"
                          name="joining_date"
                          className={`form-control ${errors.joining_date ? "is-invalid" : ""}`}
                          value={
                            formData.joining_date
                              ? (() => {
                                  const parts = formData.joining_date.split("-");
                                  if (parts.length === 3 && parts[2].length === 4)
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                                  return formData.joining_date;
                                })()
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const [y, m, d] = val.split("-");
                              setFormData({
                                ...formData,
                                joining_date: `${d}-${m}-${y}`,
                              });
                            } else {
                              setFormData({ ...formData, joining_date: "" });
                            }
                            setErrors((prev) => ({ ...prev, joining_date: "" }));
                          }}
                          max={new Date().toISOString().split("T")[0]}
                          placeholder={errors.joining_date || "dd-mm-yyyy"}
                          readOnly={mode === "view"}
                        />
                        {errors.joining_date && (
                          <div className="invalid-feedback d-block">
                            {errors.joining_date}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manager */}
                    <div className="col-md-6">
                      <label className="form-label">Manager (Select)</label>
                      <select
                        className="form-select"
                        name="manager"
                        value={formData.manager}
                        onChange={handleInputChange}
                        disabled={mode === "view"}
                      >
                        <option value="">No Manager</option>
                        {managers.map((m) => (
                          <option key={m.emp_id} value={m.emp_id}>
                            {managerLabel(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  {mode !== "view" && (
                    <button className="btn btn-primary" onClick={handleSave}>
                      {mode === "add" ? "Save" : "Update"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255, 255, 255, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTables;