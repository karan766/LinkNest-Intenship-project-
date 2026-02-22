import userAtom from "../atoms/userAtom";
import { useSetRecoilState } from "recoil";
import useShowToast from "./useShowToast";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
	const setUser = useSetRecoilState(userAtom);
	const showToast = useShowToast();
	const navigate = useNavigate();

	const logout = async () => {
		try {
			// Immediately clear user state to prevent UI issues
			setUser(null);
			
			// Clear localStorage immediately
			localStorage.removeItem("user-threads");
			
			// Try to call logout API, but don't block on it
			const logoutPromise = fetch("/api/users/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}).catch(error => {
				console.warn("Logout API call failed:", error);
				// Don't throw error, just log it
			});

			// Navigate immediately
			navigate("/auth", { replace: true });
			
			// Wait for API call to complete (with timeout)
			const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
			await Promise.race([logoutPromise, timeoutPromise]);
			
			showToast("Success", "Logged out successfully", "success");
		} catch (error) {
			// Even if there's an error, ensure user is logged out
			setUser(null);
			localStorage.removeItem("user-threads");
			navigate("/auth", { replace: true });
			
			console.error("Logout error:", error);
			showToast("Warning", "Logged out (with errors)", "warning");
		}
	};

	return logout;
};

export default useLogout;
