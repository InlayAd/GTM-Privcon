'use client';

import { OutreachResult } from '@/app/actions';
import { stripMarkdown } from '@/hooks/useReportHistory';

/**
 * Opens a styled print window that the user can save as PDF via the browser's native "Save as PDF" printer.
 * This produces much better results than jsPDF because we get full CSS styling, fonts, and layout.
 */
function openPrintWindow(htmlContent: string, title: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download PDFs.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #334155;
      line-height: 1.65;
      padding: 0;
      background: #fff;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 36px 40px 28px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .header .brand-name {
      font-size: 14px;
      color: #a5b4fc;
      font-weight: 600;
    }
    .header .date {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 6px;
    }
    .content {
      padding: 30px 40px 40px;
    }
    .revenue-box {
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .revenue-box .label {
      font-size: 9px;
      font-weight: 800;
      color: #e11d48;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }
    .revenue-box .value {
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-header {
      border-top: 2px solid #4f46e5;
      padding-top: 12px;
      margin-bottom: 12px;
    }
    .section-header h2 {
      font-size: 12px;
      font-weight: 800;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .section-body {
      font-size: 12px;
      color: #475569;
      line-height: 1.7;
    }
    .section-body p {
      margin-bottom: 8px;
    }
    .cta-box {
      background: #eef2ff;
      border-radius: 12px;
      padding: 18px 24px;
      text-align: center;
      margin-top: 32px;
    }
    .cta-box .title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .cta-box .subtitle {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      padding: 16px;
      font-size: 8px;
      color: #94a3b8;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .message-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 10px;
      font-style: italic;
      font-size: 12px;
      color: #334155;
    }
    .message-label {
      font-size: 9px;
      font-weight: 800;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .header { -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    .print-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #0f172a;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      z-index: 100;
    }
    .print-btn:hover { background: #1e293b; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">⬇ Save as PDF</button>
  ${htmlContent}
</body>
</html>`);

  printWindow.document.close();
}

/**
 * Converts markdown-ish text to simple HTML paragraphs
 */
function textToHTML(text: string): string {
  const clean = stripMarkdown(text);
  return clean
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line.trim()}</p>`)
    .join('');
}

/**
 * Full AEO Intelligence Report PDF
 */
export function generateReportPDF(result: OutreachResult, companyName: string) {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `
    <div class="header">
      <h1>AEO Intelligence Report</h1>
      <div class="brand-name">${companyName}</div>
      <div class="date">Generated: ${date}</div>
    </div>
    <div class="content">
      ${result.revenueImpact ? `
        <div class="revenue-box">
          <div class="label">Revenue at Stake</div>
          <div class="value">${stripMarkdown(result.revenueImpact)}</div>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-header"><h2>Brand Intelligence Profile</h2></div>
        <div class="section-body">${textToHTML(result.brandSummary)}</div>
      </div>
      
      <div class="section">
        <div class="section-header"><h2>Target AI Search Queries</h2></div>
        <div class="section-body">${textToHTML(result.queries)}</div>
      </div>

      ${result.rankingAudit ? `
        <div class="section">
          <div class="section-header"><h2>AI Ranking Audit</h2></div>
          <div class="section-body">${textToHTML(result.rankingAudit)}</div>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-header"><h2>Strategic Intelligence Report</h2></div>
        <div class="section-body">${textToHTML(result.report)}</div>
      </div>
      
      <div class="cta-box">
        <div class="title">This is a complimentary mini-report.</div>
        <div class="subtitle">Our full AEO audit identifies 15-20 optimization opportunities with implementation roadmaps and projected ROI timelines.</div>
      </div>
    </div>
    <div class="footer">Powered by AEO Intelligence Engine</div>
  `;

  openPrintWindow(html, `AEO Report - ${companyName}`);
}

/**
 * Strategic Intelligence Report only PDF
 */
export function generateStrategicReportPDF(reportText: string, companyName: string) {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `
    <div class="header">
      <h1>Strategic Intelligence Report</h1>
      <div class="brand-name">${companyName}</div>
      <div class="date">Generated: ${date}</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-body">${textToHTML(reportText)}</div>
      </div>
    </div>
    <div class="footer">Powered by AEO Intelligence Engine</div>
  `;

  openPrintWindow(html, `Strategic Report - ${companyName}`);
}

/**
 * LinkedIn Outreach Messages PDF
 */
export function generateOutreachPDF(connectionMsg: string, followUpMsg: string, companyName: string) {
  const html = `
    <div class="header">
      <h1>LinkedIn Outreach</h1>
      <div class="brand-name">${companyName}</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="message-label">Connection Request</div>
        <div class="message-block">${connectionMsg}</div>
      </div>
      <div class="section" style="margin-top: 24px;">
        <div class="message-label">Follow-up Message</div>
        <div class="message-block">${followUpMsg}</div>
      </div>
    </div>
    <div class="footer">Powered by AEO Intelligence Engine</div>
  `;

  openPrintWindow(html, `Outreach - ${companyName}`);
}
