# pdf-forms-with-latex

CLI tool for generating latex templates to fill out PDF forms.


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
This will generate the corresponding `.tex` file(s) in the same directory.
For the document to compile successfully, the source PDF file needs to be present.


Optional arguments:
```
 -h, --help                        Show this help message
 -y, --verticalPadding <amount>    Set vertical padding around textboxes (in mm, default 0)
 -x, --horizontalPadding <amount>  Set horizontal padding around textboxes (in mm, default 1)
 -c, --center                      Center text in textboxes instead of aligning top-left
 -l, --latexInputFile <file>       Override the filename passed to the latex template (by default the filename is the same as the input file)
 -s, --segment                     Attempt to automatically segment form inputs into multiple latex files (incompatible with --pagewise)
 -p, --pagewise                    Segment output into one latex file per page (incompatible with --segment)
 -a, --all                         Include all boxes (per default too small boxes are not included)
```

## Latex preamble

The latex preamble can be modified under `tex/template-pre.tex`, for example for adding packages.
