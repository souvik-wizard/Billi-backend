import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { InvoiceRequest } from '../types/types';
import {ToWords} from 'to-words';

const router = Router();

router.post('/generate-invoice', (req: Request, res: Response) => {
  const {
    sellerDetails,
    billingDetails,
    shippingDetails,
    orderDetails,
    items,
  }: InvoiceRequest = req.body;
  
  const toWords = new ToWords();
  const doc = new PDFDocument({
    size: 'A4',
    margin: 45,
  });
  
  const fileName = `Invoice.pdf`;
  const filePath = path.join(__dirname, '..', '..', fileName);
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Invoice Header
  doc
    .image(path.join(__dirname, "../assets/amazon.png"), 50, 5, { width: 160 ,height:45 }) // Logo
    .fontSize(13).font('Helvetica-Bold').text('Tax Invoice/Bill of Supply/Cash Memo', 0, 15, { align: 'right' })
    .fontSize(13).font('Helvetica').text('(Original for Recipient)', 0, 30, { align: 'right' })
    // .fontSize(8).font('Helvetica').text(`Date: ${moment().format('DD-MM-YYYY HH:mm:ss')} UTC`, 50, 100, { align: 'left' })
    // .text(`Order No: ${orderDetails.orderNo}`, 50, 110, { align: 'left' })
    .moveDown(2);

  // Seller Details
  doc.fontSize(11.5).font('Helvetica-Bold').text('Sold By :', 45, 100);
  doc.fontSize(11.5).font('Helvetica')
    .text(`${sellerDetails.name}`,{ width: 250 })
    .text(`${sellerDetails.address}, ${sellerDetails.city}`,  { width: 250 })
    .text(`${sellerDetails.state}, ${sellerDetails.pincode}`)
    .text(`IN`)
    .moveDown(2); 
  doc.fontSize(11.5).font('Helvetica-Bold')
  .text(`PAN No: `, { continued: true }).font('Helvetica').text(`${sellerDetails.pan}`)
  doc.fontSize(11.5).font('Helvetica-Bold')
  .text(`GST Registration No: `, { continued: true }).font('Helvetica').text(`${sellerDetails.gst}`)

  // Billing Details
  doc.fontSize(11.5).font('Helvetica-Bold').text('Billing Address :', 0, 100,{ align: 'right' });
  doc.fontSize(11.5).font('Helvetica')
    .text(`${billingDetails.name}`, { align: 'right' })
    .text(`${billingDetails.address}`,{ align: 'right'},)
    .text(`${billingDetails.city}, ${billingDetails.state},${billingDetails.pincode}`,{ align: 'right' })
    .text(`IN`,{ align: 'right' })
    doc.font('Helvetica-Bold')
   .text(`State/UT Code: ${billingDetails.stateCode}`, {
     align: 'right',
   })
   .moveDown(2);

  // Shipping Details
  doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address',{ align: 'right' });
  doc.fontSize(10).font('Helvetica')
    .text(`${shippingDetails.name}`,{ align: 'right' })
    .text(`${shippingDetails.address}`,{ align: 'right' })
    .text(`${shippingDetails.city}, ${shippingDetails.state}`,{ align: 'right' })
    .text(`${shippingDetails.pincode}`,{ align: 'right' })
    doc.font('Helvetica-Bold')
    .text(`State/UT Code: ${billingDetails.stateCode}`, {
      align: 'right',
    })
    .moveDown(2);

  // Table Header
  doc.moveDown().fontSize(9.5).font('Helvetica-Bold');
  doc.text('Sl No.', 50, 300, { width: 20, align: 'left' });
  doc.text('Description', 70, 300, { width: 80, align: 'left' }); 
  doc.text('Unit Price', 250, 300, { width: 80, align: 'left' });
  doc.text('Quantity', 320, 300, { width: 80, align: 'left' });
  doc.text('Tax Rate', 380, 300, { width: 80, align: 'left' });
  doc.text('Tax Type', 450, 300, { width: 80, align: 'left' });
  doc.text('Amount', 520, 300, { width: 80, align: 'left' }).moveDown(1);
  
  
  // Draw a line under the header
  doc.moveTo(50, doc.y + 5).lineTo(560, doc.y + 5).stroke();

  let y = doc.y + 15; 
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

    doc.fontSize(8).font('Helvetica')
        .text((items.indexOf(item) + 1).toString(), 50, y)
        .text(item.description, 70, y, { width: 150 })
        .text(unitPrice.toFixed(2), 250, y)
        .text(quantity.toString(), 320, y)
        .text(`${taxRate}%`, 380, y)
        .text(item.taxType, 450, y)
        .text(totalItemAmount.toFixed(2), 520, y);

    y += 20;
});


  // Total Section
  doc.moveDown().fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${totalAmount.toFixed(2)}`, 450, y + 20, { align: 'right' });
  doc.fontSize(12).font('Helvetica-Bold').text(`Amount in Words: `, 50, y + 40,)
  .text (`${toWords.convert(totalAmount,{ currency: true })}`,{ width: 250 })

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

export default router;
