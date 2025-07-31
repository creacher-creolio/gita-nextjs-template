# .githooks/pre-push.ps1

Write-Host "Running code polish (lint + format) before push..." -ForegroundColor Yellow

# Run the polish command
pnpm run polish

# Check if polish command succeeded
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Code polish failed. Please fix the issues and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code polish completed successfully. Proceeding with push..." -ForegroundColor Green
exit 0
