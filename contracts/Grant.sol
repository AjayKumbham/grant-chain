
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GovernanceToken.sol";

contract Grant is ReentrancyGuard, Ownable {
    struct Milestone {
        string title;
        string description;
        uint256 amount;
        bool completed;
        bool fundsReleased;
        uint256 votingSessionId;
        string proofIpfsHash;
        uint256 submittedAt;
    }
    
    struct VotingSession {
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        mapping(address => bool) hasVoted;
        bool finalized;
        bool approved;
    }
    
    string public title;
    address public funder;
    address public grantee;
    uint256 public totalAmount;
    uint256 public releasedAmount;
    string public ipfsHash;
    GovernanceToken public governanceToken;
    uint256 public votingPeriodDuration;
    
    Milestone[] public milestones;
    mapping(uint256 => VotingSession) public votingSessions;
    uint256 public votingSessionCount;
    
    enum GrantStatus { Active, InProgress, Completed, Cancelled }
    GrantStatus public status;
    
    event MilestoneSubmitted(uint256 indexed milestoneIndex, string proofIpfsHash);
    event VotingStarted(uint256 indexed milestoneIndex, uint256 indexed votingSessionId, uint256 endTime);
    event VoteCast(uint256 indexed votingSessionId, address indexed voter, bool vote, uint256 weight);
    event MilestoneApproved(uint256 indexed milestoneIndex, uint256 amount);
    event MilestoneRejected(uint256 indexed milestoneIndex);
    event FundsReleased(uint256 indexed milestoneIndex, uint256 amount, address recipient);
    event GranteeAssigned(address indexed grantee);
    
    modifier onlyFunder() {
        require(msg.sender == funder, "Only funder can call this");
        _;
    }
    
    modifier onlyGrantee() {
        require(msg.sender == grantee, "Only grantee can call this");
        _;
    }
    
    modifier milestoneExists(uint256 _milestoneIndex) {
        require(_milestoneIndex < milestones.length, "Milestone does not exist");
        _;
    }
    
    constructor(
        string memory _title,
        address _funder,
        uint256 _totalAmount,
        uint256 _milestoneCount,
        string memory _ipfsHash,
        address _governanceToken,
        uint256 _votingPeriod
    ) payable Ownable(_funder) {
        require(msg.value == _totalAmount, "Incorrect funding amount");
        
        title = _title;
        funder = _funder;
        totalAmount = _totalAmount;
        ipfsHash = _ipfsHash;
        governanceToken = GovernanceToken(_governanceToken);
        votingPeriodDuration = _votingPeriod;
        status = GrantStatus.Active;
        
        // Initialize milestones (details will be set by funder)
        for (uint256 i = 0; i < _milestoneCount; i++) {
            milestones.push(Milestone({
                title: "",
                description: "",
                amount: 0,
                completed: false,
                fundsReleased: false,
                votingSessionId: 0,
                proofIpfsHash: "",
                submittedAt: 0
            }));
        }
        
    }
    
    function assignGrantee(address _grantee) external onlyFunder {
        require(grantee == address(0), "Grantee already assigned");
        require(_grantee != address(0), "Invalid grantee address");
        
        grantee = _grantee;
        status = GrantStatus.InProgress;
        
        emit GranteeAssigned(_grantee);
    }
    
    function setMilestoneDetails(
        uint256 _milestoneIndex,
        string memory _title,
        string memory _description,
        uint256 _amount
    ) external onlyFunder milestoneExists(_milestoneIndex) {
        require(milestones[_milestoneIndex].amount == 0, "Milestone already configured");
        
        milestones[_milestoneIndex].title = _title;
        milestones[_milestoneIndex].description = _description;
        milestones[_milestoneIndex].amount = _amount;
    }
    
    function submitMilestone(
        uint256 _milestoneIndex,
        string memory _proofIpfsHash
    ) external onlyGrantee milestoneExists(_milestoneIndex) {
        Milestone storage milestone = milestones[_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        require(milestone.amount > 0, "Milestone not configured");
        require(bytes(_proofIpfsHash).length > 0, "Proof required");
        
        milestone.proofIpfsHash = _proofIpfsHash;
        milestone.submittedAt = block.timestamp;
        
        // Start voting session
        uint256 sessionId = ++votingSessionCount;
        VotingSession storage session = votingSessions[sessionId];
        session.startTime = block.timestamp;
        session.endTime = block.timestamp + votingPeriodDuration;
        
        milestone.votingSessionId = sessionId;
        
        emit MilestoneSubmitted(_milestoneIndex, _proofIpfsHash);
        emit VotingStarted(_milestoneIndex, sessionId, session.endTime);
    }
    
    function vote(uint256 _votingSessionId, bool _approve) external {
        VotingSession storage session = votingSessions[_votingSessionId];
        require(block.timestamp >= session.startTime, "Voting not started");
        require(block.timestamp <= session.endTime, "Voting period ended");
        require(!session.hasVoted[msg.sender], "Already voted");
        
        uint256 votingPower = governanceToken.getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");
        
        session.hasVoted[msg.sender] = true;
        
        if (_approve) {
            session.yesVotes += votingPower;
        } else {
            session.noVotes += votingPower;
        }
        
        emit VoteCast(_votingSessionId, msg.sender, _approve, votingPower);
    }
    
    function finalizeVoting(uint256 _milestoneIndex) external milestoneExists(_milestoneIndex) {
        Milestone storage milestone = milestones[_milestoneIndex];
        VotingSession storage session = votingSessions[milestone.votingSessionId];
        
        require(block.timestamp > session.endTime, "Voting period not ended");
        require(!session.finalized, "Already finalized");
        
        session.finalized = true;
        
        uint256 totalVotes = session.yesVotes + session.noVotes;
        require(totalVotes > 0, "No votes cast");
        
        // Require 60% approval
        bool approved = (session.yesVotes * 100) / totalVotes >= 60;
        session.approved = approved;
        
        if (approved) {
            milestone.completed = true;
            emit MilestoneApproved(_milestoneIndex, milestone.amount);
            
            // Auto-release funds
            _releaseFunds(_milestoneIndex);
        } else {
            emit MilestoneRejected(_milestoneIndex);
        }
    }
    
    function _releaseFunds(uint256 _milestoneIndex) internal {
        Milestone storage milestone = milestones[_milestoneIndex];
        require(milestone.completed, "Milestone not completed");
        require(!milestone.fundsReleased, "Funds already released");
        require(address(this).balance >= milestone.amount, "Insufficient contract balance");
        
        milestone.fundsReleased = true;
        releasedAmount += milestone.amount;
        
        (bool success, ) = payable(grantee).call{value: milestone.amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(_milestoneIndex, milestone.amount, grantee);
        
        // Check if all milestones completed
        bool allCompleted = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].completed) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            status = GrantStatus.Completed;
        }
    }
    
    function emergencyWithdraw() external onlyFunder {
        require(status != GrantStatus.Completed, "Grant already completed");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        status = GrantStatus.Cancelled;
        
        (bool success, ) = payable(funder).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    function getMilestone(uint256 _index) external view returns (
        string memory _title,
        string memory _description,
        uint256 _amount,
        bool _completed,
        bool _fundsReleased,
        string memory _proofIpfsHash,
        uint256 _submittedAt
    ) {
        require(_index < milestones.length, "Milestone does not exist");
        Milestone storage milestone = milestones[_index];
        
        return (
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.completed,
            milestone.fundsReleased,
            milestone.proofIpfsHash,
            milestone.submittedAt
        );
    }
    
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }
    
    function getVotingSession(uint256 _sessionId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool finalized,
        bool approved
    ) {
        VotingSession storage session = votingSessions[_sessionId];
        return (
            session.startTime,
            session.endTime,
            session.yesVotes,
            session.noVotes,
            session.finalized,
            session.approved
        );
    }
    
    function hasVoted(uint256 _sessionId, address _voter) external view returns (bool) {
        return votingSessions[_sessionId].hasVoted[_voter];
    }
    
    receive() external payable {
        // Allow additional funding
    }
}
