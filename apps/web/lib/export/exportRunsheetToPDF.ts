import type { Runsheet } from '@/types/runsheet';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportRunsheetToPDF(runsheet: Runsheet, eventName?: string) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(runsheet.title, 15, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 30;

    doc.text(`Status: ${runsheet.status.toUpperCase()}`, 15, yPos);
    yPos += 6;
    doc.text(`Revision: ${runsheet.revision}`, 15, yPos);
    yPos += 6;
    doc.text(`Created: ${new Date(runsheet.createdAt).toLocaleDateString()}`, 15, yPos);

    if (eventName) {
        yPos += 6;
        doc.text(`Event: ${eventName}`, 15, yPos);
    }

    // Items table
    if (runsheet.items && runsheet.items.length > 0) {
        const items = runsheet.items.sort((a, b) => a.idx - b.idx);

        // Calculate cumulative times
        let cumulativeMs = 0;
        const tableData = items.map((item) => {
            cumulativeMs += item.durationMs;
            const mins = Math.floor(item.durationMs / 60000);
            const secs = Math.floor((item.durationMs % 60000) / 1000);
            const duration = `${mins}:${secs.toString().padStart(2, '0')}`;

            const cumMins = Math.floor(cumulativeMs / 60000);
            const cumSecs = Math.floor((cumulativeMs % 60000) / 1000);
            const cumTime = `${cumMins}:${cumSecs.toString().padStart(2, '0')}`;

            return [
                `#${item.idx}`,
                item.title,
                duration,
                cumTime,
                item.notes || '',
            ];
        });

        autoTable(doc, {
            startY: yPos + 10,
            head: [['#', 'Item', 'Duration', 'Elapsed', 'Notes']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 60 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 60 },
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Generate filename
    const filename = `${runsheet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_runsheet.pdf`;

    // Download
    doc.save(filename);
}
