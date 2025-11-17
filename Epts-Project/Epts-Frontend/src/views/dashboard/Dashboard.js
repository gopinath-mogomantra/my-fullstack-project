import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function PerformanceDashboard() {
  const employees = [
    { id: 1, name: "Anil", department: "Frontend", score: 88 },
    { id: 2, name: "Haritha", department: "UI/UX", score: 91 },
    { id: 3, name: "Gopi", department: "Backend", score: 65 },
    { id: 4, name: "Sandeep", department: "Database", score: 70 },
    { id: 5, name: "Srinivas", department: "Testing", score: 92 },
    { id: 6, name: "Kiran", department: "UI/UX", score: 80 },
    { id: 7, name: "Ravi", department: "Backend", score: 60 },
    { id: 8, name: "Divya", department: "Frontend", score: 90 },
    { id: 9, name: "Pavan", department: "DevOps", score: 55 },
    { id: 10, name: "Manoj", department: "QA", score: 88 },
  ];

  const sortedEmployees = [...employees].sort((a, b) => b.score - a.score);
  const topPerformers = sortedEmployees.slice(0, 3);
  const lowPerformers = sortedEmployees.slice(-3);

  const chartData = {
    labels: employees.map((e) => e.name),
    datasets: [
      {
        label: "Weekly Performance Score",
        data: employees.map((e) => e.score),
        backgroundColor: employees.map((e) =>
          topPerformers.some((p) => p.id === e.id)
            ? "green"
            : lowPerformers.some((p) => p.id === e.id)
              ? "red"
              : "rgba(0, 123, 255, 0.6)"
        ),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <div >
      <div className=" text-dark">
        <h5 className="">DASHBOARD</h5>
      </div>
      <div className="row">
        <div className="col-md-7">
        <div className="card">
         
          <div className=" card-header text-white bg-info fw-bold mb-5">
          <h5>📈 Weekly Performance Chart</h5>
        </div>
          <Bar data={chartData} options={chartOptions} className="mb-5" />
        </div>
       
      </div>
       <div className="col-md-5">
          <div className="card shadow-sm border-success mb-3">
            <div className="card-header bg-success text-white fw-bold">
              <h5>🏆 Top 3 Performers</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm table-bordered text-center mb-0">
                <thead className="table-success">
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.department}</td>
                      <td className="fw-bold">{emp.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card shadow-sm border-danger">
            <div className="card-header bg-danger text-white fw-bold">
              <h5>😞 Bottom 3 Performers</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm table-bordered text-center mb-0">
                <thead className="table-danger">
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {lowPerformers.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.department}</td>
                      <td className="fw-bold">{emp.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <div className=" card mt-5">
        <div className=" card-header text-white bg-info fw-bold mb-3">
          <h5>📊 All Employee Performance</h5>
        </div>
        <div className="p-2">
          <table className="table table-bordered table-striped text-center ">
          <thead className="table-dark">
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Score</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((emp, index) => (
              <tr
                key={emp.id}
                className={
                  topPerformers.some((p) => p.id === emp.id)
                    ? "table-success"
                    : lowPerformers.some((p) => p.id === emp.id)
                      ? "table-danger"
                      : ""
                }
              >
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.score}</td>
                <td>{index + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>


  );
}

export default PerformanceDashboard;
