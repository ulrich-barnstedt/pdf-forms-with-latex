import fs from "node:fs";

const templatePre = fs.readFileSync("./tex/template-pre.tex", "utf-8").split("\n");
const templatePost = fs.readFileSync("./tex/template-post.tex", "utf-8").split("\n");

export class MultifileTex {
    private files: Record<string, string[]> = {};
    public readonly mainFile: string;
    private readonly segmentIntoMultiple: boolean;

    public constructor (mainFile: string, segment: boolean) {
        this.mainFile = mainFile;
        this.segmentIntoMultiple = segment;

        this.files[mainFile] = [
            ...templatePre
        ];
    }

    public appendLinesTo (segment: string, content: string[]) {
        if (this.segmentIntoMultiple) {
            const generatedName = this.mainFile + "-" + segment;
            if (!(generatedName in this.files)) {
                this.files[generatedName] = [];
            }

            this.files[generatedName].push(...content);
        } else {
            this.files[this.mainFile].push(...content);
        }

    }

    public appendLines (content: string[]) {
        this.files[this.mainFile].push(...content);
    }

    public endFile () {
        if (this.segmentIntoMultiple) {
            this.appendLines([""]);

            for (const file in this.files) {
                if (file === this.mainFile) continue;
                this.files[this.mainFile].push(`\\include{${file}.tex}`);
            }

            this.appendLines([""]);
        }

        this.files[this.mainFile].push(...templatePost);
    }

    public write () {
        // TODO: write all
        console.log(this.files);
    }
}