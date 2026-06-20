import { test, expect } from '@playwright/test';
import { ScreenshotHelper } from "./Screenshothelper";

test('Successful Login', async ({ page }, testInfo) => {

    const shot = new ScreenshotHelper(page, testInfo);

    await test.step('Navigate to login page URL.', async () => {
        await page.goto('https://www.saucedemo.com/');
    });

    await test.step('Verify that the login page is displayed successfully.', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await shot.capture('Login page loaded');
    });
    await test.step('Check Correct login', async () => {
        await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
        await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
        await shot.capture('Filled login form with valid credentials');
        await page.getByRole('button', { name: 'Login' }).click();
    });
    await test.step('Verify that user is directed to Swag Labs inventory page', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
        await shot.capture('User directed to inventory page');
    });
})

test('Invalid Username', async ({ page }, testInfo) => {
    const shot = new ScreenshotHelper(page, testInfo);

    await test.step('Navigate to login page URL.', async () => {
        await page.goto('https://www.saucedemo.com/');
    });

    await test.step('Verify that the login page is displayed successfully.', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await shot.capture('Login page loaded');
    });
    await test.step('Check Invalid Username', async () => {
        await page.getByRole('textbox', { name: 'Username' }).fill('asdasdasdasdasd');
        await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();
    });
    await test.step('Confirm the error message is visible.', async () => {
        await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
        await shot.capture('Invalid username error displayed');
    });
    await test.step('Verify that user remains on the login page', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
});

test('Invalid Password', async ({ page }, testInfo) => {
    const shot = new ScreenshotHelper(page, testInfo);

    await test.step('Navigate to login page URL.', async () => {
        await page.goto('https://www.saucedemo.com/');
    });

    await test.step('Verify that the login page is displayed successfully.', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await shot.capture('Login page loaded');
    });
    await test.step('Check Invalid Password', async () => {
        await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
        await page.getByRole('textbox', { name: 'Password' }).fill('InvalidPassword!');
        await page.getByRole('button', { name: 'Login' }).click();
    });
    await test.step('Confirm the error message is visible.', async () => {
        await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
        await shot.capture('Invalid password error displayed');
    });
    await test.step('Verify that user remains on the login page', async () => {
        await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
});

