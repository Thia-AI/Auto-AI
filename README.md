<div align="center">
    <div>
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://thia.tech/logo/thia-icon.svg">
        <img src="https://thia.tech/logo/thia-icon.svg" height="128">
      </picture>
      <h1 align=center>Thia [NO LONGER IN DEVELOPMENT]</h1>
      <a href="https://thia.tech">Website</a>
    </div>
</div>

<br />

![Build Status](https://github.com/Thia-AI/Auto-AI/actions/workflows/main.yml/badge.svg) ![Version](https://img.shields.io/badge/Version-alpha-red)

<br />

Thia is an Auto-ML application that uses your own hardware instead of some server in the cloud.

![image](https://user-images.githubusercontent.com/15899753/208352477-ef647bb8-bb6d-4e62-96a1-f421e9eaa375.png)

<br />
<br />
<br />

The ML Engine runs on **YOUR** GPU so **YOU** are in control of your own private data. The only time the app communicates with our servers will be for [Authn and Authz](https://www.cloudflare.com/en-ca/learning/access-management/authn-vs-authz/ 'Learn about the difference'), everything else will be packaged in the installer.

![yes](./doc/images/how_thia_works.png)

## Status

We have currently stopped development as we are performing customer discovery (yes we did things completely backwards).

## About

Thia was a passion project of mine that I came up with after I received an absolutely ridiculous bill from Google Cloud:

![yes](./doc/images/automl_pricing_example.png)

This was for a hackathon I was partaking in where I needed a model to detect individual roofs of houses from satellite images. The training was done twice and took about half a day each with 8 nodes in parallel. This is where cloud auto-ml providers get you; training is never quick, and you can kiss your wallet goodbye if you need to retrain when you get more data.

Commercial GPUs now are so powerful and so common (thanks to crypto and games) that almost everyone has access to a GPU and if they don't they can rent a relatively cheap machine that does have one from the [multitude of providers](https://geekflare.com/best-cloud-gpu-platforms/ 'List of some GPU providers ') out there. So why are there no auto-ml solutions that can run on your own hardware? _(sarcasm)_.

> #### ℹ️ Built with:
> - ElectronJS (TypeScript)
> - React (TypeScript)
> - Flask
> - TensorFlow
