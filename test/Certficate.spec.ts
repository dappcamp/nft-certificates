import { ethers } from 'hardhat'
import { Wallet } from 'ethers'
import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { Certificate } from '../typechain/Certificate'

use(solidity)

describe('Certficates', () => {
    let certificate: Certificate
    let owner: Wallet, account1: Wallet, account2: Wallet

    beforeEach('deploy Certificate', async() => {
        [owner, account1, account2] = await (ethers as any).getSigners();
        const factory = await ethers.getContractFactory('Certificate')
        certificate = (await factory.deploy()) as Certificate
    })

    describe("award certificate", () => {
        it("should not be mintable by anyone except the owner", async() => {
            await expect(certificate.connect(account1).awardCertificate(account1.address, "tokenURI")).to.be.revertedWith('Ownable: caller is not the owner')
        }); 

        it("should not be transferable after the first transfer", async() => {
            const newTokenURI = await certificate.connect(owner).callStatic.awardCertificate(account1.address,
            "tokenURI");        

            await expect(certificate.connect(account1).transferFrom(account1.address, account2.address, 
            newTokenURI)).to.be.revertedWith('Token transfer is not allowed');

            await expect(certificate.connect(account1)['safeTransferFrom(address,address,uint256)'](account1.address, account2.address, newTokenURI)).to.be.revertedWith('Token transfer is not allowed');
        });   

        it("awarding the certificate should be successful",async() => {
            //Defining the Transfer event and the action
            const filter = {
                address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                topics: [
                    ethers.utils.id("Transfer(address,address,uint256)")
                ]
            }; 
            const provider = certificate.provider;
            provider.on(filter, (log, event) => {
                console.log("event recorded");
                //The expect assertion goes here
            });

            const txn = await certificate.connect(owner).awardCertificate(account1.address,
            "tokenURI");
            await txn.wait(); //Transaction successfuly executes here but no event is emitted
        })
    })

})

