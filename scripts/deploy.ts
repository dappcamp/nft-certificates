import { ethers } from "hardhat";
import * as fs from "fs";
import { Contract } from "@ethersproject/contracts";

async function deployCertificate() {
  const Certificate = await ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy();

  await certificate.deployed();
  return certificate;
}

async function awardCertificate(
  certificate: Contract,
  toAddress: string,
  metadataURI: string
) {
  const txn = await certificate.awardCertificate(toAddress, metadataURI);
  return await txn.wait();
}

async function main() {
  const certificate = await deployCertificate();
  console.log(
    `Certificate contract deployed at: ${(await certificate).address}`
  );

  const data = JSON.parse(
    fs.readFileSync("metadata/storeScriptOp.json", "utf-8")
  );

  for (let elem of data) {
    const receipt = await awardCertificate(
      certificate,
      elem.address,
      elem.metadataURI
    );

    if (receipt.events.pop().event !== "Transfer") {
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
