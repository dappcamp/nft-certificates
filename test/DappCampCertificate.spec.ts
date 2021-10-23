import { ethers, upgrades } from "hardhat";
import { Wallet } from "ethers";
import { expect } from "chai";
import { DappCampCertificate } from "../typechain/DappCampCertificate";

describe("DappCampCertificates", () => {
    let dAppCampCertificate: DappCampCertificate;
    let accounts: Wallet[];
    let owner: Wallet, account1: Wallet, account2: Wallet;

    beforeEach("deploy Certificate", async () => {
        accounts = await (ethers as any).getSigners();

        owner = accounts[0];
        account1 = accounts[1];
        account2 = accounts[2];

        const DappCampCertificateFactory = await ethers.getContractFactory(
            "DappCampCertificate"
        );
        dAppCampCertificate = (await upgrades.deployProxy(
            DappCampCertificateFactory
        )) as DappCampCertificate;
    });

    describe("certificate", () => {
        it("should not be mintable by anyone except the owner", async () => {
            await expect(
                dAppCampCertificate
                    .connect(account1)
                    .awardCertificate(account1.address, "tokenURI")
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should not be transferable", async () => {
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

        it("should be awardable", async () => {
            await expect(
                dAppCampCertificate.awardCertificate(
                    account1.address,
                    "tokenURI"
                )
            )
                .to.emit(dAppCampCertificate, "Transfer")
                .withArgs(ethers.constants.AddressZero, account1.address, 1);
        });

        it("should be burnable", async () => {
            const txn = await dAppCampCertificate
                .connect(owner)
                .awardCertificate(account1.address, "tokenURI");
            await txn.wait();

            await expect(dAppCampCertificate.burn(1))
                .to.emit(dAppCampCertificate, "Transfer")
                .withArgs(account1.address, ethers.constants.AddressZero, 1);
        });

        it("should not be burnable by anyone except the owner", async () => {
            const txn = await dAppCampCertificate
                .connect(owner)
                .awardCertificate(account1.address, "tokenURI");
            await txn.wait();

            await expect(
                dAppCampCertificate.connect(account1).burn(1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should be awardable in batches", async () => {
            const txn = await dAppCampCertificate.batchAwardCertificates(
                accounts.map((elem) => elem.address),
                accounts.map((elem) => "tokenURI")
            );

            const receipt = await txn.wait();
            const events = receipt.events ?? [];

            for (let idx = 0; idx < events.length; idx++) {
                let event = events[idx];
                let args = event.args ?? [];

                expect(event.event).to.equal("Transfer");
                expect(args[0]).to.equal(ethers.constants.AddressZero);
                expect(args[1]).to.equal(accounts[idx].address);
            }
        });
    });
});
