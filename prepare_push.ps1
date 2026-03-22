
$basePath = "F:\Hellen\Site Novo"
$filePaths = @(
    ".gitignore",
    "code-style-guide.json",
    "eslint.config.mjs",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "postcss.config.mjs",
    "README.md",
    "tsconfig.json"
)

# Add src files
$srcFiles = Get-ChildItem -Path "$basePath\src" -Recurse -File | Where-Object { $_.Extension -in ".tsx", ".ts", ".css", ".svg", ".json", ".md" }
foreach ($f in $srcFiles) {
    $filePaths += $f.FullName.Replace("$basePath\", "")
}

# Add public files (not content)
$publicFiles = Get-ChildItem -Path "$basePath\public" -Recurse -File | Where-Object { ($_.FullName -notmatch "content") -and ($_.Extension -in ".svg", ".json", ".md") }
foreach ($f in $publicFiles) {
    $filePaths += $f.FullName.Replace("$basePath\", "")
}

# Add superpowers/docs
$extraFiles = Get-ChildItem -Path "$basePath\superpowers", "$basePath\docs" -Recurse -File | Where-Object { $_.Extension -in ".md", ".json" }
foreach ($f in $extraFiles) {
    $filePaths += $f.FullName.Replace("$basePath\", "")
}

$output = @()
foreach ($p in $filePaths) {
    $fullPath = Join-Path $basePath $p
    if (Test-Path $fullPath) {
        $content = Get-Content -Path $fullPath -Raw
        $output += @{
            path = $p.Replace("\", "/")
            content = $content
        }
    }
}

$output | ConvertTo-Json -Depth 10 | Out-File -FilePath "$basePath\payload.json" -Encoding utf8
