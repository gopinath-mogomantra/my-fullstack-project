
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";


const employeeDatabase = {
  1001: { name: "Anil", department: "Fullstack", manager: "Haritha" },
  1002: { name: "Gopi", department: "Backend", manager: "Haritha" },
  1003: { name: "Sandeep", department: "Database", manager: "Haritha" },
  1004: { name: "Srinivas", department: "Testing", manager: "Haritha" },
};


const performanceDatabase = {
  1001: {
    "Week 43 (Oct 20 - Oct 26)": {
      scores: {
        "Communication Skills": 80,
        "Multi Tasking Abilities": 75,
        "Team Skills": 85,
        "Technical Skills": 90,
        "Job Knowledge": 88,
        "Productivity": 86,
        "Creativity": 82,
        "Work Quality": 87,
        "Professionalism": 85,
        "Work Consistency": 83,
        "Attitude": 90,
        "Cooperation": 92,
        "Dependability": 89,
        "Attendance": 100,
        "Punctuality": 98,
      },
      comments: {
        "Communication Skills": "Clear and concise",
        "Multi Tasking Abilities": "Handles tasks well",
        "Team Skills": "Very cooperative",
        "Technical Skills": "Excellent problem solver",
        "Job Knowledge": "Good understanding",
        "Productivity": "Meets targets",
        "Creativity": "Innovative ideas",
        "Work Quality": "High standard",
        "Professionalism": "Maintains decorum",
        "Work Consistency": "Reliable output",
        "Attitude": "Positive and proactive",
        "Cooperation": "Supports team members",
        "Dependability": "Trustworthy",
        "Attendance": "Always present",
        "Punctuality": "Always on time",
      },
    },
    "Week 42 (Oct 13 - Oct 19)": {
      scores: {
        "Communication Skills": 75,
        "Multi Tasking Abilities": 72,
        "Team Skills": 80,
        "Technical Skills": 85,
        "Job Knowledge": 82,
        "Productivity": 80,
        "Creativity": 78,
        "Work Quality": 81,
        "Professionalism": 83,
        "Work Consistency": 79,
        "Attitude": 88,
        "Cooperation": 89,
        "Dependability": 85,
        "Attendance": 98,
        "Punctuality": 95,
      },
      comments: {
        "Communication Skills": "Improve",
        "Multi Tasking Abilities": "Handles pressure better",
        "Team Skills": "Good support",
        "Technical Skills": "Learning advanced concepts",
        "Job Knowledge": "Good",
        "Productivity": "Acceptable level",
        "Creativity": "Good",
        "Work Quality": "Decent work",
        "Professionalism": "Good ",
        "Work Consistency": "Stable",
        "Attitude": "Good team player",
        "Cooperation": "Helpful",
        "Dependability": "Reliable",
        "Attendance": "Very regular",
        "Punctuality": "Usually on time",
      },
    },
  },
};


const measurementFields = [
  "Communication Skills",
  "Multi Tasking Abilities",
  "Team Skills",
  "Technical Skills",
  "Job Knowledge",
  "Productivity",
  "Creativity",
  "Work Quality",
  "Professionalism",
  "Work Consistency",
  "Attitude",
  "Cooperation",
  "Dependability",
  "Attendance",
  "Punctuality",
];

const ViewPerformance = () => {
  const location = useLocation();
  const employeeId = location.state?.employeeId || 1001;

  const [employeeInfo, setEmployeeInfo] = useState({
    name: "",
    department: "",
    manager: "",
  });
  const [selectedWeek, setSelectedWeek] = useState("");
  const [performanceData, setPerformanceData] = useState({
    scores: {},
    comments: {},
  });

  useEffect(() => {
    const emp = employeeDatabase[employeeId];
    if (emp) setEmployeeInfo(emp);

    const empPerf = performanceDatabase[employeeId];
    if (empPerf) {
      const allWeeks = Object.keys(empPerf);
      const latestWeek = allWeeks[allWeeks.length - 1];
      setSelectedWeek(latestWeek);
      setPerformanceData(empPerf[latestWeek]);
    }
  }, [employeeId]);

  const handleWeekChange = (e) => {
    const week = e.target.value;
    setSelectedWeek(week);
    setPerformanceData(performanceDatabase[employeeId][week]);
  };

  
  const chartData = measurementFields.map((field) => ({
    name: field,
    score: performanceData.scores[field] ?? 0,
  }));

  
  const sortedMetrics = [...chartData].sort((a, b) => b.score - a.score);
  const top3 = sortedMetrics.slice(0, 3);
  const bottom3 = sortedMetrics.slice(-3);

  const totalScore = chartData.reduce((sum, item) => sum + item.score, 0);

  return (
    <div className="container mt-2">
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>DASHBOARD</h5>
        <div style={{ width: "250px" }}>
          <select
            className="form-select"
            value={selectedWeek}
            onChange={handleWeekChange}
          >
            {Object.keys(performanceDatabase[employeeId]).map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </div>
      </div>

      
      <div className="card mb-3 p-3">
        <div className="row">
          <div className="col-md-4">
            <label className="fw-bold">Employee Name:</label>
            <p>{employeeInfo.name}</p>
          </div>
          <div className="col-md-4">
            <label className="fw-bold">Department:</label>
            <p>{employeeInfo.department}</p>
          </div>
          <div className="col-md-4">
            <label className="fw-bold">Manager:</label>
            <p>{employeeInfo.manager}</p>
          </div>
        </div>
      </div>

      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-success shadow-sm">
            <div className="card-header bg-success text-white fw-bold">
              Top 3 Performance 
            </div>
            <ul className="list-group list-group-flush">
              {top3.map((m, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between">
                  <span>{m.name}</span>
                  <span className="fw-bold">{m.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-danger shadow-sm">
            <div className="card-header bg-danger text-white fw-bold">
              Bottom 3 Performance 
            </div>
            <ul className="list-group list-group-flush">
              {bottom3.map((m, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between">
                  <span>{m.name}</span>
                  <span className="fw-bold">{m.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      
      <div className="card p-3 mb-4 shadow-sm">
        <h6 className="fw-bold mb-3 text-center">Weekly Performance Overview</h6>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#0d6efd" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="score" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      
      <div className="table-responsive">
        <table className="table table-bordered align-middle text-start">
          <thead className="table-primary">
            <tr>
              <th>Measurement</th>
              <th>Score</th>
              <th>Comments/Remarks</th>
            </tr>
          </thead>
          <tbody>
            {measurementFields.map((field, index) => (
              <tr key={index}>
                <td className="text-start fw-bold">{field}</td>
                <td>{performanceData.scores[field] ?? "-"}</td>
                <td>{performanceData.comments[field] ?? "-"}</td>
              </tr>
            ))}
            <tr className="fw-bold table-secondary">
              <td>Total Score</td>
              <td>{totalScore}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewPerformance;
