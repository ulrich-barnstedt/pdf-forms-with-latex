import {PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject, PDFString} from "pdf-lib";

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
    title: string,
    object: PDFDict
}

// extract acroFields in pdf to list segmented by pages
export const acroFieldsExtractor = (doc: PDFDocument): ExtractedField[][] => {
    const pages = doc.getPages();

    return pages.map((page, pageIdx) => {
        const width = page.getWidth();
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

            const [o_tx, o_ty, o_bx, o_by] = boundingBox;
            const area = (o_bx - o_tx) * (o_by - o_ty);
            if (area < 150) continue;

            const topLeftX = (o_tx / width) * targetWidth;
            const topLeftY = ((height - o_by) / height) * targetHeight;
            const bottomRightX = (o_bx / width) * targetWidth;
            const bottomRightY = ((height - o_ty) / height) * targetHeight;

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
