// /src/pages/Login.tsx

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthInput } from "@/components/AuthInput";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    console.log("Login attempted with:", { email, password });
    login();
    navigate('/dashboard');
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    login();
    navigate('/dashboard');
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account</p>
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
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <AuthInput
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordToggle
              />
            </motion.div>

            <motion.div
              custom={3}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="pt-2"
            >
              <AuthButton
                label="Login"
                onClick={handleLogin}
                variant="primary"
                type="submit"
              />
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div
            custom={4}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </motion.div>

          {/* Google Button */}
          <motion.div
            custom={5}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <AuthButton
              label="Continue with Google"
              onClick={handleGoogleLogin}
              variant="secondary"
              icon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            custom={6}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-sm">
              New here?{" "}
              <a
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Register
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
