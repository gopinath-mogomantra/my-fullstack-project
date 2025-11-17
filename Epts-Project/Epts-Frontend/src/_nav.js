import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
 
// ✅ Get role from localStorage
const role = localStorage.getItem("role");
 
// ✅ Filter logic (DO NOT MODIFY STRUCTURE)
let _nav = [
  {
    component: CNavGroup,
    name: 'Admin',
    to: '',
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: 'Employee',
        to: '',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Employee details',
            to: '/base/employeedetails',
          },
          {
            component: CNavItem,
            name: 'Employee Performance ',
            to: '/base/employeeperformance',
          },
          {
            component: CNavItem,
            name: 'Employee credentials',
            to: '/base/cards',
          },
        ],
      },
      {
        component: CNavItem,
        name: 'Reports',
        to: '/buttons',
        icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      },
    ],
  },
 
  {
    component: CNavItem,
    name: 'Login',
    to: '/login',
  },
 
  {
    component: CNavGroup,
    name: 'Employee',
    to: "",
    items: [
      {
        component: CNavGroup,
        name: 'Employee Module',
        to: '',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Employee Dashboard',
            to: '/base/collapses',
          },
          {
            component: CNavItem,
            name: 'Employee Performance ',
            to: '/base/carousels',
          },
        ],
      },
    ],
  },
];
 
// ✅ Role-based filtering (without breaking alignment)
if (role === "admin") {
  // ✅ Admin can see everything except Login
  _nav = _nav.filter(item => item.name !== "Login");
}
 
if (role === "manager") {
  // ✅ Manager can see Admin group
  // ✅ Hide Employee Module group
  _nav = _nav.filter(item => item.name !== "Login");
}
 
if (role === "employee") {
  // ✅ Employee sees ONLY Employee group
  _nav = _nav.filter(item => item.name === "Employee" || item.name === "Login");
}
 
export default _nav;