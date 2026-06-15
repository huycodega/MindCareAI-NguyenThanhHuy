"""
Email sender — OTP delivery for Gmail self-registration.

Two modes, chosen automatically from config:
  * PROD  — settings.smtp_host set → send a real email via SMTP (STARTTLS).
  * DEV   — settings.smtp_host empty → log the OTP to the server console
            (and let the API echo it when settings.otp_dev_echo is True),
            so the whole flow works locally without a mail server.

Never raises to the caller: a delivery failure is logged and reported via
the boolean return so the endpoint can still respond gracefully.
"""
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

log = logging.getLogger(__name__)


def _otp_body(code: str) -> tuple[str, str]:
    subject = "Your CBT Wellbeing verification code"
    body = (
        f"Welcome to CBT Wellbeing.\n\n"
        f"Your verification code is: {code}\n\n"
        f"It expires in {settings.otp_ttl_seconds // 60} minutes. "
        f"If you did not request this, you can ignore this email.\n"
    )
    return subject, body


def send_otp(to_email: str, code: str) -> bool:
    """Deliver an OTP. Returns True if handled (sent OR dev-logged)."""
    subject, body = _otp_body(code)

    if not settings.smtp_host:
        # DEV mode — no SMTP configured.
        log.warning("[email DEV] OTP for %s = %s (no SMTP configured)",
                    to_email, code)
        return True

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        msg.set_content(body)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port,
                          timeout=15) as s:
            if settings.smtp_use_tls:
                s.starttls()
            if settings.smtp_user:
                s.login(settings.smtp_user, settings.smtp_password)
            s.send_message(msg)
        log.info("OTP email sent to %s", to_email)
        return True
    except Exception as e:
        log.error("OTP email to %s failed: %s", to_email, e)
        return False


def dev_mode() -> bool:
    """True when no real SMTP is configured (OTP is logged, not emailed)."""
    return not settings.smtp_host
