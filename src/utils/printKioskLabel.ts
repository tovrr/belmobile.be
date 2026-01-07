export const printKioskLabel = (data: {
    type: 'BUYBACK' | 'REPAIR',
    model: string,
    price: string,
    orderId: string,
    date: string
}) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const html = `
        <html>
            <head>
                <title>Label ${data.orderId}</title>
                <style>
                    body { font-family: monospace; text-align: center; padding: 20px; }
                    .header { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
                    .meta { font-size: 0.8em; margin-bottom: 20px; }
                    .model { font-size: 1.5em; font-weight: bold; margin: 20px 0; }
                    .price { font-size: 2em; font-weight: bold; border: 2px solid black; padding: 10px; display: inline-block; }
                    .footer { margin-top: 30px; font-size: 0.8em; }
                    @media print {
                        @page { size: 60mm 40mm; margin: 0; }
                        body { padding: 5px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">BELMOBILE ${data.type}</div>
                <div class="meta">${data.date}<br>REF: ${data.orderId.slice(0, 8)}</div>
                <div class="model">${data.model}</div>
                <div class="price">${data.price}</div>
                <div class="footer">Keep this receipt</div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};
