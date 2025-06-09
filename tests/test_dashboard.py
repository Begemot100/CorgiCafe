def test_dashboard_access(client):
    client.post(
        "/admin_register",
        data={
            "email": "admin@example.com",
            "password": "adminpass",
            "confirm_password": "adminpass",
        },
    )
    client.post(
        "/admin_login", data={"email": "admin@example.com", "password": "adminpass"}
    )

    response = client.get("/dashboard")
    assert response.status_code == 200
    assert b"<!DOCTYPE html>" in response.data
