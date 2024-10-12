// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimplifiedLoanAndRiskPoolContract is Ownable, ReentrancyGuard {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 dueDate;
        bool isRepaid;
        uint256 poolId;
    }

    struct CreditScore {
        uint256 score;
        uint256 lastUpdateTimestamp;
    }

    struct RiskPool {
        uint256 totalFunds;
        uint256 availableFunds;
        uint256 riskLevel;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => CreditScore) private creditScores;
    mapping(uint256 => RiskPool) public riskPools;
    uint256 public nextLoanId;
    uint256 public poolCount;

    uint256 public constant MIN_CREDIT_SCORE = 300;
    uint256 public constant INITIAL_CREDIT_SCORE = 500;
    uint256 public constant MAX_LOAN_DURATION = 365 days; // Maximum loan duration of 1 year
    uint256 public constant MIN_LOAN_AMOUNT = 0.1 ether;  // Minimum loan amount
    uint256 public constant MAX_LOAN_AMOUNT = 100 ether;  // Maximum loan amount

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 dueDate, uint256 poolId);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    event PoolCreated(uint256 indexed poolId, uint256 riskLevel, uint256 initialFunds);
    event FundsAdded(uint256 indexed poolId, uint256 amount);
    event LoanRequestRejected(address indexed borrower, string reason);

    constructor() Ownable(msg.sender) {
        nextLoanId = 0;
        poolCount = 0;
    }

    function createRiskPool(uint256 _riskLevel, uint256 _initialFunds) external payable onlyOwner {
        require(_riskLevel > 0 && _riskLevel <= 100, "Risk level must be between 1 and 100");
        
        uint256 initialFunds = _initialFunds;
        if (msg.value > 0) {
            require(msg.value == _initialFunds, "Sent value does not match specified initial funds");
            initialFunds = msg.value;
        }

        uint256 poolId = poolCount++;
        riskPools[poolId] = RiskPool({
            totalFunds: initialFunds,
            availableFunds: initialFunds,
            riskLevel: _riskLevel
        });

        emit PoolCreated(poolId, _riskLevel, initialFunds);
    }

    function addFundsToPool(uint256 _poolId, uint256 _amount) external payable {
        require(_poolId < poolCount, "Invalid pool ID");
        require(_amount > 0, "Must send funds");
        
        if (msg.value > 0) {
            require(msg.value == _amount, "Sent value does not match specified amount");
        }

        RiskPool storage pool = riskPools[_poolId];
        pool.totalFunds += _amount;
        pool.availableFunds += _amount;

        emit FundsAdded(_poolId, _amount);
    }

    function requestLoan(uint256 loanAmount, uint256 duration) external nonReentrant {
        // Input validation
        if (loanAmount < MIN_LOAN_AMOUNT) {
            emit LoanRequestRejected(msg.sender, "Loan amount below minimum");
            revert("Loan amount below minimum");
        }
        if (loanAmount > MAX_LOAN_AMOUNT) {
            emit LoanRequestRejected(msg.sender, "Loan amount above maximum");
            revert("Loan amount above maximum");
        }
        if (duration == 0 || duration > MAX_LOAN_DURATION) {
            emit LoanRequestRejected(msg.sender, "Invalid loan duration");
            revert("Invalid loan duration");
        }

        // Credit score check
        uint256 creditScore = getCreditScore(msg.sender);
        if (creditScore < MIN_CREDIT_SCORE) {
            emit LoanRequestRejected(msg.sender, "Credit score too low");
            revert("Credit score too low");
        }

        // Check existing loans
        if (hasActiveLoans(msg.sender)) {
            emit LoanRequestRejected(msg.sender, "Already has active loan");
            revert("Already has active loan");
        }

        // Find suitable risk pool
        uint256 poolId = assignRiskPool(creditScore, loanAmount);
        if (poolId >= poolCount) {
            emit LoanRequestRejected(msg.sender, "No suitable risk pool found");
            revert("No suitable risk pool found");
        }

        RiskPool storage pool = riskPools[poolId];
        if (pool.availableFunds < loanAmount) {
            emit LoanRequestRejected(msg.sender, "Insufficient funds in pool");
            revert("Insufficient funds in pool");
        }

        // Create loan
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: loanAmount,
            dueDate: block.timestamp + duration,
            isRepaid: false,
            poolId: poolId
        });

        pool.availableFunds -= loanAmount;

        emit LoanCreated(loanId, msg.sender, loanAmount, block.timestamp + duration, poolId);

        // Transfer funds
        (bool success, ) = payable(msg.sender).call{value: loanAmount}("");
        require(success, "Transfer failed");
    }

    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.value >= loan.amount, "Insufficient repayment");

        loan.isRepaid = true;
        
        // Update credit score based on timing
        bool isOnTime = block.timestamp <= loan.dueDate;
        updateCreditScore(msg.sender, isOnTime);

        RiskPool storage pool = riskPools[loan.poolId];
        pool.availableFunds += loan.amount;

        emit LoanRepaid(loanId, msg.sender, loan.amount);

        // Refund excess payment
        if (msg.value > loan.amount) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - loan.amount}("");
            require(success, "Refund failed");
        }
    }

    function hasActiveLoans(address borrower) public view returns (bool) {
        for (uint256 i = 0; i < nextLoanId; i++) {
            if (loans[i].borrower == borrower && !loans[i].isRepaid) {
                return true;
            }
        }
        return false;
    }

    function getCreditScore(address user) public view returns (uint256) {
        if (creditScores[user].score == 0) {
            return INITIAL_CREDIT_SCORE;
        }
        return creditScores[user].score;
    }

    function updateCreditScore(address user, bool isPositive) internal {
        CreditScore storage userScore = creditScores[user];
        if (userScore.score == 0) {
            userScore.score = INITIAL_CREDIT_SCORE;
        }

        if (isPositive) {
            userScore.score = min(userScore.score + 10, 850);
        } else {
            userScore.score = max(userScore.score - 50, 300);
        }

        userScore.lastUpdateTimestamp = block.timestamp;
        emit CreditScoreUpdated(user, userScore.score);
    }

    function assignRiskPool(uint256 creditScore, uint256 amount) internal view returns (uint256) {
        uint256 selectedPoolId = poolCount; // Default to invalid pool
        uint256 bestMatch = type(uint256).max;

        for (uint256 i = 0; i < poolCount; i++) {
            RiskPool storage pool = riskPools[i];
            if (pool.availableFunds >= amount) {
                uint256 scoreDiff = creditScore > pool.riskLevel ? creditScore - pool.riskLevel : pool.riskLevel - creditScore;
                if (scoreDiff < bestMatch) {
                    bestMatch = scoreDiff;
                    selectedPoolId = i;
                }
            }
        }

        return selectedPoolId;
    }

    function getPoolDetails(uint256 _poolId) external view returns (
        uint256 totalFunds,
        uint256 availableFunds,
        uint256 riskLevel
    ) {
        require(_poolId < poolCount, "Invalid pool ID");
        RiskPool storage pool = riskPools[_poolId];
        return (pool.totalFunds, pool.availableFunds, pool.riskLevel);
    }

    function getLoanDetails(uint256 _loanId) external view returns (
        address borrower,
        uint256 amount,
        uint256 dueDate,
        bool isRepaid,
        uint256 poolId
    ) {
        require(_loanId < nextLoanId, "Invalid loan ID");
        Loan storage loan = loans[_loanId];
        return (loan.borrower, loan.amount, loan.dueDate, loan.isRepaid, loan.poolId);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}