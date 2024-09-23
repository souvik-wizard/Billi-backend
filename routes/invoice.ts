import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { InvoiceRequest } from '../types/types';

const router = Router();

router.post('/generate-invoice', (req: Request, res: Response) => {
  const {
    sellerDetails,
    billingDetails,
    shippingDetails,
    orderDetails,
    items,
  }: InvoiceRequest = req.body;

  const doc = new PDFDocument({size: 'A4'});
  const fileName = `Invoice.pdf`;
  const filePath = path.join(__dirname, '..', '..', fileName);
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Invoice Header
  doc
    .image(path.join(__dirname, "../assets/logo.jpg"), 50, 45, { width: 120 }) // Logo
    .fontSize(12).font('Helvetica-Bold').text('Tax Invoice/Bill of Supply/Cash Memo', 0, 10, { align: 'right' })
    .fontSize(10).font('Helvetica').text(`Invoice Date: ${moment().format('DD-MM-YYYY')}`, 450, 70, { align: 'right' })
    .text(`Order No: ${orderDetails.orderNo}`, 450, 95, { align: 'right' })
    .moveDown(2); // Space after header

  // Seller Details
  doc.fontSize(12).font('Helvetica-Bold').text('Seller Details', 50, 150);
  doc.fontSize(10).font('Helvetica')
    .text(`Sold By: ${sellerDetails.name}`, 50, 170)
    .text(`${sellerDetails.address}, ${sellerDetails.city}`, 50, 185)
    .text(`${sellerDetails.state}, ${sellerDetails.pincode}`, 50, 200)
    .text(`PAN: ${sellerDetails.pan}`, 50, 215)
    .text(`GSTIN: ${sellerDetails.gst}`, 50, 230)
    .moveDown(2); // Space after seller details

  // Billing Details
  doc.fontSize(12).font('Helvetica-Bold').text('Billing Address', 50, 250);
  doc.fontSize(10).font('Helvetica')
    .text(`${billingDetails.name}`, 50, 270)
    .text(`${billingDetails.address}`, 50, 285)
    .text(`${billingDetails.city}, ${billingDetails.state}`, 50, 300)
    .text(`Pincode: ${billingDetails.pincode}`, 50, 315)
    .text(`State/UT Code: ${billingDetails.stateCode}`, 50, 330)
    .moveDown(2); // Space after billing details

  // Shipping Details
  doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address', 300, 250);
  doc.fontSize(10).font('Helvetica')
    .text(`${shippingDetails.name}`, 300, 270)
    .text(`${shippingDetails.address}`, 300, 285)
    .text(`${shippingDetails.city}, ${shippingDetails.state}`, 300, 300)
    .text(`Pincode: ${shippingDetails.pincode}`, 300, 315)
    .text(`State/UT Code: ${shippingDetails.stateCode}`, 300, 330)
    .moveDown(2); // Space after shipping details

  // Table Header
  doc.moveDown().fontSize(12).font('Helvetica-Bold');
  doc.text('Description', 50, doc.y);
  doc.text('Unit Price', 250, doc.y);
  doc.text('Quantity', 320, doc.y);
  doc.text('Tax Rate', 380, doc.y);
  doc.text('Tax Type', 450, doc.y);
  doc.text('Amount', 520, doc.y);
  
  // Draw a line under the header
  doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();

  let y = doc.y + 15; // Starting position for items
  let totalAmount = 0;

  // Item Details
  items.forEach(item => {
    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);
    const discount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate);
    
    const netAmount = unitPrice * quantity - discount;
    const taxAmount = netAmount * (taxRate / 100);
    const totalItemAmount = netAmount + taxAmount;

    totalAmount += totalItemAmount;

    doc.fontSize(10).font('Helvetica')
        .text(item.description, 50, y)
        .text(unitPrice.toFixed(2), 250, y)
        .text(quantity.toString(), 320, y)
        .text(`${taxRate}%`, 380, y)
        .text(item.taxType, 450, y)
        .text(totalItemAmount.toFixed(2), 520, y);

    y += 20; // Move down for next item
});


  // Total Section
  doc.moveDown().fontSize(12).font('Helvetica-Bold').text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 450, y + 20, { align: 'right' });
  doc.fontSize(10).font('Helvetica').text(`Amount in Words: ${numToWords(totalAmount)} only`, 50, y + 40);

  // Signature and Footer
  doc.moveDown().fontSize(12).font('Helvetica-Bold').text(`For ${sellerDetails.name}:`, 50, y + 80);
  doc.image(path.join(__dirname, "../assets/signature.png"), 50, y + 100, { width: 80 }) // Signature image
    .fontSize(10).text('Authorized Signatory', 50, y + 140);

  doc.end();

  writeStream.on('finish', () => {
    res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath); // Delete file after download
    });
  });
});

const numToWords = (amount: number) => {
  // Implement number to words conversion (or use a package)
  return amount; // Placeholder for actual implementation
};

export default router;
