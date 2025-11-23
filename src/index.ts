import * as fs from "node:fs";
import {PDFDocument} from "pdf-lib";
import {acroFieldsExtractor, ExtractedField} from "./acroFieldsExtractor";
import {getArguments} from "./arguments";
import {MultifileTex} from "./multifileTex";
import {translatePageOfBoxesToTex} from "./texTranslate";

const args = getArguments();
const inputFileBytes = fs.readFileSync(args.inputFile);


(async () => {
    const outputFile = args.latexInputFile.replace(".pdf", "");
    const tex = new MultifileTex(outputFile, !args.singleFile);

    const doc = await PDFDocument.load(inputFileBytes);
    const mappedBoxes = acroFieldsExtractor(doc);

    // map boxes to their respective pages
    const pages: ExtractedField[][] = [];
    for (const box of mappedBoxes) {
        if (pages[box.page] === undefined) {
            pages[box.page] = [];
        }
        pages[box.page].push(box);
    }

    // process each page
    for (let i = 0; i < pages.length; i++) {
        translatePageOfBoxesToTex(
            tex,
            pages[i],
            i,
            args
        );
    }

    tex.endFile();
    tex.write();
})();
