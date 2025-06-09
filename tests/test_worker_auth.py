def test_worker_register_and_login(client):
    response = client.post(
        "/worker_register",
        data={"username": "worker1", "password": "pass", "confirm_password": "pass"},
        follow_redirects=True,
    )
    assert response.status_code == 200

    response = client.post(
        "/worker_login",
        data={"username": "worker1", "password": "pass"},
        follow_redirects=True,
    )
    assert response.status_code == 200 or response.status_code == 302
