// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Land {
        uint256 id;
        address owner;
        string location;
        uint256 size;
        uint256 price;
        bool isForSale;
        bool isVerified;
        string documentHash;
    }

    struct PurchaseRequest {
        address buyer;
        uint256 landId;
        uint256 timestamp;
        bool isApproved;
        bool isRejected;
    }

    address public admin;
    uint256 public landCount;
    mapping(uint256 => Land) public lands;
    mapping(uint256 => PurchaseRequest[]) public purchaseRequests;
    mapping(address => uint256[]) public ownerLands;
    mapping(address => uint256[]) public buyerRequests;

    event LandAdded(uint256 indexed landId, address indexed owner, string location, uint256 price);
    event PurchaseRequested(uint256 indexed landId, address indexed buyer);
    event PurchaseApproved(uint256 indexed landId, address indexed buyer);
    event PurchaseRejected(uint256 indexed landId, address indexed buyer);
    event OwnershipTransferred(uint256 indexed landId, address indexed previousOwner, address indexed newOwner);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyLandOwner(uint256 _landId) {
        require(lands[_landId].owner == msg.sender, "Only land owner can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerLand(
        string memory _location,
        uint256 _size,
        uint256 _price,
        string memory _documentHash
    ) public returns (uint256) {
        landCount++;
        lands[landCount] = Land({
            id: landCount,
            owner: msg.sender,
            location: _location,
            size: _size,
            price: _price,
            isForSale: true,
            isVerified: true, // Automatically verify on registration
            documentHash: _documentHash
        });
        ownerLands[msg.sender].push(landCount);
        emit LandAdded(landCount, msg.sender, _location, _price);
        return landCount;
    }

    function sendPurchaseRequest(uint256 _landId) public {
        require(lands[_landId].isForSale, "Land is not for sale");
        require(lands[_landId].owner != msg.sender, "Cannot request your own land");
        require(lands[_landId].isVerified, "Land is not verified");
        
        PurchaseRequest memory newRequest = PurchaseRequest({
            buyer: msg.sender,
            landId: _landId,
            timestamp: block.timestamp,
            isApproved: false,
            isRejected: false
        });
        
        purchaseRequests[_landId].push(newRequest);
        buyerRequests[msg.sender].push(_landId);
        emit PurchaseRequested(_landId, msg.sender);
    }

    function approveRequest(uint256 _landId, address _buyer) public onlyLandOwner(_landId) {
        require(lands[_landId].isForSale, "Land is not for sale");
        require(lands[_landId].isVerified, "Land is not verified");
        
        for (uint i = 0; i < purchaseRequests[_landId].length; i++) {
            if (purchaseRequests[_landId][i].buyer == _buyer && 
                !purchaseRequests[_landId][i].isApproved && 
                !purchaseRequests[_landId][i].isRejected) {
                
                purchaseRequests[_landId][i].isApproved = true;
                lands[_landId].isForSale = false;
                
                // Transfer ownership
                address previousOwner = lands[_landId].owner;
                lands[_landId].owner = _buyer;
                
                // Update owner's land list
                for (uint j = 0; j < ownerLands[previousOwner].length; j++) {
                    if (ownerLands[previousOwner][j] == _landId) {
                        ownerLands[previousOwner][j] = ownerLands[previousOwner][ownerLands[previousOwner].length - 1];
                        ownerLands[previousOwner].pop();
                        break;
                    }
                }
                ownerLands[_buyer].push(_landId);
                
                emit PurchaseApproved(_landId, _buyer);
                emit OwnershipTransferred(_landId, previousOwner, _buyer);
                break;
            }
        }
    }

    function rejectRequest(uint256 _landId, address _buyer) public onlyLandOwner(_landId) {
        for (uint i = 0; i < purchaseRequests[_landId].length; i++) {
            if (purchaseRequests[_landId][i].buyer == _buyer && 
                !purchaseRequests[_landId][i].isApproved && 
                !purchaseRequests[_landId][i].isRejected) {
                
                purchaseRequests[_landId][i].isRejected = true;
                emit PurchaseRejected(_landId, _buyer);
                break;
            }
        }
    }

    function getLandDetails(uint256 _landId) public view returns (
        uint256 id,
        address owner,
        string memory location,
        uint256 size,
        uint256 price,
        bool isForSale,
        bool isVerified,
        string memory documentHash
    ) {
        Land memory land = lands[_landId];
        return (
            land.id,
            land.owner,
            land.location,
            land.size,
            land.price,
            land.isForSale,
            land.isVerified,
            land.documentHash
        );
    }

    function getPurchaseRequests(uint256 _landId) public view returns (PurchaseRequest[] memory) {
        return purchaseRequests[_landId];
    }

    function getOwnerLands(address _owner) public view returns (uint256[] memory) {
        return ownerLands[_owner];
    }

    function getBuyerRequests(address _buyer) public view returns (uint256[] memory) {
        return buyerRequests[_buyer];
    }
} 