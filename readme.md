# pdf-forms-with-latex

CLI tool for generating latex-templates to fill out PDF forms.


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

| Argument                  | Short-form | Default                | Effect                                                                                                     |
|---------------------------|------------|------------------------|------------------------------------------------------------------------------------------------------------|
| `--padding <amount>`      | `-p`       | `4`                    | Set padding (in mm) to be inserted around generated textboxes                                              |
| `--center`                | `-c`       |                        | Center text in textboxes instead of aligning top-left                                                      |
| `--latexInputFile <file>` | `-l`       | `<same as input file>` | Override the filename passed to the latex template (by default the filename is the same as the input file) |
| `--segment`               | `-s`       |                        | Attempt to automatically segment form inputs into multiple latex files                                     |


## Latex preamble

The latex preamble can be modified under `tex/template-pre.tex`, for example for adding packages.
