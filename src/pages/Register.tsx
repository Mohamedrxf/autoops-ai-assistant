// /src/pages/Register.tsx

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthInput } from "@/components/AuthInput";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = () => {
    console.log("Register attempted with:", {
      name,
      email,
      password,
      confirmPassword,
    });
    login();
    navigate("/dashboard");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-20"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <motion.div className="bg-slate-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <motion.div
            custom={0}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">Join us today</p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4 mb-6"
          >
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <AuthInput
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </motion.div>

            <motion.div
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <AuthInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div
              custom={3}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <AuthInput
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordToggle
              />
            </motion.div>

            <motion.div
              custom={4}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <AuthInput
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPasswordToggle
              />
            </motion.div>

            <motion.div
              custom={5}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="pt-2"
            >
              <AuthButton
                label="Register"
                onClick={handleRegister}
                variant="primary"
                type="submit"
              />
            </motion.div>
          </motion.form>

          {/* Footer */}
          <motion.div
            custom={6}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Login
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
