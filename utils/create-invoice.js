import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createInvoice(invoice, filePath) {
  return new Promise((resolve, reject) => {
    if (!invoice || !filePath) {
      return reject(new Error("Invoice data or file path is missing"));
    }

    console.log("file path 2 is ", filePath);
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.end();
    stream.on('finish', () => {
      console.log("PDF creation finished");
      resolve();
    });

    stream.on('error', (err) => {
      console.error("Error creating PDF:", err);
      reject(err);
    });
  });
}

function generateHeader(doc) {
  const logoPath = path.join(__dirname, "..", "public", "logo.jpg");
  doc
    .image(logoPath, 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Dokopi.", 110, 57)
    .fontSize(10)
    .text("Dokopi.", 200, 50, { align: "right" })
    .text("Vadgaon Budruk", 200, 65, { align: "right" })
    .text("Pune, Maharastra, 411041", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);
  generateHr(doc, 185);
  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Order Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.Order_no, 150, customerInformationTop)
    .font("Helvetica")
    .text("Order Date:", 50, customerInformationTop + 15)
    .text(invoice.order_date, 150, customerInformationTop + 15)
    .text("Payment Id:", 50, customerInformationTop + 30)
    .text(invoice.paymentId, 150, customerInformationTop + 30)
    .text("Store Name:", 50, customerInformationTop + 45)
    .text(invoice.storeName, 150, customerInformationTop + 45)
    .text("Store Phone:", 50, customerInformationTop + 60)
    .text(invoice.storePhoneNumber, 150, customerInformationTop + 60)
    .text("Address:", 50, customerInformationTop + 75)
    .text(invoice.storeLocation, 150, customerInformationTop + 75)
    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.email, 300, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 300);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Pages",
    "Copies",
    "Type",
    "PMode",
    "Color"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name,
      item.total_pages,
      item.no_of_copies,
      item.type,
      item.print_mode,
      item.color_pages_to_print
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    "Rs. " + invoice.subtotal
  );

  const duePosition = subtotalPosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Status",
    "",
    invoice.status 
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Thank you for your business! For any inquiries, please contact us at +91 8789373766.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  printMode,
  colorPages
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 170, y)
    .text(unitCost, 240, y, { width: 50, align: "right" })
    .text(quantity, 300, y, { width: 50, align: "right" })
    .text(printMode, 370, y, { width: 50, align: "right" })
    .text(colorPages, 430, y, { width: 90, align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
