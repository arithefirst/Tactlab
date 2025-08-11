import * as Minio from 'minio';
import { TwelveLabs } from 'twelvelabs-js';

const tlClient = new TwelveLabs({ apiKey: process.env.TL_API_KEY });
const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT!,
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESSKEY,
  secretKey: process.env.S3_SECRETKEY,
});

export { minioClient, tlClient };
