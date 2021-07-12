import fs from 'fs';

export const getSQL = (filename: string) => {
  const path = __dirname + `/${filename}`;
  return fs.readFileSync(path).toString();
};
