/**
 * Genera una plantilla base de cotización (templates/cotizacion.docx).
 * Corre una sola vez para inicializar. Después puedes editar el .docx con Word.
 *
 * Uso: npx ts-node scripts/setup-template.ts
 */
import PizZip from 'pizzip'
import fs from 'fs'
import path from 'path'

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
const OFD = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const CT = 'http://schemas.openxmlformats.org/package/2006/content-types'

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="${CT}">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`

const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${REL}">
  <Relationship Id="rId1" Type="${OFD}/officeDocument" Target="word/document.xml"/>
</Relationships>`

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${REL}">
  <Relationship Id="rId1" Type="${OFD}/settings" Target="settings.xml"/>
</Relationships>`

const settings = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="${W}"/>`

function para(text: string, opts: { bold?: boolean; size?: number; center?: boolean } = ''  as any): string {
  const { bold = false, size = 24, center = false } = opts as any
  const ppr = center ? `<w:pPr><w:jc w:val="center"/></w:pPr>` : ''
  const rpr = bold || size !== 24
    ? `<w:rPr>${bold ? '<w:b/><w:bCs/>' : ''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr>`
    : ''
  return `<w:p>${ppr}<w:r>${rpr}<w:t xml:space="preserve">${text}</w:t></w:r></w:p>`
}

const body = [
  para("UNIFORMES D'JOHANNA", { bold: true, size: 36, center: true }),
  para('COTIZACIÓN #{folio}',  { bold: true, size: 28, center: true }),
  para(''),
  para('Fecha: {fecha}          Entrega estimada: {fecha_entrega}'),
  para(''),
  para('DATOS DEL CLIENTE', { bold: true }),
  para('Empresa:    {cliente_empresa}'),
  para('Dirección:  {cliente_dir}'),
  para('Teléfono:   {cliente_tel}'),
  para('Email:      {cliente_email}'),
  para(''),
  para('DETALLE DE ARTÍCULOS', { bold: true }),
  // {#items} y {/items} DEBEN estar solos en su párrafo (paragraphLoop: true)
  para('{#items}'),
  para('{tipo_uniforme}    Cantidad: {cantidad}    P/U: {precio_unitario}    Subtotal: {subtotal}'),
  para('{/items}'),
  para(''),
  para('Total:      {total}', { bold: true }),
  para('Anticipo:   {anticipo}'),
  para('Saldo:      {saldo}'),
  para(''),
  para('Notas: {notas}'),
].join('\n    ')

const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}">
  <w:body>
    ${body}
    <w:sectPr/>
  </w:body>
</w:document>`

const outputDir = path.join(process.cwd(), 'templates')
const outputPath = path.join(outputDir, 'cotizacion.docx')

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

const zip = new PizZip()
zip.file('[Content_Types].xml', contentTypes)
zip.file('_rels/.rels', rootRels)
zip.file('word/document.xml', document)
zip.file('word/_rels/document.xml.rels', docRels)
zip.file('word/settings.xml', settings)

fs.writeFileSync(outputPath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }))

console.log(`Plantilla creada en: ${outputPath}`)
console.log('Variables disponibles:')
console.log('  {folio} {fecha} {fecha_entrega} {cliente_empresa} {cliente_dir}')
console.log('  {cliente_tel} {cliente_email} {notas} {total} {anticipo} {saldo}')
console.log('  Loop: {#items}...{/items} → {tipo_uniforme} {cantidad} {precio_unitario} {subtotal}')
console.log()
console.log('Puedes abrir el archivo con Word o LibreOffice para personalizarlo.')
