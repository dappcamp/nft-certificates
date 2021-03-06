import { ethers } from "hardhat";
import * as fs from "fs";
import { Contract } from "@ethersproject/contracts";

async function awardCertificates(
    dAppCampCertificate: Contract,
    toAddresses: string[],
    metadataURIs: string[]
) {
    const txn = await dAppCampCertificate.batchAwardCertificates(
        toAddresses,
        metadataURIs
    );
    return await txn.wait();
}

async function main() {
    //fetch certificate
    const addressData = JSON.parse(
        fs.readFileSync("metadata/deployedAddress.json", "utf-8")
    );

    const address = addressData["address"];
    const certContract = await ethers.getContractFactory("DappCampCertificate");
    const certificate = certContract.attach(address);

    const data = JSON.parse(
        fs.readFileSync("metadata/storeScriptOp.json", "utf-8")
    );

    for (let idx = 0; idx < data.length; idx += 20) {
        let batch = data.slice(idx, idx + 20);

        const receipt = await awardCertificates(
            certificate,
            batch.map(
                (elem: { address: string; metadataURI: string }) => elem.address
            ),
            batch.map(
                (elem: { address: string; metadataURI: string }) =>
                    elem.metadataURI
            )
        );

        if (receipt.events.length !== batch.length) {
            process.exit(1);
        }

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
