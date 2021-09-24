import { create } from "ipfs-http-client";
import * as fs from "fs";

class DeStore {
  ipfs: any;
  imageBasePath: string;

  constructor(url: string, imageBasePath: string) {
    this.ipfs = create({ url: url });

    this.imageBasePath = imageBasePath;
  }

  public async uploadImage(imageFileName: string) {
    const imagePath = `${this.imageBasePath}/${imageFileName}`;
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
      displayImage: displayImage,
      cohortID: cohortId,
    });

    const hash = await this.ipfs.add(tokenMetaData);
    return hash.cid.toString();
  }

  public async uploadMetadata(cohortData: [{ name: string; image: string }]) {
    const metadataHashes = cohortData.map(
      async (elem: { name: string; image: string }) => {
        const imageHash = await this.uploadImage(elem.image);
        return await this.addCertificate(elem.name, imageHash, 1);
      }
    );

    return Promise.all(metadataHashes);
  }
}

async function main() {
  const deStore = new DeStore("https://ipfs.infura.io:5001", "metadata/images");
  const cohortData = JSON.parse(
    fs.readFileSync("metadata/cohort1.json", "utf-8")
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

  fs.writeFileSync("metadata/storeScriptOp.json", cohortUploadedDataJson);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
