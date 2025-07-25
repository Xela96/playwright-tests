import { getAccessToken } from 'gmail-getter';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default async function globalSetup() {
  const accessToken = await getAccessToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!,
    process.env.REFRESH_TOKEN!
  );
  fs.writeFileSync(
    path.resolve(__dirname, '.access_token'),
    accessToken,
    'utf-8'
  );
}