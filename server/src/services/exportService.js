import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

export function generateExpensesCsv(expenses) {
  return stringify(
    expenses.map((expense) => ({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().slice(0, 10),
      paidBy: expense.paidBy.name,
      participants: expense.participants.map((participant) => participant.name).join(', '),
      splitType: expense.splitType,
      notes: expense.notes
    })),
    {
      header: true
    }
  );
}

export function generateDashboardPdf(snapshot) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(20).text('Apna Home CRM Dashboard Summary');
  doc.moveDown();
  doc.fontSize(12).text(`Month: ${snapshot.meta.month}/${snapshot.meta.year}`);
  doc.text(`Total monthly expenses: Rs ${snapshot.summary.totalMonthlyExpenses.toFixed(2)}`);
  doc.text(`Outstanding total: Rs ${snapshot.summary.outstandingTotal.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(14).text('Member Contributions');
  snapshot.summary.perUserContribution.forEach((entry) => {
    doc
      .fontSize(11)
      .text(
        `${entry.user.name}: paid Rs ${entry.paid.toFixed(2)}, share Rs ${entry.share.toFixed(
          2
        )}, net Rs ${entry.difference.toFixed(2)}`
      );
  });

  doc.moveDown();
  doc.fontSize(14).text('Suggested Settlements');
  if (!snapshot.analytics.simplifiedTransactions.length) {
    doc.fontSize(11).text('All balances are already settled.');
  } else {
    snapshot.analytics.simplifiedTransactions.forEach((transaction) => {
      doc
        .fontSize(11)
        .text(
          `${transaction.from.name} pays ${transaction.to.name}: Rs ${transaction.amount.toFixed(2)}`
        );
    });
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
