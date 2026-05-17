Preview here: https://sabika-liard.vercel.app/

## Environment

Copy `.env.example` to `.env` and fill in the values for your deployment.

Password reset emails use Gmail through Nodemailer. Use a Google app password for `GOOGLE_EMAIL_APP_PASSWORD`; do not use your normal Google account password.

New registrations are created with the `user` role. An existing admin can promote users from the admin dashboard.
