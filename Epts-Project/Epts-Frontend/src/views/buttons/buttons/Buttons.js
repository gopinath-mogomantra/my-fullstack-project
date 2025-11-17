import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Bar } from "react-chartjs-2";
import axiosInstance from "../../../utils/axiosInstance";


function DynamicPerformanceReport() {
  const [reportType, setReportType] = useState("weekly");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedWeek2, setSelectedWeek2] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const reportRef = useRef(null);
 
  const API_BASE = {
    weekly: "reports/weekly/",
    manager: "reports/manager/",
    department: "reports/department/"
  };

 
 
  useEffect(() => {
    fetchReport("weekly");
  }, []);

  const parseWeek = (weekValue) => {
    // weekValue = "2025-W46"
    if (!weekValue || !weekValue.includes("-W")) return { year: null, week: null };

    const [year, weekStr] = weekValue.split("-W");
    return { year: parseInt(year), week: parseInt(weekStr) };
  };

 
  const fetchReport = async (type, manager = "", department = "", week = "", year = "") => {
    try {
      setLoading(true);
      setError("");
 
      const params = {};
      if (manager) params.manager = manager;
      if (department) params.department = department;
      if (week) params.week = week;
      if (year) params.year = year;
 
      const res = await axiosInstance.get(API_BASE[type], { params });
      const data = res.data;

      // If backend returned a message or empty data → show no rows
      if (!data.records || !Array.isArray(data.records)) {
        setFilteredData([]);
        setLoading(false);
        return;
      }

      const ranked = generateRankedData(data.records);

      const normalized = ranked.map((item) => ({
        id: item.id || item.emp_id || "-",
        name: item.name || item.full_name || "-",
        department: item.department || item.department_name || "-",
        manager: item.manager || item.manager_name || "-",
        score: item.score ?? item.total_score ?? item.avg_score ?? 0,
        rank: item.rank ?? "-",
      }));



      setFilteredData(normalized);

 
    } catch (err) {
      setError("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };
 
  const generateRankedData = (data) => {
    let sorted = [...data].sort(
      (a, b) =>
        (b.total_score ?? b.avg_score ?? 0) -
        (a.total_score ?? a.avg_score ?? 0)
    );

    let ranked = [];
    let lastScore = null;
    let lastRank = 0;

    sorted.forEach((emp, index) => {
      const currentScore = emp.total_score ?? emp.avg_score ?? 0;

      if (currentScore === lastScore) {
        ranked.push({ ...emp, score: currentScore, rank: lastRank });
      } else {
        lastScore = currentScore;
        lastRank = emp.rank ?? index + 1;
        ranked.push({ ...emp, score: currentScore, rank: lastRank });
      }
    });

    return ranked;
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
 
    if (!selectedWeek2) {
      alert("Please select week");
      return;
    }
 
    const { year, week } = parseWeek(selectedWeek2);

    if (reportType === "manager")
      fetchReport("manager", selectedOption, "", week, year);
    else if (reportType === "department")
      fetchReport("department", "", selectedOption, week, year);
    else
      fetchReport("weekly", "", "", week, year);
  };


 
  const exportExcel = async (rows, filename = "report.xlsx") => {
    if (!rows.length) return alert("No data to export");
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };
 
  const handlePrint = async () => {
    if (!reportRef.current) return alert("Nothing to print");
    setIsPrinting(true);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    const content = reportRef.current.innerHTML;
    printWindow.document.write(`<html><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.print();
    setIsPrinting(false);
  };
 
  const reportTitleMap = {
    weekly: "Weekly Report",
    manager: "Manager Wise Report",
    department: "Department Wise Report",
  };
 
  return (
    <div className="container py-4">
      <h5 className="fw-bold mb-4 text-dark">EMPLOYEE PERFORMANCE REPORTS</h5>
 
      <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-3 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <label className="fw-semibold me-2">Select Report Type:</label>
          {["weekly", "manager", "department"].map((type) => (
            <div key={type} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="reportType"
                id={`type-${type}`}
                value={type}
                checked={reportType === type}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setSelectedOption("");
                  setSelectedWeek2("");
                }}
              />
              <label className="form-check-label text-capitalize">
                {reportTitleMap[type]}
              </label>
            </div>
          ))}
        </div>
 
        <div className="row align-items-end mt-4">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Select Week:</label>
            <input
              type="week"
              className="form-control"
              value={selectedWeek2}
              onChange={(e) => setSelectedWeek2(e.target.value)}
            />
          </div>
 
          {(reportType === "manager" || reportType === "department") && (
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                {reportType === "manager" ? "Select Manager:" : "Select Department:"}
              </label>
              <input
                type="text"
                className="form-control"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                placeholder={`Enter ${reportType}`}
              />
            </div>
          )}
 
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>
          </div>
        </div>
      </form>
 
      {loading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}
 
      {!loading && filteredData.length > 0 && (
        <div ref={reportRef}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">
              📋 {reportTitleMap[reportType]}{" "}
              {selectedWeek2 && `(${selectedWeek2})`}
            </h6>
            <div className="d-flex gap-3">
              <i
                className="bi bi-file-earmark-excel text-success fs-4"
                role="button"
                title="Export Excel"
                onClick={() => exportExcel(filteredData, "report.xlsx")}
              ></i>
              <i
                className={`bi bi-printer fs-4 ${
                  isPrinting ? "text-secondary" : "text-primary"
                }`}
                role="button"
                title="Print Report"
                onClick={handlePrint}
              ></i>
            </div>
          </div>
 
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Score</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.manager}</td>
                    <td>{emp.score}</td>
                    <td>{emp.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
        </div>
      )}
    </div>
  );
}

export default DynamicPerformanceReport;