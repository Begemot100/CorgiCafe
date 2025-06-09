from werkzeug.security import generate_password_hash

# Choose a new password
new_password = "newadminpassword123"
hashed_password = generate_password_hash(
    new_password, method="pbkdf2:sha256", salt_length=8
)
print(f"New password hash for '{new_password}': {hashed_password}")
