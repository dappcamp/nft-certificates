# nft-certificates

NFT Certificates for the Ethereum Bootcamp

## Add working metadata

1. Add certificate images to `metadata/images`
2. Make sure `metadata/cohort1.json` and `metatadata/storeScriptOp.json` has the complete details of cohort members

## Upload certificates to IPFS

```sh
npx ts-node scripts/store.ts --cohortId 1 --sourceDataPath metadata/cohort1.json --outputPath metadata/storeScriptOp.json --imagesPath metadata/images
```

- `cohortId` - Cohort ID
- `sourceDataPath` - Path to source data json file
- `outputPath` - Path to output json file containing IPFS hashes to certificate metadata
- `imagesPath` - Path to images directory to pick image for certificate

## Deploy the Certificate contract

```sh
npx hardhat node
npx hardhat run scripts/deploy.ts --network <network_name>
```

`network_name` can be localhost or rinkeby or mainnet, depending on where you intend to deploy

The address of the deployed contract is saved in `metadata/deployedAddress.json`

## Award the respective certificate images as NFTs

```sh 
npx hardhat run scripts/awardNFT.ts --network <network_name>
```

NOTE: it is important that the hardhat network be the same when deploying contract and awarding certificates. Also, `npx hardhat` command always creates and tears down the local network, so use `npx hardhat node` beforehand to avoid errors.

## Development and Testing

```sh
$ yarn
$ yarn test
```

## Running tests
```sh
npx hardhat test
```