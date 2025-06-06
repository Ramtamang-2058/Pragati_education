# IELTS Preparation System

A simple Django-based web application for Pragati Education's IELTS Preparation System, featuring a "Coming Soon" page.

## Setup

1. Clone the repository.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Collect static files: `python manage.py collectstatic`
7. Run the server: `python manage.py runserver`

## Structure

- `core/`: Main app for the "Coming Soon" page.
- `static/`: CSS and JS files.
- `templates/`: HTML templates.