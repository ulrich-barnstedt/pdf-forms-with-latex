import {PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject, PDFString} from "pdf-lib";
import {Arguments} from "./arguments";

const PDFName_Rect = PDFName.of("Rect");
const PDFName_T = PDFName.of("T");
// postscript-points to millimeters
const ptsToMm = 25.4 / 72;

export interface ExtractedField {
    boundingBox: {
        topLeftX: number,
        topLeftY: number,
        bottomRightX: number,
        bottomRightY: number
    },
    page: number,
    title: string,
    object: PDFDict
}

// extract acroFields to list segmented by pages
export const acroFieldsExtractor = (doc: PDFDocument, args: Arguments): ExtractedField[][] => {
    const pages = doc.getPages();

    return pages.map((page, pageIdx) => {
        const height = page.getHeight();
        const extractedFields: ExtractedField[] = [];

        const annots = page.node.Annots();
        if (annots === undefined) {
            console.warn(`INFO: no fields were found on page ${pageIdx + 1}`);
            return extractedFields;
        }
        const acroFields = annots
            .asArray()
            .map(ref => doc.context.lookup(ref) as PDFDict);

        for (const acroField of acroFields) {
            const boundingBox = (acroField.get(PDFName_Rect) as PDFArray)
                .asArray()
                .map((v: PDFObject) => (v as PDFNumber).asNumber());
            const [pts_topX, pts_topY, pts_bottomX, pts_bottomY] = boundingBox;

            if (!args.allBoxes) {
                // ignore boxes smaller than 150 pts^2 (like checkboxes)
                const area = (pts_bottomX - pts_topX) * (pts_bottomY - pts_topY);
                if (area < 150) continue;
            }

            const topLeftX = pts_topX * ptsToMm;
            const topLeftY = (height - pts_bottomY) * ptsToMm;
            const bottomRightX = pts_bottomX * ptsToMm;
            const bottomRightY = (height - pts_topY) * ptsToMm;

            const title = (acroField.get(PDFName_T) as PDFString)?.decodeText() ?? "?";

            extractedFields.push({
                object: acroField,
                boundingBox: {
                    topLeftX,
                    topLeftY,
                    bottomRightX,
                    bottomRightY
                },
                page: pageIdx,
                title: title
            });
        }

        return extractedFields;
    });
}
