const PDFParser = require('pdf2json');
const path = require('path');
const pdfParser = new PDFParser(null, 1);

const timeout = setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 10000);

pdfParser.on('pdfParser_dataReady', (pdfData) => {
    clearTimeout(timeout);
    let allText = '';
    if (pdfData && pdfData.Pages) {
        pdfData.Pages.forEach((page, pi) => {
            allText += '--- PAGE ' + (pi+1) + ' ---\n';
            if (page.Texts) {
                page.Texts.forEach(t => {
                    if (t.R) {
                        t.R.forEach(r => {
                            try { allText += decodeURIComponent(r.T) + ' '; } catch(e) { allText += r.T + ' '; }
                        });
                    }
                });
                allText += '\n';
            }
        });
    }
    console.log('Pages found:', pdfData.Pages ? pdfData.Pages.length : 0);
    console.log(allText.substring(0, 30000));
    process.exit(0);
});

pdfParser.on('pdfParser_dataError', (err) => { clearTimeout(timeout); console.log('PDF Error:', JSON.stringify(err)); process.exit(1); });
pdfParser.loadPDF(path.resolve('../read/ack-vs-po.pdf'));
