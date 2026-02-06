import util from "node:util";

const helpMessages = [
    {
        long: "--help",
        short: "-h",
        description: "Show this help message"
    },
    {
        long: "--padding <amount>",
        short: "-p",
        description: "Set padding (in mm, default 4) to be inserted around generated textboxes"
    },
    {
        long: "--center",
        short: "-c",
        description: "Center text in textboxes instead of aligning top-left"
    },
    {
        long: "--latexInputFile <file>",
        short: "-l",
        description: "Override the filename passed to the latex template (by default the filename is the same as the input file)"
    },
    {
        long: "--segment",
        short: "-s",
        description: "Attempt to automatically segment form inputs into multiple latex files (incompatible with --pagewise)"
    },
    {
        long: "--pagewise",
        short: "-n",
        description: "Segment output into one latex file per page (incompatible with --segment)"
    },
    {
        long: "--all",
        short: "-a",
        description: "Include all boxes (per default too small boxes are not included)"
    }
]

export interface Arguments {
    padding: number,
    center: boolean,
    latexInputFile: string,
    inputFile: string,
    segment: boolean,
    pagewise: boolean,
    allBoxes: boolean
}

export const parseArguments = () : Arguments => {
    const args = util.parseArgs({
        options: {
            padding: {
                type: "string",
                short: "p",
                default: "4"
            },
            center: {
                type: "boolean",
                short: "c",
                default: false
            },
            latexInputFile: {
                type: "string",
                short: "l"
            },
            segment: {
                type: "boolean",
                default: false,
                short: "s"
            },
            pagewise: {
                type: "boolean",
                default: false,
                short: "n"
            },
            help: {
                type: "boolean",
                default: false,
                short: "h"
            },
            all: {
                type: "boolean",
                default: false,
                short: "a"
            }
        },
        allowPositionals: true
    });

    if (args.values.help) {
        console.log("Usage: pdfform-to-latex <pdf-file>");
        console.log();

        const formattedMessages = helpMessages.map(argument => {
            return {param: `${argument.short}, ${argument.long}`, description: argument.description};
        });
        const textLength = formattedMessages.reduce((acc, {param}) => param.length > acc ? param.length : acc, 0);

        for (const {param, description} of formattedMessages) {
            console.log(` ${param.padEnd(textLength, " ")}  ${description}`);
        }

        process.exit(1);
    }

    if (args.positionals.length === 0) {
        throw "No input file was specified.";
    }

    const padding = +args.values.padding;
    if (isNaN(padding)) {
        throw "Padding is not a valid number";
    }

    return {
        center: args.values.center,
        inputFile: args.positionals[0],
        padding,
        latexInputFile: args.values.latexInputFile ? args.values.latexInputFile : args.positionals[0],
        segment: args.values.segment,
        pagewise: args.values.pagewise,
        allBoxes: args.values.all
    }
}
