module.exports = {
  emailSelectors: [
    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]',
    'input[type="text"]'
  ],

  passwordSelectors: [
    "#password",
    'input[name="PASSWORD"]',
    'input[type="password"]'
  ],

  nextButtonSelectors: [
    "#nextbtn",
    'button[type="submit"]',
    'button:has-text("Next")',
    'button:has-text("Sign in")',
    'input[type="submit"]'
  ]
};