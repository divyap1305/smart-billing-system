import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    setErrors({});
    
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email: email.trim() }
      );
      
      setMessage("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.message || "Failed to send OTP" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setErrors({});
    
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    
    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email: email.trim(), otp }
      );
      
      setMessage("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setErrors({ 
        otp: err.response?.data?.message || "Invalid OTP" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setErrors({});
    
    if (!newPassword) {
      setErrors({ newPassword: "New password is required" });
      return;
    }
    
    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { 
          email: email.trim(), 
          otp, 
          newPassword 
        }
      );
      
      alert("Password reset successful! Please login with your new password.");
      navigate("/");
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.message || "Failed to reset password" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email: email.trim() }
      );
      setMessage("New OTP sent to your email!");
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.message || "Failed to resend OTP" 
      });
    } finally {
      setIsLoading(false);
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
        boxSizing: "border-box"
      }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            SM
          </div>
          <h2 style={{ margin: "0", color: "#333" }}>Selvam Motors</h2>
          <p style={{ margin: "5px 0 0", color: "#666" }}>
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
          position: "relative"
        }}>
          <div style={{
            width: "100%",
            height: "2px",
            background: "#e0e0e0",
            position: "absolute",
            top: "15px",
            zIndex: 1
          }} />
          <div style={{
            width: step >= 2 ? "50%" : step > 1 ? "100%" : "0%",
            height: "2px",
            background: "#667eea",
            position: "absolute",
            top: "15px",
            zIndex: 2,
            transition: "width 0.3s ease"
          }} />
          
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: s <= step ? "#667eea" : "#e0e0e0",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {s}
            </div>
          ))}
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            padding: "10px",
            background: "#d4edda",
            color: "#155724",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}

        {/* Error Display */}
        {errors.general && (
          <div style={{
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {errors.general}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <>
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
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: `2px solid ${errors.email ? '#ff4444' : '#e0e0e0'}`,
                  borderRadius: "10px",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                disabled={isLoading}
              />
              {errors.email && (
                <p style={{ color: "#ff4444", fontSize: "12px", margin: "5px 0 0" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              style={{
                padding: "14px",
                width: "100%",
                background: isLoading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                borderRadius: "10px",
                marginBottom: "15px",
                transition: "all 0.3s ease"
              }}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                color: "#555",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: `2px solid ${errors.otp ? '#ff4444' : '#e0e0e0'}`,
                  borderRadius: "10px",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                  letterSpacing: "5px"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                disabled={isLoading}
              />
              {errors.otp && (
                <p style={{ color: "#ff4444", fontSize: "12px", margin: "5px 0 0" }}>
                  {errors.otp}
                </p>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              style={{
                padding: "14px",
                width: "100%",
                background: isLoading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                borderRadius: "10px",
                marginBottom: "10px"
              }}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontSize: "14px",
                  textDecoration: "underline"
                }}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                color: "#555",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 45px 12px 15px",
                    border: `2px solid ${errors.newPassword ? '#ff4444' : '#e0e0e0'}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  disabled={isLoading}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px"
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.newPassword && (
                <p style={{ color: "#ff4444", fontSize: "12px", margin: "5px 0 0" }}>
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                color: "#555",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: `2px solid ${errors.confirmPassword ? '#ff4444' : '#e0e0e0'}`,
                  borderRadius: "10px",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p style={{ color: "#ff4444", fontSize: "12px", margin: "5px 0 0" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div style={{
              marginBottom: "20px",
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
              </ul>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              style={{
                padding: "14px",
                width: "100%",
                background: isLoading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                borderRadius: "10px"
              }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* Back to Login Link */}
        <div style={{
          marginTop: "20px",
          textAlign: "center"
        }}>
            <button
            onClick={() => navigate("/")}
            style={{
                color: "#667eea",
                textDecoration: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px"
            }}
            >
                ← Back to Login
            </button>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;