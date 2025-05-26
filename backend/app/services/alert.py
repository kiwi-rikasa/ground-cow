import smtplib
from email.mime.text import MIMEText
from app.core.config import settings


def send_email(
    subject: str, body: str, to_email: str, from_email: str = "noreply@example.com"
):
    """
    Sends an email.

    Args:
        subject: The subject of the email.
        body: The body of the email.
        to_email: The recipient's email address.
        from_email: The sender's email address.
    """
    # In a real application, you would integrate with an email service
    # like SendGrid, Mailgun, or use Python's smtplib for direct SMTP.
    # This is a placeholder implementation.
    print(f"Sending email to: {to_email}")
    print(f"From: {from_email}")
    print(f"Subject: {subject}")
    print(f"Body:\n{body}")
    print("-" * 20)

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email

    for to_email_ in to_email:
        with smtplib.SMTP(host="smtp.gmail.com", port="587") as smtp:
            try:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(settings.FIRST_SUPERUSER, settings.FIRST_SUPERUSER_PASSWORD)
                smtp.sendmail(from_email, to_email_, msg.as_string())
                print("Email sent")
                print("Complete!")
            except Exception as e:
                print("Error message: ", e)


if __name__ == "__main__":
    # Example usage:
    send_email(
        subject="Test Email",
        body="This is a test email from the alert service.",
        to_email="recipient@example.com",
    )
    send_email(
        subject="Another Test",
        body="Hello there!",
        to_email="another_recipient@example.com",
        from_email="custom_sender@example.com",
    )
