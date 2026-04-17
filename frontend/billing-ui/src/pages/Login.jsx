import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim(),
          password
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Store tokens and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Optional: store expiry time if your API returns it
      if (res.data.expiresIn) {
        const expiryTime = new Date().getTime() + res.data.expiresIn * 1000;
        localStorage.setItem("tokenExpiry", expiryTime);
      }

      // Show success message
      alert("Login Successful! Redirecting to dashboard...");
      
      // Navigate to dashboard
      navigate("/items");
    } catch (err) {
      let errorMessage = "Login Failed";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.response?.data?.message || "Invalid email or password";
      }
      
      alert(errorMessage);
      
      // Clear password field on error for security
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: 0,
      padding: 0
    }}>
      <div style={{
        padding: "40px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "400px",
        maxWidth: "90%",
        animation: "slideUp 0.5s ease",
        boxSizing: "border-box"
      }}>
        {/* Company Logo/Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            margin: "0 auto 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "32px",
            fontWeight: "bold"
          }}>
            SM
          </div>
          <h2 style={{ 
            margin: "0",
            color: "#333",
            fontSize: "24px",
            fontWeight: "600"
          }}>
            Selvam Motors
          </h2>
          <p style={{
            margin: "5px 0 0",
            color: "#666",
            fontSize: "14px"
          }}>
            Billing System
          </p>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            color: "#555",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: "" });
              }
            }}
            onKeyPress={handleKeyPress}
            style={{
              width: "100%",
              padding: "12px 15px",
              border: `2px solid ${errors.email ? '#ff4444' : '#e0e0e0'}`,
              borderRadius: "10px",
              fontSize: "15px",
              transition: "all 0.3s ease",
              outline: "none",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = "#e0e0e0";
              }
            }}
            disabled={isLoading}
          />
          {errors.email && (
            <p style={{
              margin: "5px 0 0",
              color: "#ff4444",
              fontSize: "12px"
            }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            color: "#555",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              onKeyPress={handleKeyPress}
              style={{
                width: "100%",
                padding: "12px 45px 12px 15px",
                border: `2px solid ${errors.password ? '#ff4444' : '#e0e0e0'}`,
                borderRadius: "10px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#667eea"/>
                  <circle cx="12" cy="12" r="3" fill="#667eea"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l1.83 1.83C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="#667eea"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p style={{
              margin: "5px 0 0",
              color: "#ff4444",
              fontSize: "12px"
            }}>
              {errors.password}
            </p>
          )}
        </div>
        
        {/* Password Requirements Hint - Updated */}
        <div style={{
          marginBottom: "25px",
          padding: "10px",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#666"
        }}>
          <p style={{ margin: "0 0 5px", fontWeight: "500" }}>
            Password requirements:
          </p>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            <li>Minimum 6 characters</li>
            <li style={{ color: "#28a745" }}>✓ Any characters allowed (letters, numbers, special characters)</li>
          </ul>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: isLoading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: isLoading ? "not-allowed" : "pointer",
            borderRadius: "10px",
            transition: "all 0.3s ease",
            boxShadow: isLoading ? "none" : "0 10px 20px rgba(102, 126, 234, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = "scale(1.02)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = "scale(1)";
            }
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Additional Links */}
        <div style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "14px",
          display: "flex",
          justifyContent: "center",
          gap: "20px"
        }}>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{
              color: "#667eea",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Forgot Password?
          </button>

          <button
            onClick={() => alert("Please contact your administrator for access.")}
            style={{
              color: "#667eea",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Need Help?
          </button>
        </div>

        {/* Version Info */}
        <p style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#999",
          fontSize: "12px"
        }}>
          Version 2.0 | Secure Login
        </p>
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}

export default Login;