import { ethers } from 'hardhat'
import { Wallet } from 'ethers'
import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { Certificate } from '../typechain/Certificate'

use(solidity)

describe('Certficates', () => {
    let certificate: Certificate
    let owner: Wallet, player1: Wallet, player2: Wallet

    beforeEach('deploy Certificate', async() => {
        [owner, player1, player2] = await (ethers as any).getSigners();
        const factory = await ethers.getContractFactory('Certificate')
        certificate = (await factory.deploy()) as Certificate
    })

    describe("award certificate", () => {
        it("should not be mintable by anyone except the owner", async() => {
            await expect(certificate.connect(player1).awardCertificate(player1.address, "tokenURI")).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it("should not be transferable after the first transfer", async() => {
            const newTokenURI = await certificate.connect(owner).callStatic.awardCertificate(player1.address,
            "tokenURI");
            await expect(certificate.connect(player1).transferFrom(player1.address, player2.address, 
            newTokenURI)).to.be.revertedWith('Token transfer is not allowed');
        })
    })

})

