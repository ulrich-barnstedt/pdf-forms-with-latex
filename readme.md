# pdf-forms-with-latex

This tool allows you to easily generate a latex template for filling out PDF-Forms.


## Installation

To install, run the following commands after cloning the repository:
```shell
npm install
npm run build

chmod +x install.sh
./install.sh  
```
This assumes `./local/bin` is in your `PATH`.


## Usage

```shell
pdfform-to-latex <input pdf>
```
This will generate the corresponding `.tex` files in the same directory.


Optional arguments:

| Argument                  | Short-form | Default              | Effect                                                                                                     |
|---------------------------|------------|----------------------|------------------------------------------------------------------------------------------------------------|
| `--padding <amount>`      | `-p`       | `4`                  | Set padding (in mm) to be inserted around generated textboxes                                              |
| `--center`                | `-c`       |                      | Center text in textboxes instead of aligning top-left                                                      |
| `--latexInputFile <file>` | `-l`       | <same as input file> | Override the filename passed to the latex template (by default the filename is the same as the input file) |
| `--segment`               | `-s`       |                      | Attempt to automatically segment form inputs into multiple latex files                                     |
