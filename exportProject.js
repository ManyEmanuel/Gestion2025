const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, 'src'); // Cambia 'src' por la carpeta raíz de tu proyecto
const outputFile = path.resolve(__dirname, 'project_code.txt');

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

const writeFilesToOutput = (files, outputFile) => {
  const writeStream = fs.createWriteStream(outputFile);

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    writeStream.write(`// filepath: ${file}\n`);
    writeStream.write(content);
    writeStream.write('\n\n');
  });

  writeStream.end();
};

const files = getAllFiles(projectDir);
writeFilesToOutput(files, outputFile);

console.log(`Project code has been exported to ${outputFile}`);

/*Abri CMD en la carpeta donde se encuentra el archivo exportProject.js
cd "C:\Users\UTIE-03\Documents\Sistemas desde GIT\Gestion_Documental"
dir
node exportProject.js*/
