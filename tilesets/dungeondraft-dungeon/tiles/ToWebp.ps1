param($name=$(throw "You must specify the filename"))
$foregroundName = [string]::Format("{0}_Foreground", $name)
Write-Output "Converting $name.png"
cwebp -q 80 "$name.png" -o "$name.webp"
Write-Output "Converting $foregroundName.png"
cwebp -q 80 "$foregroundName.png" -f $name -o "$foregroundName.webp" -f $name
