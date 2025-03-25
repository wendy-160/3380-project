import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  // Load user from localStorage or API
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUser({ role: storedRole });
    } else {
      axios
        .get("http://localhost:5000/api/auth/me", { withCredentials: true })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);


  // Login function
  const login = async (credentials) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials, {
        withCredentials: true,
      });
      console.log("Login Response:", res.data);

      const { role, token } = res.data;

      if (!role) {
        throw new Error("Invalid login response: Role is missing");
      }

      localStorage.setItem("userRole", role);
      localStorage.setItem("authToken", token);

      setUser({ role });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    localStorage.removeItem("userRole"); // Clear localStorage
    window.location.reload(); // Refresh to update UI
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
