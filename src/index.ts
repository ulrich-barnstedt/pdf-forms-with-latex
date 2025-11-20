import * as fs from "node:fs";
import * as util from "node:util";
import {PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject} from "pdf-lib";

const PDFName_Rect = PDFName.of("Rect");
const templatePre = fs.readFileSync("./tex/template-pre.tex", "utf-8").split("\n");
const templatePost = fs.readFileSync("./tex/template-post.tex", "utf-8").split("\n");

// paper height/width in mm
const targetWidth = 210;
const targetHeight = 297;
const topLeftOffset = 2;

const args = util.parseArgs({
    options: {
        padding: {
            type: "string",
            short: "p",
            default: "0"
        },
        stdout: {
            type: "boolean",
            short: "s",
            default: false
        },
        center: {
            type: "boolean",
            short: "c",
            default: false
        },
        latexInputFile: {
            type: "string",
            short: "l"
        }
    },
    allowPositionals: true
});
if (args.positionals.length === 0) {
    throw "No input file was specified.";
}
const padding = +args.values.padding;
if (isNaN(padding)) {
    throw "Padding is not a valid number";
}

const inputFile = args.positionals[0];
const inputFileBytes = fs.readFileSync(inputFile);


(async () => {
    let outputTex = [...templatePre];

    const doc = await PDFDocument.load(inputFileBytes);
    const pages = doc.getPages();

    for (let i = 0; i < pages.length; i++) {
        // begin page
        outputTex.push(`% -------- page ${i + 1} --------`);
        outputTex.push(`\\begin{existingpage}{${args.values.latexInputFile ? args.values.latexInputFile : inputFile}}{${i +1}}`);

        const page = pages[i];
        const width = page.getWidth();
        const height = page.getHeight();

        const acroFields = page
            .node
            .Annots()!
            .asArray()
            .map(f => doc.context.lookup(f) as PDFDict);
        const boundingBoxes = acroFields
            .map(obj =>
                (obj.get(PDFName_Rect) as PDFArray)
                    .asArray()
                    .map((v: PDFObject) => (v as PDFNumber).asNumber())
            )
        const filteredBoundingBoxes = boundingBoxes
            .map((bb) => {
                const [tx, ty, bx, by] = bb;

                return {
                    area: (bx - tx) * (by - ty),
                    bb
                }
            })
            .filter(({bb, area}) => area > 150)
            .map(({bb}) => bb);
        const latexMappedBoundingBoxes = filteredBoundingBoxes
            .map((bounds) => [
                (bounds[0] / width) * targetWidth,
                ((height - bounds[3]) / height) * targetHeight,
                (bounds[2] / width) * targetWidth,
                ((height - bounds[1]) / height) * targetHeight,
            ]);

        for (let j = 0; j < latexMappedBoundingBoxes.length; j++) {
            const bounds = latexMappedBoundingBoxes[j];

            outputTex.push(`    % -------- page ${i + 1}, box ${j + 1} --------`);
            if (args.values.center) {
                const textBoxWidth = Math.floor(bounds[2] - bounds[0]) - (padding * 2);
                const centerX = Math.floor((bounds[0] + bounds[2]) / 2);
                const centerY = Math.floor((bounds[1] + bounds[3]) / 2)

                outputTex.push(`    \\begin{textblock*}{${textBoxWidth}mm}[0.5, 0.5](${centerX}mm, ${centerY}mm)`);
            } else {
                const textBoxWidth = Math.floor(bounds[2] - bounds[0]) - padding;
                const topLeftX = Math.floor(bounds[0]) + padding;
                const topLeftY = Math.floor(bounds[1]) + topLeftOffset + padding;

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

    if (args.values.stdout) {
        console.log(outputTex.join("\n"));
    } else {
        const outputFile = inputFile.replace(".pdf", ".tex");

        fs.writeFileSync(outputFile, outputTex.join("\n"));
        console.log(`Wrote to ${outputFile}`);
    }
})();
