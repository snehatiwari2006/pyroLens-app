"""Notification adapters for dashboard, Twilio SMS, and SMTP email."""
import asyncio
import smtplib
from email.message import EmailMessage

import httpx

from .config import get_settings
from .schemas import ThermalEvent


async def send_alert(event: ThermalEvent, channels: list[str], recipients: list[str], message: str | None = None) -> list[dict[str, str]]:
    settings = get_settings()
    body = message or f"PyroLens {event.risk_level} alert: {event.name} at {event.location}. Risk score: {event.risk_score}/100."
    deliveries: list[dict[str, str]] = []
    if "dashboard" in channels:
        deliveries.append({"channel": "dashboard", "recipient": "in-app", "status": "recorded"})
    if "sms" in channels:
        for recipient in recipients:
            deliveries.append(await _send_sms(recipient, body, settings))
    if "email" in channels:
        for recipient in recipients:
            deliveries.append(await _send_email(recipient, event.name, body, settings))
    return deliveries


async def _send_sms(recipient: str, body: str, settings: object) -> dict[str, str]:
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_from_number]):
        return {"channel": "sms", "recipient": recipient, "status": "not_configured"}
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, data={"To": recipient, "From": settings.twilio_from_number, "Body": body}, auth=(settings.twilio_account_sid, settings.twilio_auth_token))
            response.raise_for_status()
        return {"channel": "sms", "recipient": recipient, "status": "sent"}
    except httpx.HTTPError:
        return {"channel": "sms", "recipient": recipient, "status": "failed"}


def _smtp_send(recipient: str, subject: str, body: str, settings: object) -> None:
    message = EmailMessage()
    message["From"] = settings.smtp_from_address
    message["To"] = recipient
    message["Subject"] = f"PyroLens alert: {subject}"
    message.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.starttls()
        if settings.smtp_username and settings.smtp_password:
            smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)


async def _send_email(recipient: str, subject: str, body: str, settings: object) -> dict[str, str]:
    if not settings.smtp_host or not settings.smtp_from_address:
        return {"channel": "email", "recipient": recipient, "status": "not_configured"}
    try:
        await asyncio.to_thread(_smtp_send, recipient, subject, body, settings)
        return {"channel": "email", "recipient": recipient, "status": "sent"}
    except (OSError, smtplib.SMTPException):
        return {"channel": "email", "recipient": recipient, "status": "failed"}
