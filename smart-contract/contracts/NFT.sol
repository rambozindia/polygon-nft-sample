// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    address private _usdtTokenAddress;

    constructor(address initialOwner, address usdtTokenAddress)
        ERC721("MyNFT", "MNFT")
        Ownable(initialOwner)
    {
        _usdtTokenAddress = usdtTokenAddress;
    }

    function mint(address to, string memory _tokenURI) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    function depositUSDT(uint256 amount) public {
        IERC20 usdt = IERC20(_usdtTokenAddress);
        require(usdt.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
    }

    function withdrawUSDT(address to, uint256 amount) public onlyOwner {
        IERC20 usdt = IERC20(_usdtTokenAddress);
        require(usdt.transfer(to, amount), "USDT transfer failed");
    }
}
