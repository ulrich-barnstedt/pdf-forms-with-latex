import {MultifileTex} from "./multifileTex";
import {ExtractedField} from "./acroFieldsExtractor";
import {Arguments} from "./arguments";

const topLeftOffset = 2;

export const translatePageOfBoxesToTex = (tex: MultifileTex, boxesOnPage: ExtractedField[], pageIdx: number, args: Arguments) => {
    const segments = new Set(boxesOnPage.map(b => b.title[0]));
    const targetSegment = tex.toSegment(segments.values().next().value);

    if (args.segment) {
        // check if all boxes are in same segment, else print warning
        if (segments.size > 1) {
            console.warn(`WARN: at page ${pageIdx + 1}, elements were not separated by segment, due to multiple segments on one page`);
        }
    }

    // begin page
    tex.appendLinesTo(targetSegment, [
        `% -------- page ${pageIdx + 1} --------`,
        `\\begin{existingpage}{${args.latexInputFile}}{${pageIdx + 1}}`
    ]);

    // map each box on page
    for (let boxIdx = 0; boxIdx < boxesOnPage.length; boxIdx++) {
        const box = boxesOnPage[boxIdx];
        const textBoxWidth = Math.floor(box.boundingBox.bottomRightX - box.boundingBox.topLeftX) - (args.padding * 2);

        // create textblock for bounding box
        tex.appendLinesTo(targetSegment, [`    % -------- page ${pageIdx + 1}, box ${boxIdx + 1}, "${box.title}" --------`]);
        if (args.center) {
            const centerX = Math.floor((box.boundingBox.topLeftX + box.boundingBox.bottomRightX) / 2);
            const centerY = Math.floor((box.boundingBox.topLeftY + box.boundingBox.bottomRightY) / 2)

            tex.appendLinesTo(targetSegment, [`    \\begin{textblock*}{${textBoxWidth}mm}[0.5, 0.5](${centerX}mm, ${centerY}mm)`]);
        } else {
            const topLeftX = Math.floor(box.boundingBox.topLeftX) + args.padding;
            const topLeftY = Math.floor(box.boundingBox.topLeftY) + topLeftOffset + args.padding;

            tex.appendLinesTo(targetSegment, [`    \\begin{textblock*}{${textBoxWidth}mm}[0, 0](${topLeftX}mm, ${topLeftY}mm)`]);
        }
        tex.appendLinesTo(targetSegment, [
            " ".repeat(8),
            `    \\end{textblock*}`
        ])

        if (boxIdx !== boxesOnPage.length - 1) {
            tex.appendLinesTo(targetSegment, [""]);
        }
    }

    // end page
    tex.appendLinesTo(targetSegment, [
        "\\end{existingpage}",
        "",
        ""
    ]);
}
