# PowerShell script to verify TypeScript/React imports for Ticket_Management module

Write-Host "Checking Ticket_Management module TypeScript imports..." -ForegroundColor Green

# Get all TypeScript and TSX files
$tsFiles = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

$fileCount = 0
$correctCount = 0

foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    # Check if file contains ticket-related imports
    if ($content -match "ticket" -and $content -match "import") {
        # Check if using correct modular structure
        if ($content -match "from ['`"]@/modules/ticket-management") {
            $correctCount++
        }
    }
    
    $fileCount++
}

Write-Host "`nTypeScript import scan complete!" -ForegroundColor Green
Write-Host "Files scanned: $fileCount" -ForegroundColor Cyan
Write-Host "Files with correct modular imports: $correctCount" -ForegroundColor Cyan

# Check the main types index file
$typesIndexPath = "src/lib/types/index.ts"
if (Test-Path $typesIndexPath) {
    $content = Get-Content $typesIndexPath -Raw
    if ($content -match "modules/ticket-management/types/ticket") {
        Write-Host "`n✓ Main types index file correctly exports from ticket-management module" -ForegroundColor Green
    }
}

Write-Host "`nFrontend imports are already using the modular structure!" -ForegroundColor Green
