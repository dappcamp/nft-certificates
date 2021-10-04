import { ethers } from "hardhat";
import * as fs from "fs";
import { Contract } from "@ethersproject/contracts";

async function awardCertificate(
  certificate: Contract,
  toAddress: string,
  metadataURI: string
) {
  const txn = await certificate.awardCertificate(toAddress, metadataURI);
  return await txn.wait();
}

async function main() {
  //fetch certificate
  const addressData = JSON.parse(
    fs.readFileSync("metadata/deployedAddress.json","utf-8")
  ); 

  const address = addressData[0]["address"];
  const certContract = await ethers.getContractFactory('Certificate');
  const certificate = await certContract.attach(address);

  const data = JSON.parse(
    fs.readFileSync("metadata/storeScriptOp.json", "utf-8")
  );

  for (let elem of data) {
    const receipt = await awardCertificate(
      certificate,
      elem.address,
      elem.metadataURI
    );

    //if (receipt.events.pop().event !== "Transfer") {
    //  process.exit(1);
    //}
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
