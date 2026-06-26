function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function generateVetSummary(cats, colonies) {
  // Handle both boolean false and string 'false' from database, as well as null/undefined
  const intactCats = cats.filter(c => c.neutered === false || c.neutered === 'false' || !c.neutered)

  const catRows = intactCats.map(cat => {
    const colony = colonies.find(c => c.id === cat.colony_id)
    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
          ${cat.name ? escapeHtml(cat.name) : '<em style="color:#9ca3af">Unnamed</em>'}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
          ${cat.gender === 'male' ? '♂ Male' : cat.gender === 'female' ? '♀ Female' : 'Unknown'}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
          ${colony?.name ? escapeHtml(colony.name) : 'Unknown'}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
          ${cat.health_notes ? escapeHtml(cat.health_notes) : '<span style="color:#9ca3af">None</span>'}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <div style="width: 60px; height: 20px; border: 1px solid #d1d5db; border-radius: 4px;"></div>
        </td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TNR Tracker — Vet Clinic Summary</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: #1f2937;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }
        h1 { font-size: 20px; margin: 0; color: #2d6a4f; }
        h2 { font-size: 14px; color: #6b7280; margin: 4px 0 16px; font-weight: 400; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th {
          text-align: left;
          padding: 8px 12px;
          background: #f9fafb;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        td { font-size: 13px; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #2d6a4f;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .meta { font-size: 12px; color: #6b7280; }
        .stats {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #f0fdf4;
          border-radius: 8px;
        }
        .stat-item { text-align: center; }
        .stat-value { font-size: 24px; font-weight: 700; color: #2d6a4f; }
        .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
        .footer {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #9ca3af;
        }
        .signature-line {
          margin-top: 40px;
          display: flex;
          gap: 40px;
        }
        .signature-field {
          flex: 1;
          border-top: 1px solid #1f2937;
          padding-top: 4px;
          font-size: 11px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>🐱 TNR Tracker — Veterinary Intake Summary</h1>
          <h2>Cats Requiring Spay/Neuter Procedures</h2>
        </div>
        <div class="meta" style="text-align: right;">
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Total Cats in Colony:</strong> ${cats.length}</div>
        </div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${intactCats.length}</div>
          <div class="stat-label">Cats for Surgery</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${intactCats.filter(c => c.gender === 'female').length}</div>
          <div class="stat-label">Females (Spay)</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${intactCats.filter(c => c.gender === 'male').length}</div>
          <div class="stat-label">Males (Neuter)</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${intactCats.filter(c => c.gender === 'unknown').length}</div>
          <div class="stat-label">Unknown Gender</div>
        </div>
      </div>

      ${intactCats.length === 0 ? '<p style="text-align:center; color:#9ca3af; padding: 40px 0;">All cats are neutered! Great work. 🎉</p>' : `
      <table>
        <thead>
          <tr>
            <th>Cat Name</th>
            <th>Gender</th>
            <th>Colony</th>
            <th>Health Notes / Allergies</th>
            <th>Vet Initials</th>
          </tr>
        </thead>
        <tbody>
          ${catRows}
        </tbody>
      </table>
      `}

      <div class="signature-line">
        <div class="signature-field">Volunteer Name & Signature</div>
        <div class="signature-field">Veterinarian Signature</div>
        <div class="signature-field">Date & Time</div>
      </div>

      <div class="footer">
        Generated by TNR Tracker • ${new Date().toLocaleString()} • This document is for veterinary clinic intake purposes.
      </div>

      <div class="no-print" style="text-align: center; margin-top: 24px;">
        <button onclick="window.print()" style="
          background: #2d6a4f;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        ">🖨️ Print / Save as PDF</button>
        <button onclick="window.close()" style="
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          margin-left: 8px;
        ">Close</button>
      </div>
    </body>
    </html>
  `

  return html
}

export function openVetSummary(cats, colonies) {
  const html = generateVetSummary(cats, colonies)
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
