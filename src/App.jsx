import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, ChevronDown } from "lucide-react";
import HomePage from "./components/Home";
import BorrowerPage from "./components/Borrower";
import LenderPage from "./components/lenders";

const WalletButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  // const handleConnect = () => {
  //   setIsConnected(true);
  // };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsOpen(false);
  };

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Wallet size={20} />
        <span>Connect Wallet</span>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium"
      >
        <Wallet size={20} />
        <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
        <ChevronDown size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
          >
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-emerald-600 text-white"
            : "text-emerald-800 hover:bg-emerald-100"
        }`}
      >
        {children}
      </motion.div>
    </Link>
  );
};

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text"
                >
                  DCS
                </motion.div>
                <span className="ml-2 text-sm text-emerald-600 font-medium hidden sm:block">
                  Decentralized Credit System
                </span>
              </Link>

              <div className="hidden md:flex items-center ml-10 space-x-4">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/borrower">Borrower</NavLink>
                <NavLink to="/lender">Lender</NavLink>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <WalletButton />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-emerald-100"
            >
              <div className="px-4 py-4 space-y-3">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/borrower">Borrower</NavLink>
                <NavLink to="/lender">Lender</NavLink>
                <div className="pt-2">
                  <WalletButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/borrower" element={<BorrowerPage />} />
          <Route path="/lender" element={<LenderPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;