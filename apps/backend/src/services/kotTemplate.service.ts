type KOTLineItem = {
  name: string;
  qty: number;
  modifiers?: Array<{ name: string }>;
  notes?: string;
};

export function buildKotHtml(payload: {
  orderNumber: string;
  orderType: string;
  paymentMode: string;
  createdAt: string;
  items: KOTLineItem[];
}): string {
  const itemRows = payload.items
    .map((item) => {
      const modifierLine = (item.modifiers ?? []).map((modifier) => `+ ${modifier.name}`).join("<br/>");
      const noteLine = item.notes ? `<div class=\"note\">Note: ${item.notes}</div>` : "";

      return `<tr><td>${item.name}<div class=\"mod\">${modifierLine}</div>${noteLine}</td><td>${item.qty}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <style>
    body { font-family: monospace; width: 80mm; color: #000; margin: 0; padding: 8px; }
    h1 { font-size: 16px; margin: 0 0 8px 0; }
    .meta { font-size: 12px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    td { font-size: 12px; border-bottom: 1px dashed #999; padding: 4px 0; vertical-align: top; }
    td:last-child { text-align: right; width: 24px; }
    .mod, .note { font-size: 11px; color: #333; }
  </style>
</head>
<body>
  <h1>KOT ${payload.orderNumber}</h1>
  <div class=\"meta\">${payload.createdAt}<br/>Type: ${payload.orderType}<br/>Payment: ${payload.paymentMode}</div>
  <table>
    <tbody>${itemRows}</tbody>
  </table>
</body>
</html>`;
}
