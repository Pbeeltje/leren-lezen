Add-Type -AssemblyName System.Drawing

$staged = "C:\claude\leren-lezen\bronbestanden\_staged"
$files = Get-ChildItem $staged -Include "*.jpg", "*.png" -Recurse | Sort-Object Name

$cols = 6
$cellW = 200
$cellH = 200
$labelH = 30
$rows = [Math]::Ceiling($files.Count / $cols)

$sheetW = $cols * $cellW
$sheetH = $rows * ($cellH + $labelH)

$sheet = New-Object System.Drawing.Bitmap $sheetW, $sheetH
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font "Arial", 14
$brush = [System.Drawing.Brushes]::Black
$pen = [System.Drawing.Pens]::LightGray

$i = 0
foreach ($f in $files) {
    $r = [Math]::Floor($i / $cols)
    $c = $i % $cols
    $x = $c * $cellW
    $y = $r * ($cellH + $labelH)

    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $g.DrawImage($img, $x, $y, $cellW, $cellH)
    $img.Dispose()
    $g.DrawRectangle($pen, $x, $y, $cellW - 1, $cellH - 1)
    $g.DrawString($f.BaseName, $font, $brush, $x + 2, $y + $cellH + 2)
    $i++
}

$sheet.Save("C:\claude\leren-lezen\bronbestanden\_contact_sheet.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$sheet.Dispose()
Write-Output "done: $($files.Count) images, $cols x $rows grid"
