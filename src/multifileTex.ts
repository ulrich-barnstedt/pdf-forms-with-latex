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
    private currentSegment: string;

    public constructor (mainFile: string) {
        this.mainFile = mainFile;
        this.currentSegment = mainFile;

        this.files.set(mainFile, [
            ...templatePre
        ]);
    }

    public setSegment (segment: string | undefined) {
        if (segment === undefined) return;

        let formattedSegment = this.mainFile + "-" + segment;
        if (formattedSegment === this.currentSegment) return;

        if (this.files.has(formattedSegment)) {
            console.info(`INFO: duplicate segment "${segment}", auto-renaming`);
        }
        while (this.files.has(formattedSegment)) formattedSegment += "*";

        this.currentSegment = formattedSegment;
    }

    public append (content: string[]) {
        if (!this.files.has(this.currentSegment)) {
            this.files.set(this.currentSegment, []);
        }

        this.files.get(this.currentSegment)!.push(...content);
    }

    public endFile () {
        const mainFileRef = this.files.get(this.mainFile)!;

        if (this.files.size > 1) {
            mainFileRef.push("");

            for (const [file, _content] of this.files) {
                if (file === this.mainFile) continue;
                mainFileRef.push(`\\include{${file}.tex}`);
            }

            mainFileRef.push("");
        }

        mainFileRef.push(...templatePost);
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
