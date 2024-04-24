pragma solidity ^0.8.7;

import "@openzeppelin/contracts@v4.9.2/token/ERC721/ERC721.sol";

contract AeonNFT is ERC721 {
    struct Trait {
        string headwear;
        string eyes;
        string chest;
        string legs;
        string bodySwatch;
        string headwearSwatch;
        string eyesSwatch;
        string chestSwatch;
        string legsSwatch;
        string petSwatch;
    }

    enum Faction {
        Prima
    }

    struct Aeon {
        Trait trait;
        string tokenURI;
        Faction faction;
        uint8 petId;
        bytes32 gene;
    }

    uint256 private _nextTokenId = 1;
    uint256 private _maxSupply = 10000;  // Example max supply
    mapping(uint256 => Aeon) private allAeon;

    constructor() ERC721("AeonNFT", "AEFT") {}

    function mint(address to) public {
        require(_nextTokenId <= _maxSupply, "Max supply exceeded");
        uint256 tokenId = _nextTokenId++;

        Trait memory trait = Trait({
            headwear: "Prima Tuft",
            eyes: "Prima Seer",
            chest: "Prima Aether",
            legs: "Prima Warp",
            bodySwatch: "#e4626a,#da557a",
            headwearSwatch: "#ab40f6,#ab40f6",
            eyesSwatch: "#f83737,#907f74",
            chestSwatch: "#ffcfb5,#aaaaff",
            legsSwatch: "#907f74,#339fff",
            petSwatch: "#f2f0ed,#8080ff"
        });

        Aeon memory newAeon = Aeon({
            trait: trait,
            tokenURI: "https://bafkreidrxvhsldtk6j5f3gfwstoiuwzo35y2mdtvoqkllzzko3fjfmtxb4.ipfs.nftstorage.link/",
            faction: Faction.Prima,
            petId: 1,
            gene: 0x1010110110001010101010010100011000111100110000010110100110010010
        });

        _mint(to, tokenId);
        allAeon[tokenId] = newAeon;
    }

    function getAeonInfo(uint256 tokenId) external view returns (Aeon memory) {
        require(_exists(tokenId), "AeonNFT: Aeon does not exist");
        return allAeon[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "AeonNFT: URI query for nonexistent token");
        return allAeon[tokenId].tokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Optional: If you want to burn tokens
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");
        _burn(tokenId);
    }

    // Override required by Solidity for ERC721.
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
        delete allAeon[tokenId];
    }
}
