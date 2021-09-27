# nft-certificates

NFT Certificates for the Ethereum Bootcamp

## Development and Testing

```sh
$ yarn
$ yarn test
```

## Adding certificates to IPFS

```sh
npx ts-node scripts/store.ts --cohortId 1 --sourceDataPath metadata/cohort1.json --outputPath metadata/newOutput.json --imagesPath metadata/images
```

- `cohortId` - Cohort ID
- `sourceDataPath` - Path to source data json file
- `outputPath` - Path to output json file containing IPFS hashes to certificate metadata
- `imagesPath` - Path to images directory to pick image for certificate
