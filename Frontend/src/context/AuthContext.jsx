import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API = process.env.REACT_APP_API_URL;

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      axios
        .get(`${API}/api/auth/me`, { withCredentials: true })
        .then((res) => {
          const loadedUser = {
            Role: res.data.role.charAt(0).toUpperCase() + res.data.role.slice(1).toLowerCase(),
          };
          localStorage.setItem("user", JSON.stringify(loadedUser));
          setUser(loadedUser);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, credentials, {
        withCredentials: true,
      });
  
      const { role, email, token, DoctorID, PatientID } = res.data;
      const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  
      const userData = {
        Role: normalizedRole,
        Email: email,
        DoctorID: DoctorID || null,
        PatientID: PatientID || null
      };
  
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("authToken", token);
      if (DoctorID) localStorage.setItem("DoctorID", DoctorID);
      if (PatientID) localStorage.setItem("PatientID", PatientID);
  
      setUser(userData);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };
  

  const logout = async () => {
    try {
      console.log("Logging out using:", `${API}/api/auth/logout`);
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};