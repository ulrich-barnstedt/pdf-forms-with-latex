import {PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject, PDFPage, PDFString} from "pdf-lib";

const PDFName_Rect = PDFName.of("Rect");
const PDFName_T = PDFName.of("T");

// paper height/width in mm
const targetWidth = 210;
const targetHeight = 297;

export interface ExtractedField {
    boundingBox: {
        topLeftX: number,
        topLeftY: number,
        bottomRightX: number,
        bottomRightY: number
    },
    page: number,
    segment: string,
    object: PDFDict
}

export const acroFieldsExtractor = (doc: PDFDocument): ExtractedField[] => {
    const pages = doc.getPages();
    const extractedFields: ExtractedField[] = [];

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const page = pages[pageIdx];
        const width = page.getWidth();
        const height = page.getHeight();

        const acroFields = page
            .node
            .Annots()!
            .asArray()
            .map(f => doc.context.lookup(f) as PDFDict);

        for (const acroField of acroFields) {
            const boundingBox = (acroField.get(PDFName_Rect) as PDFArray)
                .asArray()
                .map((v: PDFObject) => (v as PDFNumber).asNumber());

            const [o_tx, o_ty, o_bx, o_by] = boundingBox;
            const area = (o_bx - o_tx) * (o_by - o_ty);
            if (area < 150) continue;

            const topLeftX = (o_tx / width) * targetWidth;
            const topLeftY = ((height - o_by) / height) * targetHeight;
            const bottomRightX = (o_bx / width) * targetWidth;
            const bottomRightY = ((height - o_ty) / height) * targetHeight;

            const segmentText = (acroField.get(PDFName.of("T")) as PDFString)
                .decodeText()
                [0];

            extractedFields.push({
                object: acroField,
                boundingBox: {
                    topLeftX,
                    topLeftY,
                    bottomRightX,
                    bottomRightY
                },
                page: pageIdx,
                segment: segmentText
            });
        }
    }

    return extractedFields;
}
