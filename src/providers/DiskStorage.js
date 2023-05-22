const fs = require("fs");
const path = require("path");

const uploadConfig = require("../configs/upload");

class diskStorage {
  async saveFile(file) {
    await fs.promises.rename(
      path.resolve(uploadConfig.modules.TMP_FOLDER, file),
      path.resolve(uploadConfig.modules.UPLOADS_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file){
    const filePath = path.resolve(uploadConfig.modules.UPLOADS_FOLDER, file);
    try{
      await fs.promises.stat(filePath);

    }catch{
      return;
    }

    await fs.promises.unlink(filePath);

  }
}

module.exports = diskStorage;