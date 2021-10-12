import { create } from "ipfs-http-client";
import minimist from "minimist";
import * as fs from "fs";

class Configuration {
  cohortId: number;
  sourceDataPath: string;
  outputPath: string;
  imagesPath: string;

  constructor(args: string[]) {
    const params = minimist(args);
    this.cohortId = params.cohortId;
    this.sourceDataPath = params.sourceDataPath;
    this.outputPath = params.outputPath;
    this.imagesPath = params.imagesPath;
  }
}

class DeStore {
  ipfs: any;
  config: Configuration;

  constructor(url: string, config: Configuration) {
    this.ipfs = create({ url: url });
    this.config = config;
  }

  public async uploadImage(imageFileName: string) {
    const imagePath = `${this.config.imagesPath}/${imageFileName}`;
    const fileInfo = await this.ipfs.add({
      path: imageFileName,
      content: fs.readFileSync(imagePath),
    });

    return fileInfo.cid.toString();
  }

  public async addCertificate(
    name: string,
    displayImage: string,
    cohortId: number
  ) {
    const tokenMetaData = JSON.stringify({
      name: name,
      image: displayImage,
      attributes: [
        {
          trait_type: "CohortId",
          display_type: "number",
          value: cohortId,
        },
      ],
    });

    const hash = await this.ipfs.add(tokenMetaData);
    return hash.cid.toString();
  }

  public async uploadMetadata(cohortData: [{ name: string; image: string }]) {
    const metadataHashes = cohortData.map(
      async (elem: { name: string; image: string }) => {
        const imageHash = await this.uploadImage(elem.image);
        return await this.addCertificate(
          elem.name,
          imageHash,
          this.config.cohortId
        );
      }
    );

    return Promise.all(metadataHashes);
  }
}

async function main() {
  const config = new Configuration(process.argv);

  const deStore = new DeStore("https://ipfs.infura.io:5001", config);
  const cohortData = JSON.parse(
    fs.readFileSync(config.sourceDataPath, "utf-8")
  );
  const hashes = await deStore.uploadMetadata(cohortData);

  let cohortUploadedData = <{ address: string; metadataURI: string }[]>[];

  hashes.map((elem: string, idx: number) => {
    cohortUploadedData.push({
      address: cohortData[idx].address,
      metadataURI: elem,
    });
  });

  const cohortUploadedDataJson = JSON.stringify(cohortUploadedData);

  fs.writeFileSync(config.outputPath, cohortUploadedDataJson);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
