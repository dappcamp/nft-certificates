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
            await expect(certificate.awardCertificate(account1.address, "tokenURI"))
                  .to.emit(certificate, "Transfer")
                  .withArgs(ethers.constants.AddressZero, account1.address, 1)
        })
    })

})

