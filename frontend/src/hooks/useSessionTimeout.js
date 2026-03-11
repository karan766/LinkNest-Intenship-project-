import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "./useLogout";
import useShowToast from "./useShowToast";

const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiry

const useSessionTimeout = () => {
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const showToast = useShowToast();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const loginTimeRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Clear timeouts if user logs out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Get or set login time
    const storedLoginTime = localStorage.getItem("session_start_time");
    const loginTime = storedLoginTime ? parseInt(storedLoginTime) : Date.now();
    
    if (!storedLoginTime) {
      localStorage.setItem("session_start_time", loginTime.toString());
    }
    
    loginTimeRef.current = loginTime;

    // Calculate remaining time
    const elapsed = Date.now() - loginTime;
    const remaining = SESSION_DURATION - elapsed;

    // If session already expired, logout immediately
    if (remaining <= 0) {
      showToast("Session Expired", "Your session has expired. Please login again.", "warning");
      logout();
      return;
    }

    // Set warning timeout (5 minutes before expiry)
    const warningTime = remaining - WARNING_TIME;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showToast(
          "Session Expiring Soon",
          "Your session will expire in 5 minutes. Please save your work.",
          "warning"
        );
      }, warningTime);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      showToast("Session Expired", "Your session has expired. Please login again.", "info");
      localStorage.removeItem("session_start_time");
      logout();
    }, remaining);

    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user, logout, showToast]);

  // Activity listener to extend session on user activity
  useEffect(() => {
    if (!user) return;

    const resetSessionTimer = () => {
      const loginTime = loginTimeRef.current || Date.now();
      const elapsed = Date.now() - loginTime;
      
      // Only reset if less than 12 hours have passed
      if (elapsed < SESSION_DURATION) {
        // Clear existing timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        const remaining = SESSION_DURATION - elapsed;

        // Set new warning timeout
        const warningTime = remaining - WARNING_TIME;
        if (warningTime > 0) {
          warningTimeoutRef.current = setTimeout(() => {
            showToast(
              "Session Expiring Soon",
              "Your session will expire in 5 minutes.",
              "warning"
            );
          }, warningTime);
        }

        // Set new logout timeout
        timeoutRef.current = setTimeout(() => {
          showToast("Session Expired", "Your session has expired. Please login again.", "info");
          localStorage.removeItem("session_start_time");
          logout();
        }, remaining);
      }
    };

    // Listen for user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetSessionTimer);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetSessionTimer);
      });
    };
  }, [user, logout, showToast]);
};

export default useSessionTimeout;
