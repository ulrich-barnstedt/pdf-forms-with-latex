import util from "node:util";

export interface Arguments {
    padding: number,
    center: boolean,
    latexInputFile: string,
    inputFile: string,
    segment: boolean
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
            }
        },
        allowPositionals: true
    });

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
        segment: args.values.segment
    }
}
