// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Certificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Certificate", "CERT") {}

    function awardCertificate(address to, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newCertificateId = _tokenIds.current();
        _mint(to, newCertificateId);
        _setTokenURI(newCertificateId, tokenURI);

        return newCertificateId;
    }

    modifier disallowTransfer() {
        require(false, "Token transfer is not allowed");
        _;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override disallowTransfer {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override disallowTransfer {
        super.safeTransferFrom(from, to, tokenId, _data);
    }
}
