// SPDX-License-Identifier: MIT
// WARNING: This contract has significant centralization risks.
// The owner has the power to mint, assign, and transfer any NFT, and can withdraw all funds.
// For a production system, consider using a TimelockController or a multisig wallet as the owner.
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    uint256 private _nextTokenId;
    address private _usdtTokenAddress;
    string private _customBaseURI;

    mapping(uint256 => uint256) private _prices;
    mapping(uint256 => uint256) private _investments;

    constructor(address initialOwner, address usdtTokenAddress)
        ERC721("MyNFT", "MNFT")
        Ownable(initialOwner)
    {
        _usdtTokenAddress = usdtTokenAddress;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _customBaseURI = baseURI_;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _customBaseURI;
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".png")) : "";
    }

    function initialMintAndList(uint256 quantity) public onlyOwner {
        uint256 price = 50 * 10**6; // 50 USDT
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(owner(), tokenId);
            _prices[tokenId] = price;
            _investments[tokenId] = 0; // Indicates first sale
        }
    }

    function purchaseNFT(uint256 tokenId) public nonReentrant {
        uint256 price = _prices[tokenId];
        require(price > 0, "NFT not for sale");

        address seller = ownerOf(tokenId);
        address buyer = msg.sender;

        require(buyer != seller, "Cannot buy your own NFT");

        uint256 investment = _investments[tokenId];

        IERC20 usdt = IERC20(_usdtTokenAddress);
        
        // Transfer the full price from the buyer to this contract
        usdt.safeTransferFrom(buyer, address(this), price);

        if (investment == 0) { // First sale from admin
            // Admin gets the full price
            usdt.safeTransfer(owner(), price);
        } else { // Subsequent sale
            // Seller gets investment + 1% profit
            // Note: Solidity 0.8+ has built-in overflow checks.
            uint256 sellerShare = investment + (investment / 100);
            usdt.safeTransfer(seller, sellerShare);

            // Admin gets the rest
            uint256 adminShare = price - sellerShare;
            usdt.safeTransfer(owner(), adminShare);
        }

        // Transfer the NFT to the buyer
        _transfer(seller, buyer, tokenId);

        // Record the buyer's investment for the next sale
        _investments[tokenId] = price;

        // Auto-relist at the new price
        uint256 threshold = 2000 * 10**6;
        if (price <= threshold) {
            _prices[tokenId] = (price * 110) / 100;
        } else {
            _prices[tokenId] = (price * 112) / 100;
        }
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        return _prices[tokenId];
    }

    function getInvestment(uint256 tokenId) public view returns (uint256) {
        return _investments[tokenId];
    }

    function getUSDTBalance() public view returns (uint256) {
        IERC20 usdt = IERC20(_usdtTokenAddress);
        return usdt.balanceOf(address(this));
    }

    function totalSupply() public view override returns (uint256) {
        return _nextTokenId;
    }

    // --- Old Functions Kept for Compatibility ---

    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function batchMint(address to, uint256 quantity) public onlyOwner {
        require(quantity <= 100, "Batch size exceeds limit");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }

    function assignNFT(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function adminTransfer(address from, address to, uint256 tokenId) public onlyOwner {
        _transfer(from, to, tokenId);
    }

    function batchAdminTransfer(address[] calldata from, address to, uint256[] calldata tokenIds) public onlyOwner {
        require(from.length <= 100, "Batch size exceeds limit");
        require(from.length == tokenIds.length, "Batch transfer input arrays must have the same length");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _transfer(from[i], to, tokenIds[i]);
        }
    }

    // Users can deposit USDT to this contract, but only the owner can withdraw.
    // This is a trust-based model. Users should be aware of this before depositing.
    function depositUSDT(uint256 amount) public {
        IERC20 usdt = IERC20(_usdtTokenAddress);
        usdt.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdrawUSDT(address to, uint256 amount) public onlyOwner {
        IERC20 usdt = IERC20(_usdtTokenAddress);
        usdt.safeTransfer(to, amount);
    }
}
