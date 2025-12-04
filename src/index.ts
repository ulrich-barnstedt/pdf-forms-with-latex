import * as fs from "node:fs";
import {PDFDocument} from "pdf-lib";
import {acroFieldsExtractor} from "./acroFieldsExtractor";
import {parseArguments} from "./arguments";
import {MultifileTex} from "./multifileTex";
import {translatePageOfBoxesToTex} from "./texTranslate";

const args = parseArguments();
const inputFileBytes = fs.readFileSync(args.inputFile);

(async () => {
    const outputFile = args.latexInputFile.replace(".pdf", "");
    const tex = new MultifileTex(outputFile, args.segment);

    const doc = await PDFDocument.load(inputFileBytes);
    const mappedBoxesPerPage = acroFieldsExtractor(doc);

    // process each page
    for (let i = 0; i < mappedBoxesPerPage.length; i++) {
        translatePageOfBoxesToTex(
            tex,
            mappedBoxesPerPage[i],
            i,
            args
        );
    }

    tex.endFile();
    tex.write();
})();
