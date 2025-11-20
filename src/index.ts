import * as fs from "node:fs";
import {PDFDocument} from "pdf-lib";
import {acroFieldsExtractor} from "./acroFieldsExtractor";
import {getArguments} from "./arguments";

const templatePre = fs.readFileSync("./tex/template-pre.tex", "utf-8").split("\n");
const templatePost = fs.readFileSync("./tex/template-post.tex", "utf-8").split("\n");
const topLeftOffset = 2;

const args = getArguments();
const inputFileBytes = fs.readFileSync(args.inputFile);


(async () => {
    let outputTex = [...templatePre];

    const doc = await PDFDocument.load(inputFileBytes);
    const pages = doc.getPages();

    for (let i = 0; i < pages.length; i++) {
        // begin page
        outputTex.push(`% -------- page ${i + 1} --------`);
        outputTex.push(`\\begin{existingpage}{${args.latexInputFile}}{${i +1}}`);

        const latexMappedBoundingBoxes = acroFieldsExtractor(pages[i]);
        for (let j = 0; j < latexMappedBoundingBoxes.length; j++) {
            const bounds = latexMappedBoundingBoxes[j];
            const textBoxWidth = Math.floor(bounds[2] - bounds[0]) - (args.padding * 2);

            // create textblock for bounding box
            outputTex.push(`    % -------- page ${i + 1}, box ${j + 1} --------`);
            if (args.center) {
                const centerX = Math.floor((bounds[0] + bounds[2]) / 2);
                const centerY = Math.floor((bounds[1] + bounds[3]) / 2)

                outputTex.push(`    \\begin{textblock*}{${textBoxWidth}mm}[0.5, 0.5](${centerX}mm, ${centerY}mm)`);
            } else {
                const topLeftX = Math.floor(bounds[0]) + args.padding;
                const topLeftY = Math.floor(bounds[1]) + topLeftOffset + args.padding;

                outputTex.push(`    \\begin{textblock*}{${textBoxWidth}mm}[0, 0](${topLeftX}mm, ${topLeftY}mm)`);
            }
            outputTex.push(" ".repeat(8));
            outputTex.push(`    \\end{textblock*}`);

            if (j !== latexMappedBoundingBoxes.length - 1) {
                outputTex.push("");
            }
        }

        // end page
        outputTex.push("\\end{existingpage}");
        outputTex.push("");
        outputTex.push("");
    }

    outputTex.push(...templatePost);

    if (args.stdout) {
        console.log(outputTex.join("\n"));
    } else {
        const outputFile = args.inputFile.replace(".pdf", ".tex");

        fs.writeFileSync(outputFile, outputTex.join("\n"));
        console.log(`Wrote to ${outputFile}`);
    }
})();
