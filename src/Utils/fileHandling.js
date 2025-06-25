import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);

const currentDirectoryPath = path.dirname(currentFilePath);

const directory = path.join(currentDirectoryPath, '/DataFolder');

const FileHanding = {

    createFolder: async (directorypath) => {
        try {
            await fs.promises.mkdir(directorypath, { recursive: true });
            console.log("folder created");
        } catch (error) {
            console.log("Error at createFolder : - ", error);
        }
    },

    createFile: (fileName) => {
        try {

            FileHanding.createFolder(directory);

            const filePath = path.join(directory, fileName);

            if (fs.existsSync(filePath)) {
                console.log("File already present");
            } else {
                fs.writeFile(filePath, JSON.stringify({ "chats": [] }), (err) => {
                    if (err) {
                        console.log("Error at createFile : - ", err);
                    } else {
                        console.log("File created!");
                    }
                });
            }

        } catch (error) {
            console.log("Error occurs at createFile : - ", error);
        }
    },
    storeData: async (filename, newObject) => {

        try {
            await FileHanding.createFolder(directory);


            const filePath = path.join(directory, filename + ".json");


            let fileContent;


            try {
                fileContent = await fs.promises.readFile(filePath, 'utf-8');

            } catch (error) {
                if (error.code == "ENOENT") {
                    fileContent = '{"chats" : []}';
                } else {
                    throw error;
                }
            }


            const json = JSON.parse(fileContent);


            json.chats.push(newObject);


            await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2));

        } catch (error) {
            console.log(error);
        }
    },
    retriveChats: async (filename) => {
        const filePath = path.join(directory, filename + ".json");

        if (fs.existsSync(filePath)) {
            const fileData = await fs.promises.readFile(filePath, 'utf-8');

            return JSON.parse(fileData);
        } else {
            console.log("File not exists");
        }

        return null;
    }
}


export default FileHanding;