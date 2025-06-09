def test_add_employee(client):
    # Добавление администратора, чтобы пройти защиту доступа
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

    response = client.post(
        "/employee/add",
        data={
            "full_name": "John Doe",
            "nie": "X1234567",
            "position": "Waiter",
            "phone": "123456789",
            "email": "john@example.com",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "section": "Sala",
            "work_start_time": "09:00",
            "work_end_time": "17:00",
            "days_per_week": 5,
        },
    )
    assert response.status_code == 200
    assert b"Employee added successfully!" in response.data
