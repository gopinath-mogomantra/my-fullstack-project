import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
 
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
 
import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
 
import { sygnet } from 'src/assets/brand/sygnet'
 
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
 
 
  const role = localStorage.getItem("role")
 
 
 const filterNavigation = (items) => {
  return items
    .map((item) => {
 
     
      if (role === "admin") {
        if (item.name === "Employee") {
         
          const employeeModule = item.items?.some(
            (x) => x.name === "Employee Module"
          );
          if (employeeModule) return null;
          return item;
        }
        return item;
      }
 
     
      if (role === "manager") {
        if (item.name === "Admin") {
          const allowedAdminItems = item.items.map((inner) => {
            if (inner.name === "Employee") {
              const filteredEmployeeItems = inner.items.filter(
                (x) => x.name !== "Employee credentials"
              );
              return { ...inner, items: filteredEmployeeItems };
            }
            return inner;
          });
          return { ...item, items: allowedAdminItems };
        }
 
       
        if (item.name === "Employee") {
          const employeeModule = item.items?.some(
            (x) => x.name === "Employee Module"
          );
          if (employeeModule) return null;
          return item;
        }
 
        return item;
      }
 
     
      if (role === "employee") {
        if (item.name === "Employee") return item;
        return null;
      }
 
      return item;
    })
    .filter(Boolean);
};
 
 
 
  const filteredNav = filterNavigation(navigation)
 
  return (
    <CSidebar
      className="border-end"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom bg-primary">
        <CSidebarBrand to="/">
          <img src="/images/logo.png" alt="Logo" height={50} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
 
 
      <AppSidebarNav items={filteredNav} />
    </CSidebar>
  )
}
 
export default React.memo(AppSidebar)