<?php
$email=$_POST['email'];

$myfile = fopen("avaava_email.txt", "a") or die("Unable to open file!");
fwrite($myfile, $email . PHP_EOL);
fclose($myfile);

echo "<script>window.location.href = './color.html'</script>";
?>