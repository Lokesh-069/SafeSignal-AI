from twilio.rest import Client

client = Client("ACd76b6305e68a1ac820636ff54f082654", "a153e6991d50599ec5ded7169c465920")

message = client.messages.create(
    from_="whatsapp:+14155238886",
    body="Test working",
    to="whatsapp:+917679341340"
)

print(message.sid)