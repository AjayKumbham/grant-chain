
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Grant.sol";
import "./GovernanceToken.sol";

contract GrantFactory {
    address public governanceToken;
    address[] public allGrants;
    mapping(address => address[]) public funderGrants;
    
    event GrantCreated(
        address indexed grantAddress,
        address indexed funder,
        string title,
        uint256 totalAmount,
        uint256 milestoneCount,
        string ipfsHash
    );
    
    constructor() {
        // Initialize with zero address - will be set later
        governanceToken = address(0);
    }
    
    function setGovernanceToken(address _governanceToken) external {
        require(governanceToken == address(0), "Governance token already set");
        require(_governanceToken != address(0), "Invalid governance token address");
        governanceToken = _governanceToken;
    }
    
    function createGrant(
        string memory _title,
        uint256 _totalAmount,
        uint256 _milestoneCount,
        string memory _ipfsHash,
        uint256 _votingPeriod
    ) external payable returns (address) {
        require(msg.value == _totalAmount, "Must send exact grant amount");
        require(_milestoneCount > 0, "Must have at least one milestone");
        
        Grant newGrant = new Grant{value: msg.value}(
            _title,
            msg.sender,
            _totalAmount,
            _milestoneCount,
            _ipfsHash,
            governanceToken,
            _votingPeriod
        );
        
        address grantAddress = address(newGrant);
        allGrants.push(grantAddress);
        funderGrants[msg.sender].push(grantAddress);
        
        emit GrantCreated(
            grantAddress,
            msg.sender,
            _title,
            _totalAmount,
            _milestoneCount,
            _ipfsHash
        );
        
        return grantAddress;
    }
    
    function getAllGrants() external view returns (address[] memory) {
        return allGrants;
    }
    
    function getFunderGrants(address _funder) external view returns (address[] memory) {
        return funderGrants[_funder];
    }
    
    function getGrantCount() external view returns (uint256) {
        return allGrants.length;
    }
}
