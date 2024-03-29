import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import fs from 'fs';
import path from 'path';
import viteImagemin from 'vite-plugin-imagemin';

function findHtmlFiles(dir, fileList = {}) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (filePath.endsWith('.html')) {
            const name = path.relative(process.cwd(), filePath).replace(/\\/g, '/').replace(/^\.\//, '');
            fileList[name] = filePath;
        }
    });
    return fileList;
}


const htmlInput = findHtmlFiles(path.resolve(__dirname, ''));


function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

export default defineConfig({
    plugins: [
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
        }),
        {
            name: 'copy-assets-js',
            generateBundle() {
                const folderPath = path.resolve(__dirname, 'assets/js');
                const allFiles = getAllFiles(folderPath);

                allFiles.forEach((filePath) => {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const outputPath = 'assets/js/' + path.relative(folderPath, filePath);
                    this.emitFile({ type: 'asset', fileName: outputPath, source: fileContent });
                });
            }
        },
        {
            name: 'copy-assets-vendor',
            generateBundle() {
                const folderPath = path.resolve(__dirname, 'vendor');
                const allFiles = getAllFiles(folderPath);

                allFiles.forEach((filePath) => {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const outputPath = 'vendor/' + path.relative(folderPath, filePath);
                    this.emitFile({ type: 'asset', fileName: outputPath, source: fileContent });
                });
            }
        },
        viteImagemin({
            gifsicle: {
                optimizationLevel: 7,
                interlaced: false,
            },
            optipng: {
                optimizationLevel: 7,
            },
            mozjpeg: {
                quality: 80,
            },
            pngquant: {
                quality: [0.8, 0.9],
                speed: 4,
            },
            svgo: {
                plugins: [
                    {
                        name: 'removeViewBox',
                    },
                    {
                        name: 'removeEmptyAttrs',
                        active: false,
                    },
                ],
            },
        }),
    ],
    build: {
        rollupOptions: {
            input: htmlInput,
        },
    },
});
