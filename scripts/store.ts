import minimist from "minimist";
import * as fs from "fs";
import pinataClient from "@pinata/sdk";
import * as dotenv from "dotenv";

class Configuration {
    cohortId: number;
    sourceDataPath: string;
    outputPath: string;
    videosPath: string;
    imagesPath: string;

    constructor(args: string[]) {
        const params = minimist(args);
        this.cohortId = params.cohortId;
        this.sourceDataPath = params.sourceDataPath;
        this.outputPath = params.outputPath;
        this.videosPath = params.videosPath;
        this.imagesPath = params.imagesPath;
    }
}

class DeStore {
    ipfs: any;
    config: Configuration;
    client: any;
    apiKey: string;
    apiSecret: string;

    constructor(config: Configuration) {
        dotenv.config();
        this.config = config;
        this.apiKey = process.env.PINATA_API_KEY as string;
        this.apiSecret = process.env.PINATA_API_SECRET as string;
        this.client = pinataClient(this.apiKey, this.apiSecret);
    }

    public async uploadFile(filePath: string) {
        const result = await this.client.pinFileToIPFS(
            fs.createReadStream(filePath)
        );
        return result.IpfsHash;
    }

    public async addCertificate(
        name: string,
        displayVideo: string,
        displayImage: string,
        cohortId: number
    ) {
        const tokenMetaData = {
            name: name,
            animation_url: displayVideo,
            image: displayImage,
            attributes: [
                {
                    trait_type: "CohortId",
                    display_type: "number",
                    value: cohortId,
                },
            ],
        };

        const response = await this.client.pinJSONToIPFS(tokenMetaData);
        return response.IpfsHash;
    }

    public async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public async uploadMetadata(
        cohortData: [{ name: string; video: string; image: string }]
    ) {
        let certHashes: string[] = [];
        for (let elem of cohortData) {
            const videoPath = `${this.config.videosPath}/${elem.video}`;
            const videoHash = await this.uploadFile(videoPath);

            const imagePath = `${this.config.imagesPath}/${elem.image}`;
            const imageHash = await this.uploadFile(imagePath);

            console.log(
                `Added video for member: ${elem.name} with hash: ${videoHash}`
            );
            await this.sleep(1000);
            let certHash = await this.addCertificate(
                elem.name,
                videoHash,
                imageHash,
                this.config.cohortId
            );
            certHashes.push(certHash);
        }

        return certHashes;
    }
}

async function main() {
    const config = new Configuration(process.argv);
    const deStore = new DeStore(config);
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
