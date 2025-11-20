import {PDFArray, PDFDict, PDFName, PDFNumber, PDFObject, PDFPage} from "pdf-lib";

const PDFName_Rect = PDFName.of("Rect");

// paper height/width in mm
const targetWidth = 210;
const targetHeight = 297;


export const acroFieldsExtractor = (page: PDFPage) => {
    const doc = page.doc;
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

    return latexMappedBoundingBoxes;
}
