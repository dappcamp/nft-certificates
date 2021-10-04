import { ethers } from "hardhat";
import * as fs from "fs";
import { Contract } from "@ethersproject/contracts";

async function deployCertificate() {
  const Certificate = await ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy();

  await certificate.deployed();
  return certificate;
}

async function main() {
  const certificate = await deployCertificate();
  console.log(
    `Certificate contract deployed at: ${(await certificate).address}`
  );

  //save certificate
  let contractAddress = <{ address: string }[]>[];
  contractAddress.push({
    address: certificate.address
  });

  const savedAddressData = JSON.stringify(contractAddress);

  fs.writeFileSync("metadata/deployedAddress.json", savedAddressData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
