import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownHeader,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
  CBadge,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilBell,
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
} from "@coreui/icons";
import { AppBreadcrumb } from "./index";
import { AppHeaderDropdown } from "./header/index";

const AppHeader = () => {
  const headerRef = useRef();
  const { colorMode, setColorMode } = useColorModes(
    "coreui-free-react-admin-template-theme"
  );

  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);

  // ✅ Example role check — replace with your real logic
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || "employee"
  );

  // ✅ Dummy notifications
  const [notifications, setNotifications] = useState([
    "Weekly report updated",
    "Manager added a comment",
    "Goal progress: 90%",
  ]);

  useEffect(() => {
    document.addEventListener("scroll", () => {
      headerRef.current &&
        headerRef.current.classList.toggle(
          "shadow-sm",
          document.documentElement.scrollTop > 0
        );
    });
  }, []);

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        {/* Sidebar toggle button */}
        <CHeaderToggler
          onClick={() => dispatch({ type: "set", sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: "-14px" }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="ms-auto">
          {/* 🔔 Notification Bell — only for employee */}
          {userRole === "employee" && (
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                <div style={{ position: "relative" }}>
                  <CIcon icon={cilBell} size="lg" />
                  {notifications.length > 0 && (
                    <CBadge
                      color="danger"
                      position="top-end"
                      shape="rounded-pill"
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-8px",
                        fontSize: "0.6rem",
                      }}
                    >
                      {notifications.length}
                    </CBadge>
                  )}
                </div>
              </CDropdownToggle>
              <CDropdownMenu className="pt-0">
                <CDropdownHeader>Notifications</CDropdownHeader>
                {notifications.length > 0 ? (
                  notifications.map((note, index) => (
                    <CDropdownItem key={index}>{note}</CDropdownItem>
                  ))
                ) : (
                  <CDropdownItem disabled>No new notifications</CDropdownItem>
                )}
              </CDropdownMenu>
            </CDropdown>
          )}

          {/* Divider */}
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          {/* 🌙 Theme toggle dropdown */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === "dark" ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === "auto" ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === "light"}
                as="button"
                onClick={() => setColorMode("light")}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === "dark"}
                as="button"
                onClick={() => setColorMode("dark")}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === "auto"}
                as="button"
                onClick={() => setColorMode("auto")}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          {/* 👤 Profile dropdown */}
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  );
};

export default AppHeader;
