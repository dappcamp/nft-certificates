import { ethers } from 'hardhat'
import { Wallet } from 'ethers'
import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { Certificate } from '../typechain/Certificate'

use(solidity)

describe('Certficates', () => {
    let certificate: Certificate
    let owner: Wallet, player1: Wallet

    beforeEach('deploy Certificate', async() => {
        [owner, player1] = await (ethers as any).getSigners();
        const factory = await ethers.getContractFactory('Certificate')
        certificate = (await factory.deploy()) as Certificate
    })

    describe("award certificate", () => {
        it("should not be mintable by anyone except the owner", async() => {
            await expect(certificate.connect(player1).awardCertificate(player1.address, "tokenURI")).to.be.revertedWith('Only Owner')
        })
    })

})

