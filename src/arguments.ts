import util from "node:util";

const helpMessages = [
    {
        long: "--help",
        short: "-h",
        description: "Show this help message"
    },
    {
        long: "--verticalPadding <amount>",
        short: "-y",
        description: "Set vertical padding around textboxes (in mm, default 0)"
    },
    {
        long: "--horizontalPadding <amount>",
        short: "-x",
        description: "Set horizontal padding around textboxes (in mm, default 1)"
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
        short: "-p",
        description: "Segment output into one latex file per page (incompatible with --segment)"
    },
    {
        long: "--all",
        short: "-a",
        description: "Include all boxes (per default too small boxes are not included)"
    }
]

export interface Arguments {
    xPadding: number,
    yPadding: number,
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
            verticalPadding: {
                type: "string",
                short: "y",
                default: "0"
            },
            horizontalPadding: {
                type: "string",
                short: "x",
                default: "1"
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
                short: "p"
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

    const yPadding = +args.values.verticalPadding;
    const xPadding = +args.values.horizontalPadding;
    if (isNaN(yPadding) || isNaN(xPadding)) {
        throw "Padding is not a valid number";
    }

    return {
        xPadding,
        yPadding,
        center: args.values.center,
        inputFile: args.positionals[0],
        latexInputFile: args.values.latexInputFile ? args.values.latexInputFile : args.positionals[0],
        segment: args.values.segment,
        pagewise: args.values.pagewise,
        allBoxes: args.values.all
    }
}
