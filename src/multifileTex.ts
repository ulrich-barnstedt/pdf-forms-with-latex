import fs from "node:fs";
import path from "node:path";

const templatePrePath = path.resolve(__dirname, "../tex/template-pre.tex");
const templatePostPath = path.resolve(__dirname, "../tex/template-post.tex");
const templatePre = fs.readFileSync(templatePrePath, "utf-8").split("\n");
const templatePost = fs.readFileSync(templatePostPath, "utf-8").split("\n");

export class MultifileTex {
    // map retains insertion order
    private files: Map<string, string[]> = new Map<string, string[]>();
    public readonly mainFile: string;
    private readonly mainFileRef: string[];
    private readonly segmentIntoMultiple: boolean;
    private lastSegment: string;

    public constructor (mainFile: string, segmentIntoMultiple: boolean) {
        this.mainFile = mainFile;
        this.segmentIntoMultiple = segmentIntoMultiple;
        this.lastSegment = mainFile;

        this.files.set(mainFile, [
            ...templatePre
        ]);
        this.mainFileRef = this.files.get(mainFile)!;
    }

    public toSegment (name: string | undefined) : string {
        if (!name) {
            return this.lastSegment;
        }

        return this.mainFile + "-" + name;
    }

    public appendLinesTo (segment: string, content: string[]) {
        this.lastSegment = segment;

        if (this.segmentIntoMultiple) {
            if (!this.files.has(segment)) {
                this.files.set(segment, []);
            }

            this.files.get(segment)!.push(...content);
        } else {
            this.mainFileRef.push(...content);
        }
    }

    public endFile () {
        if (this.segmentIntoMultiple) {
            this.mainFileRef.push("");

            for (const [file, _content] of this.files) {
                if (file === this.mainFile) continue;
                this.mainFileRef.push(`\\include{${file}.tex}`);
            }

            this.mainFileRef.push("");
        }

        this.mainFileRef.push(...templatePost);
    }

    public write () {
        console.log("Generated files:");

        for (const [file, content] of this.files) {
            const filename = file + ".tex";
            console.log(`\t${filename}`);

            fs.writeFileSync(filename, content.join("\n"));
        }
    }
}
