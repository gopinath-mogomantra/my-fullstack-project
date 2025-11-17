import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";


function getAllowedWeeks() {
  const today = new Date();

  // Get current ISO week and year
  const currentYear = today.getFullYear();
  const currentWeek = Number(
    today.toLocaleDateString("en-GB", { week: "numeric", year: "numeric" })
  );

  // Previous week handling
  let prevWeek = currentWeek - 1;
  let prevYear = currentYear;

  // If current week is 1 → previous week is last week of last year
  if (prevWeek === 0) {
    prevWeek = 52;
    prevYear = currentYear - 1;
  }

  return {
    min: `${prevYear}-W${String(prevWeek).padStart(2, "0")}`,
    max: `${currentYear}-W${String(currentWeek).padStart(2, "0")}`,
  };
}

 
function EmployeePerformance() {
  const allowed = getAllowedWeeks();
  const navigate = useNavigate();
  const location = useLocation();

  const [week, setWeek] = useState("");

  // Auto-load latest week from backend on page load
  useEffect(() => {
    const fetchLatestWeek = async () => {
      try {
        const res = await axiosInstance.get("/performance/latest-week/");

        if (res.data.week && res.data.year) {
          const formatted = `${res.data.year}-W${String(res.data.week).padStart(2, "0")}`;

          setWeek(formatted);  // Auto-select latest week
          setPage(1);          // Reset pagination
        }
      } catch (error) {
        console.error("Error loading latest week:", error);
      }
    };

    fetchLatestWeek();
  }, []);

  const [employees, setEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

 
  // Reset to page 1 every time you navigate back to this screen
  useEffect(() => {
    setPage(1);
  }, [location.key]);

  // Fetch Performance Data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);

      try {
        let url = "http://127.0.0.1:8000/api/performance/summary/";

        if (week && week.includes("-W")) {
            let [year, weekNumber] = week.split("-W");

            year = parseInt(year);
            weekNumber = parseInt(weekNumber);

            // Only append when both are valid
            if (!isNaN(year) && !isNaN(weekNumber)) {
                url += `?week=${weekNumber}&year=${year}`;
            }
        }

        let paginatedUrl = `${url}${url.includes("?") ? "&" : "?"}page=${page}&page_size=${pageSize}`;
        const response = await axiosInstance.get(paginatedUrl);

        const backend = response.data;

        let finalRecords = [];

        // DRF Paginated Response → results: { evaluation_period, records }
        if (backend.results?.records) {
            finalRecords = backend.results.records;
        }
        // Fallback
        else if (backend.records) {
            finalRecords = backend.records;
        }



        console.log("Extracted Records:", finalRecords);

        setEmployees(finalRecords);
        setTotalPages(Math.ceil(backend.count / pageSize));


      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [week, page, location.key]);

 
  //Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sorted = [...employees].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setEmployees(sorted);
    setSortConfig({ key, direction });
  };
 
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "";
  };
 
  const handleNavigate = (emp, mode) => {
    const evalId = emp.evaluation_id;

    if (!evalId) {
      alert("No evaluation ID found for this record.");
      return;
    }

    navigate("/theme/performancemetrics", {
      state: {
        employee: emp,
        mode,
        evaluation_id: evalId,
        selectedWeek: week   // 🔥 PASS SELECTED WEEK TO NEXT PAGE
      }
    });
  };

 
  // Search filter
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.emp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  return (
    <div className="container">
      <div className="text-dark">
        <h5>PERFORMANCE DETAILS</h5>
      </div>
 
      <div className="card shadow-sm">
        <div className="card-body p-3">

          {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex justify-content-start">
              <input
                type="text"
                className="form-control w-25 me-3"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <input
                type="week"
                className="form-control w-auto me-3"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                title="Select Week"
                min={allowed.min}
                max={allowed.max}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/theme/performancemetrics")}
            >
              <i className="bi bi-plus-circle me-2" /> Add Performance
            </button>
          </div>
 
          {/* Table */}
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th onClick={() => handleSort("emp_id")} style={{ cursor: "pointer" }}>
                    Emp ID {getSortIcon("emp_id")}
                  </th>
                  <th onClick={() => handleSort("full_name")} style={{ cursor: "pointer" }}>
                    Full Name {getSortIcon("full_name")}
                  </th>
                  <th>Department</th>
                  <th onClick={() => handleSort("total_score")} style={{ cursor: "pointer" }}>
                    Score {getSortIcon("total_score")}
                  </th>
                  <th>Evaluation Period</th>
                  <th onClick={() => handleSort("rank")} style={{ cursor: "pointer" }}>
                    Rank {getSortIcon("rank")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="d-flex justify-content-center">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                          style={{ width: "3rem", height: "3rem" }}
                        ></div>
                      </div>
                      <div className="mt-2 fw-bold text-primary">Loading records...</div>
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.evaluation_id}>
                      <td>{emp.emp_id}</td>
                      <td>{emp.full_name}</td>
                      <td>{emp.department_name}</td>
                      <td>{emp.total_score}</td>
                      <td>{emp.evaluation_period || "-"}</td>
                      <td>{emp.rank || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          title="Edit"
                          onClick={() => handleNavigate(emp, "edit")}
                        >
                          <i className="bi bi-pencil-square text-white"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          title="View"
                          onClick={() => handleNavigate(emp, "view")}
                        >
                          <i className="bi bi-eye text-white"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
 
                  <tr>
                    <td colSpan="7" className="text-center">
                      No performance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION START*/}
            <div className="d-flex justify-content-end mt-3">
              <nav>
                <ul className="pagination">

                  {/* Prev */}
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>
                      Prev
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {[...Array(totalPages).keys()].map((num) => {
                    const pageNum = num + 1;
                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${page === pageNum ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setPage(pageNum)}>
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  {/* Next */}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </li>

                </ul>
              </nav>
            </div>
            {/* PAGINATION END */}

          </div>

        </div>
      </div>
    </div>
  );
}
 
export default EmployeePerformance;