<h1 align=center>Thia [README OUTDATED AS FUCK LOL!]</h1>


#### Getting Setup On Your Machine
##### Prereqs
- Node & NPM (tested at v15.4.0 & 7.5.6)
- Python 3.8.9 (App only)
- Git
- Windows 10
- Visual C++ Build Tools [here](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio-exp/?sku=BuildTools&rel=16 "Download link") **(App only)**

##### Steps

For being able to push changes you need to 1. have access to the repo, and 2. have your ssh keys installed

1. Make sure you have OpenSSH Clientoptional feature installed. To do so open Apps & features in Windows settings, click on Optional features and add OpenSSH Client.
2. Open `command prompt` as an admin and generate an ED25519 (more secure and performance than RSA keys) SSH key pair using `ssh-keygen -t ed25519`.

```shell
$ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
$Enter file in which to save the key (C:\Users\Ritesh/.ssh/id_ed25519):
Created directory 'C:\Users\Ritesh/.ssh'.
$Enter passphrase (empty for no passphrase):
$Enter same passphrase again:
Your identification has been saved in C:\Users\Ritesh/.ssh/id_ed25519.
Your public key has been saved in C:\Users\Ritesh/.ssh/id_ed25519.pub.
The key fingerprint is:
SHA256:ALPHANUMERICAL_NUMBERS user@PC-NAME
The key's randomart image is:
+--[ED25519 256]--+
|       +Xz+=+    |
|      . =*zE     |
|       o ==a. .. |
|      + = oo o...|
|     . *Sz..o  .o|
|      o z.+ o.o .|
|       o + . =   |
|        z     .  |
|                 |
+----[SHA256]-----+
```
3. To copy the ssh-key you just created, you can directly copy the `id_ed25519.pub` or open Git Bash and enter `cat ~/.ssh/id_ed25519.pub | clip` which would copy it to your clipboard.
4. Sign in to GitLab.
5. In the top right corner, select your avatar.
6. Select **Settings**.
7. From the left sidebar, select **SSH Keys**.
8. In the **Key** box, paste the contents of your public key. If you manually copied the key, make sure you copy the entire key, which starts with `ssh-ed25519` or `ssh-rsa` if you’re using an RSA key-pair, and may end with a comment.
9. In the **Title** text box, dtype a description like *Work Laptop* or *Home Workstation*.
10. In the **Expires at** box, select an expiration date **for today's date in 1 year**. The expiration date is informational only and won’t prevent you from using the key. However, it is so that administrators can view expiration dates and use them for guidance when deleting keys.
11. Select **Add key**.

For cloning and setting up **App**

1. Clone the repo (using ssh - `git clone git@gitlab.com:thia-ai/auto-ai.git` if you are a project member).
2. Open VS code at the `thia` directory and install the recommended extensions.
3. Install npm packages with `npm install`.
5. Install pip packages with `pip install -r requirements.txt`.
6. We use a local version of CUDA for dev/prod and store it [here](https://drive.google.com/file/d/1O9fdHDXvDuA2Xz2wVxCS--EECazrqt_r/view?usp=sharing "Downlink to CUDA"). Download and extract into thia so that there exists a folder thia/CUDA with all CUDA files inside.

For starting **App**

1. Open a terminal and run webpack with `npm run dev`, this will start webpack in watch mode and **main/renderer** would be compiled and bundled in the dist directory.
2. Open a new terminal and start the **Electron** process with `npm run start`. This will launch the app, each time the **renderer** code changes you can just reload the webpage, however, if the **main** code changes then you will need to close and restart **App** again.
