import type { WardMeta } from '../types';

export interface TableRow {
  label: string;
  value: string;
}

/**
 * Escapes characters for PDF text streams
 */
function escapePdfText(text: string): string {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/²/g, '2')
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Escapes characters for XML
 */
function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates and downloads a clean, beautifully formatted Excel (.xls) file
 */
export function downloadTableAsExcel(ward: WardMeta, rows: TableRow[]): void {
  const safeName = ward.wardName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${ward.corp}_Ward_${ward.wardNo}_${safeName}_Metrics.xls`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="HeaderSub">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#64748B" ss:Italic="1"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
   </Borders>
  </Style>
  <Style ss:ID="RowEven">
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="RowOdd">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="ParamBold">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="ValBold">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Ward Metrics">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="250"/>
   <Column ss:Width="280"/>
   <Row ss:Height="28">
    <Cell ss:MergeAcross="1" ss:StyleID="HeaderTitle"><Data ss:Type="String">MIND THE GAP - ${escapeXml(ward.wardName)} (Ward ${ward.wardNo})</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="1" ss:StyleID="HeaderSub"><Data ss:Type="String">Corporation: ${escapeXml(ward.corp)} | Exported: ${new Date().toLocaleDateString()} | Authoritative Metrics</Data></Cell>
   </Row>
   <Row ss:Height="8"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">PARAMETER / INDICATOR</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">AUTHORITATIVE VALUE</Data></Cell>
   </Row>
`;

  rows.forEach((r, i) => {
    const rowStyle = i % 2 === 0 ? 'RowEven' : 'RowOdd';
    xml += `   <Row ss:Height="22" ss:StyleID="${rowStyle}">
    <Cell ss:StyleID="ParamBold"><Data ss:Type="String">${escapeXml(r.label)}</Data></Cell>
    <Cell ss:StyleID="ValBold"><Data ss:Type="String">${escapeXml(r.value)}</Data></Cell>
   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a standards-compliant PDF file directly in the browser
 */
export function downloadTableAsPdf(ward: WardMeta, rows: TableRow[]): void {
  const safeName = ward.wardName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${ward.corp}_Ward_${ward.wardNo}_${safeName}_Metrics.pdf`;

  const title = `MIND THE GAP - ${ward.wardName.toUpperCase()}`;
  const subtitle = `${ward.corp === 'PCMC' ? 'Pimpri Chinchwad Municipal Corporation' : 'Pune Municipal Corporation'} | Ward ${ward.wardNo}`;

  const stream: string[] = [];

  // Top header banner (Navy)
  stream.push('0.06 0.09 0.16 rg 0 740 612 52 re f');
  stream.push('1 1 1 rg');
  stream.push(`BT /F1 14 Tf 40 762 Td (${escapePdfText(title)}) Tj ET`);
  stream.push('0.6 0.75 0.98 rg');
  stream.push(`BT /F2 9.5 Tf 40 748 Td (${escapePdfText(subtitle)}) Tj ET`);

  // KPI Summary Bar (Light blue box)
  stream.push('0.96 0.98 1 rg 40 682 532 44 re f');
  stream.push('0.8 0.88 0.98 RG 0.8 w 40 682 532 44 re S');

  stream.push('0.4 0.45 0.55 rg');
  stream.push('BT /F2 7.5 Tf 55 712 Td (CENSUS 2026 POP) Tj ET');
  stream.push('0.06 0.09 0.16 rg');
  stream.push(`BT /F1 11 Tf 55 696 Td (${ward.censusPop2026.toLocaleString()}) Tj ET`);

  stream.push('0.4 0.45 0.55 rg');
  stream.push('BT /F2 7.5 Tf 190 712 Td (WORLDPOP 2020) Tj ET');
  stream.push('0.26 0.22 0.79 rg');
  stream.push(`BT /F1 11 Tf 190 696 Td (${ward.worldPop2020.toLocaleString()}) Tj ET`);

  stream.push('0.4 0.45 0.55 rg');
  stream.push('BT /F2 7.5 Tf 320 712 Td (LAND AREA) Tj ET');
  stream.push('0.06 0.09 0.16 rg');
  stream.push(`BT /F1 11 Tf 320 696 Td (${ward.areaKm2} km2) Tj ET`);

  stream.push('0.4 0.45 0.55 rg');
  stream.push('BT /F2 7.5 Tf 435 712 Td (TRANSIT ACCESS) Tj ET');
  stream.push('0.02 0.59 0.41 rg');
  stream.push(`BT /F1 11 Tf 435 696 Td (${ward.busStopsCount} Bus / ${ward.metroStopsCount} Metro) Tj ET`);

  // Table Column Header (Blue)
  const tableTopY = 654;
  stream.push(`0.15 0.39 0.92 rg 40 ${tableTopY - 5} 532 20 re f`);
  stream.push('1 1 1 rg');
  stream.push(`BT /F1 9 Tf 55 ${tableTopY} Td (PARAMETER / INDICATOR) Tj 310 ${tableTopY} Td (AUTHORITATIVE VALUE) Tj ET`);

  // Table Data Rows
  let curY = tableTopY - 24;
  rows.forEach((r, i) => {
    const bg = i % 2 === 0 ? '0.96 0.97 0.99' : '1 1 1';
    stream.push(`${bg} rg 40 ${curY - 4} 532 19 re f`);
    stream.push(`0.89 0.92 0.96 RG 0.5 w 40 ${curY - 4} 532 19 re S`);

    // Parameter label
    stream.push('0.2 0.25 0.35 rg');
    stream.push(`BT /F1 8.5 Tf 55 ${curY + 2} Td (${escapePdfText(r.label)}) Tj ET`);

    // Value
    stream.push('0.06 0.09 0.16 rg');
    stream.push(`BT /F2 8.5 Tf 310 ${curY + 2} Td (${escapePdfText(r.value)}) Tj ET`);

    curY -= 19;
  });

  // Footer
  stream.push('0.55 0.6 0.68 rg');
  stream.push('BT /F2 8 Tf 40 28 Td (MIND THE GAP - Pune Metropolitan Spatial Analytics | Official Ward Report) Tj 490 28 Td (Page 1 of 1) Tj ET');

  const streamContent = stream.join('\n');
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamContent);

  const objects: Uint8Array[] = [
    encoder.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj'),
    encoder.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj'),
    encoder.encode('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj'),
    // 4 0 obj will contain the stream
    encoder.encode(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`),
    encoder.encode('\nendstream\nendobj'),
    encoder.encode('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj'),
    encoder.encode('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'),
  ];

  // Assemble full PDF byte array
  const header = encoder.encode('%PDF-1.4\n');
  const parts: Uint8Array[] = [header];
  const offsets: number[] = [];
  let currentOffset = header.length;

  // Obj 1
  offsets.push(currentOffset);
  parts.push(objects[0], encoder.encode('\n'));
  currentOffset += objects[0].length + 1;

  // Obj 2
  offsets.push(currentOffset);
  parts.push(objects[1], encoder.encode('\n'));
  currentOffset += objects[1].length + 1;

  // Obj 3
  offsets.push(currentOffset);
  parts.push(objects[2], encoder.encode('\n'));
  currentOffset += objects[2].length + 1;

  // Obj 4 (stream)
  offsets.push(currentOffset);
  parts.push(objects[3], streamBytes, objects[4], encoder.encode('\n'));
  currentOffset += objects[3].length + streamBytes.length + objects[4].length + 1;

  // Obj 5
  offsets.push(currentOffset);
  parts.push(objects[5], encoder.encode('\n'));
  currentOffset += objects[5].length + 1;

  // Obj 6
  offsets.push(currentOffset);
  parts.push(objects[6], encoder.encode('\n'));
  currentOffset += objects[6].length + 1;

  const xrefPos = currentOffset;
  let xrefText = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    xrefText += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  xrefText += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  parts.push(encoder.encode(xrefText));

  const blob = new Blob(parts as any[], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
