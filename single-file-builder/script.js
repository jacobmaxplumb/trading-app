const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const directoryPath = path.join(__dirname, './csv-files'); // Directory containing CSV files
const outputPath = path.join(__dirname, 'output.csv'); // Path for the output CSV

fs.readdir(directoryPath, async (err, files) => {
    if (err) {
        console.error('Unable to scan directory:', err);
        return;
    }

    let results = [];
    let count = 0;
    for (let file of files) {
        count++;
        console.log(`reading file count: ${count + 1}`)
        if (path.extname(file) === '.csv') {
            const filePath = path.join(directoryPath, file);
            const content = fs.readFileSync(filePath, 'utf8');

            try {
                const parsed = Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                });

                const records = parsed.data;

                // Add a single column 'NextCloseHigher' to check if the next row's close price is higher
                const updatedRecords = records.map((row, index, array) => {
                    let newRow = { ...row };
                    let nextCloseHigher = 0; // Default to 0

                    if (array[index + 1] && typeof row['close'] === 'number' && typeof array[index + 1]['close'] === 'number') {
                        // Check if next row's close is higher than current row's close
                        nextCloseHigher = array[index + 1]['close'] > row['close'] ? 1 : 0;
                    }

                    newRow['NextCloseHigher'] = nextCloseHigher;
                    return newRow;
                });

                // Remove last row because it cannot have a 'NextCloseHigher' value
                updatedRecords.pop();

                results = results.concat(updatedRecords);
            } catch (error) {
                console.error('Error processing file:', filePath, error);
            }
        }
    }

    // Write all results to a single output file
    const csvString = Papa.unparse(results, {
        header: true
    });

    fs.writeFileSync(outputPath, csvString);
    console.log('CSV files processed and output file created.');
});
