# Builds data/files/QATContractTemplate.docx: a minimal Word template with MERGEFIELDs that PTL's TemplateMergeService resolves.
# Field names come from Features/Contract/ContractMergeMapper.cs. Synthetic text only.
param([string]$Out = (Join-Path $PSScriptRoot '..\data\files\QATContractTemplate.docx'))

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Field([string]$name) {
  "<w:r><w:fldChar w:fldCharType=`"begin`"/></w:r><w:r><w:instrText xml:space=`"preserve`"> MERGEFIELD $name </w:instrText></w:r><w:r><w:fldChar w:fldCharType=`"separate`"/></w:r><w:r><w:t>«$name»</w:t></w:r><w:r><w:fldChar w:fldCharType=`"end`"/></w:r>"
}
function Line([string]$label, [string]$name) { "<w:p><w:r><w:t xml:space=`"preserve`">$label </w:t></w:r>$(Field $name)</w:p>" }

$document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:t>QA automation test template (synthetic data only)</w:t></w:r></w:p>
$(Line 'Contract number:' 'ContractNumber')
$(Line 'Contact:' 'ContactName')
$(Line 'Organisation:' 'CustomerOrganisation')
$(Line 'Address:' 'AddressLine1')
$(Line 'Telephone:' 'Telephone')
<w:sectPr/></w:body></w:document>
"@

$parts = @{
  '[Content_Types].xml' = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  '_rels/.rels' = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  'word/document.xml' = $document
}

New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null
if (Test-Path $Out) { Remove-Item $Out }
$zip = [System.IO.Compression.ZipFile]::Open($Out, 'Create')
try {
  foreach ($name in $parts.Keys) {
    $entry = $zip.CreateEntry($name)
    $writer = New-Object System.IO.StreamWriter($entry.Open(), (New-Object System.Text.UTF8Encoding($false)))
    $writer.Write($parts[$name]); $writer.Dispose()
  }
} finally { $zip.Dispose() }
"$Out ($((Get-Item $Out).Length) bytes)"

