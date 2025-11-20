import util from "node:util";

export interface Arguments {
    padding: number,
    stdout: boolean,
    center: boolean,
    latexInputFile: string,
    inputFile: string
}

export const getArguments = () : Arguments => {
    const args = util.parseArgs({
        options: {
            padding: {
                type: "string",
                short: "p",
                default: "0"
            },
            stdout: {
                type: "boolean",
                short: "s",
                default: false
            },
            center: {
                type: "boolean",
                short: "c",
                default: false
            },
            latexInputFile: {
                type: "string",
                short: "l"
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
        stdout: args.values.stdout,
        inputFile: args.positionals[0],
        padding,
        latexInputFile: args.values.latexInputFile ? args.values.latexInputFile : args.positionals[0]
    }
}

