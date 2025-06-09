# Employee Management System

A Flask-based web application for managing employee work logs, including check-in/check-out, holiday tracking, and Excel export functionality.

## Features
- **Employee Management**: Add, edit, delete, and view employee details.
- **Work Logs**: Track daily check-in/check-out times, calculate worked hours, and manage holidays (paid, unpaid, weekend).
- **Dashboard**: View real-time employee status for admins and workers.
- **Filtering**: Filter work logs by date ranges (today, yesterday, last 7/30 days, this/last month, custom).
- **Excel Export**: Export filtered work logs to Excel with summaries.
- **Role-Based Access**: Separate access for admins (full control) and workers (view own data).
- **Scheduled Tasks**: Daily reset of work logs using APScheduler.

## Project Structure