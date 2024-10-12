import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Timer, 
  RefreshCw, 
  AlertCircle,
  ChevronUp,
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

const LendersPage = () => {
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pools, setPools] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [poolCount, setPoolCount] = useState(0);

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
        
        setContract(contractInstance);
        await fetchPoolCount(contractInstance);
  
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

  const fetchPoolCount = async (contractInstance) => {
    try {
      setLoading(true);
      // Access poolCount as a public variable
      const count = await contractInstance.poolCount();
      const poolCountNumber = Number(count);
      setPoolCount(poolCountNumber);
      await fetchPools(contractInstance, poolCountNumber);
    } catch (err) {
      setError('Failed to fetch pool count');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async (contractInstance, count) => {
    try {
      setLoading(true);
      const poolsData = [];
      
      for (let i = 0; i < count; i++) {
        const poolDetails = await contractInstance.getPoolDetails(i);
        poolsData.push({
          id: i,
          totalFunds: poolDetails[0],
          availableFunds: poolDetails[1],
          riskLevel: poolDetails[2]
        });
      }
      
      setPools(poolsData);
    } catch (err) {
      setError('Failed to fetch pool details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      setLoading(true);
      setError('');

      if (!contract) throw new Error('Contract not initialized');
      if (!riskLevel || !depositAmount) throw new Error('Please fill in all fields');

      const amountInWei = ethers.parseEther(depositAmount);
      
      // Create a new risk pool
      const tx = await contract.createRiskPool(
        riskLevel,
        amountInWei,
        { value: amountInWei }
      );
      await tx.wait();

      setRiskLevel('');
      setDepositAmount('');
      alert('Pool created successfully!');
      
      // Refresh pools
      await fetchPoolCount(contract);
    } catch (err) {
      setError(err.message || 'Failed to create pool');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    try {
      setLoading(true);
      setError('');

      if (!contract) throw new Error('Contract not initialized');
      if (!depositAmount || !selectedPoolId) throw new Error('Please fill in all fields');

      const amountInWei = ethers.parseEther(depositAmount);
      
      // Add funds to existing pool
      const tx = await contract.addFundsToPool(
        selectedPoolId,
        amountInWei,
        { value: amountInWei }
      );
      await tx.wait();

      setDepositAmount('');
      setSelectedPoolId('');
      alert('Funds added successfully!');
      
      // Refresh pools
      await fetchPoolCount(contract);
    } catch (err) {
      setError(err.message || 'Failed to add funds');
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
        <h2 className="text-3xl font-bold text-gray-900">Risk Pools</h2>
      </motion.div>

      {error && <ErrorMessage message={error} />}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create New Pool</h3>
          <Wallet className="text-emerald-600" size={24} />
        </div>
        <div className="space-y-4">
          <Input
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            placeholder="Risk Level (1-100)"
            type="number"
            disabled={loading}
          />
          <Input
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Initial Funds (ETH)"
            disabled={loading}
          />
          <Button
            onClick={handleCreatePool}
            disabled={loading}
            icon={ChevronUp}
          >
            {loading ? 'Processing...' : 'Create Pool'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Funds to Pool</h3>
          <Wallet className="text-emerald-600" size={24} />
        </div>
        <div className="space-y-4">
          <select
            value={selectedPoolId}
            onChange={(e) => setSelectedPoolId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
          >
            <option value="">Select a Pool</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                Pool #{pool.id} (Risk Level: {pool.riskLevel.toString()})
              </option>
            ))}
          </select>
          <Input
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Amount to Add (ETH)"
            disabled={loading}
          />
          <Button
            onClick={handleAddFunds}
            disabled={loading}
            icon={ChevronUp}
          >
            {loading ? 'Processing...' : 'Add Funds'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Available Pools</h3>
          <RefreshCw
            className={`text-emerald-600 cursor-pointer ${loading ? 'animate-spin' : ''}`}
            size={24}
            onClick={() => fetchPoolCount(contract)}
          />
        </div>
        <div className="space-y-4">
          {pools.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pools available</p>
          ) : (
            pools.map((pool) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 rounded-xl p-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Pool #{pool.id}</h4>
                    <p className="text-sm text-gray-600">Risk Level: {pool.riskLevel.toString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      {ethers.formatEther(pool.totalFunds)} ETH Total
                    </p>
                    <p className="text-sm text-emerald-500">
                      {ethers.formatEther(pool.availableFunds)} ETH Available
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default LendersPage;