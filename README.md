# 🎯 MSAL-SSO Proof of Concept 🎯

## 👋 Introduction
This repository is a step by step integration for **Microsoft Authentication Library (MSAL)** in Angular.

## Prerequisites
Before using **Microsoft Authentication Library (MSAL)**, register an application in Azure Active Directory to get your clientId.

## 📃 Procedures
[ ] Create new application in Angular
[ ] Install other packages and required libraries to perform the MSAL
[ ] Create login page and homepage
[ ] MSAL Configuration in your app component
[ ] Secure routes with MsalGuard

### 1. Create New Application in Angular
Create a new web application using Angular CLI. Please note that this application uses **Angular 14**:
```
ng new MSAL-SSO-POC
```

### 2. Install required and optional libraries to perform the MSAL

##### **Required Libraries:**
Before installing MSAL using npm check supported version of it based in Angular version (See table below):
| **MSAL Angular Version** | **MSAL support status** | **Supported Angular Versions** |
|---|---|---|
| MSAL Angular v3 | Active development | 15, 16, 17, 18 |
| MSAL Angular v2 | In maintenance | 9, 10, 11, 12, 13, 14 |
| MSAL Angular v1 | In maintenance | 6, 7, 8, 9 |
| MSAL Angular v0 | Out of support | 4, 5 |

Once verified, install the library with the supported version. For this example, I will be using MSAL Angular v2 since the application is running in Angular 14.
```
npm install @azure/msal-browser@2.x.x @azure/msal-angular@2.x.x
```

##### **Optional Libraries:**
Install Angular Material for angular built-in themes using Angular CLI:
```
ng add @angular/material
```

You can also install Tailwind for efficient component styling. Visit [https://tailwindcss.com/docs/guides/angular](https://tailwindcss.com/docs/guides/angular) to learn how to install Tailwind in your Angular Application.


### 3. Create Login Page and Homepage
First, create Login Page Component. 
This will be the overlay component inside your **app.component.html** to check whether the token is valid and not expired.
```
ng generate component pages/login
```

After generating login component, feel free to style/design how you will show errors, queuing, and other information for the user. It will be also easier for the users as well for the support/dev team to understand if an error occurs. You may also check how this application integrate the login component [here](www.google.com).

Once the login.component.ts is created, create a homepage which will be used later for securing the routes.