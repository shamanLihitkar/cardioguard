import React, { useState } from 'react';
import './ForgotPassword.css';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // step: 1 (Email), 2 (OTP), 3 (New Password)
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false);
    const role=localStorage.getItem("type");
    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/get-otp', { email ,role});
            setStep(2);
        } catch (error) {
            alert(error.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
            setStep(3); // Move to password reset fields
        } catch (error) {
            alert(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Update Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/reset-password', {
                email,
                password,
                role
            });
            console.log(res.data.message);
            if(res.data.message=="Success"){
                alert("Password reset successful! You can now login.");
                localStorage.removeItem("type");
               if(role=="user"){
                 window.location.href = "/auth"; // Redirect to login
               }else if(role=="hospital"){
                 window.location.href = "/hospital/login"; // Redirect to login
                }else{
                   window.location.href = "/admin/login"; // Redirect to login

               }

            }else{
                alert("Error changing the password please try again!");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <h1>
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Set New Password"}
                    </h1>
                </div>

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form className="forgot-password-form" onSubmit={handleSendOtp}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <button type="submit" className="reset-button" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Form */}
                {step === 2 && (
                    <form className="forgot-password-form" onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <label>Enter OTP</label>
                            <input
                                type="number"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="4-digit code"
                                required
                            />
                        </div>
                        <button type="submit" className="reset-button" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password Form */}
                {step === 3 && (
                    <form className="forgot-password-form" onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>
                        <button type="submit" className="reset-button" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                <div className="forgot-password-footer">
                    <a href="/" className="back-link">← Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;