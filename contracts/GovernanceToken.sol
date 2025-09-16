
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20, Ownable {
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => uint256) public reputationScore;
    
    uint256 public constant STAKING_REWARD_RATE = 100; // 1% per day
    uint256 public constant MIN_STAKING_PERIOD = 1 days;
    uint256 public constant REPUTATION_MULTIPLIER = 2;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    constructor(address initialOwner) ERC20("GovernanceToken", "GT") Ownable(initialOwner) {}
    
    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Calculate and add staking rewards if already staking
        if (stakingBalance[msg.sender] > 0) {
            uint256 rewards = calculateStakingRewards(msg.sender);
            if (rewards > 0) {
                _mint(msg.sender, rewards);
            }
        }
        
        _transfer(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] += _amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, _amount);
    }
    
    function unstake(uint256 _amount) external {
        require(_amount > 0, "Cannot unstake 0");
        require(stakingBalance[msg.sender] >= _amount, "Insufficient staking balance");
        require(
            block.timestamp >= stakingTimestamp[msg.sender] + MIN_STAKING_PERIOD,
            "Minimum staking period not met"
        );
        
        // Calculate and add staking rewards
        uint256 rewards = calculateStakingRewards(msg.sender);
        if (rewards > 0) {
            _mint(msg.sender, rewards);
        }
        
        stakingBalance[msg.sender] -= _amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        _transfer(address(this), msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount);
    }
    
    function calculateStakingRewards(address _user) public view returns (uint256) {
        if (stakingBalance[_user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamp[_user];
        uint256 dailyReward = (stakingBalance[_user] * STAKING_REWARD_RATE) / 10000;
        
        return (dailyReward * stakingDuration) / 1 days;
    }
    
    function updateReputation(address _user, int256 _change) external onlyOwner {
        if (_change > 0) {
            reputationScore[_user] += uint256(_change);
        } else if (_change < 0) {
            uint256 decrease = uint256(-_change);
            if (reputationScore[_user] > decrease) {
                reputationScore[_user] -= decrease;
            } else {
                reputationScore[_user] = 0;
            }
        }
        
        emit ReputationUpdated(_user, reputationScore[_user]);
    }
    
    function getVotingPower(address _user) external view returns (uint256) {
        uint256 baseVotingPower = stakingBalance[_user];
        uint256 reputationBonus = (reputationScore[_user] * REPUTATION_MULTIPLIER);
        
        return baseVotingPower + reputationBonus;
    }
    
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
    
    function getStakingInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 stakingTime,
        uint256 reputation,
        uint256 votingPower,
        uint256 pendingRewards
    ) {
        return (
            stakingBalance[_user],
            stakingTimestamp[_user],
            reputationScore[_user],
            this.getVotingPower(_user),
            calculateStakingRewards(_user)
        );
    }
}
