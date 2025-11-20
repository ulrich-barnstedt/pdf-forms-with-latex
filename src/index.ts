import * as fs from "node:fs";
import {PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject} from "pdf-lib";

const PDFName_Rect = PDFName.of("Rect");
const bytes = fs.readFileSync("./ha4.pdf");
const templatePre = fs.readFileSync("./tex/template-pre.tex", "utf-8").split("\n");
const templatePost = fs.readFileSync("./tex/template-post.tex", "utf-8").split("\n");

// paper height/width in mm
const targetWidth = 210;
const targetHeight = 297;

/*
TODO:
- option for input/output
- option for centering / top left (with envs for centering/not)
- option for offset left? (pdf boxes incorrect)
 */

(async () => {
    let outputTex = [...templatePre];

    const doc = await PDFDocument.load(bytes);
    const pages = doc.getPages();

    for (let i = 0; i < pages.length; i++) {
        // begin page
        outputTex.push(`\\begin{existingpage}{ha4.pdf}{${i +1}}`);

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

            outputTex.push(`    % page ${i + 1}, box ${j + 1}`);
            outputTex.push(`    \\begin{textblock*}{${Math.floor(bounds[2] - bounds[0])}mm}[0.5, 0.5](${Math.floor((bounds[0] + bounds[2]) / 2)}mm, ${Math.floor((bounds[1] + bounds[3]) / 2)}mm)`);
            outputTex.push(" ".repeat(8));
            outputTex.push(`    \\end{textblock*}`);

            if (j !== latexMappedBoundingBoxes.length - 1) {
                outputTex.push("");
            }
        }

        // end page
        outputTex.push("\\end{existingpage}");
        outputTex.push("");
    }

    outputTex.push(...templatePost);
    console.log(outputTex.join("\n"));
})();
