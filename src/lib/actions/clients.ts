import * as Minio from 'minio';
import { TwelveLabs } from 'twelvelabs-js';

function checkVars() {
  const requiredEnv = [
    { key: 'S3_ENDPOINT', value: process.env.S3_ENDPOINT },
    { key: 'S3_ACCESSKEY', value: process.env.S3_ACCESSKEY },
    { key: 'S3_SECRETKEY', value: process.env.S3_SECRETKEY },
    { key: 'S3_PORT', value: process.env.S3_PORT },
    { key: 'TL_API_KEY', value: process.env.TL_API_KEY },
    { key: 'TL_INDEX_ID', value: process.env.TL_INDEX_ID },
  ];

  for (const env of requiredEnv) {
    if (!env.value) {
      console.error(`The following environment variable was required and not provided: ${env.key}`);
    }
  }
}

checkVars();

const tlClient = new TwelveLabs({ apiKey: process.env.TL_API_KEY });
const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: +process.env.S3_PORT!,
  useSSL: false,
  accessKey: process.env.S3_ACCESSKEY,
  secretKey: process.env.S3_SECRETKEY,
});

export { minioClient, tlClient };
