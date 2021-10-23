import { ethers, upgrades } from "hardhat";
import * as fs from "fs";

async function deployCertificate() {
    const DappCampCertificate = await ethers.getContractFactory(
        "DappCampCertificate"
    );
    const dAppCampCertificate = await upgrades.deployProxy(DappCampCertificate);

    await dAppCampCertificate.deployed();
    return dAppCampCertificate;
}

async function main() {
    const dAppCampCertificate = await deployCertificate();
    console.log(
        `Certificate contract deployed at: ${
            (await dAppCampCertificate).address
        }`
    );

    //save certificate
    let contractAddress = {
        address: dAppCampCertificate.address,
    };

    const savedAddressData = JSON.stringify(contractAddress);

    fs.writeFileSync("metadata/deployedAddress.json", savedAddressData);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
