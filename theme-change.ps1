$path = "d:\portfolio website\THE_WEBSITE\src\components\AdminPanel.tsx"
$content = Get-Content $path -Raw

$replacements = @(
    @("bg-\[#0d0d0d\]", "bg-gray-50"),
    @("bg-\[#0a0a0a\]/90", "bg-white/90"),
    @("bg-\[#121212\]", "bg-white"),
    @("bg-\[#181818\]", "bg-gray-50"),
    @("bg-\[#222\]", "bg-gray-200"),
    @("bg-\[#111\]", "bg-gray-100"),
    @("text-white/20", "text-gray-400"),
    @("text-white/30", "text-gray-400"),
    @("text-white/40", "text-gray-500"),
    @("text-white/50", "text-gray-500"),
    @("text-white/60", "text-gray-600"),
    @("text-white/70", "text-gray-700"),
    @("text-white/80", "text-gray-800"),
    @("(?<!-)text-white", "text-gray-900"),
    @("border-white/5", "border-gray-200"),
    @("border-white/10", "border-gray-300"),
    @("hover:bg-white/5", "hover:bg-gray-100"),
    @("hover:bg-white/10", "hover:bg-gray-200"),
    @("hover:text-white", "hover:text-gray-900"),
    @("bg-white/5", "bg-gray-100"),
    @("bg-white/10", "bg-gray-200"),
    @("bg-white text-black", "bg-gray-900 text-white"),
    @("hover:bg-neutral-200", "hover:bg-gray-800"),
    @("bg-black/20", "bg-gray-100"),
    @("bg-black", "bg-gray-200"),
    @("selection:bg-white selection:text-black", "selection:bg-gray-900 selection:text-white"),
    @("placeholder:text-white/20", "placeholder:text-gray-400")
)

foreach ($rep in $replacements) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $rep[0], $rep[1])
}

Set-Content $path -Value $content -Encoding UTF8
Write-Output "Done replacing theme"
