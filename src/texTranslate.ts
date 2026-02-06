import {MultifileTex} from "./multifileTex";
import {ExtractedField} from "./acroFieldsExtractor";
import {Arguments} from "./arguments";

const topLeftOffset = 2;

export const translatePageOfBoxesToTex = (tex: MultifileTex, boxesOnPage: ExtractedField[], pageIdx: number, args: Arguments) => {
    if (args.segment) {
        // use first character of title as segment identifier
        const segments = new Set(boxesOnPage.map(b => b.title[0]));
        tex.setSegment(segments.values().next().value);

        if (segments.size > 1) {
            console.warn(`WARN: on page ${pageIdx + 1}: boxes were not separated by segment due to multiple segments being on one page (${Array.from(segments).join(", ")})`);
        }
    } else if (args.pagewise) {
        tex.setSegment((pageIdx + 1).toString());
    }

    // begin page
    tex.append([
        `% -------- page ${pageIdx + 1} --------`,
        `\\begin{existingpage}{${args.latexInputFile}}{${pageIdx + 1}}`
    ]);

    // map each box on page
    for (let boxIdx = 0; boxIdx < boxesOnPage.length; boxIdx++) {
        const box = boxesOnPage[boxIdx];
        const textBoxWidth = Math.floor(box.boundingBox.bottomRightX - box.boundingBox.topLeftX) - (args.xPadding * 2);

        // create textblock for bounding box
        tex.append([`    % -------- page ${pageIdx + 1}, box ${boxIdx + 1}, "${box.title}" --------`]);
        if (args.center) {
            const centerX = Math.floor((box.boundingBox.topLeftX + box.boundingBox.bottomRightX) / 2);
            const centerY = Math.floor((box.boundingBox.topLeftY + box.boundingBox.bottomRightY) / 2)

            tex.append([`    \\begin{textblock*}{${textBoxWidth}mm}[0.5, 0.5](${centerX}mm, ${centerY}mm)`]);
        } else {
            const topLeftX = Math.floor(box.boundingBox.topLeftX) + args.xPadding;
            const topLeftY = Math.floor(box.boundingBox.topLeftY) + topLeftOffset + args.yPadding;

            tex.append([`    \\begin{textblock*}{${textBoxWidth}mm}[0, 0](${topLeftX}mm, ${topLeftY}mm)`]);
        }
        tex.append([
            " ".repeat(8),
            `    \\end{textblock*}`
        ])

        if (boxIdx !== boxesOnPage.length - 1) {
            tex.append([""]);
        }
    }

    // end page
    tex.append([
        "\\end{existingpage}",
        "",
        ""
    ]);
}
