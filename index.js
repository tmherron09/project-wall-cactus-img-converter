const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function getDir() {
  if (process.pkg) {
    return path.resolve(process.execPath + "/..");
  } else {
    return path.join(require.main ? require.main.path : process.cwd());
  }
}

const inputPath = getDir() + "\\input";
const outputPath = getDir() + "\\converted";

function verifyInputOutPaths() {
  if (!fs.existsSync(inputPath)) {
    fs.mkdir(inputPath, (err) => {
      if (err) {
        console.debug("Error Creating Input Directory");
        console.debug(err);
        return 0;
      }
    });
    console.debug(`Directory Created: ${inputPath}`);
  } else {
    console.debug("Input Directory Found!");
  }
  if (!fs.existsSync(outputPath)) {
    fs.mkdir(outputPath, (err) => {
      if (err) {
        console.debug("Error Creating Output/Converted Directory");
        console.debug(err);
        return 0;
      }
    });
    console.debug(`Directory Created: ${outputPath}`);
  } else {
    console.debug("Output/Converted Directory Found!");
  }
}

async function getMetadata(fileName, logInfo = true) {
  try {
    const metadata = await sharp(fileName).metadata();
    if (logInfo) {
      console.log(metadata);
      console.log(typeof metadata);
      console.log(metadata.width);
      console.log(metadata.height);
    }
    return metadata;
  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
  }
}

async function compressJpegKeepOriginalName(
  imageMetaData,
  fileName,
  outputName,
  size,
  divisor
) {
  try {
    let width = Math.floor(imageMetaData.width / divisor);
    let height = Math.floor(imageMetaData.height / divisor);
    let toFileName = `${outputName}${size}.jpeg`;
    await sharp(fileName)
      .resize({
        width: width,
        height: height,
      })
      .toFormat("jpeg", { mozjpeg: true })
      .toFile(toFileName);
    console.debug(`Successfully Created: ${toFileName}`);
  } catch (error) {
    console.log(error);
  }
}

async function processInputImagesKeepOriginalName() {
  fs.readdir(inputPath, (err, files) => {
    files.forEach((file) => {
      let inputFile = `${inputPath}\\${file}`;
      console.debug(inputFile);
      processImageKeepOriginalName(inputFile, file);
    });
  });
}

async function processImageKeepOriginalName(inputFile, file) {
  let imageMetadata = await getMetadata(inputFile, false);
  let fileName = file.split(".")[0];
  let outputDirectory = `${outputPath}\\${fileName}`;
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdir(outputDirectory, (err) => {
      if (err) {
        console.debug(err);
        return 0;
      }
    });
    console.debug(`Directory Created: ${outputDirectory}`);
  }
  let outputFile = `${outputPath}\\${fileName}\\${fileName}`;
  compressJpegKeepOriginalName(imageMetadata, inputFile, outputFile, "-sm", 4);
  compressJpegKeepOriginalName(imageMetadata, inputFile, outputFile, "-md", 3);
  compressJpegKeepOriginalName(imageMetadata, inputFile, outputFile, "-lg", 2);
  compressJpegKeepOriginalName(imageMetadata, inputFile, outputFile, "", 1);
}

console.log("Beginning Image Conversion Process:\n");
verifyInputOutPaths();
console.log("Input/Output Directories Verification Complete.\n\n");
processInputImagesKeepOriginalName();
console.log("Image Processing Complete.");
