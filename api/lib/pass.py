import bcrypt


def encrypt_password(plain_password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    print("Hashed password (save this in your .env):")
    print(hashed.decode())
