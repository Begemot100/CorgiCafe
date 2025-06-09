def test_admin_register_and_login(client):
    # Регистрация
    response = client.post(
        "/admin_register",
        data={
            "email": "test@example.com",
            "password": "secret",
            "confirm_password": "secret",
        },
        follow_redirects=True,
    )
    assert response.status_code == 200

    # Логин
    response = client.post(
        "/admin_login",
        data={"email": "test@example.com", "password": "secret"},
        follow_redirects=True,
    )
    assert response.status_code == 200 or response.status_code == 302
