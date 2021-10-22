import { ethers, upgrades } from "hardhat";
import { Wallet } from "ethers";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { DappCampCertificate } from "../typechain/DappCampCertificate";

use(solidity);

describe("DappCampCertificates", () => {
    let dAppCampCertificate: DappCampCertificate;
    let owner: Wallet, account1: Wallet, account2: Wallet;

    beforeEach("deploy Certificate", async () => {
        [owner, account1, account2] = await (ethers as any).getSigners();
        const DappCampCertificateFactory = await ethers.getContractFactory(
            "DappCampCertificate"
        );
        dAppCampCertificate = (await upgrades.deployProxy(
            DappCampCertificateFactory
        )) as DappCampCertificate;
    });

    describe("award certificate", () => {
        it("should not be mintable by anyone except the owner", async () => {
            await expect(
                dAppCampCertificate
                    .connect(account1)
                    .awardCertificate(account1.address, "tokenURI")
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should not be transferable after the first transfer", async () => {
            const newTokenURI = await dAppCampCertificate
                .connect(owner)
                .callStatic.awardCertificate(account1.address, "tokenURI");

            await expect(
                dAppCampCertificate
                    .connect(account1)
                    .transferFrom(
                        account1.address,
                        account2.address,
                        newTokenURI
                    )
            ).to.be.revertedWith("Token transfer is not allowed");

            await expect(
                dAppCampCertificate
                    .connect(account1)
                    ["safeTransferFrom(address,address,uint256)"](
                        account1.address,
                        account2.address,
                        newTokenURI
                    )
            ).to.be.revertedWith("Token transfer is not allowed");
        });

        it("awarding the certificate should be successful", async () => {
            await expect(
                dAppCampCertificate.awardCertificate(
                    account1.address,
                    "tokenURI"
                )
            )
                .to.emit(dAppCampCertificate, "Transfer")
                .withArgs(ethers.constants.AddressZero, account1.address, 1);
        });
    });
});
