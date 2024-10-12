import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Timer, 
  RefreshCw, 
  AlertCircle,
  ChevronUp,
  CreditCard,
  PiggyBank,
  BadgeCheck
} from 'lucide-react';
import { contractAddress, contractABI } from '../config/contractAddress';

const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-emerald-100 ${className}`}
  >
    {children}
  </motion.div>
);

const Button = ({ onClick, disabled, variant = 'primary', children, icon: Icon }) => {
  const baseStyle = "w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed";
  const variants = {
    primary: `${disabled ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`,
    secondary: `${disabled ? 'bg-gray-400' : 'bg-emerald-100 hover:bg-emerald-200'} text-emerald-800`,
    danger: `${disabled ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white`,
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {Icon && <Icon size={20} />}
      <span>{children}</span>
    </motion.button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'number', disabled }) => (
  <motion.input
    whileFocus={{ scale: 1.02 }}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-100"
  />
);

const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-2"
  >
    <AlertCircle size={20} />
    <span>{message}</span>
  </motion.div>
);

const BorrowerPage = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loanId, setLoanId] = useState('');
  const [creditScore, setCreditScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('Please install MetaMask to use this dApp');
        }
  
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log('Contract initialized:', contractInstance);
        setContract(contractInstance);
  
        window.ethereum.on('accountsChanged', (accounts) => {
          setUserAddress(accounts[0]);
          window.location.reload();
        });
        window.ethereum.on('chainChanged', () => window.location.reload());
  
      } catch (err) {
        setError(err.message || 'Failed to initialize contract connection');
        console.error(err);
      }
    };
  
    initializeContract();
  }, []);
  
  const handleRequestLoan = async () => {
    try {
      setLoading(true);
      setError('');

      if (!contract) throw new Error('Contract not initialized. Please try again.');
      if (!loanAmount || !loanDuration) throw new Error('Please fill in all fields');

      const amountInWei = ethers.parseEther(loanAmount);
      const durationInSeconds = parseInt(loanDuration) * 24 * 60 * 60;

      const tx = await contract.requestLoan(amountInWei, durationInSeconds);
      await tx.wait();

      setLoanAmount('');
      setLoanDuration('');
      alert('Loan request submitted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to request loan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    try {
      setLoading(true);
      setError('');

      if (!contract) throw new Error('Contract not initialized. Please try again.');
      if (!loanId) throw new Error('Please enter a loan ID');

      const tx = await contract.repayLoan(loanId);
      await tx.wait();

      setLoanId('');
      alert('Loan repaid successfully!');
    } catch (err) {
      setError(err.message || 'Failed to repay loan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCreditScore = async () => {
    try {
      setLoading(true);
      setError('');
  
      if (!contract) {
        throw new Error('Contract not initialized. Please try again.');
      }
  
      if (!userAddress) {
        throw new Error('User address not available. Please connect your wallet.');
      }
  
      const score = await contract.getCreditScore(userAddress);
      setCreditScore(score.toString());
    } catch (err) {
      setError(err.message || 'Failed to fetch credit score');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 p-4"
    >
      <motion.div
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        className="flex items-center space-x-4 mb-8"
      >
        <PiggyBank size={32} className="text-emerald-600" />
        <h2 className="text-3xl font-bold text-gray-900">Borrower Dashboard</h2>
      </motion.div>

      {error && <ErrorMessage message={error} />}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Request a Loan</h3>
            <Wallet className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            <Input
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Loan Amount (in ETH)"
              disabled={loading}
            />
            <Input
              value={loanDuration}
              onChange={(e) => setLoanDuration(e.target.value)}
              placeholder="Loan Duration (in days)"
              disabled={loading}
            />
            <Button
              onClick={handleRequestLoan}
              disabled={loading}
              icon={Timer}
            >
              {loading ? 'Processing...' : 'Request Loan'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Repay Loan</h3>
            <RefreshCw className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            <Input
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              placeholder="Loan ID"
              disabled={loading}
            />
            <Button
              onClick={handleRepayLoan}
              disabled={loading}
              variant="secondary"
              icon={ChevronUp}
            >
              {loading ? 'Processing...' : 'Repay Loan'}
            </Button>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Credit Score</h3>
            <CreditCard className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleGetCreditScore}
              disabled={loading}
              variant="secondary"
              icon={BadgeCheck}
            >
              {loading ? 'Processing...' : 'Get Credit Score'}
            </Button>
            {creditScore !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 rounded-xl p-6 text-center"
              >
                <p className="text-sm text-emerald-600 mb-2">Your Credit Score</p>
                <p className="text-4xl font-bold text-emerald-800">{creditScore}</p>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
export default BorrowerPage;