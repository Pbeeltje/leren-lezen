Add-Type -AssemblyName System.Drawing

function Save-Crop($srcImg, $x, $y, $w, $h, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$staged = "C:\claude\leren-lezen\bronbestanden\_staged"
New-Item -ItemType Directory -Force -Path $staged | Out-Null

$img = [System.Drawing.Image]::FromFile("C:\claude\leren-lezen\bronbestanden\5730b8faaeb7d0b1534601273bc7a4bd.jpg")

# Measured by scanning for pixel runs (not extrapolated from a fixed row pitch, which drifted
# and clipped the raised fingertips): each crop starts just below the red number word and
# stays inside the cell's grid lines (odd cells x 59..113, even cells x 179..233).
$oddX = 60;  $oddW = 52
$evenX = 181; $evenW = 51
$oddY  = @(26, 116, 209, 291, 385)
$evenY = @(26, 116, 205, 294, 384)
$h = 48

for ($r = 0; $r -lt 5; $r++) {
    Save-Crop $img $oddX  $oddY[$r]  $oddW  $h "$staged\vinger-$($r * 2 + 1).png"
    Save-Crop $img $evenX $evenY[$r] $evenW $h "$staged\vinger-$($r * 2 + 2).png"
}
$img.Dispose()
Write-Output "done"
