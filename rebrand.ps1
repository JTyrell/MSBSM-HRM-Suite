$files = Get-ChildItem "src\components\hrm\*.tsx"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $original = $content

    # === EMERALD REPLACEMENTS ===
    # Dark mode backgrounds
    $content = $content -replace 'bg-emerald-950/40', 'bg-msbm-red/10'
    $content = $content -replace 'bg-emerald-950/30', 'bg-msbm-red/10'
    $content = $content -replace 'bg-emerald-950/20', 'bg-msbm-red/10'
    $content = $content -replace 'bg-emerald-900/50', 'bg-msbm-red/20'
    $content = $content -replace 'bg-emerald-900/30', 'bg-msbm-red/20'
    # Text colors
    $content = $content -replace 'text-emerald-300', 'text-msbm-red-bright'
    $content = $content -replace 'text-emerald-400', 'text-msbm-red-bright'
    $content = $content -replace 'text-emerald-500', 'text-msbm-red'
    $content = $content -replace 'text-emerald-600', 'text-msbm-red'
    $content = $content -replace 'text-emerald-700', 'text-msbm-red'
    # Backgrounds
    $content = $content -replace 'bg-emerald-50/50', 'bg-msbm-red/5'
    $content = $content -replace 'bg-emerald-50', 'bg-msbm-red/5'
    $content = $content -replace 'bg-emerald-100', 'bg-msbm-red/10'
    $content = $content -replace 'bg-emerald-500/20', 'bg-msbm-red/20'
    $content = $content -replace 'bg-emerald-500/10', 'bg-msbm-red/10'
    $content = $content -replace 'bg-emerald-500', 'bg-msbm-red'
    $content = $content -replace 'bg-emerald-600', 'bg-msbm-red'
    $content = $content -replace 'bg-emerald-700', 'bg-msbm-red/80'
    # Hover
    $content = $content -replace 'hover:bg-emerald-600', 'hover:bg-msbm-red-bright'
    $content = $content -replace 'hover:bg-emerald-700', 'hover:bg-msbm-red/80'
    $content = $content -replace 'hover:bg-emerald-500/10', 'hover:bg-msbm-red/10'
    # Borders
    $content = $content -replace 'border-emerald-200/60', 'border-msbm-red/20'
    $content = $content -replace 'border-emerald-200', 'border-msbm-red/20'
    $content = $content -replace 'border-emerald-300', 'border-msbm-red/30'
    $content = $content -replace 'border-emerald-500/50', 'border-msbm-red/50'
    $content = $content -replace 'border-emerald-500/30', 'border-msbm-red/30'
    $content = $content -replace 'border-emerald-500', 'border-msbm-red'
    $content = $content -replace 'border-emerald-800/40', 'border-msbm-red/20'
    $content = $content -replace 'border-emerald-800', 'border-msbm-red/20'
    $content = $content -replace 'border-emerald-100', 'border-msbm-red/20'
    # Gradients
    $content = $content -replace 'from-emerald-500', 'from-msbm-red'
    $content = $content -replace 'from-emerald-600', 'from-msbm-red'
    $content = $content -replace 'from-emerald-400', 'from-msbm-red'
    $content = $content -replace 'hover:from-emerald-600', 'hover:from-msbm-red-bright'
    # Shadows and rings
    $content = $content -replace 'shadow-emerald-500/20', 'shadow-msbm-red/20'
    $content = $content -replace 'ring-emerald-400', 'ring-msbm-red/40'
    $content = $content -replace 'ring-emerald-500', 'ring-msbm-red/40'
    # Stroke (SVG)
    $content = $content -replace 'stroke-emerald-500', 'stroke-msbm-red'
    # Hex codes
    $content = $content -replace '#059669', '#ac1928'
    $content = $content -replace '#10b981', '#d11226'
    $content = $content -replace '#34d399', '#d11226'
    $content = $content -replace '#6ee7b7', '#d11226'

    # === TEAL REPLACEMENTS ===
    # Dark mode backgrounds
    $content = $content -replace 'bg-teal-950/40', 'bg-inner-blue/10'
    $content = $content -replace 'bg-teal-950/30', 'bg-inner-blue/10'
    $content = $content -replace 'bg-teal-900/50', 'bg-inner-blue/20'
    $content = $content -replace 'bg-teal-900/30', 'bg-inner-blue/20'
    # Text colors
    $content = $content -replace 'text-teal-300', 'text-light-blue'
    $content = $content -replace 'text-teal-400', 'text-light-blue'
    $content = $content -replace 'text-teal-500', 'text-inner-blue'
    $content = $content -replace 'text-teal-600', 'text-inner-blue'
    $content = $content -replace 'text-teal-700', 'text-inner-blue'
    # Backgrounds
    $content = $content -replace 'bg-teal-50', 'bg-inner-blue/5'
    $content = $content -replace 'bg-teal-100', 'bg-inner-blue/10'
    $content = $content -replace 'bg-teal-500/20', 'bg-inner-blue/20'
    $content = $content -replace 'bg-teal-500', 'bg-inner-blue'
    $content = $content -replace 'bg-teal-600', 'bg-inner-blue'
    $content = $content -replace 'bg-teal-700', 'bg-inner-blue/80'
    # Hover
    $content = $content -replace 'hover:bg-teal-600', 'hover:bg-inner-blue/80'
    $content = $content -replace 'hover:bg-teal-700', 'hover:bg-inner-blue/80'
    # Borders
    $content = $content -replace 'border-teal-200/60', 'border-inner-blue/20'
    $content = $content -replace 'border-teal-200', 'border-inner-blue/20'
    $content = $content -replace 'border-teal-300', 'border-inner-blue/30'
    $content = $content -replace 'border-teal-500/50', 'border-inner-blue/50'
    $content = $content -replace 'border-teal-500/30', 'border-inner-blue/30'
    $content = $content -replace 'border-teal-500', 'border-inner-blue'
    $content = $content -replace 'border-teal-800/40', 'border-inner-blue/20'
    $content = $content -replace 'border-teal-800', 'border-inner-blue/20'
    $content = $content -replace 'border-teal-100', 'border-inner-blue/20'
    $content = $content -replace 'border-teal-900/30', 'border-inner-blue/20'
    # Gradients
    $content = $content -replace 'from-teal-400', 'from-inner-blue'
    $content = $content -replace 'from-teal-500', 'from-inner-blue'
    $content = $content -replace 'from-teal-600', 'from-inner-blue'
    $content = $content -replace 'to-teal-500', 'to-inner-blue'
    $content = $content -replace 'to-teal-600', 'to-inner-blue'
    $content = $content -replace 'to-teal-700', 'to-inner-blue/80'
    $content = $content -replace 'hover:to-teal-700', 'hover:to-inner-blue/80'
    # Shadows and rings
    $content = $content -replace 'shadow-teal-500/20', 'shadow-inner-blue/20'
    $content = $content -replace 'ring-teal-400', 'ring-inner-blue/40'
    # SVG
    $content = $content -replace 'stroke-teal-500', 'stroke-inner-blue'
    # Hex codes
    $content = $content -replace '#0d9488', '#2341a4'
    $content = $content -replace '#14b8a6', '#2341a4'
    $content = $content -replace '#2dd4bf', '#697ec1'
    $content = $content -replace '#5eead4', '#697ec1'

    if ($content -ne $original) {
        Set-Content $f.FullName $content -NoNewline
        Write-Output "Updated: $($f.Name)"
    }
}
Write-Output "--- Rebranding complete ---"
