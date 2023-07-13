<?php
session_start();
$state='idle';
$file="edit.php";
$pf="js/soup";
// Check if the user is already logged in
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    // Check if the logout button is clicked
    if (isset($_GET['logout'])) {
        // End the session and redirect to the login page
        session_destroy();
        header('Location: '.$file);
        exit;
    }
 
    



    // Check if the password change form is submitted
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $newPassword = $_POST['new_password'];

        // Encrypt the new password
        $encryptedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Save the encrypted password in the file
        file_put_contents($pf, $encryptedPassword);

        // Redirect to a success page or display a success message
        header('Location: '.$file);
        exit;
        
    }

    // Display the password change form
    ?>

    <!DOCTYPE html>
    <html>
    <head>
        <title>Editor StudioSoup</title>

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="css/sms.css?uid=ef" rel="stylesheet" type="text/css">
 
 <style>
</style>
  </head>
</head>
<body>


<div class='login_controls'>
    <a href="?logout=true">Log out</a> - 
        <form method="post" action="" style='display:inline-block;'>
            <label for="new_password">New password:</label>
            <input type="password" id="new_password" name="new_password" required> 

            <input type="submit" value="send">
        </form>
       
       
</div>
 


<div class='main-controls'></div>
<div>
    <div class='lista'>
    </div>


    <div class='projectDiv'>
    </div>
 
</div>
<div class='selectBlock' style='display:none;'>
</div>


<div class='newProjectPromt' style='display:none;'>
<h2>New Project</h2>
Folder: <input name='folder' value='' type='text' placeholder='folderName'><br>
Project Title: <input name='title' value='' type='text' placeholder='project name'><br>
Subtitle: <input name='subtitle' value='' type='text' placeholder='project subtitle'><br><br>
<button class='createProject'>Create</button> <button  class='cancelNewProject'>Cancel</button>
</div>



<div class='loadingDiv'>Loading...</div>
  <script src="js/sms.js?uid=e"></script>
</body>
</html>




















<?php
    exit;
}

// Check if the login form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if the "password.txt" file exists
    if (file_exists($pf)) {
        // Retrieve the encrypted password from the file
        $encryptedPassword = file_get_contents($pf);

        // Verify the password
        if (password_verify($password, $encryptedPassword)) {
            // Password is correct, create a session
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
            header('Location: '.$file);
            exit;
        } else {
            // Password is incorrect, show an error message
            $error = 'Invalid username or password';
        }
    } else {
        // "password.txt" file doesn't exist, allow user to create a valid password
        $newPassword = $_POST['new_password'];

        // Check if the new password meets the required criteria (e.g., minimum length)
        if (strlen($newPassword) >= 4) {
            // Encrypt the new password
            $encryptedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Save the encrypted password in the file
            file_put_contents($pf, $encryptedPassword);

            // Create a session for the user
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;

            header('Location: '.$file);
            exit;
        } else {
            // New password doesn't meet the required criteria, show an error message
            $error = 'Invalid password. Password must be at least 4 characters long.';
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link href="css/sms.css?uid=ef" rel="stylesheet" type="text/css">
</head>
<body>
    <div class='login_controls'>
 
    <?php if (isset($error)) { ?>
        <p><?php echo $error; ?></p>
    <?php } ?>



    <form method="post" action=""  style='display:inline-block;'>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" value='soup'> | 

        <?php if (file_exists($pf)) { ?>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required> | 
        <?php } else { ?>
            <label for="new_password">Create Password:</label>
            <input type="password" id="new_password" name="new_password" required> | 
        <?php } ?>

        <input type="submit" value="Login">
    </form>
        </div>
</body>
</html>
