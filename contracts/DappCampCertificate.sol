// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DappCampCertificate is
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    function initialize() public initializer {
        __ERC721_init("DappCampCertificate", "DCAMP");
        __Ownable_init();
    }

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
